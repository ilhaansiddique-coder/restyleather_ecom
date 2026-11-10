"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Clock3, Package, ShoppingBag, Ticket } from "lucide-react";
import { dashboardRequest } from "./dashboard-api";

const metrics = [
  { key: "orders", label: "Total orders", section: "orders", Icon: ShoppingBag },
  { key: "openOrders", label: "Open orders", section: "orders", Icon: Clock3 },
  { key: "products", label: "Products", section: "products", Icon: Package },
  { key: "coupons", label: "Active coupons", section: "coupons", Icon: Ticket },
] as const;

type OverviewStats = Record<typeof metrics[number]["key"], number> & {
  dailyOrders: { day: string; count: number }[];
  orderStatuses: { status: string; count: number }[];
};

const dateLabel = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: "UTC" });
const formatDay = (day: string) => dateLabel.format(new Date(day + "T00:00:00Z"));

export function DashboardOverview({ onSelect }: {
  onSelect: (section: "orders" | "products" | "coupons") => void;
}) {
  const [stats, setStats] = useState<OverviewStats>();
  const [error, setError] = useState("");
  useEffect(() => {
    let current = true;
    dashboardRequest<NonNullable<typeof stats>>("/admin/dashboard")
      .then((data) => { if (current) setStats(data); })
      .catch((reason: Error) => { if (current) setError(reason.message); });
    return () => { current = false; };
  }, []);
  const dailyOrders = stats?.dailyOrders ?? [];
  const orderStatuses = stats?.orderStatuses ?? [];
  const peak = Math.max(1, ...dailyOrders.map(({ count }) => count));
  const recentTotal = dailyOrders.reduce((sum, { count }) => sum + count, 0);

  return <section aria-label="Store activity" className="space-y-5">
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {metrics.map(({ key, label, section, Icon }) => (
        <button key={key} type="button" onClick={() => onSelect(section)}
          className="rounded-2xl border border-slate-200 bg-white p-4 text-left hover:border-indigo-300 sm:p-5">
          <span className="flex items-center justify-between gap-2">
            <span className="grid size-10 place-items-center rounded-xl bg-indigo-50 text-stone-900"><Icon className="size-5" aria-hidden /></span>
            <ArrowUpRight className="size-4 text-slate-500" aria-hidden />
          </span>
          <span className="mt-5 block text-3xl font-bold tabular-nums text-stone-900">{stats ? stats[key].toLocaleString() : "—"}</span>
          <span className="mt-1 block text-sm text-slate-600">{label}</span>
        </button>
      ))}
    </div>
    <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
        <h2 className="font-sans text-lg font-semibold">Orders over time</h2>
        <p className="mt-1 text-sm text-slate-600">Last 14 days · Dhaka time</p>
        {stats && dailyOrders.length > 0 ? <>
          <p className="mt-4 text-2xl font-bold tabular-nums">{recentTotal.toLocaleString()} <span className="text-sm font-normal text-slate-600">orders placed</span></p>
          <div className="mt-4 grid h-36 grid-cols-[repeat(14,minmax(0,1fr))] items-end gap-1 border-b border-slate-200 bg-slate-50 px-1 sm:gap-2" aria-hidden="true">
            {dailyOrders.map(({ day, count }) => <div key={day} title={`${formatDay(day)}: ${count} orders`}
              className="rounded-t bg-stone-900"
              style={{ height: count ? `${count / peak * 100}%` : "2px", opacity: count ? 1 : 0.16 }} />)}
          </div>
          <div className="mt-2 flex justify-between text-xs text-slate-600" aria-hidden="true">
            <span>{formatDay(dailyOrders[0].day)}</span><span>{formatDay(dailyOrders[6].day)}</span><span>{formatDay(dailyOrders.at(-1)!.day)}</span>
          </div>
          {recentTotal === 0 && <p className="mt-3 text-sm text-slate-600">No orders were placed in this period.</p>}
          <details className="mt-4 text-sm">
            <summary className="cursor-pointer font-semibold text-stone-900">View daily counts</summary>
            <dl className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {dailyOrders.map(({ day, count }) => <div key={day} className="rounded-lg bg-slate-50 px-3 py-2"><dt className="text-slate-600">{formatDay(day)}</dt><dd className="font-semibold">{count}</dd></div>)}
            </dl>
          </details>
        </> : <p className="mt-5 text-sm text-slate-600">{error ? "Order activity unavailable." : "Loading order activity…"}</p>}
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
        <h2 className="font-sans text-lg font-semibold">Orders by status</h2>
        <p className="mt-1 text-sm text-slate-600">All orders</p>
        {orderStatuses.length > 0 ? <ul className="mt-5 space-y-4">
          {orderStatuses.map(({ status, count }) => <li key={status}>
            <div className="mb-1.5 flex justify-between gap-3 text-sm"><span className="capitalize">{status.replaceAll("_", " ")}</span><span className="font-semibold tabular-nums">{count.toLocaleString()}</span></div>
            <div aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-stone-900" style={{ width: `${count / (stats?.orders || 1) * 100}%` }} />
            </div>
          </li>)}
        </ul> : <p className="mt-5 text-sm text-slate-600">{stats ? "No orders yet." : error ? "Order statuses unavailable." : "Loading order statuses…"}</p>}
      </section>
    </div>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <h2 className="font-sans text-lg font-semibold text-stone-900">Quick actions</h2>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" className="rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white" onClick={() => onSelect("orders")}>Review orders</button>
        <button type="button" className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-stone-900" onClick={() => onSelect("products")}>Manage catalog</button>
      </div>
    </section>
  </section>;
}
