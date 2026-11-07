"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

// The story, in order: what was extracted, a project's trace, the index, how deep to read, the history, the way to reach me.
const ROUTE: [string, string][] = [
  ["ore1:out", "ore2:in"],
  ["ore2:out", "ore3:in"],
  ["hero:out", "ore3:in"],
  ["ore3:out", "ore4:in"],
  ["ore4:out", "view:in"],
  ["work:out", "depth:in"],
  ["depth:out", "readme:in"],
  ["clock:out", "readme:in"],
  ["readme:out", "contact:in"],
  ["raw:out", "strata:in"],
];

const DESKTOP = 1280;
const BULGE = 72;

/**
 * Cables between the panels' ports, desktop only. Panels stack down the page,
 * so a cable leaves through one side, runs down the margin and comes back in.
 * Geometry is measured from the DOM so it follows any layout.
 */
export function PatchCables({ children }: { children: React.ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const [paths, setPaths] = useState<string[]>([]);

  const measure = useCallback(() => {
    const root = box.current;
    if (!root || window.innerWidth < DESKTOP || document.documentElement.dataset.mode === "read") {
      setPaths([]);
      return;
    }
    const r = root.getBoundingClientRect();
    const port = (id: string) => {
      const el = root.querySelector<HTMLElement>(`[data-port="${id}"]`);
      if (!el || !el.offsetWidth) return null;
      const b = el.getBoundingClientRect();
      return { x: b.left + b.width / 2 - r.left, y: b.top + b.height / 2 - r.top, dir: el.dataset.side === "left" ? -1 : 1 };
    };
    const next: string[] = [];
    for (const [from, to] of ROUTE) {
      const a = port(from);
      const b = port(to);
      if (!a || !b) continue;
      // Keep the bulge inside the margin: the wrapper clips anything wider.
      const room = Math.min(BULGE, a.dir > 0 ? r.width - a.x - 4 : a.x - 4);
      // Facing ports are a plain S-curve; same-side ports bow out into the margin.
      const reach = a.dir === b.dir ? room : Math.abs(b.x - a.x) * 0.5;
      next.push(`M${a.x} ${a.y} C${a.x + a.dir * reach} ${a.y}, ${b.x + b.dir * reach} ${b.y}, ${b.x} ${b.y}`);
    }
    setPaths(next);
  }, []);

  useLayoutEffect(measure, [measure]);

  useEffect(() => {
    const ro = new ResizeObserver(() => measure());
    if (box.current) ro.observe(box.current);
    document.fonts?.ready.then(() => measure());
    const mode = new MutationObserver(() => measure());
    mode.observe(document.documentElement, { attributes: true, attributeFilter: ["data-mode"] });
    return () => {
      ro.disconnect();
      mode.disconnect();
    };
  }, [measure]);

  return (
    <div ref={box} className="relative overflow-x-clip">
      <svg aria-hidden className="pointer-events-none absolute inset-0 hidden h-full w-full xl:block">
        {paths.map((d) => (
          <g key={d} fill="none">
            <path d={d} stroke="var(--signal)" strokeOpacity={0.28} strokeWidth={1.4} />
            <path d={d} pathLength={1} className="cable-run" stroke="var(--signal)" strokeWidth={1.6} strokeLinecap="round" />
          </g>
        ))}
      </svg>
      {children}
    </div>
  );
}
