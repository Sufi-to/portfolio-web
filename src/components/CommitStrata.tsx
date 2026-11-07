"use client";

import { useState } from "react";
import bronze from "@/data/bronze.json";
import { Panel } from "./Panel";

type Month = (typeof bronze.months)[number];
const STRATA = [
  { key: "systems", label: "Systems and C", color: "var(--stratum-systems)" },
  { key: "web", label: "Web and backend", color: "var(--stratum-web)" },
  { key: "ai", label: "AI and data", color: "var(--stratum-ai)" },
] as const;

const W = 1120;
const H = 244;
const BASE = 168;
const LEFT = 8;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const label = (m: string) => `${MONTHS[Number(m.slice(5, 7)) - 1]} ${m.slice(0, 4)}`;

// Repos that mark a turn in the timeline, shown under the axis.
const MARKS: { month: string; text: string }[] = [
  { month: "2023-03", text: "C and Unix" },
  { month: "2024-01", text: "Python, web, backend" },
  { month: "2025-07", text: "Assay" },
  { month: "2026-06", text: "FinRadar" },
  { month: "2026-10", text: "HN Observatory" },
];

/**
 * Real git history, layered like rock: oldest work at the bottom of each
 * column, newest on top. Built at build time from scripts/ingest.mjs.
 */
export function CommitStrata() {
  const months = bronze.months as Month[];
  const [hover, setHover] = useState<number | null>(null);
  const colW = (W - LEFT * 2) / months.length;
  const total = (m: Month) => m.systems + m.web + m.ai;
  const max = Math.max(...months.map(total));
  // Square-root scale: coursework months commit per task and would flatten the rest.
  const h = (n: number) => (n === 0 ? 0 : Math.max(2, Math.sqrt(n / max) * (BASE - 16)));

  const shown = hover ?? months.length - 1;
  const m = months[shown];

  return (
    <Panel name="commit_strata" meta={`ingested ${bronze.generatedAt}`} tag="DATA" portId="strata" in="right" out="left">
    <figure className="p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
        <figcaption className="max-w-2xl">
          <span className="t-h2">{bronze.totalCommits.toLocaleString("en-US")} commits, from a C shell to LLM pipelines</span>
          <span className="mt-2 block t-small text-shale">
            Every month since my first commit, across {bronze.repos.length} repositories, counted from git history under my own
            identities. Heights use a square-root scale; coursework repos commit once per task, so 2023 and 2024 run tall.
          </span>
        </figcaption>
        <ul className="flex gap-4 t-micro text-shale">
          {STRATA.map((s) => (
            <li key={s.key} className="flex items-center gap-1.5">
              <span aria-hidden className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
              {s.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 overflow-x-auto overscroll-x-contain">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="block h-auto w-full min-w-[720px]"
          role="img"
          aria-label={`Monthly commits from ${label(months[0].month)} to ${label(months.at(-1)!.month)}, ${bronze.totalCommits} in total.`}
          onMouseLeave={() => setHover(null)}
        >
          <line x1={LEFT} x2={W - LEFT} y1={BASE + 0.5} y2={BASE + 0.5} stroke="var(--seam)" />
          {months.map((mo, i) => {
            const x = LEFT + i * colW;
            let y = BASE;
            const on = hover === i;
            return (
              <g key={mo.month} onMouseEnter={() => setHover(i)} onClick={() => setHover(i)}>
                <rect x={x} y={0} width={colW} height={BASE} fill={on ? "color-mix(in srgb, var(--trace) 8%, transparent)" : "transparent"} />
                {STRATA.map((s) => {
                  const v = mo[s.key];
                  if (!v) return null;
                  const hh = h(total(mo)) * (v / total(mo));
                  y -= hh;
                  return <rect key={s.key} x={x + 2} y={y} width={colW - 4} height={hh} fill={s.color} opacity={hover === null || on ? 1 : 0.55} />;
                })}
                {mo.month.endsWith("-01") && (
                  <text x={x + 2} y={BASE + 18} fontSize="14" fill="var(--shale)">
                    {mo.month.slice(0, 4)}
                  </text>
                )}
              </g>
            );
          })}
          {MARKS.map((mk, n) => {
            const i = months.findIndex((mo) => mo.month === mk.month);
            if (i < 0) return null;
            const x = LEFT + i * colW + colW / 2;
            const anchor = i > months.length - 6 ? "end" : "start";
            // Neighbouring marks alternate between two label rows so they never collide.
            const dy = n % 2 === 0 ? 0 : 16;
            return (
              <g key={mk.month}>
                <line x1={x} x2={x} y1={BASE + 26} y2={BASE + 34 + dy} stroke="var(--shale)" />
                <text x={anchor === "end" ? x + 4 : x - 4} y={BASE + 48 + dy} textAnchor={anchor} fontSize="14" fill="var(--quartz)">
                  {mk.text}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <p className="mt-3 min-h-[1.5em] t-data text-shale" aria-live="polite">
        {label(m.month)}: {total(m)} commits
        {total(m) > 0 && <span className="text-quartz/80"> in {m.repos.join(", ")}</span>}
      </p>
    </figure>
    </Panel>
  );
}
