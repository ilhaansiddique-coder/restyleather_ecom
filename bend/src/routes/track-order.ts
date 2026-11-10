import { prisma } from "../db/prisma";


export async function trackOrder(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code || !code.trim()) {
      return Response.json(
        { success: false, error: "Please enter a tracking ID." },
        { status: 400 }
      );
    }

    if (!process.env.DATABASE_URL) return Response.json({ success: false, error: "Tracking is temporarily unavailable." }, { status: 503 });
    const cleanCode = code.trim().toUpperCase();
    const order = await prisma.order.findUnique({
      where: { trackingCode: cleanCode },
      select: { trackingCode: true, district: true, total: true, paymentMethod: true, orderStatus: true, createdAt: true, items: true },
    });
    if (!order) return Response.json({ success: false, error: "No parcel found for that tracking code." }, { status: 404 });

    // The store updates the status as the order moves through fulfillment.
    const createdDate = new Date(order.createdAt);
    const stages = [
      {
        step: 1,
        key: "processing",
        title: "Order received",
        description: "Your order has been recorded.",
        completed: true,
        date: createdDate.toLocaleDateString("en-BD", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      },
      {
        step: 2,
        key: "quality_checked",
        title: "Craftsmanship & Hardware QA Passed",
        description: "Full saddle stitch, brass zips, edge burnish, and monogram inspected.",
        completed: ["quality_checked", "dispatched", "out_for_delivery", "delivered"].includes(order.orderStatus),
        date: "",
      },
      {
        step: 3,
        key: "dispatched",
        title: "Handed over to Courier Express",
        description: `The store has marked your parcel as dispatched to ${order.district}.`,
        completed: ["dispatched", "out_for_delivery", "delivered"].includes(order.orderStatus),
        date: "",
      },
      {
        step: 4,
        key: "out_for_delivery",
        title: "Out for Final Doorstep Delivery",
        description: `Rider is on the way to your delivery address. Cash on Delivery amount: ৳${order.total}.`,
        completed: ["out_for_delivery", "delivered"].includes(order.orderStatus),
        date: "",
      },
      {
        step: 5,
        key: "delivered",
        title: "Delivered & Inspected",
        description: "Package received with 7-day hassle-free exchange and 6-month stitch guarantee.",
        completed: order.orderStatus === "delivered",
        date: "",
      },
    ];

    return Response.json({
      success: true,
      order,
      stages: order.orderStatus === "cancelled" ? [{ step: 1, key: "cancelled", title: "Order cancelled", description: "This order was cancelled.", completed: true, date: "" }] : stages,
    });
  } catch (error) {
    console.error("Order track error:", error);
    return Response.json(
      { success: false, error: "Failed to fetch tracking details" },
      { status: 500 }
    );
  }
}
