"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { Activity, ArrowUpRight, Building2, CircleDollarSign, LayoutDashboard, Package, Settings2, ShoppingBag, Ticket, Truck, Users, Warehouse } from "lucide-react";
import { DashboardOverview } from "./overview";
import { BranchAccounts } from "./branch-accounts";
import { dashboardRequest as api } from "./dashboard-api";
import { OrderDocument } from "./order-document";
import { PasswordInput } from "@/components/PasswordInput";

type Row = Record<string, unknown> & { id?: number };
type DashboardSession = { user: Row };
type DashboardList = Partial<Record<Section, Row[]>> & { total: number };
type Field = [key: string, label: string, kind?: "number" | "boolean" | "password" | "lines" | "colors" | readonly string[]];
const fields = {
  overview: [],
  products: [
    ["title", "Product name"], ["bengaliTitle", "Bengali name"], ["slug", "URL slug"],
    ["sku", "SKU"], ["category", "Category", ["bags", "wallets", "footwear", "belts", "jackets-gloves", "accessories"]],
    ["price", "Price (BDT)", "number"], ["compareAtPrice", "Original price (BDT)", "number"],
    ["description", "Description"], ["leatherType", "Leather type"], ["dimensions", "Dimensions"],
    ["warranty", "Warranty"], ["images", "Image URLs, one per line", "lines"],
    ["colors", "Colors, one per line (Tan, #A0522D)", "colors"], ["features", "Features, one per line", "lines"],
    ["inStock", "In stock", "boolean"], ["stockQuantity", "Stock quantity (optional)", "number"], ["featured", "Featured", "boolean"],
  ],
  orders: [["status", "Status", ["processing", "quality_checked", "dispatched", "out_for_delivery", "delivered", "cancelled"]]],
  users: [["name", "Name"], ["email", "Email"], ["password", "Password (12+ characters)", "password"], ["role", "Role", ["staff", "admin", "branch_manager", "sales_executive", "super_admin"]], ["branchId", "Assigned branch"], ["active", "Active", "boolean"]],
  coupons: [["code", "Code"], ["percent", "Discount percentage", "number"], ["active", "Active", "boolean"]],
  shipping: [["dhakaFee", "Dhaka fee (BDT)", "number"], ["outsideFee", "Outside Dhaka fee (BDT)", "number"], ["freeThreshold", "Free delivery threshold (BDT)", "number"]],
  courier: [["provider", "Courier", ["manual", "pathao", "steadfast"]], ["enabled", "Enabled", "boolean"]],
  branches: [["name", "Branch name"], ["code", "Branch code"], ["address", "Address"], ["active", "Active", "boolean"]],
  vendors: [["name", "Vendor name"], ["email", "Email"], ["phone", "Phone"], ["active", "Active", "boolean"]],
  suppliers: [["name", "Supplier name"], ["email", "Email"], ["phone", "Phone"], ["active", "Active", "boolean"]],
  accounts: [],
  audit: [],
  "store-profile": [
    ["name", "Store name"], ["description", "Store description"], ["logoUrl", "Logo URL"], ["domain", "Public store URL"],
    ["contactEmail", "Contact email"], ["contactPhone", "Contact phone"], ["primaryColor", "Primary color"], ["accentColor", "Accent color"],
    ["shippingPolicy", "Shipping policy"], ["returnPolicy", "Return policy"], ["privacyPolicy", "Privacy policy"],
  ],
} satisfies Record<string, Field[]>;
type Section = keyof typeof fields;
const navigation = [
  { title: "Store", items: [["overview", "Overview", LayoutDashboard], ["orders", "Orders", ShoppingBag], ["products", "Products", Package], ["coupons", "Coupons", Ticket]] },
  { title: "Operations", items: [["branches", "Branches", Building2], ["vendors", "Vendors", Warehouse], ["suppliers", "Suppliers", Package], ["accounts", "Accounts", CircleDollarSign]] },
  { title: "Administration", items: [["users", "Staff", Users], ["shipping", "Shipping", Truck], ["courier", "Courier", Truck], ["store-profile", "Store setup", Settings2], ["audit", "Audit log", Activity]] },
] as const;
const inputStyle = "block w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900";
const buttonStyle = "rounded-lg btn-grad btn-grad--fit px-4 py-2 text-white disabled:opacity-50";


function formatValue(row: Row, key: string, kind: Field[2]) {
  if (kind === "colors" && Array.isArray(row[key])) return row[key].map((color) => color.name + ", " + color.hex).join("\n");
  if (Array.isArray(row[key])) return row[key].join("\n");
  return String(row[key] ?? (key === "status" ? row.orderStatus : "") ?? "");
}

function ManagementForm({ section, row, save, busy, branches }: { section: Section; row: Row; save: (data: Row) => void; busy: boolean; branches: Row[] }) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const data: Row = {};
    for (const [key, , kind] of fields[section]) {
      const value = String(form.get(key) ?? "").trim();
      if (kind === "boolean") data[key] = form.has(key);
      else if (kind === "number" || key === "branchId") data[key] = value ? Number(value) : null;
      else if (kind === "lines") data[key] = value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      else if (kind === "colors") data[key] = value.split(/\r?\n/).filter(Boolean).map((line) => {
        const [name, hex] = line.split(",");
        return { name: name.trim(), hex: hex?.trim() ?? "" };
      });
      else if (kind === "password") {
        const raw = String(form.get(key) ?? "");
        if (raw) data[key] = raw;
      } else if (!value && (["dimensions", "warranty"].includes(key) || ((section === "vendors" || section === "suppliers") && ["email", "phone"].includes(key)))) data[key] = null;
      else data[key] = value;
    }
    save(data);
  }

  return <form onSubmit={submit} className="grid gap-4 rounded-xl border border-stone-200 bg-white p-5 sm:grid-cols-2">
    {fields[section].map(([key, label, kind]) => <label key={key} className="grid content-start gap-1 text-sm font-medium">
      {label}
      {key === "branchId" ? <select className="store-select w-full" name={key} defaultValue={String(row.branchId ?? "")}>
        <option value="">No branch</option>
        {branches.map((branch) => <option key={branch.id} value={branch.id}>{String(branch.name)}</option>)}
      </select>
        : kind === "boolean" ? <input type="checkbox" className="size-5" name={key} defaultChecked={Boolean(row[key] ?? key !== "featured")} />
        : Array.isArray(kind) ? <select className="store-select w-full" name={key} defaultValue={formatValue(row, key, kind)}>{kind.map((option: string) => <option key={option}>{option}</option>)}</select>
        : kind === "lines" || kind === "colors" || key === "description" || key.endsWith("Policy") ? <textarea className={inputStyle} name={key} rows={3} defaultValue={formatValue(row, key, kind)} />
        : kind === "password" ? <PasswordInput className={inputStyle} name={key} autoComplete="new-password" minLength={12} maxLength={128} required={!row.id} />
        : <input className={inputStyle} name={key} defaultValue={formatValue(row, key, kind)} type={kind === "number" ? "number" : key.toLowerCase().endsWith("email") ? "email" : key.endsWith("Color") ? "color" : "text"} min={kind === "number" ? 0 : undefined} required={!["compareAtPrice", "stockQuantity", "dimensions", "warranty", "phone", "domain"].includes(key) && !(key === "email" && ["vendors", "suppliers"].includes(section))} />}
    </label>)}
    <div><button className={buttonStyle} disabled={busy}>Save changes</button></div>
  </form>;
}

export default function Dashboard() {
  const [user, setUser] = useState<Row | null | undefined>();
  const [section, setSection] = useState<Section>("overview");
  const [rows, setRows] = useState<Row[]>([]);
  const [row, setRow] = useState<Row | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [revision, setRevision] = useState(0);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [document, setDocument] = useState<"invoice" | "packing" | null>(null);
  const [branches, setBranches] = useState<Row[]>([]);
  const [orderFilter, setOrderFilter] = useState({ search: "", status: "" });
  const editor = useRef<HTMLDivElement>(null);
  const single = section === "shipping" || section === "courier" || section === "store-profile";
  const directory = section === "branches" || section === "vendors" || section === "suppliers" || section === "audit";
  const scoped = user?.role === "branch_manager" || user?.role === "sales_executive";
  const activeSection = scoped && section === "overview" ? "orders" : section;
  const admin = user?.role === "admin" || user?.role === "super_admin";

  useEffect(() => {
    if (row && !single) editor.current?.focus();
  }, [row, single]);

  useEffect(() => {
    api<DashboardSession>("/auth/me").then((data) => setUser(data.user)).catch(() => setUser(null));
  }, []);

  useEffect(() => {
    if (!user || (activeSection === "accounts" || activeSection === "overview")) return;
    let current = true;
    const query = new URLSearchParams({ page: String(page) });
    if (activeSection === "orders") {
      if (orderFilter.search) query.set("search", orderFilter.search);
      if (orderFilter.status) query.set("status", orderFilter.status);
    }
    api<Row | Row[] | DashboardList>("/admin/" + activeSection + (single || directory ? "" : "?" + query))
      .then((data) => {
        if (!current) return;
        if (single) setRow(data as Row);
        else if (Array.isArray(data)) {
          setRows(data);
          setTotal(data.length);
        }
        else {
          const list = data as DashboardList;
          setRows(list[activeSection] ?? []);
          setTotal(list.total);
        }
      })
      .catch((error) => { if (current) setError(error.message); })
      .finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [user, activeSection, page, revision, single, directory, orderFilter]);

  useEffect(() => {
    if (!user || (!admin && user.role !== "branch_manager")) return;
    let current = true;
    api<Row[]>("/admin/branches").then((data) => { if (current) setBranches(data); }).catch(() => {});
    return () => { current = false; };
  }, [user, admin, revision]);

  async function action(work: () => Promise<void>) {
    setBusy(true);
    setError("");
    setNotice("");
    try { await work(); }
    catch (error) { setError(error instanceof Error ? error.message : "Request failed."); }
    finally { setBusy(false); }
  }

  function refresh() {
    setLoading(true);
    setRow(null);
    setRevision((value) => value + 1);
  }

  function changePage(next: number) {
    setError("");
    setLoading(true);
    setRow(null);
    setPage(next);
  }

  function selectSection(name: Section) {
    if (activeSection === name) return;
    setSection(name);
    setPage(1);
    setLoading(name !== "accounts" && name !== "overview");
    setRows([]);
    setTotal(0);
    setRow(null);
    setError("");
    setNotice("");
  }

  const canView = (name: Section) => {
    if (admin) return true;
    if (scoped) return name === "orders" || name === "branches" || (name === "accounts" && user?.role === "branch_manager");
    return !["users", "branches", "vendors", "suppliers", "accounts", "audit", "store-profile"].includes(name);
  };
  const sectionLabel = navigation.flatMap(({ items }) => [...items]).find(([name]) => name === activeSection)?.[1] ?? "Overview";

  const message = <>{error && <p role="alert" className="text-red-700">{error}</p>}{notice && <p role="status" className="text-green-800">{notice}</p>}</>;
  if (user === undefined) return <section data-dashboard className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-600">Checking session…</section>;
  if (!user) return <section data-dashboard className="grid min-h-screen place-items-center bg-slate-50 px-4 py-10"><div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
    <p className="mb-2 text-sm font-semibold text-indigo-800">ReStyleather</p><h1 className="font-sans text-2xl font-bold">Staff sign-in</h1><p className="mb-6 mt-2 text-sm text-slate-600">Sign in to manage your store.</p>
    <form className="space-y-4" onSubmit={(event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(event.currentTarget));
      void action(async () => {
        const result = await api<DashboardSession>("/auth/login", "POST", data);
        setLoading(true);
        setUser(result.user);
      });
    }}>
      <label className="block">Email<input name="email" type="email" autoComplete="username" className={inputStyle} required /></label>
      <label className="block">Password<PasswordInput name="password" autoComplete="current-password" className={inputStyle} required /></label>
      {message}
      <button className={buttonStyle} disabled={busy}>Sign in</button>
    </form>
    <Link href="/" className="mt-5 inline-block text-sm font-semibold text-stone-700 underline">Back to storefront</Link>
  </div></section>;

  return <section data-dashboard className="min-h-screen bg-slate-50 text-stone-900 lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
    <aside className="border-b border-slate-200 bg-white lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:border-b-0 lg:border-r">
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 lg:py-6">
        <span className="grid size-9 place-items-center rounded-lg bg-stone-900 text-white"><LayoutDashboard className="size-4" aria-hidden /></span>
        <div><p className="font-bold">ReStyleather</p><p className="text-xs text-slate-600">Store dashboard</p></div>
      </div>
      <nav aria-label="Management sections" className="flex gap-3 overflow-x-auto px-3 py-3 lg:flex-col lg:gap-5 lg:px-4 lg:py-5">
        {navigation.map(({ title, items }) => {
          const visible = items.filter(([name]) => canView(name));
          if (!visible.length) return null;
          return <div key={title} className="flex gap-1 lg:flex-col">
            <p className="mb-1 hidden px-3 text-xs font-semibold text-slate-500 lg:block">{title}</p>
            {visible.map(([name, label, Icon]) => <button key={name} type="button" aria-current={activeSection === name ? "page" : undefined}
              disabled={busy} onClick={() => selectSection(name)}
              className={"flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-semibold " +
                (activeSection === name ? "bg-indigo-50 text-stone-900" : "text-slate-600 hover:bg-slate-100")}>
              <Icon className="size-4" aria-hidden />{label}
            </button>)}
          </div>;
        })}
      </nav>
      <Link href="/" className="mx-5 mb-4 hidden items-center gap-2 text-sm font-semibold text-slate-700 hover:underline lg:inline-flex">
        View storefront <ArrowUpRight className="size-4" aria-hidden />
      </Link>
    </aside>
    <div className="min-w-0">
      <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-7 lg:py-8">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
      <div><h1 className="font-sans text-3xl font-bold">{sectionLabel}</h1><p className="mt-1 text-sm text-slate-600">{String(user.name)} · {String(user.role).replaceAll("_", " ")}</p></div>
      <div className="flex flex-wrap justify-end gap-2">
      <button className="rounded-lg border bg-white px-4 py-2" aria-expanded={changingPassword} onClick={() => setChangingPassword((value) => !value)}>Change password</button>
      <button className={buttonStyle} disabled={busy} onClick={() => void action(async () => {
        await api("/auth/logout", "POST");
        setRows([]);
        setRow(null);
        setSection("overview");
        setPage(1);
        setUser(null);
        setChangingPassword(false);
      })}>Sign out</button>
      </div>
    </header>
    {changingPassword && <form className="grid gap-3 rounded-xl border bg-white p-5 sm:grid-cols-2" onSubmit={(event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(event.currentTarget));
      void action(async () => {
        await api("/auth/password", "POST", data);
        setChangingPassword(false);
        setRow(null);
        setRows([]);
        setSection("overview");
        setPage(1);
        setUser(null);
        setNotice("Password changed. Sign in with your new password.");
      });
    }}>
      <label>Current password<PasswordInput name="currentPassword" autoComplete="current-password" className={inputStyle} required /></label>
      <label>New password<PasswordInput name="newPassword" autoComplete="new-password" className={inputStyle} minLength={12} required /></label>
      <div><button className={buttonStyle} disabled={busy}>Save password</button></div>
    </form>}
    {activeSection === "overview" && <DashboardOverview onSelect={selectSection} />}
    {message}
    {activeSection === "accounts" && <BranchAccounts branches={branches.filter((branch) => typeof branch.id === "number").map((branch) => ({ id: branch.id!, name: String(branch.name), active: Boolean(branch.active) }))} admin={admin} />}
    {activeSection === "orders" && <form className="flex flex-wrap gap-2" onSubmit={(event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      setPage(1);
      setRow(null);
      setLoading(true);
      setOrderFilter({ search: String(form.get("search") ?? ""), status: String(form.get("status") ?? "") });
    }}>
      <input className="rounded-lg border p-2" name="search" aria-label="Search orders" placeholder="Tracking code, name, or phone" defaultValue={orderFilter.search} />
      <select className="store-select" name="status" aria-label="Order status" defaultValue={orderFilter.status}>
        <option value="">All statuses</option>
        {(fields.orders[0][2] as string[]).map((status) => <option key={status}>{status}</option>)}
      </select>
      <button className={buttonStyle}>Filter orders</button>
    </form>}
    {loading && activeSection !== "overview" && <p role="status" className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">Loading…</p>}
    {!loading && !single && activeSection !== "accounts" && activeSection !== "overview" && <>
      {activeSection !== "orders" && activeSection !== "audit" && (!directory || admin) && <button className={buttonStyle} disabled={busy} onClick={() => setRow({})}>Add {({ users: "user", products: "product", branches: "branch", vendors: "vendor", suppliers: "supplier", coupons: "coupon" } as Partial<Record<Section, string>>)[activeSection]}</button>}
      <ul className="divide-y divide-stone-200 rounded-2xl border border-slate-200 bg-white">
        {rows.map((item) => <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5">
          {activeSection === "audit" ? <div><strong>{String(item.action)} · #{String(item.targetId)}</strong><p className="text-sm text-stone-600">{String((item.actor as { name?: string } | undefined)?.name ?? "")} · {new Date(String(item.createdAt)).toLocaleString()}</p></div> :
            <div><strong>{String(item.title ?? item.customerName ?? item.name ?? item.code)}</strong><p className="text-sm text-stone-600">{String(item.trackingCode ?? item.email ?? item.sku ?? item.address ?? item.phone ?? "")} {String(item.orderStatus ?? (item.percent ? item.percent + "%" : ""))}</p></div>}
          {activeSection !== "audit" && (!directory || admin) && <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold hover:bg-slate-50" disabled={busy} onClick={() => { setDocument(null); setRow(item); }}>{activeSection === "orders" ? "View order" : "Edit"}</button>}
        </li>)}
        {rows.length === 0 && <li className="px-5 py-10 text-center text-sm text-slate-600">No records found.</li>}
      </ul>
      {!directory && <div className="flex items-center gap-4 text-sm">
        <button className={buttonStyle} disabled={page === 1 || busy} onClick={() => changePage(page - 1)}>Previous</button>
        <span>Page {page} · {total} records</span>
        <button className={buttonStyle} disabled={page * 30 >= total || busy} onClick={() => changePage(page + 1)}>Next</button>
      </div>}
    </>}
    {!loading && row && <div ref={editor} tabIndex={-1} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-sans text-xl font-semibold">{single ? sectionLabel + " settings" : row.id ? activeSection === "orders" ? "Order details" : "Edit record" : "New record"}</h2>
        {!single && <button type="button" className="text-sm font-semibold text-slate-700 underline" onClick={() => setRow(null)}>Close</button>}
      </div>
      {section === "courier" && <p className="text-sm text-stone-600">Set the store’s preferred courier. Create and track courier bookings in your provider’s portal.</p>}
      {activeSection === "orders" && <div className="space-y-2 rounded-xl border bg-white p-5">
        <p>{String(row.customerName)} · {String(row.phone)} · {String(row.email ?? "")}</p>
        <p>{String(row.address)}, {String(row.district)}</p>
        <p>৳{String(row.total)} · {String(row.paymentMethod)}</p>
        <ul>{Array.isArray(row.items) && row.items.map((item, index) => <li key={index}>{item.quantity} × {item.title} {item.selectedColor}</li>)}</ul>
        <div className="flex flex-wrap gap-3">
          <button className="underline" onClick={() => setDocument("invoice")}>Preview invoice</button>
          <button className="underline" onClick={() => setDocument("packing")}>Preview packing slip</button>
        </div>
        {document && <OrderDocument kind={document} close={() => setDocument(null)} order={{
          trackingCode: String(row.trackingCode), customerName: String(row.customerName), phone: String(row.phone),
          address: String(row.address), district: String(row.district), subtotal: Number(row.subtotal),
          deliveryFee: Number(row.deliveryFee), discount: Number(row.discount ?? 0), total: Number(row.total),
          items: Array.isArray(row.items) ? row.items : [],
        }} />}
        {admin && <form key={row.id} className="flex flex-wrap items-center gap-2" onSubmit={(event) => {
          event.preventDefault();
          const value = String(new FormData(event.currentTarget).get("branchId") ?? "");
          void action(async () => {
            await api("/admin/orders/" + row.id + "/branch", "PATCH", { branchId: value ? Number(value) : null });
            setNotice("Branch assignment saved.");
            refresh();
          });
        }}>
          <select name="branchId" aria-label="Order branch" defaultValue={String(row.branchId ?? "")} className="store-select">
            <option value="">Unassigned</option>
            {branches.filter((branch) => branch.active || branch.id === row.branchId).map((branch) => <option key={branch.id} value={branch.id}>{String(branch.name)}</option>)}
          </select>
          <button className={buttonStyle} disabled={busy}>Assign branch</button>
        </form>}
      </div>}
      {single && !admin
        ? <dl>{fields[section].map(([key, label]) => <div key={key}><dt className="font-medium">{label}</dt><dd>{String(row[key])}</dd></div>)}</dl>
        : !(activeSection === "orders" && user.role === "sales_executive") && <ManagementForm key={activeSection + ":" + (row.id ?? "new") + ":" + revision} section={activeSection} row={row} busy={busy} branches={branches} save={(data) => void action(async () => {
          const path = "/admin/" + activeSection + (single || !row.id ? "" : "/" + row.id) + (activeSection === "orders" ? "/status" : "");
          await api(path, single ? "PUT" : row.id ? "PATCH" : "POST", data);
          setNotice("Changes saved.");
          refresh();
        })} />}
    </div>}
      </div>
    </div>
  </section>;
}
