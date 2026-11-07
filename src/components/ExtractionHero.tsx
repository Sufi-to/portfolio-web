"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { rawPost, extractedRecord, profile } from "@/content/profile";
import { button } from "@/lib/button";
import { keepStill } from "@/lib/motion";
import { Panel } from "./Panel";

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

/**
 * The home page's opening: an unstructured, HN-style post about Tomas is parsed
 * on screen into a typed record. Each field links back to the span it came from,
 * in both directions, which is the habit his projects are built on.
 */
export function ExtractionHero() {
  const segments = useMemo(() => parse(rawPost), []);
  const spanCount = segments.filter((s) => s.span !== undefined).length;

  // Starts finished, so the record reads the same without scripts; the replay
  // runs once, just before the panels scroll into view.
  const [step, setStep] = useState(spanCount); // spans extracted so far
  const [refined, setRefined] = useState(true);
  const [rawOpen, setRawOpen] = useState(false);
  const [focus, setFocus] = useState<string | null>(null); // highlighted field
  const [lines, setLines] = useState<{ span: number; field: string; d: string; x: number; y: number }[]>([]);

  const box = useRef<HTMLDivElement>(null);
  const rawPanel = useRef<HTMLDivElement>(null);
  const spanEls = useRef<Map<number, HTMLElement>>(new Map());
  const fieldEls = useRef<Map<string, HTMLElement>>(new Map());
  const timer = useRef<number | null>(null);

  const run = useCallback(() => {
    if (timer.current) window.clearInterval(timer.current);
    if (keepStill()) {
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
    if (!box.current) return;
    const near = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        near.disconnect();
        run();
      },
      { rootMargin: "160px 0px" },
    );
    near.observe(box.current);
    return () => {
      near.disconnect();
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

  // The header's status pill follows the run.
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("extract:step", { detail: { step, total: spanCount } }));
  }, [step, spanCount]);

  return (
    <section aria-label="Extraction replay" className="min-w-0">
      <div ref={box} className="relative grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
        {/* Raw input */}
        <Panel ref={rawPanel} portId="raw" out="left" name="raw_post" meta={`${rawPost.replace(/\[\[(.+?)\|\w+\]\]/g, "$1").length} chars, unstructured`} tag="TXT">
          <div className="p-3.5">
            <p className={`t-raw text-[0.8125rem] leading-[1.8] text-quartz/75 ${rawOpen ? "" : "max-lg:line-clamp-4"}`}>
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
                    onMouseEnter={() => found && setFocus(s.field!)}
                    onMouseLeave={() => setFocus(null)}
                    onClick={() => found && setFocus(s.field!)}
                    className={`rounded-sm transition-[background-color,color,box-shadow] duration-300 ${
                      lit
                        ? "bg-trace/20 text-quartz shadow-[inset_0_-1px_0_var(--trace)]"
                        : found
                          ? "cursor-pointer bg-metal/[0.13] text-quartz shadow-[inset_0_-1px_0_color-mix(in_srgb,var(--metal)_60%,transparent)]"
                          : ""
                    }`}
                  >
                    {s.text}
                  </span>
                );
              })}
            </p>
            <button onClick={() => setRawOpen((o) => !o)} aria-expanded={rawOpen} className={`mt-3 lg:hidden ${button("outline", "sm")}`}>
              {rawOpen ? "Show less" : "Read the whole post"}
            </button>
          </div>
        </Panel>

        {/* Connectors, desktop only. */}
        <svg aria-hidden className="pointer-events-none absolute inset-0 z-[2] hidden h-full w-full overflow-visible lg:block">
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
                  stroke={lit ? "var(--trace)" : "color-mix(in srgb, var(--metal) 55%, transparent)"}
                  strokeWidth={lit ? 1.5 : 1}
                  style={{ transition: "stroke-dashoffset 420ms cubic-bezier(0.2,0.7,0.2,1), stroke 200ms" }}
                />
                <circle cx={l.x} cy={l.y} r={2.5} fill={lit ? "var(--trace)" : "var(--metal)"} />
              </g>
            );
          })}
        </svg>

        {/* Extracted record */}
        <Panel
          name="extracted_record"
          meta={done ? `${spanCount} spans, ${extractedRecord.length} fields` : `extracting ${step}/${spanCount}`}
          tag="DATA"
        >
          <dl>
            {extractedRecord.map((f, i) => {
              const shown = revealedFields.has(f.field);
              const lit = focus === f.field;
              return (
                <div
                  key={f.field}
                  ref={(el) => {
                    if (el) fieldEls.current.set(f.field, el);
                  }}
                  onMouseEnter={() => shown && setFocus(f.field)}
                  onMouseLeave={() => setFocus(null)}
                  onFocus={() => shown && setFocus(f.field)}
                  onBlur={() => setFocus(null)}
                  onClick={() => shown && setFocus(f.field)}
                  className={`grid grid-cols-[5.5rem_minmax(0,1fr)] items-baseline gap-3 sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:gap-4 px-3.5 py-1.5 transition-colors duration-300 ${
                    i > 0 ? "border-t border-seam/70" : ""
                  } ${lit ? "bg-trace/10" : ""} ${shown ? "cursor-pointer" : ""}`}
                >
                  <dt>
                    {/* Focus or a click reaches the row, which lights the phrases behind this field. */}
                    <button disabled={!shown} aria-pressed={lit} aria-label={`Show where ${f.label} came from`} className={`tap t-data ${lit ? "text-trace" : "text-shale"}`}>
                      {f.label}
                    </button>
                  </dt>
                  <dd
                    className={`hero-value t-data [overflow-wrap:anywhere] transition-opacity duration-500 ${shown ? "opacity-100" : "opacity-0"}`}
                  >
                    {f.field === "contact" ? (
                      <a href={`mailto:${profile.email}`} className="tap underline decoration-seam underline-offset-4 hover:decoration-trace" tabIndex={shown ? 0 : -1}>
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
          <div className="flex items-center justify-between gap-4 border-t border-seam/70 px-3.5 py-1.5 t-data text-[0.625rem] text-shale">
            <span className="hidden lg:inline">Hover a field to see its source. A replay, tagged by hand.</span>
            <span className="lg:hidden">Tap a field to see its source. A replay, tagged by hand.</span>
            <button
              onClick={run}
              disabled={!done}
              className={`shrink-0 ${button("outline", "sm")}`}
            >
              Replay
            </button>
          </div>
        </Panel>
      </div>

    </section>
  );
}
