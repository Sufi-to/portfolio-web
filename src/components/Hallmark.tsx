import type { Project } from "@/content/types";
import { statusLabel } from "@/content/projects";

/**
 * A row of stamped marks, like the hallmarks on assayed metal: what the
 * project is, when, and how much of it is linked to code. Every mark is
 * derived from the content, so nothing here can drift from the claims.
 * Bronze is the evidence depth, so only the evidence mark carries it.
 */
export function Hallmark({ project: p, className = "" }: { project: Project; className?: string }) {
  const claims = p.evidence?.length ?? 0;
  const shas = new Set(p.evidence?.map((e) => e.sha.slice(0, 7)));
  const marks = [
    { text: statusLabel[p.status], tone: "text-quartz/85 border-shale/40" },
    { text: String(p.year), tone: "text-quartz/85 border-shale/40" },
    claims > 0 && { text: `${claims} claims linked to code`, tone: "text-bronze border-bronze/50" },
    shas.size === 1 && { text: [...shas][0], tone: "t-data text-shale border-shale/30", title: "Commit every claim is pinned to" },
  ].filter(Boolean) as { text: string; tone: string; title?: string }[];

  return (
    <ul aria-label="Project facts" className={`flex flex-wrap gap-1.5 ${className}`}>
      {marks.map((m) => (
        <li key={m.text} title={m.title} className={`hallmark rounded-[3px] border px-1.5 py-[1px] t-micro ${m.tone}`}>
          {m.text}
        </li>
      ))}
    </ul>
  );
}
