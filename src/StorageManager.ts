import { Note, PrismaClient } from "@prisma/client";

const PREFIX = "__mnote_";

export const saveLocalNoteContent = (text: string) => {
  return localStorage.setItem(`${PREFIX}unauth_file_content`, text);
};

export const saveLocalNoteName = (name: string) => {
  return localStorage.setItem(`${PREFIX}unauth_file_name`, name);
};

export const loadLocalNote = () => {
  return {
    name: localStorage.getItem(`${PREFIX}unauth_file_name`) ?? "",
    content: localStorage.getItem(`${PREFIX}unauth_file_content`) ?? "",
  };
};

export const saveDBNoteName = async ({ id, name }: Note) => {
  const client = new PrismaClient();
  await client.note.update({ where: { id }, data: { name } });
};

// WARNING dont use this directly
export const saveDBNoteContent = async (
  client: PrismaClient,
  id: string,
  content: string
) => {
  await client.note.update({ where: { id }, data: { content } });
};

// WARNING dont use this directly
export const loadDBNote = async (
  client: PrismaClient,
  id: string,
  userId: string
) => {
  const note = await client.note.findFirst({
    where: { id, userId },
  });
  return note;
};
