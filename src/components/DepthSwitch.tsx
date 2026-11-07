"use client";

import { useRef } from "react";
import { useDepth } from "./DepthProvider";
import { depthInfo } from "@/content/site";
import type { Depth } from "@/content/types";

const ORDER: Depth[] = ["gold", "silver", "bronze"];
const SWATCH: Record<Depth, string> = { gold: "bg-gold", silver: "bg-silver", bronze: "bg-bronze" };

/**
 * Three-position control for how refined the site is. Works as a radio group:
 * arrow keys move between stops, and G / S / B work from anywhere.
 */
export function DepthSwitch({ compact = false }: { compact?: boolean }) {
  const { depth, setDepth } = useDepth();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (i + step + ORDER.length) % ORDER.length;
    setDepth(ORDER[next]);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label="Detail level"
      className="relative flex items-center rounded-full border border-seam bg-slab p-0.5"
    >
      {ORDER.map((d, i) => {
        const on = d === depth;
        const info = depthInfo[d];
        return (
          <button
            key={d}
            ref={(el) => {
              refs.current[i] = el;
            }}
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            title={`${info.label}: ${info.hint} (${info.key})`}
            onClick={() => setDepth(d)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={`tap group relative flex items-center gap-1.5 rounded-full px-2 py-1 t-micro sm:px-2.5 transition-colors duration-200 ${
              on ? "bg-slab-2 text-quartz" : "text-shale hover:text-quartz"
            }`}
          >
            <span
              aria-hidden
              className={`h-2 w-2 rounded-full ${SWATCH[d]} transition-transform duration-200 ${on ? "scale-100" : "scale-75 opacity-60"}`}
            />
            {compact ? (
              <>
                <span className="hidden sm:inline">{info.label}</span>
                <span className="sm:hidden" aria-hidden>{info.key}</span>
                <span className="sr-only sm:hidden">{info.label}</span>
              </>
            ) : (
              <span>{info.label}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
