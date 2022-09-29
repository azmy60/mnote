import type { NextPage } from "next";
import { NoteWindow } from "../../components/NoteWindow";
import { useRouter } from "next/router";
import { trpc } from "../../utils/trpc";

const NotePage: NextPage = () => {
  const id = useRouter().query.id as string;
  const { isError, data, error } = trpc.note.byId.useQuery({ id });
  const mutation = trpc.note.edit.useMutation();

  const saveName = (name: string) => mutation.mutate({ id, name });
  const saveContent = (content: string) => mutation.mutate({ id, content });

  if (!data) {
    return (
      <div className="h-screen flex items-center justify-center bg-base-100 font-bold text-5xl">
        <div className="text-5xl font-bold">mnote</div>
        {isError && <div className="text-xl">{error.message}</div>}
      </div>
    );
  }

  return (
    <NoteWindow
      note={data}
      saveNameHandler={saveName}
      saveContentHandler={saveContent}
    />
  );
};

export default NotePage;
