import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";

test("branch staff access, order assignment, accounts, and credential rotation", async () => {
  assert.ok(process.env.TEST_DATABASE_URL, "Set TEST_DATABASE_URL to a disposable migrated PostgreSQL database.");
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
  const { app } = await import("../src/app");
  const { prisma } = await import("../src/db/prisma");
  const { hashPassword } = await import("../src/server/security");
  const run = randomUUID().slice(0, 8);
  const password = "test-password-1234";
  const email = (role: string) => role + "-" + run + "@example.test";

  async function call<T = unknown>(path: string, expected: number, options: { token?: string; method?: string; body?: unknown } = {}) {
    const response = await app.request("/api/v1/m/" + path, {
      method: options.method ?? "GET",
      headers: { ...(options.token ? { Authorization: "Bearer " + options.token } : {}), "Content-Type": "application/json" },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
    const result = await response.json();
    assert.equal(response.status, expected, path + " " + JSON.stringify(result));
    return result as { data: T; token?: string };
  }

  async function signIn(role: string, credential = password) {
    return (await call("auth/login", 200, { method: "POST", body: { email: email(role), password: credential } })).token as string;
  }

  try {
    await prisma.user.create({ data: { email: email("admin"), name: "Test admin", passwordHash: hashPassword(password), role: "admin" } });
    await call("branches", 401);
    const admin = await signIn("admin");
    const branchIds: number[] = [];
    for (const branch of ["A", "B"]) {
      const { data } = await call<{ id: number }>("branches", 200, { method: "POST", token: admin, body: { code: branch + "-" + run, name: branch, address: "Test address" } });
      branchIds.push(data.id);
    }
    const [branchA, branchB] = branchIds;
    for (const role of ["branch_manager", "sales_executive"]) {
      await call("staff", 200, { method: "POST", token: admin, body: { email: email(role), name: role, password, role, branchId: branchA } });
    }
    const manager = await signIn("branch_manager");
    const sales = await signIn("sales_executive");
    assert.deepEqual((await call<{ id: number }[]>("branches", 200, { token: manager })).data.map((branch) => branch.id), [branchA]);
    await call("staff", 403, { token: manager });
    await call("products", 403, { token: sales });
    await call("store-profile", 403, { token: manager });
    const profile = (await call<Record<string, unknown>>("store-profile", 200, { token: admin })).data;
    await call("store-profile", 200, { token: admin, method: "PUT", body: { ...profile, name: "Test Store", domain: "https://example.test/shop" } });
    const publicProfile = await (await app.request("/api/store-profile")).json() as { name: string; domain: string };
    assert.equal(publicProfile.name, "Test Store");
    assert.equal(publicProfile.domain, "https://example.test");
    await call("accounts", 403, { token: sales });
    await call("accounts?branchId=" + branchB, 403, { token: manager });
    for (const [kind, amount] of [["revenue", "100.25"], ["refund", "5.25"], ["cost_of_goods", "40"], ["expense", "10"]]) {
      await call("accounts", 200, { method: "POST", token: manager, body: { branchId: branchA, kind, amount, memo: "Test posting", bookedOn: "2026-11-06" } });
    }
    await call("accounts", 403, { method: "POST", token: manager, body: { branchId: branchB, kind: "revenue", amount: "10", memo: "Out of scope", bookedOn: "2026-11-06" } });
    const report = (await call<{ grossProfit: number; netProfit: number }>("accounts?branchId=" + branchA + "&from=2026-11-06&to=2026-11-06", 200, { token: admin })).data;
    assert.equal(report.grossProfit, 5500);
    assert.equal(report.netProfit, 4500);
    const { data: vendor } = await call<{ id: number }>("vendors", 200, { method: "POST", token: admin, body: { name: "Test vendor" } });
    await call("suppliers/" + vendor.id, 404, { method: "PATCH", token: admin, body: { name: "Wrong directory" } });

    const order = await prisma.order.create({ data: {
      trackingCode: "TEST-" + run, customerName: "Test Buyer", phone: "01712345678", address: "Test address",
      district: "Dhaka", division: "Dhaka", deliveryFee: 0, paymentMethod: "cod", items: [], subtotal: 100, total: 100,
      branchId: branchB,
    } });
    await call("orders/" + order.id, 404, { token: manager });
    await call("orders/" + order.id + "/status", 404, { method: "PATCH", token: manager, body: { status: "dispatched" } });
    await call("orders/" + order.id + "/branch", 200, { method: "PATCH", token: admin, body: { branchId: branchA } });
    await call("orders/" + order.id, 200, { token: sales });
    await call("orders/" + order.id + "/status", 403, { method: "PATCH", token: sales, body: { status: "dispatched" } });
    await call("orders/" + order.id + "/status", 200, { method: "PATCH", token: manager, body: { status: "dispatched" } });
    const newPassword = "changed-password-1234";
    await call("auth/password", 200, { method: "POST", token: manager, body: { currentPassword: password, newPassword } });
    await call("auth/me", 401, { token: manager });
    const changed = await signIn("branch_manager", newPassword);
    await call("branches/" + branchA, 200, { method: "PATCH", token: admin, body: { active: false } });
    await call("orders", 403, { token: changed });
    await call("audit", 403, { token: sales });
    const audit = (await call<{ action: string }[]>("audit", 200, { token: admin })).data;
    assert.ok(audit.some(({ action }) => action === "account.recorded"));
    assert.ok(audit.some(({ action }) => action === "user.password_changed"));
    assert.ok(audit.some(({ action }) => action === "store.profile_updated"));
    const subscriber = "newsletter-" + run + "@example.test";
    for (const address of [subscriber.toUpperCase(), subscriber]) {
      const response = await app.request("/api/newsletter", { method: "POST", body: JSON.stringify({ email: address }), headers: { "Content-Type": "application/json" } });
      assert.equal(response.status, 200);
    }
    assert.equal(await prisma.newsletterSubscriber.count({ where: { email: subscriber } }), 1);

    const credentials = { name: "Test customer", email: email("customer"), password, role: "admin" };
    const signup = await app.request("/api/v1/customer/auth/signup", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(credentials),
    });
    assert.equal(signup.status, 201);
    const session = signup.headers.get("Set-Cookie");
    assert.ok(session);
    assert.ok(session.startsWith("resty_customer_session="));
    assert.ok(session.includes("HttpOnly"));
    const cookie = session.split(";")[0];
    const me = await app.request("/api/v1/customer/auth/me", { headers: { Cookie: cookie } });
    assert.equal(me.status, 200);
    const customer = await me.json() as { data: { user: { role: string } } };
    assert.equal(customer.data.user.role, "customer");
    const forgedStaffCookie = cookie.replace("resty_customer_session=", "resty_session=");
    assert.equal((await app.request("/api/v1/admin/products", { headers: { Cookie: forgedStaffCookie } })).status, 401);
    assert.equal((await app.request("/api/v1/customer/auth/logout", { method: "POST", headers: { Cookie: cookie } })).status, 200);
    const signedOut = await app.request("/api/v1/customer/auth/me", { headers: { Cookie: cookie } });
    assert.equal(signedOut.status, 200);
    assert.deepEqual(await signedOut.json(), { success: true, data: { user: null } });
    assert.equal((await app.request("/api/v1/customer/auth/login", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(credentials),
    })).status, 200);
  } finally {
    await prisma.$disconnect();
  }
});
