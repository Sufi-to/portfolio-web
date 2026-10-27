"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { rawPost, extractedRecord, profile } from "@/content/profile";

interface Segment {
  text: string;
  field?: string;
  /** Order in which the extractor finds this span. */
  span?: number;
}

const STEP_MS = 280;
const START_DELAY_MS = 450;

function parse(post: string): Segment[] {
  const out: Segment[] = [];
  const re = /\[\[(.+?)\|(\w+)\]\]/g;
  let last = 0;
  let span = 0;
  for (const m of post.matchAll(re)) {
    if (m.index! > last) out.push({ text: post.slice(last, m.index) });
    out.push({ text: m[1], field: m[2], span: span++ });
    last = m.index! + m[0].length;
  }
  if (last < post.length) out.push({ text: post.slice(last) });
  return out;
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The home page's opening: an unstructured, HN-style post about Tomas is parsed
 * on screen into a typed record. Each field links back to the span it came from,
 * in both directions, which is the habit his projects are built on.
 */
export function ExtractionHero() {
  const segments = useMemo(() => parse(rawPost), []);
  const spanCount = segments.filter((s) => s.span !== undefined).length;

  const [step, setStep] = useState(0); // spans extracted so far
  const [refined, setRefined] = useState(false);
  const [focus, setFocus] = useState<string | null>(null); // highlighted field
  const [lines, setLines] = useState<{ span: number; field: string; d: string; x: number; y: number }[]>([]);

  const box = useRef<HTMLDivElement>(null);
  const rawPanel = useRef<HTMLDivElement>(null);
  const spanEls = useRef<Map<number, HTMLElement>>(new Map());
  const fieldEls = useRef<Map<string, HTMLElement>>(new Map());
  const timer = useRef<number | null>(null);

  const run = useCallback(() => {
    if (timer.current) window.clearInterval(timer.current);
    if (prefersReducedMotion()) {
      setStep(spanCount);
      setRefined(true);
      return;
    }
    setStep(0);
    setRefined(false);
    window.setTimeout(() => {
      setRefined(true);
      timer.current = window.setInterval(() => {
        setStep((s) => {
          if (s + 1 >= spanCount && timer.current) window.clearInterval(timer.current);
          return Math.min(s + 1, spanCount);
        });
      }, STEP_MS);
    }, START_DELAY_MS);
  }, [spanCount]);

  useEffect(() => {
    run();
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [run]);

  // Fields appear as soon as their first span is extracted.
  const revealedFields = useMemo(() => {
    const set = new Set<string>();
    for (const s of segments) if (s.span !== undefined && s.span < step && s.field) set.add(s.field);
    return set;
  }, [segments, step]);

  // Connector geometry, measured from the DOM so it follows any layout.
  const measure = useCallback(() => {
    const root = box.current;
    const raw = rawPanel.current;
    if (!root || !raw || window.innerWidth < 1024) {
      setLines([]);
      return;
    }
    const r = root.getBoundingClientRect();
    const edgeX = raw.getBoundingClientRect().right - r.left;
    const next: typeof lines = [];
    for (const s of segments) {
      if (s.span === undefined || !s.field) continue;
      const a = spanEls.current.get(s.span);
      const b = fieldEls.current.get(s.field);
      if (!a || !b) continue;
      const ar = a.getClientRects();
      const last = ar[ar.length - 1] ?? a.getBoundingClientRect();
      const y1 = last.top + last.height / 2 - r.top;
      const br = b.getBoundingClientRect();
      const x2 = br.left - r.left - 6;
      const y2 = br.top + 18 - r.top;
      const dx = Math.max(40, (x2 - edgeX) * 0.5);
      next.push({
        span: s.span,
        field: s.field,
        x: edgeX,
        y: y1,
        d: `M${edgeX} ${y1} C${edgeX + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`,
      });
    }
    setLines(next);
  }, [segments]);

  useLayoutEffect(() => {
    measure();
  }, [measure, step, revealedFields.size]);

  useEffect(() => {
    const ro = new ResizeObserver(() => measure());
    if (box.current) ro.observe(box.current);
    document.fonts?.ready.then(() => measure());
    return () => ro.disconnect();
  }, [measure]);

  const done = step >= spanCount;

  return (
    <section aria-labelledby="hero-title" className="mx-auto max-w-[76rem] px-5 pt-14 sm:px-8 sm:pt-20">
      <h1
        id="hero-title"
        className={`t-display transition-[font-stretch,font-weight,color] ease-[cubic-bezier(0.2,0.7,0.2,1)] lg:whitespace-nowrap ${
          refined ? "text-quartz [font-stretch:116%] [font-weight:560]" : "text-shale [font-stretch:62%] [font-weight:340]"
        }`}
        style={{ transitionDuration: `${spanCount * STEP_MS}ms` }}
      >
        <span className="lg:block">I turn messy data </span>
        <span className="lg:block">into systems you can check.</span>
      </h1>

      <div ref={box} className="relative mt-12 grid gap-6 lg:mt-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-28">
        {/* Raw input */}
        <div>
          <div className="mb-3 flex items-baseline justify-between t-micro text-shale">
            <span>Raw post</span>
            <span className="t-data">{rawPost.replace(/\[\[(.+?)\|\w+\]\]/g, "$1").length} chars, unstructured</span>
          </div>
          <div ref={rawPanel} className="rounded-lg border border-seam bg-slab/60 p-5 sm:p-6">
            <p className="t-raw text-[1.1875rem] leading-[1.75] text-shale sm:text-[1.3125rem]">
              {segments.map((s, i) => {
                if (s.span === undefined) return <span key={i}>{s.text}</span>;
                const found = s.span < step;
                const lit = focus !== null && focus === s.field;
                return (
                  <span
                    key={i}
                    ref={(el) => {
                      if (el) spanEls.current.set(s.span!, el);
                    }}
                    tabIndex={found ? 0 : -1}
                    onMouseEnter={() => found && setFocus(s.field!)}
                    onMouseLeave={() => setFocus(null)}
                    onFocus={() => found && setFocus(s.field!)}
                    onBlur={() => setFocus(null)}
                    onClick={() => found && setFocus((f) => (f === s.field ? null : s.field!))}
                    aria-label={found ? `${s.text}, extracted as ${s.field}` : undefined}
                    className={`rounded-[3px] transition-[background-color,color,box-shadow] duration-300 ${
                      lit
                        ? "bg-trace/20 text-quartz shadow-[inset_0_-1px_0_var(--trace)]"
                        : found
                          ? "cursor-pointer bg-gold/[0.13] text-quartz shadow-[inset_0_-1px_0_color-mix(in_srgb,var(--gold)_60%,transparent)]"
                          : ""
                    }`}
                  >
                    {s.text}
                  </span>
                );
              })}
            </p>
          </div>
        </div>

        {/* Connectors, desktop only. */}
        <svg aria-hidden className="pointer-events-none absolute inset-0 hidden h-full w-full overflow-visible lg:block">
          {lines.map((l) => {
            const visible = l.span < step;
            const lit = focus === l.field;
            return (
              <g key={l.span} className="transition-opacity duration-300" opacity={visible ? (focus && !lit ? 0.18 : 1) : 0}>
                <path
                  d={l.d}
                  fill="none"
                  pathLength={1}
                  strokeDasharray="1"
                  strokeDashoffset={visible ? 0 : 1}
                  stroke={lit ? "var(--trace)" : "color-mix(in srgb, var(--gold) 55%, transparent)"}
                  strokeWidth={lit ? 1.5 : 1}
                  style={{ transition: "stroke-dashoffset 420ms cubic-bezier(0.2,0.7,0.2,1), stroke 200ms" }}
                />
                <circle cx={l.x} cy={l.y} r={2.5} fill={lit ? "var(--trace)" : "var(--gold)"} />
              </g>
            );
          })}
        </svg>

        {/* Extracted record */}
        <div>
          <div className="mb-3 flex items-baseline justify-between t-micro text-shale">
            <span>Extracted record</span>
            <span className="t-data" aria-live="polite">
              {done ? `${spanCount} spans, ${extractedRecord.length} fields` : `extracting ${step}/${spanCount}`}
            </span>
          </div>
          <dl className="rounded-lg border border-seam">
            {extractedRecord.map((f, i) => {
              const shown = revealedFields.has(f.field);
              const lit = focus === f.field;
              return (
                <div
                  key={f.field}
                  ref={(el) => {
                    if (el) fieldEls.current.set(f.field, el);
                  }}
                  tabIndex={shown ? 0 : -1}
                  onMouseEnter={() => shown && setFocus(f.field)}
                  onMouseLeave={() => setFocus(null)}
                  onFocus={() => shown && setFocus(f.field)}
                  onBlur={() => setFocus(null)}
                  onClick={() => shown && setFocus((x) => (x === f.field ? null : f.field))}
                  className={`grid grid-cols-[6.5rem_1fr] items-baseline gap-4 px-4 py-2.5 transition-colors duration-300 sm:px-5 ${
                    i > 0 ? "border-t border-seam/70" : ""
                  } ${lit ? "bg-trace/10" : ""} ${shown ? "cursor-pointer" : ""}`}
                >
                  <dt className={`t-data ${lit ? "text-trace" : "text-shale"}`}>{f.label}</dt>
                  <dd
                    className={`transition-[opacity,font-stretch] duration-500 ${
                      shown ? "opacity-100 [font-stretch:100%]" : "opacity-0 [font-stretch:70%]"
                    }`}
                  >
                    {f.field === "contact" ? (
                      <a href={`mailto:${profile.email}`} className="underline decoration-seam underline-offset-4 hover:decoration-trace" tabIndex={shown ? 0 : -1}>
                        {f.value}
                      </a>
                    ) : (
                      f.value
                    )}
                  </dd>
                </div>
              );
            })}
          </dl>
          <div className="mt-3 flex items-center justify-between gap-4 t-micro text-shale">
            <span className="hidden lg:inline">Hover a field to see where it came from.</span>
            <span className="lg:hidden">Tap a field or a highlighted phrase to link them.</span>
            <button
              onClick={run}
              disabled={!done}
              className="shrink-0 rounded-md border border-seam px-2.5 py-1 text-quartz transition-colors hover:border-trace/60 disabled:opacity-40"
            >
              Run again
            </button>
          </div>
        </div>
      </div>

      <div className="mt-14 grid gap-8 border-t border-seam pt-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-28">
        <p className="measure text-[1.1875rem] leading-[1.6] text-quartz/90">
          I&rsquo;m Tomas, a software engineer working on AI and data systems. Recently: LLM extraction over 40,065 Hacker News
          hiring posts on Databricks, a stock research tool that discards unsourced model claims, and a gateway that keeps LLM
          endpoints safe when prompts or providers misbehave. I started out writing a Unix shell in C.
        </p>
        <div className="flex flex-wrap content-start items-center gap-3">
          <Link
            href="/projects/"
            className="rounded-md bg-quartz px-4 py-2.5 font-[560] text-slate transition-colors hover:bg-gold"
          >
            Explore projects
          </Link>
          <a
            href={`mailto:${profile.email}`}
            className="rounded-md border border-seam px-4 py-2.5 transition-colors hover:border-shale/60"
          >
            Email me
          </a>
          <a
            href={profile.github}
            target="_blank"
            rel="me noopener"
            className="rounded-md px-2 py-2.5 text-shale underline decoration-seam underline-offset-4 transition-colors hover:text-quartz"
          >
            GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
