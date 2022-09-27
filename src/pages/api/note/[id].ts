import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { loadDBNote } from "../../../StorageManager";
import { authOptions } from "../auth/[...nextauth]";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await unstable_getServerSession(req, res, authOptions);
  const userId = session?.user?.id;
  if (!session || !userId) {
    return res.status(401);
  }

  const id = req.query.id as string;
  const client = new PrismaClient();
  const note = await loadDBNote(client, id, userId);
  if (!note) {
    return res.status(401);
  }

  if (req.method === "POST") {
    const { name, content } = JSON.parse(req.body);
    await client.note.update({
      where: { id },
      data: { name, content },
    });
  } else {
    res.json({
      name: note.name,
      content: note.content,
    });
  }

  res.status(200);
};
