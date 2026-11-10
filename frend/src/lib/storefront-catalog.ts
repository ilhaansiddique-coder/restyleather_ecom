import type { Product } from "./types";

export function storefrontOrigin() {
  const origin = process.env.STOREFRONT_URL;
  if (!origin) return null;
  try {
    const url = new URL(origin);
    return ["http:", "https:"].includes(url.protocol) ? url.origin : null;
  } catch {
    return null;
  }
}

export async function catalogRequest<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(new URL(path, process.env.BACKEND_ORIGIN ?? "http://127.0.0.1:3001"), {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    return response.ok ? await response.json() : null;
  } catch {
    return null;
  }
}

export function productPath(slug: string) {
  return "/product/" + encodeURIComponent(slug);
}

export type ProductCatalogResponse = { products: Product[] };
export type ProductDetailResponse = { product: Product };
