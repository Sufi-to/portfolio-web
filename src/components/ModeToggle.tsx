"use client";

import { useEffect, useState } from "react";
import { getMode, setMode, type Mode } from "@/lib/mode";
import { isTyping, shortcutsOn } from "./DepthProvider";

/** PATCH keeps the wired canvas; READ stacks it. P switches between them. */
export function ModeToggle() {
  const [mode, set] = useState<Mode>("patch");

  useEffect(() => {
    const saved = getMode();
    set(saved);
    setMode(saved);
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "p" || e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target) || !shortcutsOn()) return;
      set((m) => {
        const next = m === "patch" ? "read" : "patch";
        setMode(next);
        return next;
      });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const choose = (m: Mode) => {
    set(m);
    setMode(m);
  };

  return (
    <div role="group" aria-label="Page layout" className="hidden overflow-hidden rounded-md border border-seam font-[family-name:var(--font-mono)] text-[0.625rem] tracking-[0.08em] xl:flex">
      {(["patch", "read"] as const).map((m) => (
        <button key={m} aria-pressed={mode === m} onClick={() => choose(m)} className={`px-2.5 py-1 uppercase transition-colors ${mode === m ? "bg-signal text-slate" : "text-quartz hover:text-signal"}`}>
          {m}
        </button>
      ))}
    </div>
  );
}
