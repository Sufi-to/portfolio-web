"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { assays, type Assay } from "@/content/assays";
import { evidenceKey, evidenceUrl } from "@/content/projects";
import report from "@/data/evidence-report.json";

const results: Record<string, { ok: boolean }> = report.results;
const pattern = new RegExp(`(${assays.map((a) => a.phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`);
const byPhrase = new Map(assays.map((a) => [a.phrase, a]));

/** A figure with its proof one click away: the claim, the line and when it was last checked. */
function AssayMark({ assay: a }: { assay: Assay }) {
  const [open, setOpen] = useState(false);
  const [flip, setFlip] = useState(false);
  const root = useRef<HTMLSpanElement>(null);
  const id = useId();
  const ok = results[evidenceKey(a.evidence)]?.ok;

  useEffect(() => {
    if (!open) return;
    const away = (e: Event) => root.current && !root.current.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <span ref={root} className="relative">
      <button
        type="button"
        className="assay"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => {
          // Open towards whichever side has room.
          const r = root.current?.getBoundingClientRect();
          setFlip(!!r && r.left + 288 > window.innerWidth - 16);
          setOpen((o) => !o);
        }}
      >
        {a.phrase}
      </button>
      {open && (
        <span id={id} role="note" className={`assay-pop ${flip ? "right-0" : "left-0"}`}>
          <span className="flex items-center justify-between gap-3 border-b border-seam px-2.5 py-1.5 text-[0.5625rem] tracking-[0.12em] text-shale">
            <span>ASSAY &middot; {a.project.slug.replaceAll("-", "_")}</span>
            <span className={ok ? "text-signal" : "text-reject"}>{ok ? `VERIFIED ${report.checkedAt}` : "NOT VERIFIED"}</span>
          </span>
          <span className="block px-2.5 pt-2 text-[0.75rem] leading-[1.45] text-quartz">{a.evidence.claim}</span>
          <a href={evidenceUrl(a.evidence)} target="_blank" rel="noopener" className="block break-all px-2.5 pb-2 pt-1 text-[0.6875rem] text-signal underline-offset-4 hover:underline">
            {a.evidence.path}
            {a.evidence.line ? `:${a.evidence.line}` : ""} @ {a.evidence.sha.slice(0, 7)}
          </a>
          <Link href={`/evidence/#${a.project.slug}`} className="block border-t border-seam px-2.5 py-1.5 text-[0.5625rem] tracking-[0.12em] text-shale hover:text-signal">
            ALL CLAIMS FOR {a.project.name.toUpperCase()} &rarr;
          </Link>
        </span>
      )}
    </span>
  );
}

/** Prose with every backed figure turned into an assay mark. */
export function Assayed({ text }: { text: string }) {
  return (
    <>
      {text.split(pattern).map((part, i) => {
        const a = byPhrase.get(part);
        return a ? <AssayMark key={i} assay={a} /> : part;
      })}
    </>
  );
}
