import type { GetServerSideProps, NextPage } from "next";
import {
  saveLocalNoteName,
  saveLocalNoteContent,
  loadLocalNote,
} from "../StorageManager";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import { NoteWindow } from "../components/NoteWindow";
import { useEffect, useState } from "react";
import { Note } from "@prisma/client";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );

  if (session) {
    return {
      redirect: {
        destination: "/dashboard",
        permanent: false,
      },
    };
  }

  return { props: {} };
};

const Home: NextPage = () => {
  const [note, setNote] = useState<Pick<Note, "name" | "content"> | null>(null);

  useEffect(() => setNote(loadLocalNote()), []);

  if (!note) {
    return (
      <div className="h-screen flex items-center justify-center bg-base-100 font-bold text-5xl">
        <div className="text-5xl font-bold">mnote</div>
      </div>
    );
  }

  return (
    <NoteWindow
      note={note}
      saveNameHandler={saveLocalNoteName}
      saveContentHandler={saveLocalNoteContent}
    />
  );
};

export default Home;
