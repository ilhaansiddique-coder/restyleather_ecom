import { cache, type ReactNode } from "react";
import type { Metadata } from "next";
import { catalogRequest, productPath, storefrontOrigin, type ProductDetailResponse } from "@/lib/storefront-catalog";
import { getStoreProfile } from "@/lib/store-profile";

type Params = { params: Promise<{ slug: string }> };
const loadProduct = cache(async (slug: string) =>
  (await catalogRequest<ProductDetailResponse>("/api/products/" + encodeURIComponent(slug)))?.product
);
function publicImages(images: string[], origin: string) {
  return images.flatMap((image) => {
    try {
      const url = new URL(image, origin);
      return ["http:", "https:"].includes(url.protocol) ? [url.href] : [];
    } catch {
      return [];
    }
  });
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const product = await loadProduct((await params).slug);
  if (!product) return { title: "Product", robots: { index: false } };
  const origin = (await getStoreProfile()).domain || storefrontOrigin();
  const canonical = origin ? origin + productPath(product.slug) : undefined;
  const images = origin ? publicImages(product.images, origin) : [];
  return {
    title: product.title,
    description: product.description,
    alternates: canonical ? { canonical } : undefined,
    openGraph: { title: product.title, description: product.description, url: canonical, images },
  };
}

export default async function ProductLayout({ params, children }: Params & { children: ReactNode }) {
  const origin = (await getStoreProfile()).domain || storefrontOrigin();
  if (!origin) return children;
  const product = await loadProduct((await params).slug);
  if (!product) return children;
  const url = origin + productPath(product.slug);
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    sku: product.sku,
    image: publicImages(product.images, origin),
    offers: {
      "@type": "Offer",
      url,
      price: product.price,
      priceCurrency: "BDT",
      availability: "https://schema.org/" + (product.inStock ? "InStock" : "OutOfStock"),
    },
  };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />
    {children}
  </>;
}
