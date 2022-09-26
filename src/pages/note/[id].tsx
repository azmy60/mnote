import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { marked } from "marked";
import Split from "react-split";
import { useBeforeunload } from "react-beforeunload";
import debounce from "lodash.debounce";
import TextareaAutoSize from "react-textarea-autosize";
import Link from "next/link";
import { saveNoteContent, saveNoteName } from "../../StorageManager";
import create from "zustand";
import shallow from "zustand/shallow";
import { useSession } from "next-auth/react";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";
import { Note, PrismaClient } from "@prisma/client";

interface NoteState {
  name: string;
  content: string;
  previewWidth: number;
  dirtyName: boolean;
  dirtyContent: boolean;
}

const useStore = create<NoteState>(() => ({
  name: "",
  content: "",
  previewWidth: 0,
  dirtyName: false,
  dirtyContent: false,
}));

const debouncedSaveNoteContent = debounce(
  (text: string, afterSave: () => void) => {
    saveNoteContent(text);
    afterSave();
  },
  1000
);
const debouncedSaveNoteName = debounce(
  (name: string, afterSave: () => void) => {
    saveNoteName(name);
    afterSave();
  },
  1000
);

function NoteName() {
  const [inputVal, setInputVal] = useState(useStore.getState().name);
  const blurHandler = (e: React.FocusEvent<HTMLInputElement>) => {
    useStore.setState({ dirtyName: true, name: e.target.value });
    debouncedSaveNoteName(e.target.value, () =>
      useStore.setState({ dirtyName: false })
    );
  };

  const name = useStore((state) => state.name);
  useEffect(() => setInputVal(name), [name]);

  return (
    <input
      type="text"
      className="input input-ghost input-xs text-base px-0 mt-0.5"
      onBlur={(e) => blurHandler(e)}
      onChange={(e) => setInputVal(e.target.value)}
      value={inputVal}
    />
  );
}

function NoteEditor() {
  const { content, previewWidth } = useStore(
    (state) => ({
      content: state.content,
      previewWidth: state.previewWidth,
    }),
    shallow
  );
  const textarea = useRef<HTMLTextAreaElement>(null);

  const changeHandler = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    useStore.setState({ content: text, dirtyContent: true });
    debouncedSaveNoteContent(text, () =>
      useStore.setState({ dirtyContent: false })
    );
  };

  useEffect(() => {
    textarea.current!.focus();
  }, []);

  useEffect(() => {
    textarea.current!.style.width = `${previewWidth}px`;
  }, [content]);

  return (
    <TextareaAutoSize
      ref={textarea}
      value={content}
      onChange={changeHandler}
      placeholder="Start typing your note here!"
      className="bg-transparent resize-none min-w-full min-h-full whitespace-pre outline-none"
    />
  );
}

function Preview() {
  const content = useStore((state) => state.content);
  const preview = useRef<HTMLDivElement>(null);

  useEffect(() => {
    useStore.setState({ previewWidth: preview.current!.scrollWidth });
  }, [content]);

  return (
    <div
      ref={preview}
      dangerouslySetInnerHTML={{ __html: marked.parse(content) }}
      className="prose"
    />
  );
}

export const getServerSideProps: GetServerSideProps<{
  note: Pick<Note, "name" | "content">;
}> = async (context) => {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );
  const id = context.query.id as string;
  const userId = session?.user?.id;

  if (!session || !id || !userId) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const client = new PrismaClient();
  const note = await client.note.findFirst({
    select: { name: true, content: true },
    where: { id, userId },
  });
  if (!note) {
    return { notFound: true };
  }

  return { props: { note } };
};

const NotePage = ({
  note,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { data: session, status } = useSession();

  const { name, dirtyName, dirtyContent } = useStore(
    (state) => ({
      name: state.name,
      dirtyName: state.dirtyName,
      dirtyContent: state.dirtyContent,
    }),
    shallow
  );

  const [title, setTitle] = useState("mnote");
  const [error, setError] = useState("");

  useEffect(() => {
    useStore.setState({
      name: note.name,
      content: note.content,
    });
  }, []);

  useEffect(() => {
    if (status !== "loading" && name.length > 0) {
      setTitle(`mnote | ${name}`);
    } else {
      setTitle("mnote");
    }
  }, [status, name]);

  useBeforeunload(
    (event: BeforeUnloadEvent) =>
      (dirtyName || dirtyContent) && event.preventDefault()
  );

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta
          name="description"
          content="Take some notes and save it locally."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col h-screen">
        {status === "loading" ? (
          <div className="h-full flex items-center justify-center bg-base-100 font-bold text-5xl">
            mnote
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between bg-base-100 px-4 py-2">
              <div className="flex items-center gap-2">
                <Link href="/">
                  <a className="font-bold text-xl leading-none">mnote</a>
                </Link>
                <span className="leading-none">|</span>
                <NoteName />
              </div>
              <p className="text-sm underline opacity-50">
                Your note is auto-saved. Try to refresh.
              </p>
            </div>
            <Split className="flex grow overflow-y-hidden">
              <div className="p-4 bg-base-100 overflow-auto">
                <NoteEditor />
              </div>
              <div className="p-4 bg-base-200 overflow-auto">
                <Preview />
              </div>
            </Split>
          </>
        )}
      </main>

      {error.length > 0 && (
        <div className="absolute inset-0 bg-base-100 opacity-50 flex items-center justify-center">
          {error}
        </div>
      )}
    </>
  );
};

export default NotePage;
