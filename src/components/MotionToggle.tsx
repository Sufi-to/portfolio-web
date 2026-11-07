"use client";

import { useEffect, useState } from "react";
import { motionPaused, prefersStill, setMotionPaused } from "@/lib/motion";

/** Every copy of the switch follows the same setting. */
export function useMotionSwitch() {
  const [paused, setPaused] = useState(false);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const off = motionPaused();
    setPaused(off);
    setStill(prefersStill()); // Already still, so there is nothing to pause.
    if (off) setMotionPaused(true);
    const watch = new MutationObserver(() => setPaused(document.documentElement.dataset.motion === "off"));
    watch.observe(document.documentElement, { attributes: true, attributeFilter: ["data-motion"] });
    return () => watch.disconnect();
  }, []);

  return { paused, still, toggle: () => setMotionPaused(!paused) };
}

/** The ground, cables and cycling run indefinitely, so anyone can stop them. */
export function MotionToggle({ className = "" }: { className?: string }) {
  const { paused, still, toggle } = useMotionSwitch();
  if (still) return null;
  return (
    <button onClick={toggle} className={`chip ${className}`} data-quiet={paused} aria-pressed={paused} aria-label="Pause motion">
      {paused ? "MOTION OFF" : "MOTION ON"}
    </button>
  );
}
