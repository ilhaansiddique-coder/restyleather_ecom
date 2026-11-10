"use client";

import { useEffect, useState } from "react";
import { dashboardRequest } from "./dashboard-api";

type Branch = { id: number; name: string; active: boolean };
type Entry = { id: number; kind: string; amountPaisa: number; memo: string; bookedOn: string; branch: { name: string } };
type Report = { entries: Entry[]; count: number; revenue: number; refunds: number; costOfGoods: number; expenses: number; grossProfit: number; netProfit: number };
const kindLabels: Record<string, string> = { revenue: "Revenue", refund: "Refund", cost_of_goods: "Cost of goods sold", expense: "Operating expense" };
const money = (paisa: number) => new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" }).format(paisa / 100);
const input = "rounded-lg border border-stone-300 bg-white px-3 py-2";
const button = "btn-grad btn-grad--fit rounded-lg px-4 py-2 text-white disabled:opacity-50";

export function BranchAccounts({ branches, admin }: { branches: Branch[]; admin: boolean }) {
  const [report, setReport] = useState<Report>();
  const [filter, setFilter] = useState("");
  const [revision, setRevision] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let current = true;
    dashboardRequest<Report>("/admin/accounts" + filter)
      .then((result) => { if (current) setReport(result); })
      .catch((error: Error) => { if (current) setError(error.message); });
    return () => { current = false; };
  }, [filter, revision]);

  return <section className="space-y-5">
    <div>
      <h2 className="text-xl font-semibold">Branch accounts</h2>
      <p className="text-sm text-stone-600">Profit and loss is calculated from the entries recorded here.</p>
    </div>
    <form className="flex flex-wrap items-end gap-3" onSubmit={(event) => {
      event.preventDefault();
      const params = new URLSearchParams();
      new FormData(event.currentTarget).forEach((value, key) => { if (value) params.set(key, String(value)); });
      setError("");
      const next = "?" + params;
      if (next !== filter) {
        setReport(undefined);
        setFilter(next);
      }
    }}>
      {admin && <label className="grid gap-1">Branch<select className="store-select w-full" name="branchId"><option value="">All branches</option>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></label>}
      <label className="grid gap-1">From<input className={input} name="from" type="date" /></label>
      <label className="grid gap-1">To<input className={input} name="to" type="date" /></label>
      <button className={button}>Apply dates</button>
    </form>
    {error && <p className="text-red-700" role="alert">{error}</p>}
    {report && <>
      <dl className="grid gap-3 sm:grid-cols-3">
        {([["Revenue", report.revenue], ["Refunds", report.refunds], ["Cost of goods", report.costOfGoods], ["Expenses", report.expenses], ["Gross profit", report.grossProfit], ["Net profit / loss", report.netProfit]] as const).map(([label, total]) =>
          <div key={label} className="rounded-lg border bg-white p-4"><dt>{label}</dt><dd className="font-bold">{money(total)}</dd></div>)}
      </dl>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <caption className="text-left text-stone-600">Showing {report.entries.length} of {report.count} entries</caption>
          <thead><tr>{["Date", "Branch", "Type", "Memo", "Amount"].map((column) => <th key={column} scope="col" className="p-2">{column}</th>)}</tr></thead>
          <tbody>{report.entries.map((item) => <tr key={item.id} className="border-t"><td className="p-2">{item.bookedOn.slice(0, 10)}</td><td className="p-2">{item.branch.name}</td><td className="p-2">{kindLabels[item.kind]}</td><td className="p-2">{item.memo}</td><td className="p-2">{money(item.amountPaisa)}</td></tr>)}</tbody>
        </table>
      </div>
    </>}
    <form className="grid gap-3 rounded-xl border bg-white p-5 sm:grid-cols-2" onSubmit={async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const data = Object.fromEntries(new FormData(form));
      setBusy(true);
      setError("");
      try {
        await dashboardRequest("/admin/accounts", "POST", { ...data, branchId: Number(data.branchId) });
        form.reset();
        setRevision((value) => value + 1);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Could not save entry.");
      } finally {
        setBusy(false);
      }
    }}>
      <h3 className="font-semibold sm:col-span-2">Record an entry</h3>
      <label className="grid gap-1">Branch<select name="branchId" className="store-select w-full" required>{branches.filter((branch) => branch.active).map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></label>
      <label className="grid gap-1">Type<select name="kind" className="store-select w-full">{Object.entries(kindLabels).map(([kind, label]) => <option key={kind} value={kind}>{label}</option>)}</select></label>
      <label className="grid gap-1">Amount (BDT)<input name="amount" type="number" min="0.01" max="9999999.99" step="0.01" className={input} required /></label>
      <label className="grid gap-1">Booking date<input name="bookedOn" type="date" className={input} required /></label>
      <label className="grid gap-1 sm:col-span-2">Memo<input name="memo" maxLength={500} className={input} required /></label>
      <div><button className={button} disabled={busy || !branches.some((branch) => branch.active)}>Save entry</button></div>
    </form>
  </section>;
}
