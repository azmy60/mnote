import { PrismaClient } from "@prisma/client";
import { initTRPC } from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";

export const t = initTRPC.create();

export const appRouter = t.router({
  notes: t.procedure.query(async () => {
    const client = new PrismaClient();
    const notes = await client.note.findMany();
    return notes;
  }),
});

export type AppRouter = typeof appRouter;

export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: () => ({}),
});
