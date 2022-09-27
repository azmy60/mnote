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

const debouncedSaveNoteName = debounce(
  (name: string, afterSave: () => void) => {
    useNoteWindowStore.getState().saveNameHandler(name);
    afterSave();
  },
  1000
);

const debouncedSaveNoteContent = debounce(
  (content: string, afterSave: () => void) => {
    useNoteWindowStore.getState().saveContentHandler(content);
    afterSave();
  },
  1000
);

function NoteName() {
  const name = useNoteWindowStore((state) => state.name);
  const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    useNoteWindowStore.setState({ dirtyName: true, name: e.target.value });
    debouncedSaveNoteName(e.target.value, () =>
      useNoteWindowStore.setState({ dirtyName: false })
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
    const text = e.target.value;
    useNoteWindowStore.setState({ content: text, dirtyContent: true });
    // TODO useCallback??
    debouncedSaveNoteContent(text, () =>
      useNoteWindowStore.setState({ dirtyContent: false })
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
  loadNoteHandler: () => Promise<{ name: string; content: string }>;
  saveNameHandler: (name: string) => void;
  saveContentHandler: (content: string) => void;
  error: string;
}

export const NoteWindow = ({
  loadNoteHandler,
  saveNameHandler,
  saveContentHandler,
  error,
}: NoteWindowProps) => {
  const { name, dirtyName, dirtyContent } = useNoteWindowStore(
    (state) => ({
      name: state.name,
      dirtyName: state.dirtyName,
      dirtyContent: state.dirtyContent,
    }),
    shallow
  );
  const [title, setTitle] = useState("mnote");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    loadNoteHandler().then(({ name, content }) => {
      useNoteWindowStore.setState({
        name,
        content,
        saveNameHandler,
        saveContentHandler,
      });
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (name.length > 0) setTitle(`mnote | ${name}`);
    else setTitle("mnote");
  }, [name]);

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
        {loading ? (
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
