"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { Diagram, DiagramNode, DiagramScenario } from "@/content/types";
import { keepStill } from "@/lib/motion";

const CELL_W = 184;
const CELL_H = 116;
const NODE_W = 150;
const NODE_H = 58;
const PAD = 16;
const HOP_MS = 430;

const nodeBox = (n: DiagramNode) => {
  const x = PAD + n.col * CELL_W + (CELL_W - NODE_W) / 2;
  const y = PAD + n.row * CELL_H + (CELL_H - NODE_H) / 2;
  return { x, y, cx: x + NODE_W / 2, cy: y + NODE_H / 2 };
};

/** Path between two nodes, leaving and entering on the facing edges. */
function edgePath(a: DiagramNode, b: DiagramNode): string {
  const A = nodeBox(a);
  const B = nodeBox(b);
  if (a.row === b.row && Math.abs(a.col - b.col) === 1) {
    const dir = Math.sign(b.col - a.col);
    const x1 = A.cx + (dir * NODE_W) / 2;
    const x2 = B.cx - (dir * NODE_W) / 2;
    return `M${x1} ${A.cy} L${x2} ${B.cy}`;
  }
  if (a.row === b.row) {
    // Same row, not neighbours: loop underneath the boxes in between.
    const dist = Math.abs(a.col - b.col);
    const yb = A.y + NODE_H;
    const dip = yb + 14 + dist * 9;
    const x1 = A.cx + Math.sign(b.col - a.col) * 24;
    const x2 = B.cx - Math.sign(b.col - a.col) * 24;
    return `M${x1} ${yb} C${x1} ${dip}, ${x2} ${dip}, ${x2} ${yb}`;
  }
  // Different rows: leave from the bottom (or top) and S-curve across.
  const down = b.row > a.row;
  const y1 = down ? A.y + NODE_H : A.y;
  const y2 = down ? B.y : B.y + NODE_H;
  const mid = (y1 + y2) / 2;
  return `M${A.cx} ${y1} C${A.cx} ${mid}, ${B.cx} ${mid}, ${B.cx} ${y2}`;
}

const kindStroke: Record<NonNullable<DiagramNode["kind"]> | "service", string> = {
  external: "var(--shale)",
  store: "var(--stratum-web)",
  guard: "var(--silver)",
  model: "var(--gold)",
  service: "var(--seam)",
};

const KIND_LABEL: Record<NonNullable<DiagramNode["kind"]> | "service", string> = {
  external: "outside the system",
  store: "data store",
  guard: "check",
  model: "model",
  service: "service",
};

interface Props {
  diagram: Diagram;
  title: string;
  /** Run the first scenario once the trace scrolls into view. */
  autoplay?: boolean;
  /** Sit inside a panel: no frame of its own, and a log that doesn't change height. */
  bare?: boolean;
  /** Draw at this many rows, so swapping diagrams doesn't move the page. */
  fitRows?: number;
}

/**
 * An architecture diagram you can send a request through. Pick a scenario,
 * and a packet travels the real path while a log lists each hop.
 */
export function SystemTrace({ diagram, title, autoplay = false, bare = false, fitRows }: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const nodes = useMemo(() => new Map(diagram.nodes.map((n) => [n.id, n])), [diagram]);
  const [scenario, setScenario] = useState<DiagramScenario>(diagram.scenarios[0]);
  const [hop, setHop] = useState(-1); // index into scenario.path reached so far; -1 = idle
  const [running, setRunning] = useState(false);
  const [asked, setAsked] = useState(false); // Only a request the visitor sent is read out.
  const root = useRef<HTMLDivElement>(null);
  const packet = useRef<SVGCircleElement>(null);
  const pathRefs = useRef<Map<string, SVGPathElement>>(new Map());
  const raf = useRef<number | null>(null);
  const cancelled = useRef(false);

  // Inside a panel the diagram is drawn smaller, so its text is set larger to stay readable.
  const type = bare ? 1.25 : 1;
  const width = diagram.cols * CELL_W + PAD * 2;
  const height = Math.max(diagram.rows, fitRows ?? 0) * CELL_H + PAD * 2 + 34;

  const stop = () => {
    cancelled.current = true;
    if (raf.current) cancelAnimationFrame(raf.current);
  };
  useEffect(() => stop, []);

  const play = useCallback(
    (s: DiagramScenario) => {
      stop();
      cancelled.current = false;
      setScenario(s);
      // Phones get the steps as a list rather than a diagram too small to read.
      if (keepStill() || window.matchMedia("(max-width: 639px)").matches) {
        setHop(s.path.length - 1);
        setRunning(false);
        return;
      }
      setRunning(true);
      setHop(0);
      let i = 0;
      const step = () => {
        if (cancelled.current) return;
        if (i >= s.path.length - 1) {
          setRunning(false);
          if (packet.current) packet.current.style.opacity = "0";
          return;
        }
        const el = pathRefs.current.get(`${s.path[i]}>${s.path[i + 1]}`);
        if (!el || !packet.current) {
          i += 1;
          setHop(i);
          step();
          return;
        }
        const len = el.getTotalLength();
        const t0 = performance.now();
        packet.current.style.opacity = "1";
        const frame = (now: number) => {
          if (cancelled.current) return;
          const t = Math.min(1, (now - t0) / HOP_MS);
          const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
          const p = el.getPointAtLength(e * len);
          packet.current?.setAttribute("cx", String(p.x));
          packet.current?.setAttribute("cy", String(p.y));
          if (t < 1) raf.current = requestAnimationFrame(frame);
          else {
            i += 1;
            setHop(i);
            step();
          }
        };
        raf.current = requestAnimationFrame(frame);
      };
      // Place the packet on the first node, then go.
      const first = nodes.get(s.path[0]);
      if (first && packet.current) {
        const b = nodeBox(first);
        packet.current.setAttribute("cx", String(b.cx));
        packet.current.setAttribute("cy", String(b.cy));
      }
      raf.current = requestAnimationFrame(() => step());
    },
    [nodes],
  );

  useEffect(() => {
    if (!autoplay || !root.current) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        play(diagram.scenarios[0]);
      },
      { threshold: 0.35 },
    );
    io.observe(root.current);
    return () => io.disconnect();
  }, [autoplay, diagram, play]);

  const visited = new Set(hop >= 0 ? scenario.path.slice(0, hop + 1) : []);
  const activeEdges = new Set<string>();
  if (hop >= 0) for (let i = 0; i < Math.min(hop, scenario.path.length - 1); i++) activeEdges.add(`${scenario.path[i]}>${scenario.path[i + 1]}`);
  const finished = hop >= scenario.path.length - 1 && !running;
  const rejected = finished && scenario.stopsAt;

  return (
    <div ref={root} className={bare ? "flex flex-1 flex-col" : "rounded-lg border border-seam bg-slate"}>
      <div className={`flex flex-wrap items-center gap-2 border-b border-seam px-3 py-2.5 sm:px-4 ${bare ? "lg:min-h-[5.25rem]" : ""}`}>
        <span className="mr-1 t-micro text-shale">Send a request:</span>
        {diagram.scenarios.map((s) => {
          const on = s.id === scenario.id && hop >= 0;
          return (
            <button
              key={s.id}
              onClick={() => {
                setAsked(true);
                play(s);
              }}
              aria-pressed={on}
              className={`tap rounded-full border px-3 py-1 t-micro transition-colors ${
                on ? "border-trace/70 bg-trace/10 text-quartz" : "border-edge text-quartz/85 hover:border-shale"
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      <div className="hidden overflow-x-auto overscroll-x-contain sm:block">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="block h-auto w-full min-w-[640px]"
          role="img"
          aria-label={`${title} architecture: ${diagram.nodes.map((n) => n.label).join(", ")}`}
        >
          <defs>
            <marker id={`arrow-${uid}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0 0L10 5L0 10z" fill="var(--seam)" />
            </marker>
            <marker id={`arrow-on-${uid}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0 0L10 5L0 10z" fill="var(--trace)" />
            </marker>
          </defs>

          {diagram.edges.map(([a, b]) => {
            const na = nodes.get(a);
            const nb = nodes.get(b);
            if (!na || !nb) return null;
            const key = `${a}>${b}`;
            const on = activeEdges.has(key);
            return (
              <path
                key={key}
                ref={(el) => {
                  if (el) pathRefs.current.set(key, el);
                }}
                d={edgePath(na, nb)}
                fill="none"
                stroke={on ? "var(--trace)" : "var(--seam)"}
                strokeWidth={on ? 1.75 : 1.25}
                markerEnd={`url(#${on ? "arrow-on-" : "arrow-"}${uid})`}
                style={{ transition: "stroke 200ms" }}
              />
            );
          })}

          {diagram.nodes.map((n) => {
            const b = nodeBox(n);
            const isOn = visited.has(n.id);
            const isStop = rejected && scenario.stopsAt === n.id;
            const isEnd = finished && !scenario.stopsAt && scenario.path.at(-1) === n.id;
            const stroke = isStop ? "var(--reject)" : isOn ? "var(--trace)" : kindStroke[n.kind ?? "service"];
            return (
              <g key={n.id}>
                <rect
                  x={b.x}
                  y={b.y}
                  width={NODE_W}
                  height={NODE_H}
                  rx={n.kind === "store" ? 14 : 7}
                  fill={isStop ? "color-mix(in srgb, var(--reject) 14%, var(--slab))" : isOn ? "color-mix(in srgb, var(--trace) 10%, var(--slab))" : "var(--slab)"}
                  stroke={stroke}
                  strokeWidth={isOn || isStop ? 1.75 : 1.1}
                  strokeDasharray={n.kind === "external" ? "4 3" : undefined}
                  style={{ transition: "fill 220ms, stroke 220ms" }}
                />
                <text x={b.cx} y={b.cy - 4} textAnchor="middle" fontSize={14 * type} fontWeight={600} fill="var(--quartz)" style={{ fontStretch: "104%" }}>
                  {n.label}
                </text>
                {n.sub && (
                  <text x={b.cx} y={b.cy + 16} textAnchor="middle" fontSize={11.5 * type} fill="var(--shale)">
                    {n.sub}
                  </text>
                )}
                {isEnd && <circle cx={b.x + NODE_W - 8} cy={b.y + 8} r={3.5} fill="var(--trace)" />}
              </g>
            );
          })}

          <circle ref={packet} r={5} fill="var(--trace)" opacity={0} style={{ filter: "drop-shadow(0 0 6px var(--trace))" }} />

          {/* Legend */}
          <g transform={`translate(${PAD + 6}, ${height - 16})`} fontSize={11 * type} fill="var(--shale)">
            {(["external", "guard", "model", "store"] as const).map((k, i) => (
              <g key={k} transform={`translate(${i * 150}, 0)`}>
                <rect x={0} y={-9} width={14} height={10} rx={k === "store" ? 5 : 2} fill="none" stroke={kindStroke[k]} strokeDasharray={k === "external" ? "3 2" : undefined} />
                <text x={20} y={0}>{KIND_LABEL[k]}</text>
              </g>
            ))}
          </g>
        </svg>
      </div>

      {/* The log: a plain-text account of the same trace, readable without the picture. */}
      <p className="sr-only" aria-live="polite">
        {asked && finished ? scenario.outcome : ""}
      </p>
      <div className={`border-t border-seam px-4 py-3 t-data text-shale ${bare ? "min-h-[21rem] flex-1 sm:min-h-[15.5rem]" : ""}`}>
        {hop < 0 ? (
          <p>Choose a request above to trace it through the system.</p>
        ) : (
          <ol className="space-y-0.5">
            {scenario.sample && (
              <li className="text-quartz/80">
                <span className="text-trace">$</span> {scenario.sample}
              </li>
            )}
            {scenario.path.slice(0, hop + 1).map((id, i) => {
              const n = nodes.get(id)!;
              const stopHere = rejected && scenario.stopsAt === id;
              return (
                <li key={`${id}-${i}`} className={stopHere ? "text-reject" : ""}>
                  <span className="text-shale/90">{String(i + 1).padStart(2, "0")}</span> {n.label}
                  {n.sub ? <span className="text-shale/90">: {n.sub}</span> : null}
                  {stopHere ? " rejected" : ""}
                </li>
              );
            })}
            {finished && <li className={`pt-1 font-sans text-small ${rejected ? "text-reject" : "text-quartz"}`}>{scenario.outcome}</li>}
          </ol>
        )}
      </div>
    </div>
  );
}
