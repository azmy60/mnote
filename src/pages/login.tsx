import { signIn, signOut, useSession } from "next-auth/react";

const LoginPage = () => {
  const { data: session } = useSession();

  return (
    <main className="flex h-screen items-center justify-center">
      {!session ? (
        <button onClick={() => signIn()} className="btn btn-primary">
          Sign in
        </button>
      ) : (
        <div className="flex items-center gap-4">
          <p>Signed in as <span className="font-bold">{session.user?.name}</span></p>
          <button onClick={() => signOut()} className="btn btn-primary">
            Sign out
          </button>
        </div>
      )}
    </main>
  );
};

export default LoginPage;
