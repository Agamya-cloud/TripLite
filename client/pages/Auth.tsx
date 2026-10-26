import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, Plane } from "lucide-react";
import { api, json } from "@/lib/triplite-api";

const input =
  "mt-1.5 h-11 w-full rounded-xl border border-[#e5e4dc] bg-[#fcfbf8] px-3 text-[12px] text-[#34564b] outline-none focus:border-[#4d8d7d] focus:ring-2 focus:ring-[#4d8d7d]/10";
export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api(
        mode === "login" ? "/api/auth/login" : "/api/auth/register",
        json(
          "POST",
          mode === "login" ? { email, password } : { name, email, password },
        ),
      );
      navigate("/");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f7f2] px-5 py-10 text-[#183a34]">
      <section className="w-full max-w-md rounded-[24px] border border-[#e8e5dc] bg-white p-6 shadow-[0_16px_50px_rgba(31,59,49,.07)] sm:p-8">
        <Link to="/" className="mb-8 inline-flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#174f47] text-white">
            <Plane size={18} />
          </span>
          <span className="font-heading text-[20px] font-extrabold tracking-[-.05em]">
            triplite<span className="text-[#e78d62]">.</span>
          </span>
        </Link>
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[.16em] text-[#628273]">
          YOUR TRAVEL SPACE
        </p>
        <h1 className="font-heading text-[28px] font-bold tracking-[-.05em]">
          {mode === "login" ? "Welcome back." : "Create your account."}
        </h1>
        <p className="mt-2 text-[12px] text-[#80877d]">
          {mode === "login"
            ? "Sign in to pick up where your next adventure begins."
            : "Save your trips, plans, checklists, and spending."}
        </p>
        {error && (
          <div
            role="alert"
            className="mt-5 flex gap-2 rounded-xl border border-[#f0d3c8] bg-[#fff7f3] p-3 text-[11px] text-[#9a4e39]"
          >
            <AlertCircle size={15} className="shrink-0" />
            {error}
          </div>
        )}
        <form onSubmit={submit} className="mt-5 space-y-4">
          {mode === "register" && (
            <label className="block text-[10px] font-bold">
              Name
              <input
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={input}
              />
            </label>
          )}
          <label className="block text-[10px] font-bold">
            Email
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={input}
            />
          </label>
          <label className="block text-[10px] font-bold">
            Password
            <input
              required
              type="password"
              minLength={6}
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={input}
            />
          </label>
          <button
            disabled={busy}
            className="h-11 w-full rounded-xl bg-[#174f47] text-[12px] font-bold text-white hover:bg-[#216257] disabled:opacity-50"
          >
            {busy
              ? "Please wait…"
              : mode === "login"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>
        <p className="mt-5 text-center text-[11px] text-[#858b80]">
          {mode === "login" ? "New to TripLite?" : "Already have an account?"}{" "}
          <button
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
            }}
            className="font-bold text-[#287064] hover:underline"
          >
            {mode === "login" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </section>
    </main>
  );
}
