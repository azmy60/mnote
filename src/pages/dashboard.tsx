import { PlusIcon } from "@heroicons/react/24/solid";
import { Note } from "@prisma/client";
import moment from "moment";
import type { GetServerSideProps, NextPage } from "next";
import { unstable_getServerSession } from "next-auth";
import { signOut } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import Router from "next/router";
import { useEffect, useState } from "react";
import { authOptions } from "./api/auth/[...nextauth]";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return { props: {} };
};

const Dashboard: NextPage = () => {
  const [notes, setNotes] = useState([] as Note[]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/notes")
      .then((res) => res.json())
      .then((notes: Note[]) => {
        setNotes(notes);
        setLoading(false);
      });
  }, []);

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
            onClick={async () => {
              const res = await fetch("/api/note");
              const { id } = await res.json();
              Router.push(`/note/${id}`);
            }}
            className="btn btn-primary gap-2"
          >
            <PlusIcon className="w-6 h-6" /> New note
          </button>
        </div>
        <div className="mt-12 grid grid-cols-3 gap-8">
          {loading && (
            <div
              className="radial-progress animate-spin"
              style={{
                "--value": "70",
                "--size": "1.5rem",
                "--thickness": "0.25rem",
              }}
            />
          )}
          {notes.map((note) => (
            <Link key={note.id} href={`/note/${note.id}`}>
              <a>
                <NoteCard note={note} />
              </a>
            </Link>
          ))}
        </div>
      </main>
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

export default Dashboard;
