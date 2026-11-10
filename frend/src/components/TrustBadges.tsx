import { ArrowLeftRight, BadgeCheck, Truck } from "lucide-react";

export function TrustBadges({ bangla = false }: { bangla?: boolean }) {
  const items = [
    { Icon: BadgeCheck, en: "Full-grain leather", bn: "ফুল-গ্রেইন চামড়া" },
    { Icon: Truck, en: "Cash on delivery", bn: "ক্যাশ অন ডেলিভারি" },
    { Icon: ArrowLeftRight, en: "Shipping & returns", bn: "ডেলিভারি ও ফেরত", href: "/policies" },
  ];
  return <div className="store-shell">
    <ul className="grid gap-1 rounded-2xl border border-stone-200 bg-white px-4 py-2 sm:grid-cols-3 sm:gap-4 sm:py-4">
      {items.map(({ Icon, en, bn, href }) => <li key={en} className="flex min-h-11 items-center gap-2.5 px-2 text-sm font-semibold sm:justify-center">
        <Icon className="size-4 shrink-0 text-amber-700" aria-hidden />
        {href ? <a href={href} className="underline decoration-stone-300 underline-offset-4 hover:text-amber-900">{bangla ? bn : en}</a> : (bangla ? bn : en)}
      </li>)}
    </ul>
  </div>;
}
