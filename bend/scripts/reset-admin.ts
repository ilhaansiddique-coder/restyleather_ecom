import { z } from "zod";
import { prisma } from "../src/db/prisma";
import { hashPassword } from "../src/server/security";

async function main() {
  const email = z.email().trim().toLowerCase().parse(process.env.ADMIN_EMAIL);
  const password = z.string().min(8).max(128).parse(process.env.ADMIN_PASSWORD);
  const passwordHash = hashPassword(password);

  await prisma.$transaction(async (tx) => {
    const existing = await tx.user.findUnique({ where: { email } });
    const account = await tx.user.upsert({
      where: { email },
      create: { email, name: "Store administrator", passwordHash, role: "admin" },
      update: { passwordHash, active: true, role: "admin", branchId: null },
    });
    await tx.session.deleteMany({ where: { userId: account.id } });
    await tx.auditEvent.create({
      data: { actorId: account.id, targetId: account.id, action: existing ? "admin.credentials_reset" : "admin.created" },
    });
  });
  console.log("Admin account saved. Previous sessions were revoked.");
}

main().catch(() => {
  console.error("Admin setup failed. Check ADMIN_EMAIL, ADMIN_PASSWORD (8–128 characters), migrations, and the database connection.");
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
