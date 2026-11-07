import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects, getProject, domainLabel } from "@/content/projects";
import { shareImage, siteUrl } from "@/content/site";
import { ProjectDetail } from "@/components/ProjectDetail";
import { FilterDemo } from "@/components/FilterDemo";
import { Hallmark } from "@/components/Hallmark";
import { Panel } from "@/components/Panel";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = getProject((await params).slug);
  return p
    ? {
        title: p.name,
        description: p.gold,
        openGraph: { title: p.name, description: p.gold, type: "article", url: `${siteUrl}/projects/${p.slug}/`, images: [shareImage] },
      }
    : {};
}

// A project page shows every depth at once. Full case studies will grow here.
export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();

  const i = projects.indexOf(p);
  const next = projects.slice(i + 1).find((x) => x.shelf === p.shelf) ?? projects.find((x) => x.shelf === p.shelf && x !== p);

  return (
    <article className="page">
      <div className="page-col page-side">
        <Panel name={`input · ${p.slug.replaceAll("-", "_")}_txt`} tag="TXT" portId="project" out="right">
          <header className="space-y-3 px-3.5 pb-4 pt-3">
            <Link href={`/projects/#${p.slug}`} className="tap t-data text-[0.625rem] tracking-[0.1em] text-shale hover:text-signal">
              &larr; ALL PROJECTS
            </Link>
            <h1 className="t-h1">{p.name}</h1>
            <p className="font-[family-name:var(--font-code)] text-[0.8125rem] text-signal">{p.domains.map((d) => domainLabel[d]).join(" and ")}</p>
            <Hallmark project={p} />
          </header>
        </Panel>
        {next && (
          <nav aria-label="Next project">
            <Panel name="next_op" tag="SYS">
              <Link href={`/projects/${next.slug}/`} className="tap block px-3.5 py-2.5 font-[family-name:var(--font-mono)] text-[0.8125rem] text-quartz hover:text-signal">
                <span aria-hidden className="text-signal">&#9656; </span>
                {next.slug.replaceAll("-", "_")}
              </Link>
            </Panel>
          </nav>
        )}
      </div>
      <div className="page-col">
        <Panel name={`${p.slug.replaceAll("-", "_")}_detail`} tag="TXT" portId="pdetail" in="left" out="right">
          <div className="p-3.5">
            <ProjectDetail project={p} depth="bronze" showGold level={2} />
          </div>
        </Panel>
        {p.slug === "gatehouse" && <FilterDemo />}
      </div>
    </article>
  );
}
