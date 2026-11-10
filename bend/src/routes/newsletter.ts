import { z } from "zod";
import { prisma } from "../db/prisma";

export async function newsletter(request: Request) {
  if (!process.env.DATABASE_URL) return Response.json({ success: false, error: "Newsletter signup is temporarily unavailable." }, { status: 503 });
  try {
    const result = z.object({ email: z.string().trim().toLowerCase().max(254).pipe(z.email()) })
      .safeParse(await request.json().catch(() => null));
    if (!result.success) {
      return Response.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }
    const { email } = result.data;
    await prisma.newsletterSubscriber.upsert({ where: { email }, create: { email }, update: {} });
    return Response.json({
      success: true,
      message: "You’re subscribed. Thanks for joining.",
    });
  } catch (error) {
    console.error("Newsletter error:", error);
    return Response.json(
      { success: false, error: "Subscription failed" },
      { status: 500 }
    );
  }
}
