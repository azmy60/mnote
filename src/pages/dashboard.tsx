import type { NextPage } from "next";
import Head from "next/head";

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
        <div className="w-full flex flex-col items-end">
          <button className="btn btn-primary">New note</button>
        </div>
        <div className="mt-12 grid grid-cols-3 gap-8">
          {Notes.map((note) => (
            <NoteCard title={note.title} />
          ))}
        </div>
      </main>
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
