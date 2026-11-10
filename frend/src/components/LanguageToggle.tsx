"use client";

import { useRouter } from "next/navigation";
import { localeCookie, navigationText, type Locale } from "@/lib/locale";

export function LanguageToggle({ locale }: { locale: Locale }) {
  const router = useRouter();

  function setLocale(value: Locale) {
    if (value === locale) return;
    const secure = location.protocol === "https:" ? "; Secure" : "";
    document.cookie = localeCookie + "=" + value + "; Path=/; Max-Age=31536000; SameSite=Lax" + secure;
    router.refresh();
  }

  return <div role="group" aria-label={navigationText[locale].language} className="flex items-center rounded-lg border border-stone-600 p-0.5">
    {(["en", "bn"] as const).map((option) => (
      <button key={option} type="button" aria-label={option === "en" ? "English" : "বাংলা"} aria-pressed={locale === option}
        className={"min-h-8 rounded-md px-2 text-xs font-bold " + (locale === option ? "bg-white text-stone-900" : "text-stone-200 hover:text-white")}
        onClick={() => setLocale(option)}>{option.toUpperCase()}</button>
    ))}
  </div>;
}
