"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Heart, ShoppingBag, Star } from "lucide-react";
import type { Product } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import { useLocale } from "@/context/LocaleContext";
import { useWishlist } from "@/context/WishlistContext";
import { StoreImage } from "./StoreImage";

export function ProductCard({ product, imageSizes, detailed = false }: { product: Product; imageSizes: string; detailed?: boolean }) {
  const { addItem, formatPrice } = useCart();
  const router = useRouter();
  const bn = useLocale() === "bn";
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const selectedColor = product.colors[selectedColorIndex];
  const saved = isWishlisted(product.id);
  const title = bn && product.bengaliTitle ? product.bengaliTitle : product.title;
  const href = "/product/" + product.slug;
  const onSale = Boolean(product.compareAtPrice && product.compareAtPrice > product.price);
  const available = product.inStock && product.stockQuantity !== 0;
  const discountPercent = onSale && product.compareAtPrice ? Math.round((1 - product.price / product.compareAtPrice) * 100) : 0;
  const image = product.images[0];

  useEffect(() => () => clearTimeout(timer.current), []);

  function addToBag(buyNow = false) {
    if (!available || added) return;
    addItem({
      productId: product.id, slug: product.slug, title: product.title, bengaliTitle: product.bengaliTitle,
      price: product.price, quantity: 1, selectedColor: selectedColor?.name ?? "",
      image: product.images[0] ?? "", leatherType: product.leatherType,
    }, !buyNow);
    if (buyNow) {
      router.push("/checkout");
      return;
    }
    setAdded(true);
    timer.current = setTimeout(() => setAdded(false), 800);
  }

  return <article className="group flex h-full min-w-0 flex-col overflow-hidden border-b border-stone-300">
    <div className="relative aspect-[4/4.35] overflow-hidden bg-stone-100">
      <Link href={href} className="block size-full focus-visible:outline-offset-[-4px]" aria-label={title}>
        {image && <StoreImage src={image} variant="card" sizes={imageSizes}
          alt={title} loading="lazy" className="size-full object-cover" />}
      </Link>
      {onSale && <span className="absolute left-2 top-2 rounded-sm bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-900 sm:left-3 sm:top-3">{discountPercent > 0 ? `−${discountPercent}%` : bn ? "ছাড়" : "Sale"}</span>}
      <button type="button" onClick={() => toggleWishlist(product)} aria-pressed={saved}
        aria-label={bn ? "পছন্দের তালিকা" : "Save to wishlist"}
        className={"absolute right-2 top-2 grid size-10 place-items-center rounded-full bg-white/95 hover:text-amber-900 sm:right-3 sm:top-3 " + (saved ? "text-rose-700" : "text-stone-800")}>
        <Heart className={saved ? "size-4 fill-current" : "size-4"} aria-hidden />
      </button>
    </div>

    <div className="flex flex-1 flex-col gap-3 py-4 wrap-anywhere">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs font-medium capitalize text-stone-600">
          <span>{product.category.replaceAll("-", " ")}</span>
          {product.reviewCount > 0 && <span className="flex items-center gap-1 text-stone-600"><Star className="size-3 fill-amber-500 text-amber-600" aria-hidden />{product.rating}</span>}
        </div>
        <Link href={href} className="mt-2 block hover:text-amber-900">
          <h3 className="line-clamp-2 text-base font-normal sm:text-lg">{title}</h3>
        </Link>
        <p className="mt-1 line-clamp-1 text-xs text-stone-600">{product.leatherType}</p>
      </div>
      {detailed && <>
        <dl className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-700">
          <div className="flex min-w-0 gap-1"><dt className="shrink-0">SKU</dt><dd>{product.sku}</dd></div>
          <div className="flex gap-1"><dt>{bn ? "স্টক" : "Stock"}</dt><dd>{!available ? (bn ? "স্টকে নেই" : "Sold out") : product.stockQuantity ?? (bn ? "স্টকে আছে" : "In stock")}</dd></div>
        </dl>
        <p className="line-clamp-3 text-sm leading-relaxed text-stone-700">{product.description}</p>
        {product.features.length > 0 && <ul className="list-disc space-y-1 pl-4 text-xs text-stone-700">
          {product.features.slice(0, 3).map((feature, index) => <li key={index}>{feature}</li>)}
        </ul>}
      </>}
      {product.colors.length > 0 && <div className="flex flex-wrap items-center gap-1" role="group" aria-label={bn ? "রং নির্বাচন করুন" : "Select color"}>
        {product.colors.map((color, index) => <button key={color.name + index} type="button" onClick={() => setSelectedColorIndex(index)}
          className="grid size-8 shrink-0 place-items-center rounded-full border border-transparent aria-pressed:border-stone-700"
          aria-label={color.name} aria-pressed={selectedColorIndex === index} title={color.name}>
          <span className="size-5 rounded-full border border-black/10" style={{ backgroundColor: color.hex }} />
        </button>)}
      </div>}
      <div className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-base font-bold text-stone-950 sm:text-lg">{formatPrice(product.price)}</span>
        {onSale && product.compareAtPrice && <span className="text-xs text-stone-500 line-through">{formatPrice(product.compareAtPrice)}</span>}
      </div>
      <button type="button" onClick={() => addToBag()} disabled={!available || added}
        className={"flex min-h-11 w-full items-center justify-center gap-2 rounded-lg px-2 text-xs font-semibold active:scale-[0.98] disabled:opacity-75 sm:text-sm " + (available ? detailed ? "border border-stone-300 text-stone-900 hover:bg-stone-100" : "btn-grad btn-grad--fit text-white" : "bg-stone-100 text-stone-600")}>
        {added ? <Check className="size-4 shrink-0" aria-hidden /> : available ? <ShoppingBag className="size-4 shrink-0" aria-hidden /> : null}
        {added ? (bn ? "যোগ হয়েছে" : "Added") : available ? (bn ? "ব্যাগে যোগ করুন" : "Add to cart") : (bn ? "স্টকে নেই" : "Sold out")}
      </button>
      {detailed && <button type="button" onClick={() => addToBag(true)} disabled={!available || added}
        className="btn-grad btn-grad--fit flex min-h-11 w-full items-center justify-center rounded-lg text-sm font-semibold text-white disabled:opacity-60">
        {bn ? "এখনই কিনুন" : "Buy now"}
      </button>}
    </div>
  </article>;
}
