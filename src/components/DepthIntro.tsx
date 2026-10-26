"use client";

import { useDepth } from "./DepthProvider";
import { depthInfo } from "@/content/site";
import type { Depth } from "@/content/types";

const ORDER: Depth[] = ["gold", "silver", "bronze"];
const BAR: Record<Depth, string> = { gold: "bg-gold", silver: "bg-silver", bronze: "bg-bronze" };
const BODY: Record<Depth, string> = {
  gold: "What each project does and what it proved, in one sentence.",
  silver: "The problem, the build and the decisions, with an architecture you can send requests through.",
  bronze: "The files, lines and commits behind each claim, linked to GitHub.",
};

/** Teaches the depth switch by being one: each column sets the level. */
export function DepthIntro() {
  const { depth, setDepth } = useDepth();
  return (
    <section aria-labelledby="depth-title" className="mx-auto mt-24 max-w-[76rem] px-5 sm:px-8">
      <h2 id="depth-title" className="t-h2 max-w-2xl text-balance">
        Read every project at the depth you have time for.
      </h2>
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {ORDER.map((d) => {
          const on = d === depth;
          return (
            <button
              key={d}
              onClick={() => setDepth(d)}
              aria-pressed={on}
              className={`group relative overflow-hidden rounded-lg border p-5 text-left transition-colors ${
                on ? "border-shale/50 bg-slab" : "border-seam hover:border-shale/40"
              }`}
            >
              <span aria-hidden className={`absolute inset-x-0 top-0 h-[3px] ${BAR[d]} transition-opacity ${on ? "opacity-100" : "opacity-30 group-hover:opacity-60"}`} />
              <span className="flex items-baseline justify-between">
                <span className="t-h3">{depthInfo[d].label}</span>
                <kbd className="t-data text-shale">{depthInfo[d].key}</kbd>
              </span>
              <span className="mt-2 block t-small text-quartz/80">{BODY[d]}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
