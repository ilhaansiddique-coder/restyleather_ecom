import { Hono, type Context, type MiddlewareHandler } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { cors } from "hono/cors";
import { z } from "zod";
import { Prisma } from "../generated/prisma/client";
import { prisma } from "../db/prisma";
import { digest, hashPassword, newToken, verifyPassword } from "./security";
import { couponCode, orderInput, placeOrder, quote, quoteInput, shippingDefaults, statuses } from "./commerce";
import { audited, branchRole, businessOperations, isAdmin, recordId, roles, type ApiEnv as Env, type SessionUser } from "./business-operations";
import { loadStoreProfile, storeProfileInput } from "./store-profile";
import { webOrigins } from "./web-origins";

const cookie = "resty_session";
const customerCookie = "resty_customer_session";
const userSelect = { id: true, name: true, email: true, role: true, active: true, branchId: true } as const;
const validRole = (role: string) => roles.some((allowed) => allowed === role);
const orderScope = (user: SessionUser) => branchRole(user.role) ? { branchId: user.branchId ?? -1 } : {};
const sessionSeconds = 60 * 60 * 12;
const secure = process.env.NODE_ENV === "production";
const app = new Hono<Env>().basePath("/api/v1");
const fail = (c: Context, error: string, status: 400 | 401 | 403 | 404 | 409 | 429 | 503) => c.json({ success: false, error }, status);

const authenticate: MiddlewareHandler<Env> = async (c, next) => {
  const mobile = c.req.path.startsWith("/api/v1/m/");
  const customer = c.req.path.startsWith("/api/v1/customer/auth/");
  const sessionProbe = customer && c.req.method === "GET" && c.req.path.endsWith("/me");
  const token = mobile ? /^Bearer ([a-f0-9]{64})$/i.exec(c.req.header("authorization") ?? "")?.[1] : getCookie(c, customer ? customerCookie : cookie);
  if (sessionProbe && (!token || !process.env.DATABASE_URL)) return ok(c, { user: null });
  if (!token) return fail(c, "Sign in to continue.", 401);
  const tokenHash = digest(token);
  const session = await prisma.session.findUnique({ where: { tokenHash }, include: { user: { select: userSelect } } });
  if (!session?.user.active || session.expiresAt <= new Date() || !(customer ? session.user.role === "customer" : validRole(session.user.role))) {
    if (sessionProbe) return ok(c, { user: null });
    return fail(c, "Session expired or access revoked.", 401);
  }
  if (branchRole(session.user.role) && !(await activeBranch(session.user.branchId))) return fail(c, "Your branch is unavailable.", 403);
  c.set("user", session.user);
  c.set("tokenHash", tokenHash);
  await next();
};

const adminOnly: MiddlewareHandler<Env> = async (c, next) => {
  if (!isAdmin(c.get("user").role)) return fail(c, "Administrator access required.", 403);
  await next();
};

async function body<T extends z.ZodType>(c: Context, schema: T) {
  const json: unknown = await c.req.json().catch(() => null);
  const result = schema.safeParse(json);
  if (!result.success) throw result.error;
  return result.data;
}

const password = z.string().min(12).max(128);
const login = z.object({ email: z.email().trim().toLowerCase(), password: z.string().min(1).max(128) });
async function loginAttempts(key: string, now: Date) {
  const cutoff = new Date(now.getTime() - 15 * 60_000);
  const [attempt] = await prisma.$queryRaw<{ count: number }[]>`
    INSERT INTO "LoginAttempt" ("key", "count", "windowStart") VALUES (${key}, 1, ${now})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "LoginAttempt"."windowStart" <= ${cutoff} THEN 1 ELSE LEAST("LoginAttempt"."count" + 1, 11) END,
      "windowStart" = CASE WHEN "LoginAttempt"."windowStart" <= ${cutoff} THEN ${now} ELSE "LoginAttempt"."windowStart" END
    RETURNING "count"
  `;
  return attempt.count;
}

function authRoutes(mobile: boolean, customer = false) {
  const routes = new Hono<Env>();
  const sessionCookie = customer ? customerCookie : cookie;
  const cookieOptions = { httpOnly: true, secure, sameSite: "Strict", path: "/", maxAge: sessionSeconds } as const;
  if (customer) routes.post("/signup", async (c) => {
    const input = await body(c, z.object({ name: z.string().trim().min(1).max(100), email: login.shape.email, password }));
    const key = digest("customer-signup:" + input.email);
    if (await loginAttempts(key, new Date()) > 10) return fail(c, "Too many attempts. Try again in 15 minutes.", 429);
    const token = newToken();
    const user = await prisma.user.create({
      data: {
        name: input.name, email: input.email, passwordHash: hashPassword(input.password), role: "customer",
        sessions: { create: { tokenHash: digest(token), expiresAt: new Date(Date.now() + sessionSeconds * 1000) } },
      },
      select: userSelect,
    });
    setCookie(c, sessionCookie, token, cookieOptions);
    return c.json({ success: true, data: { user } }, 201);
  });
  async function signIn(c: Context<Env>, unified = false) {
    const input = await body(c, login);
    const key = digest(input.email);
    const now = new Date();
    if (await loginAttempts(key, now) > 10) return fail(c, "Too many sign-in attempts. Try again in 15 minutes.", 429);
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    const allowed = user && ((customer || unified) && user.role === "customer" || !customer && validRole(user.role));
    if (!user?.active || !allowed || !verifyPassword(input.password, user.passwordHash)) {
      return fail(c, "Invalid email or password.", 401);
    }
    if (branchRole(user.role) && !(await activeBranch(user.branchId))) return fail(c, "Your branch is unavailable.", 403);
    const token = newToken();
    const expiresAt = new Date(Date.now() + sessionSeconds * 1000);
    await prisma.$transaction([
      prisma.session.deleteMany({ where: { userId: user.id, expiresAt: { lte: now } } }),
      prisma.session.create({ data: { tokenHash: digest(token), userId: user.id, expiresAt } }),
      prisma.loginAttempt.deleteMany({ where: { key } }),
    ]);
    const { id, name, email, role, branchId } = user;
    if (!mobile) setCookie(c, role === "customer" ? customerCookie : cookie, token, cookieOptions);
    c.header("Cache-Control", "no-store");
    const profile = { id, name, email, role, branchId };
    return mobile ? c.json({ success: true, user: profile, token, expiresAt }) : ok(c, { user: profile });
  }
  routes.post("/login", (c) => signIn(c));
  if (!mobile && !customer) routes.post("/web-login", (c) => signIn(c, true));
  routes.get("/me", authenticate, (c) => mobile ? c.json({ success: true, user: c.get("user") }) : ok(c, { user: c.get("user") }));
  routes.post("/password", authenticate, async (c) => {
    const { currentPassword, newPassword } = await body(c, z.object({ currentPassword: login.shape.password, newPassword: password }));
    const { id } = c.get("user");
    const key = digest("password:" + id);
    if (await loginAttempts(key, new Date()) > 10) return fail(c, "Too many attempts. Try again in 15 minutes.", 429);
    const user = await prisma.user.findUniqueOrThrow({ where: { id }, select: { passwordHash: true } });
    if (!verifyPassword(currentPassword, user.passwordHash)) return fail(c, "Current password is incorrect.", 400);
    if (newPassword === currentPassword) return fail(c, "Choose a different password.", 400);
    await prisma.$transaction([
      prisma.user.update({ where: { id, passwordHash: user.passwordHash }, data: { passwordHash: hashPassword(newPassword) } }),
      prisma.session.deleteMany({ where: { userId: id } }),
      prisma.loginAttempt.deleteMany({ where: { key } }),
      prisma.auditEvent.create({ data: { actorId: id, action: "user.password_changed", targetId: id } }),
    ]);
    if (!mobile) deleteCookie(c, sessionCookie, { path: "/", secure });
    return c.json({ success: true });
  });
  routes.post("/logout", authenticate, async (c) => {
    await prisma.session.deleteMany({ where: { tokenHash: c.get("tokenHash") } });
    if (!mobile) deleteCookie(c, sessionCookie, { path: "/", secure });
    return c.json({ success: true });
  });
  return routes;
}

const label = z.string().trim().min(1).max(200);
const money = z.number().int().min(0).max(100_000);
const product = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(150),
  title: label, bengaliTitle: label, category: label, price: money,
  compareAtPrice: money.nullable().optional(), description: z.string().trim().min(1).max(5000),
  leatherType: label, sku: label, dimensions: label.nullable().optional(),
  warranty: label.nullable().optional(),
  images: z.array(z.string().max(1000).refine((url) => /^https?:\/\/[^\s]+$/.test(url) || /^\/(?!\/)[^\s]+$/.test(url))).min(1).max(12),
  colors: z.array(z.object({ name: label, hex: z.string().regex(/^#[a-f0-9]{6}$/i) })).max(30),
  features: z.array(label).max(30), inStock: z.boolean().optional(), featured: z.boolean().optional(),
  stockQuantity: z.number().int().min(0).max(2147483647).nullable().optional(),
});
const coupon = z.object({ code: couponCode, percent: z.number().int().min(1).max(100), active: z.boolean().optional() });
const user = z.object({ name: label, email: z.email().trim().toLowerCase(), password, role: z.enum(roles), branchId: recordId.nullable().optional() });
const activeBranch = (branchId: number | null | undefined) => branchId
  ? prisma.branch.findFirst({ where: { id: branchId, active: true }, select: { id: true } })
  : null;
const shipping = z.object({ dhakaFee: money, outsideFee: money, freeThreshold: money });
const courier = z.object({ provider: z.enum(["pathao", "steadfast", "manual"]), enabled: z.boolean() });
const orderStatus = z.object({ status: z.enum(statuses) });
const id = (c: Context) => z.coerce.number().int().positive().max(2147483647).parse(c.req.param("id"));
const ok = <T>(c: Context, data: T) => c.json({ success: true, data });
function pagination(c: Context) {
  const page = z.coerce.number().int().min(1).max(10_000).parse(c.req.query("page") ?? 1);
  const take = z.coerce.number().int().min(1).max(100).parse(c.req.query("limit") ?? c.req.query("pageSize") ?? 30);
  return { page, take, skip: (page - 1) * take };
}

function managementRoutes(mobile: boolean) {
  const routes = new Hono<Env>();
  const users = mobile ? "/staff" : "/users";
  const settings = mobile ? "/admin" : "";
  const list = <T>(c: Context, key: string, data: T[], total: number, page: number, take: number) => mobile
    ? c.json({ success: true, data, pagination: { page, pageSize: take, total, totalPages: Math.max(1, Math.ceil(total / take)) } })
    : ok(c, { [key]: data, total, page, limit: take });
  routes.use("*", authenticate);
  routes.use("*", async (c, next) => {
    const { role } = c.get("user");
    if (branchRole(role)) {
      const path = c.req.path.replace(/^\/api\/v1\/(admin|m)\//, "");
      const read = c.req.method === "GET";
      const allowed = (read && /^(branches|orders(?:\/[^/]+)?)$/.test(path))
        || (role === "branch_manager" && (path === "accounts" || (c.req.method === "PATCH" && /^orders\/\d+(\/status)?$/.test(path))));
      if (!allowed) return fail(c, "You do not have access to this operation.", 403);
    }
    await next();
  });
  routes.route("/", businessOperations());
  routes.get("/store-profile", adminOnly, async (c) => ok(c, await loadStoreProfile()));
  routes.put("/store-profile", adminOnly, async (c) => {
    const data = await body(c, storeProfileInput);
    return ok(c, await audited(c.get("user").id, "store.profile_updated", (tx) => tx.storeProfile.upsert({
      where: { id: 1 }, create: { id: 1, ...data }, update: data,
    })));
  });
  routes.get("/dashboard", async (c) => {
    const [products, coupons, statuses, dailyOrders] = await Promise.all([
      prisma.product.count(),
      prisma.coupon.count({ where: { active: true } }),
      prisma.order.groupBy({ by: ["orderStatus"], _count: { _all: true } }),
      prisma.$queryRaw<{ day: string; count: number }[]>`
        WITH bounds AS (
          SELECT (now() AT TIME ZONE 'Asia/Dhaka')::date AS today
        ), daily AS (
          SELECT ((created_at AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Dhaka')::date AS day,
                 count(*)::int AS count
          FROM orders, bounds
          WHERE created_at >= (((today - 13)::timestamp AT TIME ZONE 'Asia/Dhaka') AT TIME ZONE 'UTC')
            AND created_at < (((today + 1)::timestamp AT TIME ZONE 'Asia/Dhaka') AT TIME ZONE 'UTC')
          GROUP BY 1
        )
        SELECT to_char(bounds.today - days.day_index, 'YYYY-MM-DD') AS day,
               coalesce(daily.count, 0) AS count
        FROM bounds CROSS JOIN generate_series(0, 13) AS days(day_index)
        LEFT JOIN daily ON daily.day = bounds.today - days.day_index
        ORDER BY day
      `,
    ]);
    const orderStatuses = statuses.map(({ orderStatus, _count }) => ({ status: orderStatus, count: _count._all }));
    const orders = orderStatuses.reduce((sum, item) => sum + item.count, 0);
    const openOrders = orderStatuses.reduce((sum, item) => sum + (["delivered", "cancelled"].includes(item.status) ? 0 : item.count), 0);
    return ok(c, { products, orders, openOrders, coupons, dailyOrders, orderStatuses });
  });
  routes.get("/products", async (c) => {
    const { page, skip, take } = pagination(c);
    const [products, total] = await Promise.all([prisma.product.findMany({ orderBy: { id: "desc" }, skip, take }), prisma.product.count()]);
    return list(c, "products", products, total, page, take);
  });
  routes.get("/products/:id", async (c) => ok(c, await prisma.product.findUniqueOrThrow({ where: { id: id(c) } })));
  routes.post("/products", async (c) => ok(c, await prisma.product.create({ data: await body(c, product) })));
  routes.patch("/products/:id", async (c) => ok(c, await prisma.product.update({ where: { id: id(c) }, data: await body(c, product.partial()) })));
  routes.get("/orders", async (c) => {
    const { page, skip, take } = pagination(c);
    const status = z.enum(statuses).optional().parse(c.req.query("status"));
    const search = z.string().trim().max(150).optional().parse(c.req.query("search"));
    const where: Prisma.OrderWhereInput = {
      ...orderScope(c.get("user")),
      orderStatus: status,
      OR: search ? [{ trackingCode: { contains: search, mode: "insensitive" } }, { customerName: { contains: search, mode: "insensitive" } }, { phone: { contains: search } }] : undefined,
    };
    const [orders, total] = await Promise.all([prisma.order.findMany({ where, orderBy: { id: "desc" }, skip, take }), prisma.order.count({ where })]);
    return list(c, "orders", orders, total, page, take);
  });
  routes.get("/orders/statuses", (c) => ok(c, statuses.map((key) => ({ key, label: key.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase()) }))));
  routes.get("/orders/:id", async (c) => ok(c, await prisma.order.findUniqueOrThrow({ where: { id: id(c), ...orderScope(c.get("user")) } })));
  routes.patch("/orders/:id/branch", adminOnly, async (c) => {
    const { branchId } = await body(c, z.object({ branchId: recordId.nullable() }));
    if (branchId && !(await activeBranch(branchId))) return fail(c, "Select an active branch.", 400);
    return ok(c, await audited(c.get("user").id, "order.branch_assigned", (tx) => tx.order.update({ where: { id: id(c) }, data: { branchId } })));
  });
  const updateStatus = async (c: Context<Env>) => {
    const { status } = await body(c, orderStatus);
    const user = c.get("user");
    return ok(c, await audited(user.id, "order.status_updated", (tx) => tx.order.update({ where: { id: id(c), ...orderScope(user) }, data: { orderStatus: status } })));
  };
  routes.patch("/orders/:id/status", updateStatus);
  if (mobile) {
    routes.post("/orders", async (c) => {
      const result = await placeOrder(await body(c, orderInput));
      return "error" in result ? fail(c, result.error!, "conflict" in result ? 409 : 400) : ok(c, result);
    });
    routes.patch("/orders/:id", updateStatus);
    routes.post("/orders/:id/cancel", async (c) => ok(c, await prisma.order.update({
      where: { id: id(c) }, data: { orderStatus: "cancelled" },
    })));
  }
  routes.get("/coupons", async (c) => {
    const { page, skip, take } = pagination(c);
    const [coupons, total] = await Promise.all([prisma.coupon.findMany({ orderBy: { id: "desc" }, skip, take }), prisma.coupon.count()]);
    return list(c, "coupons", coupons, total, page, take);
  });
  routes.post("/coupons", async (c) => ok(c, await prisma.coupon.create({ data: await body(c, coupon) })));
  routes.patch("/coupons/:id", async (c) => ok(c, await prisma.coupon.update({ where: { id: id(c) }, data: await body(c, coupon.partial()) })));
  routes.delete("/coupons/:id", async (c) => {
    await prisma.coupon.delete({ where: { id: id(c) } });
    return ok(c, null);
  });
  routes.get(users, adminOnly, async (c) => {
    const { page, skip, take } = pagination(c);
    const where = { role: { in: [...roles] } };
    const [users, total] = await Promise.all([prisma.user.findMany({ where, select: userSelect, orderBy: { id: "desc" }, skip, take }), prisma.user.count({ where })]);
    return list(c, "users", users, total, page, take);
  });
  routes.post(users, adminOnly, async (c) => {
    const { password, ...data } = await body(c, user);
    if ((branchRole(data.role) || data.branchId) && !(await activeBranch(data.branchId))) return fail(c, "Select an active branch.", 400);
    if (data.role === "super_admin" && c.get("user").role !== "super_admin") return fail(c, "Super administrator access required.", 403);
    const passwordHash = hashPassword(password);
    return ok(c, await audited(c.get("user").id, "user.created", (tx) => tx.user.create({ data: { ...data, passwordHash }, select: userSelect })));
  });
  routes.patch(users + "/:id", adminOnly, async (c) => {
    const target = id(c);
    const { password, ...data } = await body(c, user.partial().extend({ active: z.boolean().optional() }));
    if (target === c.get("user").id && (data.active === false || (data.role && data.role !== c.get("user").role))) return fail(c, "You cannot remove your own administrator access.", 409);
    const existing = await prisma.user.findUniqueOrThrow({ where: { id: target, role: { in: [...roles] } }, select: userSelect });
    if ((existing.role === "super_admin" || data.role === "super_admin") && c.get("user").role !== "super_admin") return fail(c, "Super administrator access required.", 403);
    const branchId = data.branchId === undefined ? existing.branchId : data.branchId;
    if ((data.active ?? existing.active) && (branchRole(data.role ?? existing.role) || data.branchId) && !(await activeBranch(branchId))) {
      return fail(c, "Select an active branch.", 400);
    }
    const updated = await audited(c.get("user").id, "user.updated", async (tx) => {
      const updated = await tx.user.update({ where: { id: target }, data: { ...data, passwordHash: password ? hashPassword(password) : undefined }, select: userSelect });
      if (password || data.active === false || data.role || data.branchId !== undefined) await tx.session.deleteMany({ where: { userId: target } });
      return updated;
    });
    return ok(c, updated);
  });
  routes.get(settings + "/shipping", async (c) => ok(c, await prisma.shipping.findUnique({ where: { id: 1 } }) ?? shippingDefaults));
  routes.put(settings + "/shipping", adminOnly, async (c) => {
    const data = await body(c, shipping);
    return ok(c, await prisma.shipping.upsert({ where: { id: 1 }, update: data, create: { id: 1, ...data } }));
  });
  routes.get(settings + "/courier", async (c) => ok(c, await prisma.courier.findUnique({ where: { id: 1 } }) ?? { provider: "manual", enabled: false }));
  routes.put(settings + "/courier", adminOnly, async (c) => {
    const data = await body(c, courier);
    return ok(c, await prisma.courier.upsert({ where: { id: 1 }, update: data, create: { id: 1, ...data } }));
  });
  return routes;
}

const mobileOrigin = process.env.FLUTTER_WEB_ORIGIN;
if (mobileOrigin) app.use("/m/*", cors({
  origin: mobileOrigin,
  allowHeaders: ["Authorization", "Content-Type"],
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
}));

app.use("*", async (c, next) => {
  c.header("Cache-Control", "no-store");
  const publicRead = c.req.method === "GET" && ["/api/v1/customer/auth/me", "/api/v1/store/shipping"].includes(c.req.path);
  if (!process.env.DATABASE_URL && !publicRead) return fail(c, "Database is not configured.", 503);
  const origin = c.req.header("origin");
  const allowedOrigins = webOrigins(process.env.APP_ORIGIN, new URL(c.req.url).origin, process.env.NODE_ENV === "production");
  const allowedMobile = c.req.path.startsWith("/api/v1/m/") && origin === mobileOrigin;
  if (origin && !allowedOrigins.has(origin) && !allowedMobile && !["GET", "HEAD", "OPTIONS"].includes(c.req.method)) return fail(c, "Cross-origin request blocked.", 403);
  await next();
});

app.onError((error, c) => {
  if (error instanceof z.ZodError) return fail(c, error.issues.map((issue) => issue.path.join(".") + ": " + issue.message).join("; "), 400);
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") return fail(c, "Record not found.", 404);
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return fail(c, "A record with that value already exists.", 409);
  console.error("API error", error.name);
  return c.json({ success: false, error: "Request failed." }, 500);
});

app.get("/store/shipping", async (c) => {
  const settings = process.env.DATABASE_URL ? await prisma.shipping.findUnique({ where: { id: 1 } }) : null;
  return ok(c, settings ?? shippingDefaults);
});
app.get("/store/coupons/:code", async (c) => {
  const code = couponCode.parse(c.req.param("code"));
  const coupon = await prisma.coupon.findUnique({ where: { code } });
  if (!coupon?.active) return fail(c, "This coupon is unavailable.", 404);
  return ok(c, { code, percent: coupon.percent });
});
app.post("/store/quote", async (c) => {
  const result = await quote(await body(c, quoteInput));
  return result.error ? fail(c, result.error, 400) : ok(c, result);
});
app.post("/store/orders", async (c) => {
  const result = await placeOrder(await body(c, orderInput));
  return "error" in result ? fail(c, result.error!, "conflict" in result ? 409 : 400) : c.json(result, 201);
});
app.route("/auth", authRoutes(false));
app.route("/customer/auth", authRoutes(false, true));
app.route("/m/auth", authRoutes(true));
app.route("/admin", managementRoutes(false));
app.route("/m", managementRoutes(true));

export { app as versionedApi };
