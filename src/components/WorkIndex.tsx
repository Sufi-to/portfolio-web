"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { featured, projects } from "@/content/projects";
import { keepStill } from "@/lib/motion";
import { useDepth } from "./DepthProvider";
import { Hallmark } from "./Hallmark";
import { Panel } from "./Panel";
import { ProjectDetail } from "./ProjectDetail";
import { SystemTrace } from "./SystemTrace";

const snake = (slug: string) => slug.replaceAll("-", "_");
const HOVER_MS = 110; // Long enough that sweeping past a row doesn't restart the trace.
const CYCLE_MS = 7200;
const VIEW_ROWS = Math.max(...featured.map((p) => p.diagram?.rows ?? 0));

const ICONS: Record<string, React.ReactNode> = {
  "research-match": <path d="M6 1a5 5 0 1 0 3 9l3.5 3.5 1-1L10 9a5 5 0 0 0-4-8zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" fillRule="evenodd" />,
  "hn-hiring-observatory": <path d="M2 11h3V7H2zM6 11h3V3H6zM10 11h2V5h-2z" />,
  finradar: <path d="M7 1a6 6 0 1 0 0 12A6 6 0 0 0 7 1zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" fillRule="evenodd" />,
  gatehouse: <path d="M2 12V5l5-3 5 3v7H9V8H5v4z" />,
  assay: <path d="M2 2h4v4H2zM8 2h4v4H8zM2 8h4v4H2zM8 8h4v4H8z" />,
};

/**
 * The case studies as an index and a live view. Pick a project and its
 * architecture replays beside the list; left alone at gold, the view cycles
 * through them. At silver and bronze the selected project's write-up opens below.
 */
export function WorkIndex({ children }: { children: React.ReactNode }) {
  const { depth } = useDepth();
  const [slug, setSlug] = useState(featured[0].slug);
  const [auto, setAuto] = useState(true);
  const hover = useRef<number | undefined>(undefined);
  const p = featured.find((f) => f.slug === slug) ?? featured[0];
  const cycling = auto && depth === "gold";

  useEffect(() => {
    if (!cycling) return;
    const t = window.setInterval(() => {
      if (keepStill() || document.hidden) return;
      setSlug((s) => featured[(featured.findIndex((f) => f.slug === s) + 1) % featured.length].slug);
    }, CYCLE_MS);
    return () => window.clearInterval(t);
  }, [cycling]);

  const select = (next: string) => {
    window.clearTimeout(hover.current);
    setAuto(false);
    setSlug(next);
  };

  return (
    <>
      <div className="stage">
        {children}
        <h2 id="work-title" className="sr-only">
          Selected work
        </h2>

        <Panel name="work_index" meta="preview · open" tag="DATA" portId="work" out="right" className="op order-3 flex flex-col" style={{ "--x": "1.625rem", "--y": "29.75rem", "--w": "28.5rem" } as React.CSSProperties}>
          <ol className="space-y-0.5 p-2">
            {featured.map((f, i) => {
              const on = f.slug === p.slug;
              return (
                <li
                  key={f.slug}
                  onMouseEnter={() => {
                    window.clearTimeout(hover.current);
                    hover.current = window.setTimeout(() => select(f.slug), HOVER_MS);
                  }}
                  onMouseLeave={() => window.clearTimeout(hover.current)}
                  className={`group relative flex items-center rounded-md border transition-colors ${on ? "border-signal/40 bg-signal/[0.05]" : "border-transparent"}`}
                >
                  <span aria-hidden className={`absolute -left-px inset-y-1 w-0.5 rounded bg-signal transition-opacity ${on ? "opacity-100" : "opacity-0"}`} />
                  <button
                    onClick={() => select(f.slug)}
                    onFocus={() => select(f.slug)}
                    aria-pressed={on}
                    aria-label={`Trace ${f.name}`}
                    className="flex min-h-[2.75rem] min-w-0 flex-1 items-center gap-2.5 px-2.5 py-1 text-left font-[family-name:var(--font-mono)] lg:min-h-0"
                  >
                    <span aria-hidden className="text-[0.5625rem] tracking-[0.1em] text-shale">{String(i + 1).padStart(2, "0")}</span>
                    <svg aria-hidden viewBox="0 0 14 14" className={`h-3.5 w-3.5 shrink-0 ${on ? "fill-signal" : "fill-shale"}`}>
                      {ICONS[f.slug]}
                    </svg>
                    <span aria-hidden className="text-[0.5rem] text-signal/70">&#9656;</span>
                    <span className={`min-w-0 truncate text-[0.8125rem] sm:shrink-0 ${on ? "text-signal" : "text-quartz"}`}>{snake(f.slug)}</span>
                    <span aria-hidden className="hidden min-w-0 flex-1 truncate text-[0.5625rem] uppercase tracking-[0.1em] text-shale sm:block">{f.role}</span>
                    <span aria-hidden className="ml-auto shrink-0 text-[0.5625rem] tracking-[0.1em] text-shale sm:ml-0">{f.year}</span>
                  </button>
                  <Link
                    href={`/projects/${f.slug}/`}
                    aria-label={`Open ${f.name}`}
                    className={`tap shrink-0 px-2.5 font-[family-name:var(--font-mono)] text-[0.5625rem] tracking-[0.1em] transition-colors hover:text-signal ${on ? "text-signal" : "text-shale"}`}
                  >
                    OPEN &#8599;
                  </Link>
                </li>
              );
            })}
          </ol>

          <Link href="/projects/" className="tap mx-2 border-t border-seam px-2.5 py-2 font-[family-name:var(--font-mono)] text-[0.5625rem] tracking-[0.12em] text-shale hover:text-signal">
            <span className="text-signal/70">+{projects.length - featured.length}</span> MORE &#9656; FULL_INDEX
          </Link>

          {/* The selected project in a sentence; readable whether or not anything moves. */}
          <div className="flex flex-1 flex-col gap-2 border-t border-seam p-3.5">
            <h3 className="text-base font-bold">{p.name}</h3>
            <p className="text-[0.8125rem] leading-[1.5] text-quartz/90">{p.gold}</p>
            <Hallmark project={p} className="mt-auto" />
          </div>
        </Panel>

        {p.diagram && (
          <Panel name={`${snake(p.slug)}_view`} meta="replay" tag="VIEW" portId="view" in="left" className="op order-2 flex min-w-0 flex-col overflow-hidden" style={{ "--x": "calc(100% - min(44% - 1.625rem, 38rem) - 1.625rem)", "--y": "3.75rem", "--w": "min(44% - 1.625rem, 38rem)" } as React.CSSProperties}>
            <div className="contents" onPointerEnter={() => setAuto(false)}>
              <SystemTrace key={p.slug} diagram={p.diagram} title={p.name} autoplay bare fitRows={VIEW_ROWS} />
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-seam px-2.5 py-1.5 font-[family-name:var(--font-mono)] text-[0.5625rem] tracking-[0.1em] text-shale">
              <span className="hidden min-w-0 truncate uppercase sm:block">{p.stack.slice(0, 4).join(" → ")}</span>
              <Link href={`/projects/${p.slug}/`} className="tap shrink-0 text-signal hover:underline">
                OPEN PROJECT &rarr;
              </Link>
            </div>
          </Panel>
        )}

        <Panel name="run_clock · 7.2s" tag="SYS" portId="clock" out="right" className="op op-sys order-6" style={{ "--x": "max(31rem, 34.3%)", "--y": "43rem", "--w": "11rem" } as React.CSSProperties}>
          <div className="p-2.5">
            <button className="chip tap" data-quiet={!cycling} aria-pressed={false} onClick={() => setAuto((a) => !a)}>
              <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${cycling ? "status-dot bg-signal" : "bg-shale"}`} />
              {cycling ? "AUTO ▸ CYCLE" : "MANUAL"}
            </button>
          </div>
        </Panel>
      </div>

      {depth !== "gold" && (
        <div className="mx-auto max-w-[76rem] px-5 sm:px-8">
          <Panel name={`${snake(p.slug)}_detail`} meta={`${depth} depth`} tag="TXT">
            <div id="work-detail" className="scroll-mt-16 p-5 sm:p-6">
              <ProjectDetail project={p} hideTrace level={4} />
            </div>
          </Panel>
        </div>
      )}
    </>
  );
}
