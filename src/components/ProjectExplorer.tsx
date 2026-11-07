"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { projects, shelfLabel, domainLabel, statusLabel } from "@/content/projects";
import type { Domain, Project, Shelf, Status } from "@/content/types";
import { parseQuery, matches, toggleToken, hasToken, toSql } from "@/lib/query";
import { useDepth, isTyping } from "./DepthProvider";
import { ProjectDetail } from "./ProjectDetail";

const SHELVES: Shelf[] = ["featured", "lab", "archive", "foundations"];
const DOMAINS: Domain[] = ["ai", "data", "backend", "fullstack", "systems"];
const STATUSES: Status[] = ["shipped", "prototype", "coursework", "archived"];

const EXAMPLES = ["domain:ai status:shipped", "stack:fastapi", "databricks", "shelf:foundations"];

/**
 * The project catalog: a query bar with a small filter language, chips that
 * write into the same query, the equivalent SQL shown under the results, and
 * rows that expand to the current depth.
 */
export function ProjectExplorer() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [showSql, setShowSql] = useState(false);
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
      if (e.key === "/" && !isTyping(e.target)) {
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
        className={`tap rounded-full border px-3 py-1.5 t-micro transition-colors ${
          on ? "border-trace/70 bg-trace/10 text-quartz" : "border-seam text-quartz/80 hover:border-shale/60"
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <div>
      {/* Query bar */}
      <div className="rounded-lg border border-seam bg-slab/70 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-trace">
        <label className="flex items-center gap-3 px-4">
          <span aria-hidden className="t-data text-trace">›</span>
          <span className="sr-only">Filter projects</span>
          <input
            ref={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setQ("")}
            placeholder="Try domain:ai status:shipped"
            className="w-full bg-transparent py-3.5 t-data text-[0.9375rem] text-quartz placeholder:text-shale/70 focus-visible:outline-transparent"
            spellCheck={false}
            autoComplete="off"
          />
          {q ? (
            <button onClick={() => setQ("")} className="shrink-0 t-micro text-shale hover:text-quartz">
              Clear
            </button>
          ) : (
            <kbd className="hidden shrink-0 rounded border border-seam px-1.5 t-data text-shale sm:block">/</kbd>
          )}
        </label>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 w-14 t-micro text-shale">Domain</span>
          {DOMAINS.map((d) => chip("domain", d, domainLabel[d]))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 w-14 t-micro text-shale">Status</span>
          {STATUSES.map((s) => chip("status", s, statusLabel[s]))}
        </div>
      </div>

      {/* Result line and the same query as SQL */}
      <div className="mt-6 flex flex-wrap items-baseline justify-between gap-3 border-b border-seam pb-3">
        <p className="t-small text-shale" aria-live="polite">
          {results.length === projects.length ? `All ${projects.length} projects` : `${results.length} of ${projects.length} projects`}
          {parsed.unknown.length > 0 && <span className="text-reject"> (ignored: {parsed.unknown.join(", ")})</span>}
        </p>
        <button onClick={() => setShowSql((s) => !s)} aria-expanded={showSql} className="t-micro text-shale underline decoration-seam underline-offset-4 hover:text-quartz">
          {showSql ? "Hide the SQL" : "Show this as SQL"}
        </button>
      </div>
      <div className="reveal" data-open={showSql}>
        <div>
          <pre className="mt-3 overflow-x-auto rounded-lg border border-seam bg-slate p-4 t-data text-quartz/85">{toSql(parsed)}</pre>
        </div>
      </div>

      {results.length === 0 && (
        <div className="py-16">
          <p className="t-h3">Nothing matches that filter.</p>
          <p className="mt-2 t-small text-shale">Try one of these:</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button key={ex} onClick={() => setQ(ex)} className="rounded border border-seam px-2 py-1 t-data text-quartz hover:border-trace/60">
                {ex}
              </button>
            ))}
          </div>
        </div>
      )}

      {grouped.map((g) => (
        <section key={g.shelf} aria-labelledby={`shelf-${g.shelf}`} className="mt-12">
          <h2 id={`shelf-${g.shelf}`} className="flex items-baseline gap-3">
            <span className="t-h2">{shelfLabel[g.shelf]}</span>
            <span className="t-data text-shale">{g.items.length}</span>
          </h2>
          <ul className="mt-4 border-t border-seam">
            {g.items.map((p) => (
              <Row key={p.slug} p={p} open={open.has(p.slug)} onToggle={() => toggle(p.slug)} depth={depth} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function Row({ p, open, onToggle, depth }: { p: Project; open: boolean; onToggle: () => void; depth: string }) {
  // Mount the panel on first open and keep it, so closing can animate.
  const [mounted, setMounted] = useState(open);
  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);
  return (
    <li id={p.slug} className="scroll-mt-24 border-b border-seam">
      <button
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`panel-${p.slug}`}
        className="group grid w-full grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 py-5 text-left md:grid-cols-[minmax(12rem,16rem)_1fr_auto]"
      >
        <span className="flex items-baseline gap-3">
          <span
            aria-hidden
            className={`inline-block h-2 w-2 shrink-0 translate-y-[-1px] rounded-full border transition-colors ${
              open ? "border-metal bg-metal" : "border-shale/60 group-hover:border-quartz"
            }`}
          />
          <span className="t-h3 transition-[font-stretch] duration-300 group-hover:[font-stretch:112%]">{p.name}</span>
        </span>
        <span className="order-3 col-span-2 pl-5 text-quartz/80 md:order-none md:col-span-1 md:pl-0 md:line-clamp-2">{p.gold}</span>
        <span className="flex items-baseline gap-3 justify-self-end whitespace-nowrap">
          <span className="hidden t-micro text-shale sm:inline">{statusLabel[p.status]}</span>
          <span className="t-data text-shale">{p.year}</span>
          <span aria-hidden className={`t-data text-shale transition-transform duration-300 ${open ? "rotate-45" : ""}`}>+</span>
        </span>
      </button>
      <div id={`panel-${p.slug}`} className="reveal" data-open={open} role="region" aria-label={`${p.name} details`}>
        <div>
          {mounted && (
            <div className="pb-10 pl-5 pt-1" inert={!open}>
              <p className="mb-6 t-micro text-shale">
                Showing {depth} detail.{" "}
                <span className="hidden md:inline">Press G, S or B to change it.</span>
                <span className="md:hidden">Change it with the switch at the top.</span>
              </p>
              <ProjectDetail project={p} />
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
