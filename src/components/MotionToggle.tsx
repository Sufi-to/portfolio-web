"use client";

import { useEffect, useState } from "react";
import { motionPaused, prefersStill, setMotionPaused } from "@/lib/motion";

/** The ground and cables run indefinitely, so anyone can stop them. */
export function MotionToggle() {
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
      className="tap fixed bottom-3 right-3 z-30 rounded-md border border-edge bg-slate px-2 py-1 t-data text-label text-shale transition-colors hover:text-quartz"
    >
      {paused ? "Play motion" : "Pause motion"}
    </button>
  );
}
