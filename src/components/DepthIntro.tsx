"use client";

import { useDepth } from "./DepthProvider";
import { Panel } from "./Panel";
import { depthInfo } from "@/content/site";
import { featured } from "@/content/projects";
import type { Depth } from "@/content/types";

const ORDER: Depth[] = ["gold", "silver", "bronze"];
const BAR: Record<Depth, string> = { gold: "bg-gold", silver: "bg-silver", bronze: "bg-bronze" };

const sample = featured.find((p) => p.slug === "gatehouse")!;
const decision = sample.silver!.decisions[0];
const proof = sample.evidence![0];

/** Teaches the depth switch by being one: each column sets the level and shows one project at it. */
export function DepthIntro() {
  const { depth, setDepth } = useDepth();
  return (
    <section aria-labelledby="depth-title" className="mx-auto mt-16 max-w-[76rem] px-5 sm:px-8">
      <Panel name="depth_select" meta="gold, silver, bronze" tag="SYS" portId="depth" in="left" out="right">
      <div className="p-5 sm:p-6">
      <h2 id="depth-title" className="t-h2 max-w-2xl text-balance">
        Read every project at the depth you have time for.
      </h2>
      <p className="mt-3 text-quartz/80">Here is {sample.name} at all three. Pick one and the whole site follows.</p>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {ORDER.map((d) => {
          const on = d === depth;
          return (
            <button
              key={d}
              onClick={() => setDepth(d)}
              aria-pressed={on}
              className={`group relative flex flex-col overflow-hidden rounded-lg border p-5 text-left transition-colors ${
                on ? "border-shale/50 bg-slab-2" : "border-seam hover:border-shale/40"
              }`}
            >
              <span aria-hidden className={`absolute inset-x-0 top-0 h-[3px] ${BAR[d]} transition-opacity ${on ? "opacity-100" : "opacity-30 group-hover:opacity-60"}`} />
              <span className="flex items-baseline justify-between">
                <span className="t-h3">{depthInfo[d].label}</span>
                <kbd className="t-data text-shale">{depthInfo[d].key}</kbd>
              </span>
              <span className="t-small text-shale">{depthInfo[d].hint}</span>
              <span className="mt-4 block border-t border-seam pt-4 t-small text-quartz/90">
                {d === "gold" && sample.gold}
                {d === "silver" && (
                  <>
                    <span className="block font-[560] [font-stretch:104%]">{decision.title}</span>
                    {decision.body}
                  </>
                )}
                {d === "bronze" && (
                  <>
                    {proof.claim}
                    <span className="mt-2 block t-data text-shale [overflow-wrap:anywhere]">
                      {proof.path}:{proof.line} @ {proof.sha.slice(0, 7)}
                    </span>
                  </>
                )}
              </span>
            </button>
          );
        })}
      </div>
      </div>
      </Panel>
    </section>
  );
}
