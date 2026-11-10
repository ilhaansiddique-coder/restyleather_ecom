import { z } from "zod";
import { prisma } from "../db/prisma";

const hex = z.string().regex(/^#[0-9a-f]{6}$/i);
const publicUrl = z.url({ protocol: /^https?$/ });
export const storeProfileInput = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(1000),
  logoUrl: z.union([z.string().regex(/^\/(?!\/)[\w/.-]+$/), publicUrl]).optional().default("/logo.webp"),
  contactEmail: z.email(),
  contactPhone: z.string().trim().regex(/^\+?[0-9 ()-]{7,30}$/),
  domain: z.union([publicUrl.transform((url) => new URL(url).origin), z.literal("")]),
  primaryColor: hex,
  accentColor: hex,
  shippingPolicy: z.string().trim().max(20000),
  returnPolicy: z.string().trim().max(20000),
  privacyPolicy: z.string().trim().max(20000),
});

const defaults: z.infer<typeof storeProfileInput> = {
  name: "ReStyleather",
  description: "Handcrafted leather goods from Bangladesh.",
  logoUrl: "/logo.webp",
  contactEmail: "info@theleatherbd.com",
  contactPhone: "+8801725293963",
  domain: "",
  primaryColor: "#1c1364",
  accentColor: "#f15a25",
  shippingPolicy: "",
  returnPolicy: "",
  privacyPolicy: "",
};

export async function loadStoreProfile() {
  if (!process.env.DATABASE_URL) return defaults;
  const profile = await prisma.storeProfile.findUnique({ where: { id: 1 } });
  if (!profile) return defaults;
  if (profile.logoUrl === "/logo.png") return { ...profile, logoUrl: defaults.logoUrl };
  if (profile.logoUrl === "/favicon.png") return { ...profile, logoUrl: "/favicon.webp" };
  return profile;
}
