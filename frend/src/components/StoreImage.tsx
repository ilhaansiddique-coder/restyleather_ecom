import Image from "next/image";
import type { ComponentPropsWithoutRef } from "react";

const imageWidths = {
  thumbnail: [64, 96, 160, 240, 320],
  card: [240, 360, 480, 640, 800, 1200],
  gallery: [480, 640, 960, 1280, 1600, 1920],
  hero: [640, 960, 1280, 1600, 1920, 2560],
};

type StoreImageProps = Omit<ComponentPropsWithoutRef<"img">, "srcSet"> & {
  alt: string;
  sizes: string;
  variant: keyof typeof imageWidths;
};

export function StoreImage({ src, sizes, variant, decoding = "async", ...props }: StoreImageProps) {
  if (typeof src === "string" && /^\/product-images\/[a-z0-9-]+\.webp$/.test(src)) {
    const edge = src.endsWith("-detail.webp") ? 803 : 1254;
    return <Image {...props} src={src} width={edge} height={edge} sizes={sizes} decoding={decoding} />;
  }

  let srcSet: string | undefined;
  if (typeof src === "string" && src.startsWith("https://images.pexels.com/")) {
    const url = new URL(src);
    const originalWidth = Number(url.searchParams.get("w"));
    const originalHeight = Number(url.searchParams.get("h"));
    const aspectRatio = originalWidth > 0 ? originalHeight / originalWidth : 0;

    srcSet = imageWidths[variant].map((width) => {
      url.searchParams.set("w", String(width));
      if (Number.isFinite(aspectRatio) && aspectRatio > 0) {
        url.searchParams.set("h", String(Math.max(1, Math.round(width * aspectRatio))));
      }
      return `${url.href} ${width}w`;
    }).join(", ");
  }

  return <img {...props} decoding={decoding} sizes={srcSet ? sizes : undefined} srcSet={srcSet} src={src} />;
}
