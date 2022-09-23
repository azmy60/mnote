import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useRef } from "react";
import { marked } from "marked";
import Split from "react-split";
import { useBeforeunload } from "react-beforeunload";
import debounce from "lodash.debounce";
import TextareaAutoSize from "react-textarea-autosize";
import Link from "next/link";
import {
  saveNoteContent,
  loadNoteName,
  saveNoteName,
  loadNoteContent,
} from "../StorageManager";
import create from "zustand";
import shallow from "zustand/shallow";

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
  const name = useStore((state) => state.name);
  const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    useStore.setState({ dirtyName: true, name: e.target.value });
    debouncedSaveNoteName(e.target.value, () =>
      useStore.setState({ dirtyName: false })
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

const Home: NextPage = () => {
  const { name, dirtyName, dirtyContent } = useStore(
    (state) => ({
      name: state.name,
      dirtyName: state.dirtyName,
      dirtyContent: state.dirtyContent,
    }),
    shallow
  );

  useEffect(() => {
    useStore.setState({ content: loadNoteContent(), name: loadNoteName() });
  }, []);

  useBeforeunload(
    (event: BeforeUnloadEvent) =>
      (dirtyName || dirtyContent) && event.preventDefault()
  );

  return (
    <>
      <Head>
        <title>mnote{name.length > 0 && ` | ${name}`}</title>
        <meta
          name="description"
          content="Take some notes and save it locally."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col h-screen">
        <div className="flex items-center justify-between bg-base-100 px-4 py-2">
          <div className="flex items-center gap-2">
            <Link href="/dashboard">
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
          <div className="p-4 bg-base-200 overflow-x-auto overflow-y-scroll">
            <Preview />
          </div>
        </Split>
      </main>
    </>
  );
};

export default Home;
