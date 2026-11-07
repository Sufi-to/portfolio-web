"use client";

import { useSyncExternalStore } from "react";
import { depthInfo } from "@/content/site";
import type { Depth } from "@/content/types";
import { getOre, setOre, subscribeOre, type Noise, type Palette, type Pattern } from "@/lib/ore";
import { useDepth } from "./DepthProvider";
import { Panel } from "./Panel";

const place = (x: string, y: string, w: string) => ({ "--x": x, "--y": y, "--w": w }) as React.CSSProperties;
const useOre = () => useSyncExternalStore(subscribeOre, getOre, getOre);

const NOISE: Noise[] = ["RIDGE", "WAVE"];
const PATTERN: Pattern[] = ["BAYER2", "BAYER4"];
const PALETTE: Palette[] = ["GRN", "AMB", "ICE"];
const next = <T,>(list: T[], value: T) => list[(list.indexOf(value) + 1) % list.length];

function Range({ label, value, min, max, step, onChange, shown }: { label: string; value: number; min: number; max: number; step: number; onChange: (n: number) => void; shown: string }) {
  return (
    <label className="op-row">
      <span className="w-9">{label}</span>
      <input type="range" className="op-range" value={value} min={min} max={max} step={step} onChange={(e) => onChange(Number(e.target.value))} />
      <b>{shown}</b>
    </label>
  );
}

/** Four small operators that really drive the ground behind the page. */
export function OreOps() {
  const ore = useOre();
  const ground = "op op-sys op-ground";
  return (
    <>
      <Panel name="ore_01 · noise" tag="SYS" portId="ore1" out="right" className={ground} style={place("10.8%", "22.75rem", "11.25rem")}>
        <div className="space-y-2 p-2.5">
          <button className="chip" onClick={() => setOre({ noise: next(NOISE, ore.noise) })}>
            TYPE &#9656; {ore.noise}
          </button>
          <Range label="SPEED" value={ore.speed} min={0} max={3} step={0.01} shown={ore.speed.toFixed(2)} onChange={(speed) => setOre({ speed })} />
        </div>
      </Panel>
      <Panel name="ore_02 · trail" tag="SYS" portId="ore2" in="left" out="right" className={ground} style={place("27%", "22rem", "10.75rem")}>
        <div className="space-y-2 p-2.5">
          <Range label="FDBK" value={ore.trail} min={0} max={0.95} step={0.01} shown={ore.trail.toFixed(2)} onChange={(trail) => setOre({ trail })} />
          <p className="op-row">CURSOR PAINTS ORE &#9626;</p>
        </div>
      </Panel>
      <Panel name="ore_03 · dither" tag="SYS" portId="ore3" in="left" out="right" className={ground} style={place("max(31rem, 34.3%)", "10.25rem", "11.25rem")}>
        <div className="space-y-2 p-2.5">
          <button className="chip" onClick={() => setOre({ pattern: next(PATTERN, ore.pattern) })}>
            TYPE &#9656; {ore.pattern}
          </button>
          <Range label="DENS" value={ore.density} min={0} max={1} step={0.01} shown={ore.density.toFixed(2)} onChange={(density) => setOre({ density })} />
          <Range label="SCALE" value={ore.scale} min={2} max={6} step={1} shown={String(ore.scale)} onChange={(scale) => setOre({ scale })} />
        </div>
      </Panel>
      <Panel name="ore_04 · out" tag="SYS" portId="ore4" in="left" out="right" className={ground} style={place("43.3%", "2.125rem", "9.75rem")}>
        <div className="space-y-2 p-2.5">
          <button className="chip" onClick={() => setOre({ palette: next(PALETTE, ore.palette) })}>
            PAL &#9656; {ore.palette}
          </button>
          <p className="op-row">RENDERS THE PAGE &#9626;</p>
        </div>
      </Panel>
    </>
  );
}

const ORDER: Depth[] = ["gold", "silver", "bronze"];
const DOT: Record<Depth, string> = { gold: "bg-gold", silver: "bg-silver", bronze: "bg-bronze" };

/** How much the site says about each project. */
export function DepthOp() {
  const { depth, setDepth } = useDepth();
  return (
    <Panel name="depth_select" meta="detail level" tag="SYS" portId="depth" in="left" out="right" className="op op-sys order-4" style={place("max(31rem, 37%)", "33rem", "16rem")}>
      <div role="group" aria-label="Detail level" className="flex items-center gap-1 p-2.5">
        {ORDER.map((d, i) => (
          <span key={d} className="contents">
            {i > 0 && <span aria-hidden className="text-[0.5rem] text-shale">&#9654;</span>}
            <button className="chip tap flex-1 justify-center" data-quiet={d !== depth} aria-pressed={d === depth} title={`${depthInfo[d].hint} (${depthInfo[d].key})`} onClick={() => setDepth(d)}>
              <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${DOT[d]}`} />
              {depthInfo[d].label.toUpperCase()}
            </button>
          </span>
        ))}
      </div>
    </Panel>
  );
}
