import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { authErrorMessage, useAuth } from "@/lib/auth";

export const Route = createFileRoute("/sign-in")({
  head: () => ({
    meta: [
      { title: "Sign in — Halfस्केच" },
      { name: "description", content: "Sign in to Halfस्केच with email or Google." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SignInPage,
});

function SignInPage() {
  const { configured, user, signInEmail, signUpEmail, signInGoogle } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "");
    const password = String(data.get("password") ?? "");
    const name = String(data.get("name") ?? "");
    try {
      if (mode === "up") await signUpEmail(email, password, name);
      else await signInEmail(email, password);
      navigate({ to: "/" });
    } catch (err) {
      setError(authErrorMessage(err));
      setBusy(false);
    }
  }

  async function onGoogle() {
    setBusy(true);
    setError(null);
    try {
      await signInGoogle();
      navigate({ to: "/" });
    } catch (err) {
      setError(authErrorMessage(err));
      setBusy(false);
    }
  }

  if (user) {
    return (
      <div className="mx-auto max-w-md px-5 py-16 text-center">
        <h1 className="heading">You're signed in.</h1>
        <p className="mt-4 text-muted-foreground">{user.email}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-5 py-6 md:py-16">
      <h1 className="heading">{mode === "in" ? "Sign in" : "Create an account"}</h1>
      <p className="type mt-4">Use your email, or continue with Google. Your name, address and cart stay with your account.</p>
      {!configured ? (
        <p className="mt-8 bg-paper p-5 text-sm">Sign-in is not configured yet. Add the Firebase values to the env file and restart the site.</p>
      ) : (
        <>
          <form onSubmit={onSubmit} className="mt-6 space-y-4 md:mt-10 md:space-y-8">
            {mode === "up" && (
              <label className="block">
                <span className="eyebrow text-muted-foreground">Name</span>
                <input name="name" autoComplete="name" required className="field" />
              </label>
            )}
            <label className="block">
              <span className="eyebrow text-muted-foreground">Email</span>
              <input name="email" type="email" autoComplete="email" required className="field" />
            </label>
            <label className="block">
              <span className="eyebrow text-muted-foreground">Password</span>
              <input name="password" type="password" autoComplete={mode === "up" ? "new-password" : "current-password"} required minLength={6} className="field" />
            </label>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <button type="submit" disabled={busy} className="btn-ink w-full justify-center !py-2 md:!py-[0.95rem]">{busy ? "Please wait…" : mode === "in" ? "Sign in" : "Create account"}</button>
          </form>
          <button type="button" disabled={busy} onClick={onGoogle} className="btn-line mt-2 !py-2 md:mt-6 md:!py-[0.95rem]">Continue with Google</button>
          <button type="button" className="mt-2 block text-sm text-muted-foreground underline md:mt-8" onClick={() => { setMode(mode === "in" ? "up" : "in"); setError(null); }}>
            {mode === "in" ? "New here? Create an account" : "Already have an account? Sign in"}
          </button>
        </>
      )}
    </div>
  );
}
