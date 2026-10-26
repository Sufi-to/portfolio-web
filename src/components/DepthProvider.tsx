"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Depth } from "@/content/types";

interface DepthState {
  depth: Depth;
  setDepth: (d: Depth) => void;
}

const DepthContext = createContext<DepthState>({ depth: "gold", setDepth: () => {} });

const STORAGE_KEY = "refinery.depth";
const KEYS: Record<string, Depth> = { g: "gold", s: "silver", b: "bronze" };

export const isTyping = (target: EventTarget | null) => {
  const el = target as HTMLElement | null;
  if (!el) return false;
  return el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName);
};

export function DepthProvider({ children }: { children: React.ReactNode }) {
  const [depth, setDepthState] = useState<Depth>("gold");

  // Restore the visitor's last choice; storage can be unavailable, so guard it.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "gold" || saved === "silver" || saved === "bronze") setDepthState(saved);
    } catch {}
  }, []);

  const setDepth = useCallback((d: Depth) => {
    setDepthState(d);
    try {
      localStorage.setItem(STORAGE_KEY, d);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.dataset.depth = depth;
  }, [depth]);

  // G, S and B switch depth anywhere except while typing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
      const next = KEYS[e.key.toLowerCase()];
      if (next) setDepth(next);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setDepth]);

  return <DepthContext.Provider value={{ depth, setDepth }}>{children}</DepthContext.Provider>;
}

export const useDepth = () => useContext(DepthContext);

/** Renders children only at or below the given depth (gold < silver < bronze). */
export function AtDepth({ min, children }: { min: Depth; children: React.ReactNode }) {
  const { depth } = useDepth();
  const order: Depth[] = ["gold", "silver", "bronze"];
  return order.indexOf(depth) >= order.indexOf(min) ? <>{children}</> : null;
}
