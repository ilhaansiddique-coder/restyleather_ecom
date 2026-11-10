"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { navigationText } from "@/lib/locale";

export function Footer({ name, description, contactPhone, contactEmail }: { name: string; description: string; contactPhone: string; contactEmail: string }) {
  const locale = useLocale();
  const t = navigationText[locale];
  const bn = locale === "bn";
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = new FormData(event.currentTarget).get("email");
    setStatus("loading");
    try {
      const response = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error ?? "Could not subscribe.");
      setStatus("success");
    } catch (reason) {
      setError(bn ? "সাবস্ক্রাইব করা যায়নি। আবার চেষ্টা করুন।" : reason instanceof Error ? reason.message : "Could not subscribe.");
      setStatus("error");
    }
  }

  return <footer className="bg-stone-950 text-white">
    <div className="store-shell">
      <div className="grid gap-9 py-12 sm:grid-cols-2 lg:grid-cols-[1.15fr_.65fr_.8fr_1.2fr] lg:gap-8 lg:py-16">
        <div>
          <Link href="/" className="font-serif-luxury text-2xl">{name}</Link>
          <p className="mt-3 max-w-[35ch] text-sm leading-relaxed text-[#d9d3ec]">{description}</p>
        </div>
        <div>
          <p className="store-kicker text-amber-300">{bn ? "দোকান" : "Shop"}</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link className="hover:underline" href="/shop">{t.shop}</Link></li>
            <li><Link className="hover:underline" href="/shop?category=bags">{t.bags}</Link></li>
            <li><Link className="hover:underline" href="/shop?category=wallets">{t.wallets}</Link></li>
            <li><Link className="hover:underline" href="/craftsmanship">{t.craft}</Link></li>
          </ul>
        </div>
        <div className="min-w-0">
          <p className="store-kicker text-amber-300">{t.support}</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link className="hover:underline" href="/track-order">{t.tracking}</Link></li>
            <li><Link className="hover:underline" href="/policies">{bn ? "স্টোর নীতিমালা" : "Store policies"}</Link></li>
            <li><a className="break-all hover:underline" href={"mailto:" + contactEmail}>{contactEmail}</a></li>
            <li><a className="hover:underline" href={"tel:" + contactPhone.replace(/[^+\d]/g, "")}>{contactPhone}</a></li>
          </ul>
        </div>
        <div>
          <p className="store-kicker text-amber-300">{bn ? "খবর রাখুন" : "The newsletter"}</p>
          <p className="mt-3 text-sm text-[#d9d3ec]">{bn ? "নতুন পণ্য ও স্টোরের খবর ইমেইলে পান।" : "New pieces and store news, straight to your inbox."}</p>
          {status === "success" ? <p role="status" className="mt-3 text-sm">{bn ? "সাবস্ক্রাইব করার জন্য ধন্যবাদ।" : "You’re subscribed. Thanks for joining."}</p> : <>
            <form onSubmit={subscribe} className="mt-4 flex gap-2">
              <label className="min-w-0 flex-1">
                <span className="sr-only">{bn ? "ইমেইল" : "Email address"}</span>
                <input name="email" type="email" autoComplete="email" required placeholder={bn ? "ইমেইল" : "Email address"} className="min-h-11 w-full rounded-lg border border-[#8177aa] bg-white/5 px-3 text-sm text-white placeholder:text-[#d9d3ec]" />
              </label>
              <button type="submit" disabled={status === "loading"} className="btn-grad btn-grad--fit inline-flex min-h-11 min-w-11 items-center justify-center disabled:opacity-60" aria-label={bn ? "সাবস্ক্রাইব করুন" : "Subscribe"}><ArrowRight className="size-4" aria-hidden /></button>
            </form>
            {status === "error" && <p role="alert" className="mt-2 text-sm text-[#ffbcb4]">{error}</p>}
          </>}
        </div>
      </div>
      <div className="flex flex-wrap justify-between gap-3 border-t border-white/15 py-5 text-xs text-[#d9d3ec]">
        <p>© {new Date().getFullYear()} {name}</p>
        <p>{bn ? "ক্যাশ অন ডেলিভারি" : "Cash on delivery"}</p>
      </div>
    </div>
  </footer>;
}
