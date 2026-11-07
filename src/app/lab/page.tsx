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
      <PageIntro title="Lab">
        Smaller builds and programme work. Each one says what it is: coursework, a prototype, or finished.
      </PageIntro>
      <div className="mx-auto mt-12 max-w-[76rem] px-5 sm:px-8">
      <Panel name="lab_index" meta={`${lab.length} builds`} tag="DATA">
      <ul>
        {lab.map((p, i) => (
          <li key={p.slug} className={`grid gap-2 p-5 md:grid-cols-[16rem_1fr_auto] md:gap-8 ${i > 0 ? "border-t border-seam/70" : ""}`}>
            <Link href={`/projects/${p.slug}/`} className="t-h3 hover:text-metal">
              {p.name}
            </Link>
            <p className="text-quartz/85">{p.gold}</p>
            <p className="t-micro text-shale md:text-right">
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
