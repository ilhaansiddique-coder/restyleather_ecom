import type { MetadataRoute } from "next";
import { catalogRequest, productPath, storefrontOrigin, type ProductCatalogResponse } from "@/lib/storefront-catalog";
import { getStoreProfile } from "@/lib/store-profile";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = (await getStoreProfile()).domain || storefrontOrigin();
  if (!origin) return [];
  const catalog = await catalogRequest<ProductCatalogResponse>("/api/products");
  return [
    { url: origin },
    { url: origin + "/shop" },
    { url: origin + "/policies" },
    ...(catalog?.products ?? []).map((product) => ({ url: origin + productPath(product.slug) })),
  ];
}
