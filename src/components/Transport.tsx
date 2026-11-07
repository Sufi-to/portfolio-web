"use client";

import { useEffect, useState } from "react";
import { useMotionSwitch } from "./MotionToggle";

const clock = (s: number) => [s / 3600, (s / 60) % 60, s % 60].map((n) => String(Math.floor(n)).padStart(2, "0")).join(":");

/** The bar under the patch: play or pause everything, and how long the visit has run. */
export function Transport() {
  const { paused, still, toggle } = useMotionSwitch();
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, []);

  return (
    <div className="relative z-10 flex h-11 items-center gap-4 border-t border-[color:var(--rule)] bg-slate px-5 sm:px-10">
      {!still && (
        <button onClick={toggle} aria-label={paused ? "Play motion" : "Pause motion"} className="tap w-5 font-[family-name:var(--font-mono)] text-[0.625rem] text-signal">
          {paused ? "▶" : "❙❙"}
        </button>
      )}
      <span aria-hidden className="h-0.5 min-w-0 flex-1 overflow-hidden bg-seam">
        <span className="playhead block h-full w-full" />
      </span>
      <span aria-hidden className="hidden font-[family-name:var(--font-mono)] text-[0.625rem] tracking-[0.08em] text-quartz sm:inline">{clock(seconds)} / &infin;</span>
    </div>
  );
}
