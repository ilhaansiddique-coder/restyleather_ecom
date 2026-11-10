"use client";

import { Children, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function CategoryCarousel({ children, bangla, labels }: { children: ReactNode; bangla: boolean; labels: string[] }) {
  const id = useId();
  const posters = Children.toArray(children);
  const [active, setActive] = useState(0);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);

  function move(direction: number) {
    setActive((index) => (index + direction + posters.length) % posters.length);
  }

  const button = "grid size-11 place-items-center rounded-full border border-stone-200 bg-white text-stone-900 hover:border-stone-900";

  return <div role="region" aria-label={bangla ? "পণ্যের ক্যাটাগরি" : "Product categories"}
    onKeyDown={(event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      move(event.key === "ArrowRight" ? 1 : -1);
    }}>
    <ul id={id}
      className="relative isolate h-[clamp(230px,86vw,440px)] touch-pan-y overflow-hidden [--poster-step:48%] sm:[--poster-step:48%] lg:[--poster-step:45%]"
      onTouchStart={(event) => {
        const point = event.touches[0];
        touch.current = { x: point.clientX, y: point.clientY };
        swiped.current = false;
      }}
      onTouchCancel={() => { touch.current = null; }}
      onTouchEnd={(event) => {
        const origin = touch.current;
        touch.current = null;
        if (!origin) return;
        const point = event.changedTouches[0];
        const x = point.clientX - origin.x;
        const y = point.clientY - origin.y;
        if (Math.abs(x) < 35 || Math.abs(x) <= Math.abs(y)) return;
        swiped.current = true;
        move(x < 0 ? 1 : -1);
      }}
      onClickCapture={(event) => {
        if (swiped.current && event.detail > 0) {
          event.preventDefault();
          event.stopPropagation();
        }
        swiped.current = false;
      }}>
      {posters.map((poster, index) => {
        const half = Math.floor(posters.length / 2);
        const offset = (index - active + posters.length + half) % posters.length - half;
        const depth = Math.abs(offset);
        const selected = depth === 0;
        const scale = 1 - depth * 0.12;
        const style = {
          transform: `translate(calc(-50% + ${offset} * var(--poster-step)), -50%) scale(${scale})`,
          zIndex: posters.length - depth,
        } as CSSProperties;

        return <li key={index} style={style} data-active={selected}
          className={"group/poster absolute left-1/2 top-1/2 w-[min(63%,320px)] overflow-hidden rounded-xl bg-stone-950 shadow-lg motion-safe:transition-transform motion-safe:duration-500 sm:w-[min(36%,320px)] lg:w-[min(29%,320px)] " +
            (depth <= 1 ? "" : depth === 2 ? "hidden sm:block" : "hidden lg:block")}>
          <div inert={!selected}>{poster}</div>
          {!selected && <button type="button"
            aria-label={bangla ? labels[index] + " দেখুন" : "Preview " + labels[index]}
            className={"absolute inset-0 size-full rounded-xl focus-visible:outline-offset-[-4px] " +
              (depth === 1 ? "bg-stone-950/10 hover:bg-stone-950/5" : "bg-stone-950/20 hover:bg-stone-950/10")}
            onClick={() => setActive(index)} />}
        </li>;
      })}
    </ul>
    <div className="mt-3 flex items-center justify-center gap-2 sm:gap-4">
      <button type="button" aria-controls={id} aria-label={bangla ? "আগের ক্যাটাগরি" : "Previous category"} className={button} onClick={() => move(-1)}>
        <ChevronLeft className="size-5" aria-hidden />
      </button>
      <div className="flex items-center">
        {posters.map((_, index) => <button key={index} type="button" aria-controls={id}
          aria-label={labels[index]}
          aria-current={active === index ? "true" : undefined}
          className="grid size-6 place-items-center rounded-full sm:size-8"
          onClick={() => setActive(index)}>
          <span className={"h-2 rounded-full " + (active === index ? "w-5 bg-stone-900" : "w-2 bg-stone-300")} />
        </button>)}
      </div>
      <button type="button" aria-controls={id} aria-label={bangla ? "পরের ক্যাটাগরি" : "Next category"} className={button} onClick={() => move(1)}>
        <ChevronRight className="size-5" aria-hidden />
      </button>
    </div>
  </div>;
}
