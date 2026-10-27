import type { Diagram, DiagramNode } from "@/content/types";

const CW = 40;
const CH = 30;
const NW = 26;
const NH = 12;
const PAD = 6;

const center = (n: DiagramNode) => ({ x: PAD + n.col * CW + CW / 2, y: PAD + n.row * CH + CH / 2 });

function segment(a: DiagramNode, b: DiagramNode): string {
  const A = center(a);
  const B = center(b);
  if (a.row === b.row && Math.abs(a.col - b.col) > 1) {
    // Same row, not neighbours: dip under the boxes in between.
    const dip = A.y + NH / 2 + 6;
    return `M${A.x} ${A.y} C${A.x} ${dip + 4}, ${B.x} ${dip + 4}, ${B.x} ${B.y}`;
  }
  return `M${A.x} ${A.y} L${B.x} ${B.y}`;
}

/**
 * A thumbnail of a project's architecture, cut from the same diagram data as
 * the full SystemTrace. On hover of the surrounding `.group`, the first
 * scenario's path lights up, a preview of what the full trace does.
 */
export function CoreSample({ diagram }: { diagram: Diagram }) {
  const nodes = new Map(diagram.nodes.map((n) => [n.id, n]));
  const route = diagram.scenarios[0]?.path ?? [];
  const onRoute = new Set(route);
  const trace = route
    .slice(1)
    .map((id, i) => {
      const a = nodes.get(route[i]);
      const b = nodes.get(id);
      return a && b ? segment(a, b) : "";
    })
    .join(" ");
  const w = diagram.cols * CW + PAD * 2;
  const h = diagram.rows * CH + PAD * 2;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} aria-hidden className="core block max-w-full">
      {diagram.edges.map(([a, b]) => {
        const na = nodes.get(a);
        const nb = nodes.get(b);
        return na && nb ? <path key={`${a}>${b}`} d={segment(na, nb)} fill="none" stroke="var(--seam)" strokeWidth={1} /> : null;
      })}
      <path d={trace} pathLength={1} className="core-trace" fill="none" stroke="var(--trace)" strokeWidth={1.5} />
      {diagram.nodes.map((n) => {
        const c = center(n);
        return (
          <rect
            key={n.id}
            x={c.x - NW / 2}
            y={c.y - NH / 2}
            width={NW}
            height={NH}
            rx={n.kind === "store" ? 6 : 2}
            fill="var(--slab)"
            stroke={n.kind === "model" ? "var(--gold)" : n.kind === "guard" ? "var(--silver)" : "var(--shale)"}
            strokeOpacity={n.kind === "model" || n.kind === "guard" ? 0.8 : 0.45}
            strokeDasharray={n.kind === "external" ? "2 1.5" : undefined}
            className={onRoute.has(n.id) ? "core-on" : undefined}
          />
        );
      })}
    </svg>
  );
}
