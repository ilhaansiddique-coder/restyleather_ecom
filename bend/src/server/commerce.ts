import { createHash, randomBytes } from "node:crypto";
import { Prisma } from "../generated/prisma/client";
import { z } from "zod";
import { prisma } from "../db/prisma";

export const shippingDefaults = { dhakaFee: 70, outsideFee: 130, freeThreshold: 3000 };
export const statuses = ["processing", "quality_checked", "dispatched", "out_for_delivery", "delivered", "cancelled"] as const;
export const couponCode = z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{1,32}$/);
const district = z.string().trim().min(1).max(80);
const lineItems = z.array(z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().min(1).max(99),
  selectedColor: z.string().max(100).optional(),
})).min(1).max(100);

export const quoteInput = z.object({ district, items: lineItems, couponCode: couponCode.optional() });
export const orderInput = quoteInput.extend({
  customerName: z.string().trim().min(1).max(150),
  phone: z.string().trim().max(32).refine((value) => /^(?:880|0)1[3-9]\d{8}$/.test(value.replace(/\D/g, ""))),
  email: z.union([z.email(), z.literal("")]).optional(),
  address: z.string().trim().min(1).max(500),
  division: district.default("Dhaka"),
  notes: z.string().trim().max(1000).optional(),
  paymentMethod: z.literal("cod").default("cod"),
  requestKey: z.uuid().optional(),
  expectedTotal: z.number().int().nonnegative().optional(),
});

export async function quote(input: z.infer<typeof quoteInput>) {
  const [products, settings, coupon] = await Promise.all([
    prisma.product.findMany({ where: { id: { in: input.items.map((item) => item.productId) }, inStock: true } }),
    prisma.shipping.findUnique({ where: { id: 1 } }),
    input.couponCode ? prisma.coupon.findUnique({ where: { code: input.couponCode } }) : null,
  ]);
  if (input.couponCode && !coupon?.active) return { error: "This coupon is unavailable." } as const;
  const quantities = new Map<number, number>();
  const items = [];
  for (const line of input.items) {
    const product = products.find((product) => product.id === line.productId);
    if (!product) return { error: "A product in your bag is unavailable." } as const;
    const quantity = (quantities.get(product.id) ?? 0) + line.quantity;
    if (product.stockQuantity !== null && quantity > product.stockQuantity) {
      return { error: "The requested quantity is unavailable for " + product.title + "." } as const;
    }
    quantities.set(product.id, quantity);
    const colors = Array.isArray(product.colors) ? product.colors : [];
    if (line.selectedColor && !colors.some((color) => color && typeof color === "object" && "name" in color && color.name === line.selectedColor)) {
      return { error: "A selected color is unavailable." } as const;
    }
    const image = Array.isArray(product.images) && typeof product.images[0] === "string" ? product.images[0] : "";
    items.push({ productId: product.id, title: product.title, price: product.price, quantity: line.quantity, selectedColor: line.selectedColor ?? "", image });
  }
  const subtotal = items.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const shipping = settings ?? shippingDefaults;
  const discount = coupon ? Math.floor(subtotal * coupon.percent / 100) : 0;
  const deliveryFee = subtotal >= shipping.freeThreshold ? 0 : input.district.toLowerCase() === "dhaka" ? shipping.dhakaFee : shipping.outsideFee;
  return { items, subtotal, deliveryFee, discount, total: subtotal - discount + deliveryFee, couponCode: coupon?.code ?? null };
}

export async function placeOrder(input: z.infer<typeof orderInput>) {
  const { requestKey, expectedTotal, ...details } = input;
  const requestHash = requestKey ? createHash("sha256").update(JSON.stringify(details)).digest("hex") : null;
  const replay = async () => {
    if (!requestKey) return null;
    const order = await prisma.order.findUnique({ where: { requestKey } });
    if (!order) return null;
    if (order.requestHash !== requestHash) return { error: "This checkout reference was already used.", conflict: true } as const;
    return { success: true, order: { total: order.total }, trackingCode: order.trackingCode } as const;
  };
  const previous = await replay();
  if (previous) return previous;
  const pricing = await quote(input);
  if ("error" in pricing) return pricing;
  if (expectedTotal !== undefined && expectedTotal !== pricing.total) {
    return { error: "Your order total changed. Review the updated prices and try again.", conflict: true } as const;
  }
  const { customerName, phone, email, address, district, division, notes, paymentMethod } = input;
  const trackingCode = "BD-" + randomBytes(12).toString("hex").toUpperCase();
  try {
    const order = await prisma.order.create({
      data: { ...pricing, requestKey, requestHash, trackingCode, customerName, phone, email: email || null, address, district, division, notes, paymentMethod },
      select: { total: true },
    });
    return { success: true, order, trackingCode } as const;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const previous = await replay();
      if (previous) return previous;
    }
    throw error;
  }
}
