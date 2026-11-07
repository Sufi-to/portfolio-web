import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects, getProject, domainLabel } from "@/content/projects";
import { ProjectDetail } from "@/components/ProjectDetail";
import { Hallmark } from "@/components/Hallmark";
import { Panel } from "@/components/Panel";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = getProject((await params).slug);
  return p ? { title: p.name, description: p.gold } : {};
}

// A project page shows every depth at once. Full case studies will grow here.
export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();

  const i = projects.indexOf(p);
  const next = projects.slice(i + 1).find((x) => x.shelf === p.shelf) ?? projects.find((x) => x.shelf === p.shelf && x !== p);

  return (
    <article className="mx-auto max-w-[76rem] px-5 pt-10 sm:px-8 sm:pt-14">
      <Link href={`/projects/#${p.slug}`} className="t-small text-shale underline decoration-seam underline-offset-4 hover:text-quartz">
        All projects
      </Link>
      <h1 className="mt-6 t-display [font-stretch:112%]">{p.name}</h1>
      <p className="mt-3 t-small text-shale">
        {p.domains.map((d) => domainLabel[d]).join(" and ")}
      </p>
      <Hallmark project={p} className="mt-4" />
      <Panel name={`${p.slug.replaceAll("-", "_")}_detail`} meta="all three depths" tag="TXT" className="mt-10">
        <div className="p-5 sm:p-6">
          <ProjectDetail project={p} depth="bronze" showGold level={2} />
        </div>
      </Panel>
      {next && (
        <nav aria-label="Next project" className="mt-20 border-t border-seam pt-8">
          <Link href={`/projects/${next.slug}/`} className="group block">
            <span className="t-micro text-shale">Next</span>
            <span className="mt-1 block t-h2 transition-[font-stretch] duration-300 group-hover:[font-stretch:120%]">{next.name}</span>
          </Link>
        </nav>
      )}
    </article>
  );
}
