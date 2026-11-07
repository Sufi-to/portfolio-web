import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/PageIntro";
import { Panel } from "@/components/Panel";
import { projects, statusLabel } from "@/content/projects";

export const metadata: Metadata = {
  title: "Lab",
  description: "Smaller builds, bootcamp work and experiments, each labelled with what is real and what is not yet.",
};

export default function LabPage() {
  const lab = projects.filter((p) => p.shelf === "lab");
  return (
    <>
      <div className="page">
      <div className="page-col page-side">
      <PageIntro name="lab_txt" title="Lab">
        <p>Smaller builds and programme work. Each one says what it is: coursework, a prototype, or finished.</p>
      </PageIntro>
      </div>
      <Panel name="lab_index" meta={`${lab.length} builds`} tag="DATA" portId="lab" in="left" out="right">
      <ul>
        {lab.map((p, i) => (
          <li key={p.slug} className={`grid gap-1 p-3.5 md:grid-cols-[13rem_1fr_auto] md:gap-5 ${i > 0 ? "border-t border-seam/70" : ""}`}>
            <Link href={`/projects/${p.slug}/`} className="text-[0.9375rem] font-bold hover:text-metal">
              {p.name}
            </Link>
            <p className="t-small text-quartz/85">{p.gold}</p>
            <p className="t-data text-[0.625rem] text-shale md:text-right">
              {statusLabel[p.status]}, {p.year}
            </p>
          </li>
        ))}
      </ul>
      </Panel>
      </div>
    </>
  );
}
