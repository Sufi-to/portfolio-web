import type { Project } from "@/content/types";
import { statusLabel } from "@/content/projects";

/**
 * A row of stamped marks, like the hallmarks on assayed metal: what the
 * project is, when, and how much of it is pinned to code. Every mark is
 * derived from the content, so nothing here can drift from the claims.
 */
export function Hallmark({ project: p, className = "" }: { project: Project; className?: string }) {
  const claims = p.evidence?.length ?? 0;
  const shas = new Set(p.evidence?.map((e) => e.sha.slice(0, 7)));
  const marks = [
    { text: statusLabel[p.status].toUpperCase(), tone: p.status === "shipped" ? "text-gold border-gold/50" : "text-quartz/80 border-shale/40" },
    { text: String(p.year), tone: "text-quartz/80 border-shale/40" },
    claims > 0 && { text: `${claims} PINNED`, tone: "text-bronze border-bronze/50", title: `${claims} claims linked to file and line` },
    shas.size === 1 && { text: `@${[...shas][0]}`, tone: "text-shale border-shale/30", title: "Commit every claim is pinned to" },
  ].filter(Boolean) as { text: string; tone: string; title?: string }[];

  return (
    <ul aria-label="Hallmarks" className={`flex flex-wrap gap-1.5 ${className}`}>
      {marks.map((m) => (
        <li
          key={m.text}
          title={m.title}
          className={`hallmark rounded-[3px] border px-1.5 py-[1px] t-data text-[0.6875rem] tracking-[0.08em] ${m.tone}`}
        >
          {m.text}
        </li>
      ))}
    </ul>
  );
}
