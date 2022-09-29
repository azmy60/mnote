import { prisma } from "../../../utils/prisma";
import { inferAsyncReturnType, initTRPC, TRPCError } from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import { unstable_getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "../auth/[...nextauth]";

export const t = initTRPC.context<Context>().create();

export const appRouter = t.router({
  note: t.router({
    all: t.procedure.query(async ({ ctx }) => {
      if (!ctx.session) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const notes = await ctx.prisma.note.findMany({
        where: { userId: ctx.session.user?.id },
      });
      return notes;
    }),
    add: t.procedure.mutation(async ({ ctx }) => {
      if (!ctx.session) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const userId = ctx.session.user?.id;
      if (!userId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No user id" });
      }

      const note = await ctx.prisma.note.create({ data: { userId } });
      return note;
    }),
    byId: t.procedure
      .input(
        z.object({
          id: z.string(),
        })
      )
      .query(async ({ ctx, input }) => {
        if (!ctx.session) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }

        const note = await ctx.prisma.note.findUnique({
          where: { id: input.id },
        });

        if (!note) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        if (note.userId !== ctx.session.user?.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        return note;
      }),
    edit: t.procedure
      .input(
        z.object({
          id: z.string(),
          name: z.string().optional(),
          content: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.session) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }

        const note = await ctx.prisma.note.findUnique({
          where: { id: input.id },
        });

        if (!note) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        if (note.userId !== ctx.session.user?.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const { id, name, content } = input;
        await ctx.prisma.note.update({
          where: { id },
          data: { name, content },
        });
      }),
  }),
});

export type AppRouter = typeof appRouter;

const createContext = async ({
  req,
  res,
}: trpcNext.CreateNextContextOptions) => {
  const session = await unstable_getServerSession(req, res, authOptions);
  return { session, prisma };
};

type Context = inferAsyncReturnType<typeof createContext>;

export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext,
  onError({ error }) {
    if (error.code === "INTERNAL_SERVER_ERROR") {
      console.error("Something went wrong", error);
    }
  },
});
