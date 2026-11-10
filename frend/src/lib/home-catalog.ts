import type { Product } from "./types";

type HomeCatalog = { newArrivals: Product[]; featuredProducts: Product[]; bestsellers: Product[] };

export async function loadHomeCatalog(): Promise<HomeCatalog | null> {
  try {
    const backend = process.env.BACKEND_ORIGIN ?? "http://127.0.0.1:3001";
    const response = await fetch(new URL("/api/home-catalog", backend), {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}
