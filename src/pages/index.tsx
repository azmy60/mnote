import type { GetServerSideProps, NextPage } from "next";
import { loadLocalNoteName, loadLocalNoteContent, saveLocalNoteName, saveLocalNoteContent } from "../StorageManager";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import { NoteWindow } from "../components/NoteWindow";

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
  return (
    <NoteWindow
      initialName={loadLocalNoteName()}
      initialContent={loadLocalNoteContent()}
      error={""}
      saveNameHandler={saveLocalNoteName}
      saveContentHandler={saveLocalNoteContent}
    />
  );
};

export default Home;
