"use client";

import { useId, useState, type ComponentPropsWithoutRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";

export function PasswordInput({ className = "", id, disabled, ...props }: Omit<ComponentPropsWithoutRef<"input">, "type">) {
  const [visible, setVisible] = useState(false);
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const bangla = useLocale() === "bn";

  return <span className="relative block min-w-0 w-full">
    <input {...props} id={inputId} disabled={disabled} type={visible ? "text" : "password"}
      className={`${className} pe-12`} />
    <button type="button" disabled={disabled} aria-controls={inputId} aria-pressed={visible}
      aria-label={visible ? (bangla ? "পাসওয়ার্ড লুকান" : "Hide password") : (bangla ? "পাসওয়ার্ড দেখুন" : "Show password")}
      className="absolute inset-y-0 end-0 grid w-11 place-items-center rounded-e-lg text-stone-600 hover:text-stone-900 disabled:opacity-50"
      onClick={() => setVisible((current) => !current)}>
      {visible ? <Eye className="size-5" aria-hidden /> : <EyeOff className="size-5" aria-hidden />}
    </button>
  </span>;
}
