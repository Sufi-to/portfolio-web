"use client";

import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Depth } from "@/content/types";

interface DepthState {
  depth: Depth;
  setDepth: (d: Depth) => void;
  /** Counts choices the visitor made, so a restored setting announces nothing. */
  changes: number;
}

const DepthContext = createContext<DepthState>({ depth: "gold", setDepth: () => {}, changes: 0 });

const STORAGE_KEY = "refinery.depth";
const SHORTCUTS_KEY = "refinery.shortcuts";
const KEYS: Record<string, Depth> = { g: "gold", s: "silver", b: "bronze" };

export const isTyping = (target: EventTarget | null) => {
  const el = target as HTMLElement | null;
  if (!el) return false;
  return el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName);
};

/** Project, Lab, About and Contact pages read the same at every depth. */
export const depthApplies = (path: string) => /^\/(projects\/?)?$/.test(path);

export const shortcutsOn = () => {
  try {
    return localStorage.getItem(SHORTCUTS_KEY) !== "off";
  } catch {
    return true;
  }
};

/** Single-key shortcuts can clash with speech input, so they can be switched off. */
export const toggleShortcuts = () => {
  const on = !shortcutsOn();
  try {
    localStorage.setItem(SHORTCUTS_KEY, on ? "on" : "off");
  } catch {}
  return on;
};

export function DepthProvider({ children }: { children: React.ReactNode }) {
  const path = usePathname() ?? "/";
  const [depth, setDepthState] = useState<Depth>("gold");
  const [changes, setChanges] = useState(0);

  // Restore the visitor's last choice; storage can be unavailable, so guard it.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "gold" || saved === "silver" || saved === "bronze") setDepthState(saved);
    } catch {}
  }, []);

  const setDepth = useCallback((d: Depth) => {
    setDepthState(d);
    setChanges((n) => n + 1);
    try {
      localStorage.setItem(STORAGE_KEY, d);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.dataset.depth = depth;
  }, [depth]);

  // G, S and B switch depth wherever depth applies, except while typing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target) || !depthApplies(path) || !shortcutsOn()) return;
      const next = KEYS[e.key.toLowerCase()];
      if (next) setDepth(next);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setDepth, path]);

  return <DepthContext.Provider value={{ depth, setDepth, changes }}>{children}</DepthContext.Provider>;
}

export const useDepth = () => useContext(DepthContext);
