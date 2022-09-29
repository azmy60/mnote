import debounce from "lodash.debounce";
import { marked } from "marked";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useBeforeunload } from "react-beforeunload";
import shallow from "zustand/shallow";
import { useNoteWindowStore } from "../NoteWindowStore";
import TextareaAutoSize from "react-textarea-autosize";
import Split from "react-split";
import { signIn, useSession } from "next-auth/react";
import { Note } from "@prisma/client";

const debouncedSaveNoteName = debounce(
  (name: string, afterSave: () => void) => {
    useNoteWindowStore.getState().saveNameHandler(name);
    afterSave();
  },
  3000
);

const debouncedSaveNoteContent = debounce(
  (content: string, afterSave: () => void) => {
    useNoteWindowStore.getState().saveContentHandler(content);
    afterSave();
  },
  3000
);

function NoteName() {
  const name = useNoteWindowStore((state) => state.name);
  const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    useNoteWindowStore.setState({
      dirtyName: true,
      name,
      saving: true,
    });
    debouncedSaveNoteName(name, () =>
      useNoteWindowStore.setState({ dirtyName: false, saving: false })
    );
  };

  return (
    <input
      type="text"
      className="input input-ghost input-xs text-base px-0 mt-0.5"
      onChange={(e) => changeHandler(e)}
      value={name}
    />
  );
}

function NoteEditor() {
  const { content, previewWidth } = useNoteWindowStore(
    (state) => ({
      content: state.content,
      previewWidth: state.previewWidth,
    }),
    shallow
  );
  const textarea = useRef<HTMLTextAreaElement>(null);

  const changeHandler = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    useNoteWindowStore.setState({
      content,
      dirtyContent: true,
      saving: true,
    });
    // TODO useCallback??
    debouncedSaveNoteContent(content, () =>
      useNoteWindowStore.setState({ dirtyContent: false, saving: false })
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
  const content = useNoteWindowStore((state) => state.content);
  const preview = useRef<HTMLDivElement>(null);

  useEffect(() => {
    useNoteWindowStore.setState({ previewWidth: preview.current!.scrollWidth });
  }, [content]);

  return (
    <div
      ref={preview}
      dangerouslySetInnerHTML={{ __html: marked.parse(content) }}
      className="prose"
    />
  );
}

interface NoteWindowProps {
  note: Pick<Note, "name" | "content">;
  saveNameHandler: (name: string) => void;
  saveContentHandler: (content: string) => void;
}

export const NoteWindow = ({
  note,
  saveNameHandler,
  saveContentHandler,
}: NoteWindowProps) => {
  const { status } = useSession();
  const { name, dirtyName, dirtyContent, saving } = useNoteWindowStore(
    (state) => ({
      name: state.name,
      dirtyName: state.dirtyName,
      dirtyContent: state.dirtyContent,
      saving: state.saving,
    }),
    shallow
  );
  const [title, setTitle] = useState("mnote");

  useEffect(() => {
    useNoteWindowStore.setState({ saveNameHandler, saveContentHandler });
  }, []);

  useEffect(() => {
    if (name.length > 0) setTitle(`mnote | ${name}`);
    else setTitle("mnote");
  }, [name]);

  useEffect(() => {
    if (!note) return;
    useNoteWindowStore.setState({
      name: note.name,
      content: note.content,
    });
  }, [note]);

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
        <>
          <div className="flex items-center justify-between bg-base-100 px-4 py-2 border-b border-neutral/25">
            <div className="flex items-center gap-2">
              <Link href="/">
                <a className="font-bold text-xl leading-none">mnote</a>
              </Link>
              <span className="leading-none">|</span>
              <NoteName />
            </div>
            <div className="flex gap-4 items-center">
              <button className="btn btn-primary btn-sm gap-2" disabled>
                {saving ? (
                  <>
                    {/* TODO better loading icon */}
                    <div
                      className="radial-progress animate-spin"
                      style={{
                        "--value": "70",
                        "--size": "1.25rem",
                        "--thickness": "0.25rem",
                      }}
                    />
                    saving
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.5 17a4.5 4.5 0 01-1.44-8.765 4.5 4.5 0 018.302-3.046 3.5 3.5 0 014.504 4.272A4 4 0 0115 17H5.5zm3.75-2.75a.75.75 0 001.5 0V9.66l1.95 2.1a.75.75 0 101.1-1.02l-3.25-3.5a.75.75 0 00-1.1 0l-3.25 3.5a.75.75 0 101.1 1.02l1.95-2.1v4.59z"
                        clipRule="evenodd"
                      />
                    </svg>
                    saved
                  </>
                )}
              </button>
              {status !== "authenticated" && (
                <button
                  onClick={() => signIn()}
                  className="btn btn-primary btn-sm"
                >
                  Sign in
                </button>
              )}
            </div>
          </div>
          <Split className="flex grow overflow-y-hidden">
            <div className="p-4 overflow-auto border-r border-neutral/25">
              <NoteEditor />
            </div>
            <div className="p-4 overflow-auto border-l border-neutral/25">
              <Preview />
            </div>
          </Split>
        </>
      </main>
    </>
  );
};
