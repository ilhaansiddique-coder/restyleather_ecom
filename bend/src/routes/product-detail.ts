import { mockProducts } from "../catalog/demo-products";


export async function productDetail(slug: string) {
  try {

    if (!process.env.DATABASE_URL) {
      const numId = Number(slug);
      const product = !isNaN(numId)
        ? mockProducts.find((p) => p.id === numId || p.slug === slug)
        : mockProducts.find((p) => p.slug === slug);

      if (!product) {
        return Response.json({ success: false, error: "Product not found" }, { status: 404 });
      }

      const related = mockProducts.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
      return Response.json({ success: true, product, reviews: [], related });
    }

    const { prisma } = await import("../db/prisma");
    const numId = Number(slug);
    const product = await prisma.product.findFirst({
      where: { OR: [{ slug }, ...(Number.isInteger(numId) && numId > 0 && numId <= 2147483647 ? [{ id: numId }] : [])] },
    });
    if (!product) return Response.json({ success: false, error: "Product not found" }, { status: 404 });
    const [productReviews, related] = await Promise.all([
      prisma.review.findMany({ where: { productId: product.id }, orderBy: { createdAt: "desc" } }),
      prisma.product.findMany({ where: { category: product.category, id: { not: product.id } }, take: 4 }),
    ]);
    return Response.json({ success: true, product, reviews: productReviews, related });
  } catch (error) {
    console.error("Product GET slug error:", error);
    return Response.json({ success: false, error: "Failed to fetch product" }, { status: 500 });
  }
}
