import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { marked } from "marked";
import Split from "react-split";
import debounce from "lodash.debounce";
import TextareaAutoSize from "react-textarea-autosize";
import Link from "next/link";
import {
  saveNoteContent,
  loadNoteName,
  saveNoteName,
  loadNoteContent,
} from "../StorageManager";

const debouncedSaveNoteContent = debounce(saveNoteContent, 1000);
const debouncedSaveNoteName = debounce(saveNoteName, 1000);

function NoteName({ name, setName }: { name: string, setName: (val: string) => void }) {
  const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSaveNoteName(e.target.value);
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

function NoteContent({ content, setContent }: { content: string, setContent: (val: string) => void }) {
  const textarea = useRef<HTMLTextAreaElement>(null);

  const changeHandler = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setContent(text);
    debouncedSaveNoteContent(text);
  };

  useEffect(() => {
    textarea.current!.focus();
  }, []);

  useEffect(() => {
    // TODO use state manager
    // textarea.current!.style.width = `${preview.current!.scrollWidth}px`;
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
  const [content, setContent] = useState('');
  const [name, setName] = useState('');
  const preview = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setContent(loadNoteContent())
    setName(loadNoteName())
  }, []);

  // TODO show yes/no prompt before closing the tab to prevent unsaved note

  return (
    <>
      <Head>
        <title>mnote | {name}</title>
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
            <NoteName name={name} setName={setName} />
          </div>
          <p className="text-sm underline opacity-50">
            Your note is auto-saved. Try to refresh.
          </p>
        </div>
        <Split className="flex grow overflow-y-hidden">
          <div className="p-4 bg-base-100 overflow-auto">
            <NoteContent content={content} setContent={setContent} />
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
