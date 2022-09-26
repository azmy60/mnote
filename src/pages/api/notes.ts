import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await unstable_getServerSession(req, res, authOptions);
  const userId = session?.user?.id;
  if (!session || !userId) {
    return res.status(401);
  }

  const client = new PrismaClient();
  const notes = await client.note.findMany({where:{userId}});
  res.status(200).json(notes);
};
