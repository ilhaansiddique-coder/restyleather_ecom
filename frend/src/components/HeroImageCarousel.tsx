"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";

const slides = [
  {
    src: "/home/leather-collection-hero.webp",
    en: "Brown leather weekender bag and wallet",
    bn: "বাদামি চামড়ার ভ্রমণ ব্যাগ ও ওয়ালেট",
  },
  {
    src: "/product-images/hemayetpur-executive-briefcase.webp",
    en: "Dark brown leather briefcase",
    bn: "গাঢ় বাদামি চামড়ার ব্রিফকেস",
  },
  {
    src: "/product-images/bengal-goodyear-welted-derby.webp",
    en: "Brown leather Derby shoes",
    bn: "বাদামি চামড়ার ডার্বি জুতা",
  },
];

const sizes = "(min-width: 1424px) 794px, (min-width: 1024px) 58vw, (min-width: 640px) calc(100vw - 4rem), calc(100vw - 2rem)";
const arrowStyle = "grid size-11 place-items-center rounded-full bg-stone-950/85 text-white hover:bg-stone-950 focus-visible:outline-white";
const slideDelay = 5000;
const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void) {
  const query = window.matchMedia(reducedMotionQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export function HeroImageCarousel({ bangla }: { bangla: boolean }) {
  const [active, setActive] = useState(0);
  const [playbackOverride, setPlaybackOverride] = useState<boolean | null>(null);
  const [hovered, setHovered] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const playbackButton = useRef<HTMLButtonElement>(null);
  const id = useId();
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia(reducedMotionQuery).matches,
    () => true,
  );
  const playing = playbackOverride ?? !reducedMotion;

  useEffect(() => {
    if (!playing || hovered) return;
    const timer = window.setTimeout(() => setActive((index) => (index + 1) % slides.length), slideDelay);
    return () => window.clearTimeout(timer);
  }, [active, hovered, playing]);

  function move(step: number) {
    setActive((index) => (index + step + slides.length) % slides.length);
  }

  return (
    <div
      role="region"
      aria-label={bangla ? "চামড়ার পণ্যের ছবির গ্যালারি" : "Leather collection images"}
      className="relative isolate aspect-[3/2] bg-[#987458] lg:aspect-auto lg:min-h-[30rem] xl:min-h-[33rem]"
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setHovered(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") setHovered(false);
      }}
      onFocusCapture={(event) => {
        if (!playbackButton.current?.contains(event.target)) setPlaybackOverride(false);
      }}
      onKeyDown={(event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        move(event.key === "ArrowRight" ? 1 : -1);
      }}
    >
      <div
        id={id}
        className="absolute inset-0 touch-pan-y"
        onTouchStart={(event) => {
          const touch = event.touches[0];
          touchStart.current = event.touches.length === 1 ? { x: touch.clientX, y: touch.clientY } : null;
        }}
        onTouchCancel={() => { touchStart.current = null; }}
        onTouchEnd={(event) => {
          const start = touchStart.current;
          touchStart.current = null;
          if (!start) return;
          const touch = event.changedTouches[0];
          const x = touch.clientX - start.x;
          const y = touch.clientY - start.y;
          if (Math.abs(x) >= 40 && Math.abs(x) > Math.abs(y)) move(x < 0 ? 1 : -1);
        }}
      >
        {slides.map((slide, index) => (
          <div key={slide.src} aria-hidden={index !== active}
            className={`absolute inset-0 motion-safe:transition-opacity motion-safe:duration-300 ${index === active ? "z-10 opacity-100" : "opacity-0"}`}>
            <Image
              src={slide.src}
              alt={bangla ? slide.bn : slide.en}
              fill
              sizes={sizes}
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "low"}
              className="object-cover"
            />
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-x-3 bottom-3 z-20 flex items-center justify-between sm:inset-x-5 sm:bottom-5">
        <button type="button" aria-controls={id} aria-label={bangla ? "আগের ছবি" : "Previous image"} className={`pointer-events-auto ${arrowStyle}`} onClick={() => move(-1)}>
          <ChevronLeft className="size-5" aria-hidden />
        </button>
        <div className="pointer-events-auto flex rounded-full bg-stone-950/85 px-1">
          <button
            ref={playbackButton}
            type="button"
            aria-controls={id}
            aria-label={playing
              ? (bangla ? "স্বয়ংক্রিয় স্লাইড বন্ধ করুন" : "Pause slideshow")
              : (bangla ? "স্বয়ংক্রিয় স্লাইড চালু করুন" : "Play slideshow")}
            className="grid size-11 place-items-center rounded-full text-white hover:text-amber-300 focus-visible:outline-white"
            onClick={() => setPlaybackOverride(!playing)}
          >
            {playing ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
          </button>
          {slides.map((slide, index) => (
            <button key={slide.src} type="button" aria-controls={id} aria-label={bangla ? slide.bn : slide.en}
              aria-current={active === index ? "true" : undefined}
              className="grid h-11 w-8 place-items-center rounded-full focus-visible:outline-white"
              onClick={() => setActive(index)}>
              <span className={`h-1.5 rounded-full ${active === index ? "w-4 bg-amber-300" : "w-1.5 bg-white/75"}`} />
            </button>
          ))}
        </div>
        <button type="button" aria-controls={id} aria-label={bangla ? "পরের ছবি" : "Next image"} className={`pointer-events-auto ${arrowStyle}`} onClick={() => move(1)}>
          <ChevronRight className="size-5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
