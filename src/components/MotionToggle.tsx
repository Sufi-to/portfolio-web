"use client";

import { useEffect, useState } from "react";
import { motionPaused, prefersStill, setMotionPaused } from "@/lib/motion";

/**
 * The ground and cables run indefinitely, so anyone can stop them. Floats in the
 * corner on desktop; on smaller screens it lives in the menu, where it covers nothing.
 */
export function MotionToggle({ inMenu = false }: { inMenu?: boolean }) {
  const [paused, setPaused] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const off = motionPaused();
    setPaused(off);
    setHidden(prefersStill()); // Already still, so there is nothing to pause.
    if (off) setMotionPaused(true);
  }, []);

  if (hidden) return null;

  return (
    <button
      onClick={() => {
        setPaused(!paused);
        setMotionPaused(!paused);
      }}
      className={
        inMenu
          ? "tap mt-2 w-full justify-center rounded-md py-2 t-small text-shale"
          : "fixed bottom-3 right-3 z-30 hidden rounded-md border border-edge bg-slate px-2 py-1 t-data text-label text-shale transition-colors hover:text-quartz lg:block"
      }
    >
      {paused ? "Play motion" : "Pause motion"}
    </button>
  );
}
