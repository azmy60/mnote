import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";
import { NoteWindow } from "../../components/NoteWindow";
import { useRouter } from "next/router";

export const getServerSideProps: GetServerSideProps = async (context) => {
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

  return {
    props: {},
  };
};

const NotePage: NextPage = () => {
  const id = useRouter().query.id;

  const loadNote = async () => {
    const res = await fetch(`/api/note/${id}`);
    const { name, content } = await res.json();
    return { name, content };
  };

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
      loadNoteHandler={loadNote}
      saveNameHandler={saveName}
      saveContentHandler={saveContent}
      error={""}
    />
  );
};

export default NotePage;
