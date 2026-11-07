"use client";

import Link from "next/link";
import type { Depth, Project } from "@/content/types";
import { evidenceUrl, statusLabel } from "@/content/projects";
import { useDepth } from "./DepthProvider";
import { MediaGallery } from "./MediaGallery";
import { Panel } from "./Panel";
import { SystemTrace } from "./SystemTrace";

const order: Depth[] = ["gold", "silver", "bronze"];

/**
 * A project's content at the current depth. Gold: the one-line outcome and
 * links. Silver adds the build story and the replayable diagram. Bronze adds
 * file-and-line evidence. `depth` overrides the visitor's setting.
 */
export function ProjectDetail({
  project: p,
  depth: forced,
  showGold = false,
  hideTrace = false,
  level = 3,
}: {
  project: Project;
  depth?: Depth;
  showGold?: boolean;
  hideTrace?: boolean;
  /** Heading level for this block's sections, so the page outline never skips one. */
  level?: 2 | 3 | 4;
}) {
  const H = `h${level}` as const;
  const { depth: chosen } = useDepth();
  const depth = forced ?? chosen;
  const at = (d: Depth) => order.indexOf(depth) >= order.indexOf(d);

  return (
    <div className="space-y-5">
      {showGold && <p className="measure text-base leading-[1.55]">{p.gold}</p>}

      <dl className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">
        <div>
          <dt className="t-micro text-shale">Role</dt>
          <dd className="t-small">{p.role}</dd>
        </div>
        {!showGold && (
          <div>
            <dt className="t-micro text-shale">Status</dt>
            <dd className="t-small">{statusLabel[p.status]}</dd>
          </div>
        )}
        <div className="col-span-2">
          <dt className="t-micro text-shale">Source</dt>
          <dd className="flex flex-wrap gap-x-4 t-small">
            {p.repos.map((r) => (
              <a key={r.url} href={r.url} target="_blank" rel="noopener" className="tap underline decoration-seam underline-offset-4 hover:decoration-trace">
                {r.label} on GitHub
              </a>
            ))}
            {p.live && (
              <a href={p.live} target="_blank" rel="noopener" className="tap text-signal underline decoration-signal/40 underline-offset-4 hover:decoration-signal">
                Live demo
              </a>
            )}
          </dd>
        </div>
        <div className="col-span-2 sm:col-span-4">
          <dt className="t-micro text-shale">Stack</dt>
          <dd className="mt-1 flex flex-wrap gap-1.5">
            {p.stack.map((s) => (
              <span key={s} className="rounded-sm border border-seam px-1.5 py-0.5 t-data text-[0.625rem] text-quartz/85">
                {s}
              </span>
            ))}
          </dd>
        </div>
      </dl>

      {at("silver") && p.silver && (
        <div className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <H className="t-data text-[0.625rem] uppercase tracking-[0.1em] text-signal">The problem</H>
              <p className="mt-1.5 t-small text-quartz/90">{p.silver.problem}</p>
            </div>
            <div>
              <H className="t-data text-[0.625rem] uppercase tracking-[0.1em] text-signal">What I built</H>
              <p className="mt-1.5 t-small text-quartz/90">{p.silver.build}</p>
            </div>
          </div>

          <MediaGallery project={p} />

          {p.diagram && !hideTrace && <SystemTrace diagram={p.diagram} title={p.name} />}

          <div>
            <H className="t-data text-[0.625rem] uppercase tracking-[0.1em] text-signal">Decisions</H>
            <ul className="mt-3 grid gap-x-8 gap-y-5 md:grid-cols-3">
              {p.silver.decisions.map((d) => (
                <li key={d.title} className="border-l border-signal/40 pl-3">
                  <p className="t-small font-bold">{d.title}</p>
                  <p className="mt-1 t-small text-quartz/80">{d.body}</p>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <H className="t-data text-[0.625rem] uppercase tracking-[0.1em] text-signal">What it doesn&rsquo;t do</H>
            <ul className="mt-2 space-y-1 t-small text-quartz/80">
              {p.silver.boundaries.map((b) => (
                <li key={b} className="flex gap-2">
                  <span aria-hidden className="text-shale">–</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {at("silver") && !p.silver && (
        <p className="t-small text-shale">No deeper write-up for this one yet; the repository has the details.</p>
      )}

      {at("bronze") && p.evidence && (
        <div>
          <Panel name="evidence" meta="pinned to a commit" tag="DATA">
          <ul className="divide-y divide-seam/70">
            {p.evidence.map((e) => (
              <li key={`${e.path}${e.line ?? ""}`}>
                <a
                  href={evidenceUrl(e)}
                  target="_blank"
                  rel="noopener"
                  className="group grid grid-cols-[minmax(0,1fr)] gap-1 px-4 py-3 transition-colors hover:bg-slab-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-6"
                >
                  <span className="t-small">{e.claim}</span>
                  <span className="t-data text-shale [overflow-wrap:anywhere] group-hover:text-signal">
                    {e.path}
                    {e.line ? `:${e.line}` : ""} @ {e.sha.slice(0, 7)}
                  </span>
                </a>
              </li>
            ))}
          </ul>
          </Panel>
          <Link href={`/evidence/#${p.slug}`} className="tap mt-2 inline-block t-small text-shale underline decoration-seam underline-offset-4 hover:text-quartz">
            See when these were last checked
          </Link>
        </div>
      )}
      {at("bronze") && !p.evidence && (
        <p className="t-small text-shale">Evidence links are only gathered for the case studies so far.</p>
      )}

      {!forced && p.shelf === "featured" && (
        <Link href={`/projects/${p.slug}/`} className="inline-block t-small underline decoration-seam underline-offset-4 hover:decoration-trace">
          Open the {p.name} page
        </Link>
      )}
    </div>
  );
}
