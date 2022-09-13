import { PlusIcon } from "@heroicons/react/24/solid";
import type { NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";

const Notes = [
  {
    title: "My first note",
  },
  {
    title: "My second note",
  },
  {
    title: "My third note",
  },
  {
    title: "My fourth note",
  },
  {
    title: "My fifth note",
  },
];

const Dashboard: NextPage = () => {
  const { data: session } = useSession();

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
          <button className="btn btn-primary gap-2">
            <PlusIcon className="w-6 h-6" /> New note
          </button>
        </div>
        <div className="mt-12 grid grid-cols-3 gap-8">
          {Notes.map((note) => (
            <Link href="/">
              <a>
                <NoteCard title={note.title} />
              </a>
            </Link>
          ))}
        </div>
      </main>

      <div className={`modal ${!session && "modal-open"}`}>
        <div className="modal-box">
          <p>Sign in to get more access for free!</p>
          <div className="modal-action">
            <button onClick={() => signIn()} className="btn">
              Sign In
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const NoteCard = ({ title }: { title: string }) => {
  return (
    <div className="card bg-base-100 border-2 border-base-300 cursor-pointer">
      <div className="card-body">
        <h2 className="card-title">{title}</h2>
      </div>
    </div>
  );
};

export default Dashboard;
