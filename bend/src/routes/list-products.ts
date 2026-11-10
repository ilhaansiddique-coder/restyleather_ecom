import { mockProducts } from "../catalog/demo-products";
import { prisma } from "../db/prisma";

export async function listProducts(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search")?.trim();
  const featured = searchParams.get("featured") === "true";
  const min = searchParams.get("minPrice");
  const max = searchParams.get("maxPrice");
  const sort = searchParams.get("sort");
  try {
    // Use mock data when no DATABASE_URL is configured
    if (!process.env.DATABASE_URL) {
      let data = [...mockProducts];

      if (category && category !== "all") {
        data = data.filter((p) => p.category === category);
      }
      if (featured) {
        data = data.filter((p) => p.featured);
      }
      if (search) {
        const query = search.toLowerCase();
        data = data.filter(
          (p) =>
            p.title.toLowerCase().includes(query) ||
            p.bengaliTitle.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query) ||
            p.leatherType.toLowerCase().includes(query)
        );
      }
      if (min && !isNaN(Number(min))) {
        data = data.filter((p) => p.price >= Number(min));
      }
      if (max && !isNaN(Number(max))) {
        data = data.filter((p) => p.price <= Number(max));
      }
      if (sort === "price_asc") data.sort((a, b) => a.price - b.price);
      else if (sort === "price_desc") data.sort((a, b) => b.price - a.price);
      else if (sort === "rating") data.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));

      return Response.json({ success: true, products: data, total: data.length });
    }

    const contains = search ? { contains: search, mode: "insensitive" as const } : undefined;
    const data = await prisma.product.findMany({
      where: {
        category: category && category !== "all" ? category : undefined,
        featured: featured ? true : undefined,
        OR: contains ? [{ title: contains }, { bengaliTitle: contains }, { description: contains }, { leatherType: contains }] : undefined,
        price: { gte: min && Number.isSafeInteger(Number(min)) ? Number(min) : undefined, lte: max && Number.isSafeInteger(Number(max)) ? Number(max) : undefined },
      },
      orderBy: sort === "price_asc" ? { price: "asc" } : sort === "price_desc" ? { price: "desc" } : sort === "rating" ? { rating: "desc" } : { createdAt: "desc" },
    });
    return Response.json({ success: true, products: data, total: data.length });
  } catch (error) {
    console.error("Products GET error:", error);
    return Response.json({ success: false, error: "Failed to fetch products" }, { status: 500 });
  }
}
