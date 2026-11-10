"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";

export function ProductRail({ title, description, products, empty, bangla }: {
  title: string;
  description?: string;
  products: Product[];
  empty: string;
  bangla: boolean;
}) {
  const id = useId();
  const rail = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  useEffect(() => {
    const track = rail.current;
    if (!track) return;
    const update = () => setEdges({
      start: track.scrollLeft <= 2,
      end: track.scrollLeft + track.clientWidth >= track.scrollWidth - 2,
    });
    const resize = new ResizeObserver(update);
    resize.observe(track);
    track.addEventListener("scroll", update, { passive: true });
    update();
    return () => {
      resize.disconnect();
      track.removeEventListener("scroll", update);
    };
  }, [products.length]);

  function move(direction: number) {
    const track = rail.current;
    const first = track?.children[0] as HTMLElement | undefined;
    const second = track?.children[1] as HTMLElement | undefined;
    if (track && first && second) track.scrollBy({ left: direction * (second.offsetLeft - first.offsetLeft) });
  }

  const button = "grid size-11 place-items-center rounded-full border border-stone-300 text-stone-900 hover:border-stone-900 disabled:opacity-35";

  return <section className="store-shell border-t border-stone-200 py-10 sm:py-14" aria-labelledby={id + "-title"}>
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 id={id + "-title"} className="text-3xl font-normal sm:text-4xl">{title}</h2>
        {description && <p className="mt-2 text-sm text-stone-600">{description}</p>}
      </div>
      {products.length > 1 && <div className="flex gap-2">
        <button type="button" aria-controls={id} aria-label={bangla ? "আগের পণ্য" : "Previous product"} disabled={edges.start} className={button} onClick={() => move(-1)}><ChevronLeft className="size-5" aria-hidden /></button>
        <button type="button" aria-controls={id} aria-label={bangla ? "পরের পণ্য" : "Next product"} disabled={edges.end} className={button} onClick={() => move(1)}><ChevronRight className="size-5" aria-hidden /></button>
      </div>}
    </div>
    {products.length ? <ul id={id} ref={rail} tabIndex={0} aria-labelledby={id + "-title"}
      className="relative grid auto-cols-[calc((100%-0.75rem)/2)] grid-flow-col snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-4 motion-safe:scroll-smooth sm:auto-cols-[calc((100%-1rem)/2)] sm:gap-4 lg:auto-cols-[calc((100%-2rem)/3)] xl:auto-cols-[calc((100%-3rem)/4)]">
      {products.map((product) => <li key={product.id} className="min-w-0 snap-start">
        <ProductCard product={product} detailed imageSizes="(min-width: 1424px) 328px, (min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, calc((100vw - 2.75rem) / 2)" />
      </li>)}
    </ul> : <p className="text-sm text-stone-600">{empty}</p>}
  </section>;
}
