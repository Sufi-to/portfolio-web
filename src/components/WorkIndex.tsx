"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { featured } from "@/content/projects";
import { useDepth } from "./DepthProvider";
import { Hallmark } from "./Hallmark";
import { Panel } from "./Panel";
import { ProjectDetail } from "./ProjectDetail";
import { SystemTrace } from "./SystemTrace";

const snake = (slug: string) => slug.replaceAll("-", "_");
const HOVER_MS = 110; // Long enough that sweeping past a row doesn't restart the trace.
const VIEW_ROWS = Math.max(...featured.map((p) => p.diagram?.rows ?? 0));

/**
 * The case studies as a master and detail pair: pick a project in the index
 * and its live architecture runs in the view beside it. At silver and bronze
 * the selected project's write-up opens underneath.
 */
export function WorkIndex() {
  const { depth } = useDepth();
  const [slug, setSlug] = useState(featured[0].slug);
  const hover = useRef<number | undefined>(undefined);
  const p = featured.find((f) => f.slug === slug) ?? featured[0];

  const select = (next: string) => {
    window.clearTimeout(hover.current);
    setSlug(next);
  };

  return (
    <section aria-labelledby="work-title" className="mx-auto mt-16 max-w-[76rem] scroll-mt-16 px-5 sm:px-8">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h2 id="work-title" className="t-h2">
          Selected work
        </h2>
        <Link href="/projects/" className="tap t-small text-shale underline decoration-seam underline-offset-4 hover:text-quartz">
          All projects, with filters
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-10">
        <Panel name="work_index" meta="pick a project" tag="DATA" portId="work" in="right" out="left" className="flex flex-col">
          <ol>
            {featured.map((f, i) => {
              const on = f.slug === p.slug;
              return (
                <li
                  key={f.slug}
                  onMouseEnter={() => {
                    window.clearTimeout(hover.current);
                    hover.current = window.setTimeout(() => setSlug(f.slug), HOVER_MS);
                  }}
                  onMouseLeave={() => window.clearTimeout(hover.current)}
                  className={`relative grid grid-cols-[minmax(0,1fr)_auto] items-center border-b border-seam/70 transition-colors ${on ? "bg-slab-2" : ""}`}
                >
                  <span aria-hidden className={`absolute inset-y-0 left-0 w-0.5 bg-metal transition-opacity ${on ? "opacity-100" : "opacity-0"}`} />
                  <button
                    onClick={() => select(f.slug)}
                    onFocus={() => select(f.slug)}
                    aria-pressed={on}
                    aria-label={`Trace ${f.name}`}
                    className="grid min-h-[2.75rem] w-full min-w-0 grid-cols-[1.75rem_minmax(0,1fr)] items-baseline gap-x-2 px-3 py-2.5 text-left"
                  >
                    <span aria-hidden className="t-data text-shale">{String(i + 1).padStart(2, "0")}</span>
                    <span className={`truncate t-data text-small ${on ? "text-metal" : "text-quartz"}`}>{snake(f.slug)}</span>
                  </button>
                  <Link
                    href={`/projects/${f.slug}/`}
                    aria-label={`Open ${f.name}`}
                    className={`tap self-stretch px-3 t-data leading-[2.75rem] underline-offset-4 hover:underline ${on ? "text-metal" : "text-shale"}`}
                  >
                    open<span className="max-sm:hidden"> project</span>
                  </Link>
                </li>
              );
            })}
          </ol>

          {/* The selected project in a sentence; readable whether or not anything moves. */}
          <div className="flex flex-1 flex-col gap-3 p-4">
            <h3 className="text-name leading-[1.15] font-[540] [font-stretch:114%]">{p.name}</h3>
            <p className="text-quartz/90">{p.gold}</p>
            <p className="t-small text-shale">{p.role}</p>
            <p className="t-small text-shale">{p.stack.slice(0, 6).join(", ")}</p>
            <Hallmark project={p} className="mt-auto" />
          </div>
        </Panel>

        {/* On a phone the view comes first, so a tap in the list shows its result straight above it. */}
        {p.diagram && (
          <Panel name={`${snake(p.slug)}_view`} tag="VIEW" portId="view" in="right" out="left" className="order-first flex min-w-0 flex-col lg:order-none">
            <SystemTrace key={p.slug} diagram={p.diagram} title={p.name} autoplay bare fitRows={VIEW_ROWS} />
          </Panel>
        )}
      </div>

      {depth !== "gold" && (
        <Panel name={`${snake(p.slug)}_detail`} meta={`${depth} depth`} tag="TXT" className="mt-6">
          <div className="p-5 sm:p-6">
            <ProjectDetail project={p} hideTrace level={4} />
          </div>
        </Panel>
      )}
    </section>
  );
}
