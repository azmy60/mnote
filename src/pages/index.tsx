import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { marked } from "marked";
import Split from "react-split";
import debounce from "lodash.debounce";
import TextareaAutoSize from "react-textarea-autosize";
import Link from "next/link";
import { loadNote, saveNote } from "../StorageManager";

const save = debounce(saveNote, 1000);

const Home: NextPage = () => {
  const [mdText, setMdText] = useState("");
  const [fileName, setFileName] = useState("Untitled");
  const preview = useRef<HTMLDivElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);

  const onChangeHandler = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setMdText(text);
    save(text);
  };

  useEffect(() => {
    setMdText(loadNote());
    textarea.current!.focus();
  }, []);

  useEffect(() => {
    textarea.current!.style.width = `${preview.current!.scrollWidth}px`;
  }, [mdText]);

  return (
    <>
      <Head>
        <title>mnote | {fileName}</title>
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
            <input
              type="text"
              className="input input-ghost input-xs text-base px-0 mt-0.5"
              onChange={(e) => setFileName(e.target.value)}
              value={fileName}
            />
          </div>
          <p className="text-sm underline opacity-50">
            Your note is auto-saved. Try to refresh.
          </p>
        </div>
        <Split className="flex grow overflow-y-hidden">
          <div className="p-4 bg-base-100 overflow-auto">
            <TextareaAutoSize
              ref={textarea}
              value={mdText}
              onChange={onChangeHandler}
              placeholder="Start typing your note here!"
              className="bg-transparent resize-none min-w-full min-h-full whitespace-pre outline-none"
            />
          </div>
          <div className="p-4 bg-base-200 overflow-x-auto overflow-y-scroll">
            <div
              ref={preview}
              dangerouslySetInnerHTML={{ __html: marked.parse(mdText) }}
              className="prose"
            />
          </div>
        </Split>
      </main>
    </>
  );
};

export default Home;
