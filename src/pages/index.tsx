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

interface NoteState {
  name: string;
  setName: (name: string) => void;
  content: string;
  setContent: (content: string) => void;
  previewWidth: number;
  setPreviewWidth: (width: number) => void;
  dirtyName: boolean;
  setDirtyName: (dirty: boolean) => void;
  dirtyContent: boolean;
  setDirtyContent: (dirty: boolean) => void;
}

const useStore = create<NoteState>((set) => ({
  name: "",
  content: "",
  setName: (name: string) => set({ name }),
  setContent: (content: string) => set({ content }),
  previewWidth: 0,
  setPreviewWidth: (width: number) => set({ previewWidth: width }),
  dirtyName: false,
  setDirtyName: (dirtyName: boolean) => set({ dirtyName }),
  dirtyContent: false,
  setDirtyContent: (dirtyContent: boolean) => set({ dirtyContent }),
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
  const { name, setName, setDirtyName } = useStore();
  const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDirtyName(true);
    debouncedSaveNoteName(e.target.value, () => setDirtyName(false));
    setName(e.target.value);
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

function NoteContent() {
  const { content, setContent, previewWidth, setDirtyContent } = useStore();
  const textarea = useRef<HTMLTextAreaElement>(null);

  const changeHandler = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setContent(text);
    setDirtyContent(true);
    debouncedSaveNoteContent(text, () => setDirtyContent(false));
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

const Home: NextPage = () => {
  const {
    name,
    setName,
    content,
    setContent,
    setPreviewWidth,
    dirtyName,
    dirtyContent,
  } = useStore();
  const preview = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setContent(loadNoteContent());
    setName(loadNoteName());
  }, []);

  useEffect(() => {
    setPreviewWidth(preview.current!.scrollWidth);
  }, [content]);

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
            <NoteContent />
          </div>
          <div className="p-4 bg-base-200 overflow-x-auto overflow-y-scroll">
            <div
              ref={preview}
              dangerouslySetInnerHTML={{ __html: marked.parse(content) }}
              className="prose"
            />
          </div>
        </Split>
      </main>
    </>
  );
};

export default Home;
