"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { customerRequest, type Customer } from "@/lib/customer-api";
import { navigationText, type Locale } from "@/lib/locale";
import { PasswordInput } from "./PasswordInput";

const input = "w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 focus-visible:outline-2 focus-visible:outline-amber-600";
const button = "btn-grad btn-grad--fit rounded-xl px-5 py-2.5 font-semibold text-white disabled:opacity-50";

export function CustomerAccount({ mode, locale }: { mode: "login" | "signup" | "account"; locale: Locale }) {
  const router = useRouter();
  const [user, setUser] = useState<Customer | null>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const bn = locale === "bn";
  const labels = navigationText[locale];
  const signup = mode === "signup";

  useEffect(() => {
    if (mode !== "account") return;
    let current = true;
    customerRequest("me").then((result) => {
      if (!current) return;
      if (result.status === 401 || (result.status === 200 && !result.user)) router.replace("/login");
      else if (result.user) setUser(result.user);
      else setUser(null);
    }).catch(() => { if (current) setUser(null); });
    return () => { current = false; };
  }, [mode, router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await customerRequest(mode, Object.fromEntries(new FormData(event.currentTarget)));
      if (result.user) router.replace(result.user.role === "customer" ? "/account" : "/dashboard");
      else if (!bn) setError(result.error ?? "Could not complete the request.");
      else if (result.status === 401) setError("ইমেইল বা পাসওয়ার্ড সঠিক নয়।");
      else if (result.status === 409) setError("এই ইমেইল দিয়ে একটি অ্যাকাউন্ট আছে।");
      else setError("অনুরোধটি সম্পন্ন হয়নি। আবার চেষ্টা করুন।");
    } catch {
      setError(bn ? "সংযোগে সমস্যা হয়েছে। আবার চেষ্টা করুন।" : "Could not connect. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    setBusy(true);
    setError("");
    try {
      const result = await customerRequest("logout");
      if (result.status === 200 || result.status === 401) router.replace("/login");
      else setError(bn ? "লগ আউট করা যায়নি।" : "Could not log out.");
    } catch {
      setError(bn ? "সংযোগে সমস্যা হয়েছে। আবার চেষ্টা করুন।" : "Could not connect. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return <section className="mx-auto my-10 max-w-md space-y-5 rounded-2xl border border-stone-200 bg-white p-6 shadow-luxury sm:p-8">
    <h1 className="text-3xl font-bold">{mode === "account" ? labels.account : signup ? labels.signup : labels.login}</h1>
    {mode === "login" && <p className="text-sm text-stone-600">
      {bn ? "গ্রাহক ও স্টাফ অ্যাকাউন্টের জন্য।" : "For customer and staff accounts."}
    </p>}
    {mode === "account" ? (
      user ? <div className="space-y-3">
        <p className="font-semibold">{user.name}</p>
        <p className="text-sm text-stone-600">{user.email}</p>
        <button className={button} disabled={busy} onClick={() => void logout()}>{bn ? "লগ আউট" : "Log out"}</button>
      </div> : <p role="status">{user === null ? (bn ? "অ্যাকাউন্ট লোড করা যায়নি।" : "Could not load your account.") : (bn ? "অ্যাকাউন্ট লোড হচ্ছে…" : "Loading account…")}</p>
    ) : <>
      <form onSubmit={submit} className="grid gap-4">
        {signup && <label className="grid gap-1">{bn ? "পুরো নাম" : "Full name"}<input className={input} name="name" autoComplete="name" maxLength={100} required /></label>}
        <label className="grid gap-1">{bn ? "ইমেইল" : "Email"}<input className={input} name="email" type="email" autoComplete="username" required /></label>
        <label className="grid gap-1">{bn ? "পাসওয়ার্ড" : "Password"}<PasswordInput className={input} name="password" autoComplete={signup ? "new-password" : "current-password"} minLength={signup ? 12 : undefined} maxLength={128} required />
          {signup && <span className="text-sm text-stone-600">{bn ? "কমপক্ষে ১২টি অক্ষর ব্যবহার করুন।" : "Use at least 12 characters."}</span>}
        </label>
        <button className={button} disabled={busy}>{signup ? labels.signup : labels.login}</button>
      </form>
      <p className="text-sm">{signup ? (bn ? "অ্যাকাউন্ট আছে?" : "Already have an account?") : (bn ? "নতুন গ্রাহক?" : "New customer?")}{" "}
        <Link className="font-semibold text-amber-900 underline" href={signup ? "/login" : "/signup"}>{signup ? labels.login : labels.signup}</Link>
      </p>
    </>}
    {error && <p role="alert" className="text-sm text-red-800">{error}</p>}
  </section>;
}
