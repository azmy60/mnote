import { PlusIcon } from "@heroicons/react/24/solid";
import { Note } from "@prisma/client";
import moment from "moment";
import type { NextPage } from "next";
import { signOut } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import Router from "next/router";
import { useState } from "react";
import { trpc } from "../utils/trpc";

const NoteGrid = () => {
  const { isError, isLoading, data, error } = trpc.note.all.useQuery();

  if (isLoading) {
    return (
      <div
        className="radial-progress animate-spin"
        style={{
          "--value": "70",
          "--size": "1.5rem",
          "--thickness": "0.25rem",
        }}
      />
    );
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <>
      {data.map((note) => (
        <Link key={note.id} href={`/note/${note.id}`}>
          <a>
            <NoteCard note={note} />
          </a>
        </Link>
      ))}
    </>
  );
};

const NoteCard = ({ note }: { note: Note }) => {
  return (
    <div className="card card-compact bg-base-100 border-2 border-base-300 cursor-pointer">
      <div className="card-body">
        <h2 className="card-title">{note.name}</h2>
        <p className="opacity-50">{moment(note.updatedAt).fromNow()}</p>
      </div>
    </div>
  );
};

const Dashboard: NextPage = () => {
  const mutation = trpc.note.add.useMutation();
  const [disabled, setDisabled] = useState(false);

  const handleClick = async () => {
    setDisabled(true);
    const { id } = await mutation.mutateAsync();
    Router.push(`/note/${id}`);
  };

  return (
    <>
      <Head>
        <title>mnote | Dashboard</title>
        <meta
          name="description"
          content="Take some notes and save it locally."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="mx-auto mt-8 max-w-4xl">
        <div className="w-full flex justify-between">
          <button onClick={() => signOut()} className="btn btn-outline">
            Sign out
          </button>
          <button
            onClick={handleClick}
            disabled={disabled}
            className="btn btn-primary gap-2"
          >
            <PlusIcon className="w-6 h-6" /> New note
          </button>
        </div>
        <div className="mt-12 grid grid-cols-3 gap-8">
          <NoteGrid />
        </div>
      </main>
    </>
  );
};

export default Dashboard;
