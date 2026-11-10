import { mockProducts } from "../catalog/demo-products";
import { prisma } from "../db/prisma";

export async function homeCatalog() {
  if (!process.env.DATABASE_URL) {
    return Response.json({
      newArrivals: [...mockProducts].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 8),
      featuredProducts: mockProducts.filter((product) => product.featured).slice(0, 4),
      bestsellers: [],
    });
  }

  const [newArrivals, featuredProducts, ranked] = await Promise.all([
    prisma.product.findMany({ orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: 8 }),
    prisma.product.findMany({ where: { featured: true }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: 8 }),
    prisma.$queryRaw<{ id: number }[]>`
      SELECT products.id
      FROM orders
      CROSS JOIN LATERAL jsonb_array_elements(
        CASE WHEN jsonb_typeof(orders.items) = 'array' THEN orders.items ELSE '[]'::jsonb END
      ) AS line(item)
      JOIN products ON products.id::text = line.item->>'productId'
      WHERE orders.order_status = 'delivered' AND line.item->>'quantity' ~ '^[1-9][0-9]{0,8}$'
      GROUP BY products.id
      ORDER BY SUM((line.item->>'quantity')::int) DESC, products.id DESC
      LIMIT 8
    `,
  ]);
  const products = ranked.length ? await prisma.product.findMany({ where: { id: { in: ranked.map(({ id }) => id) } } }) : [];
  const byId = new Map(products.map((product) => [product.id, product]));
  const bestsellers = ranked.flatMap(({ id }) => byId.get(id) ?? []);
  return Response.json({ newArrivals, featuredProducts, bestsellers });
}
