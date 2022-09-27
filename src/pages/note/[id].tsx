import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";
import { Note, PrismaClient } from "@prisma/client";
import { NoteWindow } from "../../components/NoteWindow";
import { loadDBNote } from "../../StorageManager";

export const getServerSideProps: GetServerSideProps<{
  note: Pick<Note, "id" | "name" | "content">;
}> = async (context) => {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );
  const id = context.query.id as string;
  const userId = session?.user?.id;

  // TODO use middleware
  if (!session || !id || !userId) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const note = await loadDBNote(new PrismaClient(), id, userId);
  if (!note) {
    return { notFound: true };
  }

  return {
    props: {
      note: {
        id,
        name: note.name,
        content: note.content,
      },
    },
  };
};

const NotePage = ({
  note: { id, name, content },
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const saveName = (name: string) => {
    fetch(`/api/note/${id}`, {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  };

  const saveContent = (content: string) => {
    fetch(`/api/note/${id}`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  };

  return (
    <NoteWindow
      initialName={name}
      initialContent={content}
      error={""}
      saveNameHandler={saveName}
      saveContentHandler={saveContent}
    />
  );
};

export default NotePage;
