import { z } from "zod";
import { prisma } from "../src/db/prisma";
import { hashPassword } from "../src/server/security";

async function main() {
  const email = z.email().trim().toLowerCase().parse(process.env.ADMIN_EMAIL);
  const password = z.string().min(12).max(128).parse(process.env.ADMIN_PASSWORD);
  await prisma.user.create({
    data: { email, name: "Store administrator", passwordHash: hashPassword(password), role: "admin" },
  });
  console.log("Administrator created.");
}

main().catch(() => {
  console.error("Could not create administrator. Check database migrations, credentials, and whether the email already exists.");
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
