import { Hono, type Context } from "hono";
import { z } from "zod";
import { prisma } from "../db/prisma";
import type { Prisma } from "../generated/prisma/client";

export const roles = ["super_admin", "admin", "staff", "branch_manager", "sales_executive"] as const;
export const isAdmin = (role: string) => role === "admin" || role === "super_admin";
export const branchRole = (role: string) => role === "branch_manager" || role === "sales_executive";
export const recordId = z.number().int().positive().max(2147483647);
export type SessionUser = { id: number; name: string; email: string; role: string; branchId: number | null };
export type ApiEnv = { Variables: { user: SessionUser; tokenHash: string } };

const name = z.string().trim().min(1).max(200);
const branch = z.object({
  code: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{1,24}$/),
  name,
  address: z.string().trim().min(1).max(500),
  active: z.boolean().optional(),
});
const partner = z.object({
  name,
  email: z.email().nullable().optional(),
  phone: z.string().trim().min(1).max(40).nullable().optional(),
  active: z.boolean().optional(),
});
const kinds = ["revenue", "refund", "cost_of_goods", "expense"] as const;
const bookedOn = z.iso.date();
const entry = z.object({
  branchId: recordId,
  kind: z.enum(kinds),
  amount: z.string().regex(/^(?:0|[1-9]\d{0,6})(?:\.\d{1,2})?$/),
  memo: z.string().trim().min(1).max(500),
  bookedOn,
});

async function parseBody<T extends z.ZodType>(c: Context, schema: T) {
  return schema.parse(await c.req.json().catch(() => null));
}

const ok = <T>(c: Context, data: T) => c.json({ success: true, data });
const forbidden = (c: Context) => c.json({ success: false, error: "You do not have access to this operation." }, 403);
const pathId = (value: string) => recordId.parse(Number(value));
const date = (day: string) => new Date(day + "T00:00:00.000Z");

export function audited<T extends { id: number }>(
  actorId: number,
  action: string,
  write: (tx: Prisma.TransactionClient) => Promise<T>,
) {
  return prisma.$transaction(async (tx) => {
    const record = await write(tx);
    await tx.auditEvent.create({ data: { actorId, action, targetId: record.id } });
    return record;
  });
}

export function businessOperations() {
  const routes = new Hono<ApiEnv>();

  routes.get("/branches", async (c) => {
    const user = c.get("user");
    const branches = await prisma.branch.findMany({
      where: branchRole(user.role) ? { id: user.branchId ?? -1 } : {},
      orderBy: { name: "asc" },
    });
    return ok(c, branches);
  });

  routes.post("/branches", async (c) => {
    if (!isAdmin(c.get("user").role)) return forbidden(c);
    const data = await parseBody(c, branch);
    return ok(c, await audited(c.get("user").id, "branch.created", (tx) => tx.branch.create({ data })));
  });

  routes.patch("/branches/:id", async (c) => {
    if (!isAdmin(c.get("user").role)) return forbidden(c);
    const data = await parseBody(c, branch.partial());
    const id = pathId(c.req.param("id"));
    return ok(c, await audited(c.get("user").id, "branch.updated", (tx) => tx.branch.update({ where: { id }, data })));
  });

  for (const [path, kind] of [["/vendors", "vendor"], ["/suppliers", "supplier"]] as const) {
    routes.get(path, async (c) => {
      if (!isAdmin(c.get("user").role)) return forbidden(c);
      return ok(c, await prisma.partner.findMany({ where: { kind }, orderBy: { name: "asc" } }));
    });
    routes.post(path, async (c) => {
      if (!isAdmin(c.get("user").role)) return forbidden(c);
      const data = await parseBody(c, partner);
      return ok(c, await audited(c.get("user").id, kind + ".created", (tx) => tx.partner.create({ data: { ...data, kind } })));
    });
    routes.patch(path + "/:id", async (c) => {
      if (!isAdmin(c.get("user").role)) return forbidden(c);
      const data = await parseBody(c, partner.partial());
      const id = pathId(c.req.param("id")!);
      return ok(c, await audited(c.get("user").id, kind + ".updated", (tx) => tx.partner.update({ where: { id, kind }, data })));
    });
  }

  routes.get("/accounts", async (c) => {
    const user = c.get("user");
    if (!isAdmin(user.role) && user.role !== "branch_manager") return forbidden(c);
    const branchId = c.req.query("branchId");
    if (user.role === "branch_manager" && branchId && Number(branchId) !== user.branchId) return forbidden(c);
    const from = bookedOn.optional().parse(c.req.query("from"));
    const to = bookedOn.optional().parse(c.req.query("to"));
    if (from && to && from > to) return c.json({ success: false, error: "Start date must be before end date." }, 400);
    const where = {
      branchId: user.role === "branch_manager" ? user.branchId ?? -1 : branchId ? pathId(branchId) : undefined,
      bookedOn: { gte: from ? date(from) : undefined, lte: to ? date(to) : undefined },
    };
    const [entries, sums, count] = await prisma.$transaction([
      prisma.accountEntry.findMany({ where, orderBy: [{ bookedOn: "desc" }, { id: "desc" }], take: 100, include: { branch: { select: { name: true } } } }),
      prisma.accountEntry.groupBy({ by: ["kind"], where, orderBy: { kind: "asc" }, _sum: { amountPaisa: true } }),
      prisma.accountEntry.count({ where }),
    ], { isolationLevel: "RepeatableRead" });
    const total = (kind: typeof kinds[number]) => sums.find((item) => item.kind === kind)?._sum?.amountPaisa ?? 0;
    const revenue = total("revenue");
    const refunds = total("refund");
    const costOfGoods = total("cost_of_goods");
    const expenses = total("expense");
    return ok(c, { entries, count, revenue, refunds, costOfGoods, expenses, grossProfit: revenue - refunds - costOfGoods, netProfit: revenue - refunds - costOfGoods - expenses });
  });

  routes.post("/accounts", async (c) => {
    const user = c.get("user");
    if (!isAdmin(user.role) && user.role !== "branch_manager") return forbidden(c);
    const input = await parseBody(c, entry);
    if (user.role === "branch_manager" && input.branchId !== user.branchId) return forbidden(c);
    const [taka, fraction = ""] = input.amount.split(".");
    const amountPaisa = Number(taka) * 100 + Number(fraction.padEnd(2, "0"));
    if (!amountPaisa) return c.json({ success: false, error: "Enter a positive amount." }, 400);
    const active = await prisma.branch.findFirst({ where: { id: input.branchId, active: true }, select: { id: true } });
    if (!active) return c.json({ success: false, error: "Select an active branch." }, 400);
    return ok(c, await audited(user.id, "account.recorded", (tx) => tx.accountEntry.create({ data: {
      branchId: input.branchId, createdById: user.id, amountPaisa,
      kind: input.kind, memo: input.memo, bookedOn: date(input.bookedOn),
    } })));
  });
  routes.get("/audit", async (c) => {
    if (!isAdmin(c.get("user").role)) return forbidden(c);
    return ok(c, await prisma.auditEvent.findMany({
      orderBy: { id: "desc" }, take: 100, include: { actor: { select: { name: true } } },
    }));
  });
  return routes;
}
