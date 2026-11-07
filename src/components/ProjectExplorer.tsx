"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { projects, shelfLabel, domainLabel, statusLabel } from "@/content/projects";
import type { Domain, Project, Shelf, Status } from "@/content/types";
import { parseQuery, matches, toggleToken, hasToken, toSql } from "@/lib/query";
import { useDepth, isTyping, shortcutsOn } from "./DepthProvider";
import { Panel } from "./Panel";
import { DepthOp } from "./OreOps";
import { ProjectDetail } from "./ProjectDetail";
import { SystemTrace } from "./SystemTrace";

const SHELVES: Shelf[] = ["featured", "lab", "archive", "foundations"];
const DOMAINS: Domain[] = ["ai", "data", "backend", "fullstack", "systems"];
const STATUSES: Status[] = ["shipped", "prototype", "coursework", "archived"];

const DOT: Record<Domain, string> = { ai: "bg-signal", data: "bg-[#7cc2e3]", backend: "bg-[#c77dba]", fullstack: "bg-[#e0a43a]", systems: "bg-shale" };

const EXAMPLES = ["domain:ai status:shipped", "stack:fastapi", "databricks", "shelf:foundations"];

/**
 * The project catalog: a query bar with a small filter language, chips that
 * write into the same query, the equivalent SQL shown under the results, and
 * rows that expand to the current depth.
 */
export function ProjectExplorer({ intro }: { intro: React.ReactNode }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [showSql, setShowSql] = useState(false);
  const [preview, setPreview] = useState(projects[0].slug);
  const input = useRef<HTMLInputElement>(null);
  const { depth } = useDepth();

  // Read ?q= and #slug from the URL once, then keep ?q= in sync.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("q");
    if (fromUrl) setQ(fromUrl);
    const hash = window.location.hash.slice(1);
    if (hash && projects.some((p) => p.slug === hash)) {
      setOpen(new Set([hash]));
      setPreview(hash);
      requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView({ block: "start" }));
    }
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (q.trim()) url.searchParams.set("q", q.trim());
    else url.searchParams.delete("q");
    window.history.replaceState(null, "", url);
  }, [q]);

  // "/" focuses the query bar.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !isTyping(e.target) && shortcutsOn()) {
        e.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const parsed = useMemo(() => parseQuery(q), [q]);
  const results = useMemo(() => projects.filter((p) => matches(p, parsed)), [parsed]);
  const grouped = SHELVES.map((s) => ({ shelf: s, items: results.filter((p) => p.shelf === s) })).filter((g) => g.items.length);

  const toggle = (slug: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });

  const chip = (key: "domain" | "status", value: string, label: string) => {
    const on = hasToken(parsed, key, value);
    return (
      <button
        key={`${key}:${value}`}
        onClick={() => setQ((cur) => toggleToken(cur, key, value))}
        aria-pressed={on}
        className="chip tap"
        data-quiet={!on}
      >
        {label}
      </button>
    );
  };

  const active = projects.find((p) => p.slug === preview) ?? projects[0];
  let counter = 0;

  return (
    <div className="page">
      <div className="page-col">
        {intro}

        <Panel name="catalog_query" meta={`${results.length} of ${projects.length} rows`} tag="SYS" className="focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-trace">
          <label className="flex items-center gap-2 border-b border-seam px-3.5">
            <span aria-hidden className="t-data text-signal">&gt;</span>
            <span className="sr-only">Filter projects</span>
            <input
              ref={input}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && setQ("")}
              placeholder="Try domain:ai status:shipped"
              className="w-full bg-transparent py-2.5 t-data text-quartz placeholder:text-shale focus-visible:outline-transparent"
              spellCheck={false}
              autoComplete="off"
            />
            {q ? (
              <button onClick={() => setQ("")} className="shrink-0 t-data text-shale hover:text-quartz">
                CLEAR
              </button>
            ) : (
              <kbd className="hidden shrink-0 rounded-sm border border-seam px-1.5 t-data text-shale sm:block">/</kbd>
            )}
          </label>
          <div className="flex flex-wrap gap-1.5 p-2.5">
            {DOMAINS.map((d) => chip("domain", d, domainLabel[d]))}
            {STATUSES.map((v) => chip("status", v, statusLabel[v]))}
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-3 border-t border-seam px-3.5 py-2 t-data text-[0.625rem] text-shale">
            <p aria-live="polite">
              {results.length === projects.length ? `ALL ${projects.length} PROJECTS` : `${results.length} OF ${projects.length} PROJECTS`}
              {parsed.unknown.length > 0 && <span className="text-reject"> (ignored: {parsed.unknown.join(", ")})</span>}
            </p>
            <button onClick={() => setShowSql((v) => !v)} aria-expanded={showSql} className="tap hover:text-signal">
              {showSql ? "HIDE THE SQL" : "SHOW THIS AS SQL"}
            </button>
          </div>
          <div className="reveal" data-open={showSql}>
            <div>
              <pre className="overflow-x-auto border-t border-seam p-3.5 t-data text-[0.6875rem] text-quartz/85">{toSql(parsed)}</pre>
            </div>
          </div>
        </Panel>

        <DepthOp />

        <Panel name="work_index" meta="preview · open" tag="DATA" portId="index" out="right">
          {results.length === 0 && (
            <div className="p-4">
              <p className="t-h3">Nothing matches that filter.</p>
              <p className="mt-1 t-small text-shale">Try one of these:</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {EXAMPLES.map((ex) => (
                  <button key={ex} onClick={() => setQ(ex)} className="chip tap">
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}

          {grouped.map((g, gi) => (
            <section key={g.shelf} aria-labelledby={`shelf-${g.shelf}`} className="p-2">
              <h2 id={`shelf-${g.shelf}`} className="flex items-baseline justify-between border-b border-seam px-2.5 pb-1.5 font-[family-name:var(--font-mono)] text-[0.625rem] font-normal tracking-[0.14em] text-shale">
                <span>
                  <span className="mr-3 font-bold text-signal">{String(gi + 1).padStart(2, "0")}</span>
                  {shelfLabel[g.shelf].toUpperCase()}
                </span>
                <span>{g.items.length} OPS</span>
              </h2>
              <ul className="mt-1 space-y-0.5">
                {g.items.map((p) => (
                  <Row key={p.slug} p={p} n={++counter} on={p.slug === active.slug} open={open.has(p.slug)} onPreview={() => setPreview(p.slug)} onToggle={() => {
                    setPreview(p.slug);
                    toggle(p.slug);
                  }} depth={depth} />
                ))}
              </ul>
            </section>
          ))}
        </Panel>
      </div>

      <div className="page-col page-side max-xl:hidden xl:max-h-[calc(100dvh-5rem)] xl:overflow-y-auto">
        <Panel name={`${active.slug.replaceAll("-", "_")}_view`} meta={active.diagram ? "replay" : "summary"} tag="VIEW" portId="pview" in="left">
          {active.diagram ? (
            <SystemTrace key={active.slug} diagram={active.diagram} title={active.name} autoplay bare />
          ) : (
            <div className="p-4">
              <p className="t-h3">{active.name}</p>
              <p className="mt-2 t-small text-quartz/90">{active.gold}</p>
            </div>
          )}
          <div className="flex items-center justify-between gap-4 border-t border-seam px-2.5 py-1.5 font-[family-name:var(--font-mono)] text-[0.5625rem] tracking-[0.1em] text-shale">
            <span className="min-w-0 truncate uppercase">{active.stack.slice(0, 4).join(" → ")}</span>
            <Link href={`/projects/${active.slug}/`} className="shrink-0 text-signal hover:underline">
              OPEN PROJECT &rarr;
            </Link>
          </div>
        </Panel>
        {depth !== "gold" && (
          <Panel name={`${active.slug.replaceAll("-", "_")}_detail`} meta={`${depth} depth`} tag="TXT">
            <div className="p-4">
              <ProjectDetail project={active} hideTrace />
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}

function Row({ p, n, on, open, onPreview, onToggle, depth }: { p: Project; n: number; on: boolean; open: boolean; onPreview: () => void; onToggle: () => void; depth: string }) {
  // Mount the panel on first open and keep it, so closing can animate.
  const [mounted, setMounted] = useState(open);
  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);
  return (
    <li id={p.slug} className="scroll-mt-16" onMouseEnter={onPreview}>
      <div className={`group relative flex items-center rounded-md border transition-colors ${on ? "border-signal/40 bg-signal/[0.05]" : "border-transparent"}`}>
        <span aria-hidden className={`absolute -left-px inset-y-1 w-0.5 rounded bg-signal transition-opacity ${on ? "opacity-100" : "opacity-0"}`} />
        <button
          onClick={onToggle}
          onFocus={onPreview}
          aria-expanded={open}
          aria-controls={`panel-${p.slug}`}
          className="flex min-h-[2.75rem] min-w-0 flex-1 items-center gap-2.5 px-2.5 py-1 text-left font-[family-name:var(--font-mono)] xl:min-h-0"
        >
          <span aria-hidden className="text-[0.5625rem] tracking-[0.1em] text-shale">{String(n).padStart(2, "0")}</span>
          <span aria-hidden className={`h-2 w-2 shrink-0 rounded-[1px] ${DOT[p.domains[0]]}`} />
          <span aria-hidden className="text-[0.5rem] text-signal/70">&#9656;</span>
          <span className={`min-w-0 truncate text-[0.8125rem] sm:shrink-0 ${on ? "text-signal" : "text-quartz"}`}>{p.slug.replaceAll("-", "_")}</span>
          <span aria-hidden className="hidden min-w-0 flex-1 truncate text-[0.5625rem] uppercase tracking-[0.1em] text-shale sm:block">{p.role}</span>
          <span className={`ml-auto shrink-0 rounded-sm border px-1 text-[0.5rem] tracking-[0.1em] sm:ml-0 ${p.status === "shipped" ? "border-signal/50 text-signal" : "border-edge text-shale"}`}>{statusLabel[p.status].toUpperCase()}</span>
          <span aria-hidden className="hidden text-[0.5625rem] tracking-[0.1em] text-shale sm:inline">{p.year}</span>
        </button>
      </div>
      <div id={`panel-${p.slug}`} className="reveal xl:hidden" data-open={open} role="region" aria-label={`${p.name} details`}>
        <div>
          {mounted && (
            <div className="px-3 pb-6 pt-3" inert={!open}>
              <p className="mb-4 t-micro text-shale">Showing {depth} detail.</p>
              <ProjectDetail project={p} />
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
