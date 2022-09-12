import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import { marked } from "marked";
import Split from "react-split";
import debounce from "lodash.debounce";
import TextareaAutoSize from "react-textarea-autosize";

const save = debounce((text: string) => {
  localStorage.setItem("__mnote", text);
}, 1000);

const Home: NextPage = () => {
  const [mdText, setMdText] = useState("");

  const onChangeHandler = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setMdText(text);
    save(text);
    e.target.style.width = `${e.target.scrollWidth}px`;
  };

  useEffect(() => {
    setMdText(localStorage.getItem("__mnote") ?? "");
  }, []);

  return (
    <>
      <Head>
        <title>mnote</title>
        <meta
          name="description"
          content="Take some notes and save it locally."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col h-screen">
        <div className="flex justify-end bg-base-100 px-4 py-2">
          <p className="text-sm underline opacity-50">
            Your note is auto-saved. Try to refresh.
          </p>
        </div>
        <Split className="flex grow overflow-y-hidden">
          <div className="p-4 bg-base-100 overflow-auto">
            <TextareaAutoSize
              value={mdText}
              onChange={onChangeHandler}
              className="bg-transparent resize-none min-w-full whitespace-pre outline-none"
            />
          </div>
          <div className="p-4 bg-base-200 overflow-x-auto overflow-y-scroll">
            <div
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
