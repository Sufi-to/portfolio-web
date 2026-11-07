"use client";

import Link from "next/link";
import { featured, domainLabel } from "@/content/projects";
import { useDepth } from "./DepthProvider";
import { ProjectDetail } from "./ProjectDetail";
import { Hallmark } from "./Hallmark";
import { CoreSample } from "./CoreSample";

/**
 * The four case studies on the home page. At gold they are a scan-in-30-
 * seconds list; at silver and bronze each one opens up in place.
 */
export function FeaturedWork() {
  const { depth } = useDepth();
  const deep = depth !== "gold";

  return (
    <section aria-labelledby="work-title" className="mx-auto mt-16 max-w-[76rem] px-5 sm:px-8">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h2 id="work-title" className="t-h2">
          Selected work
        </h2>
        <Link href="/projects/" className="tap t-small text-shale underline decoration-seam underline-offset-4 hover:text-quartz">
          All projects, with filters
        </Link>
      </div>

      <ol className="mt-6 border-t border-seam">
        {featured.map((p) => (
          <li key={p.slug} className="group border-b border-seam py-8">
            <div className="grid gap-x-10 gap-y-3 md:grid-cols-[minmax(14rem,18rem)_1fr] lg:grid-cols-[minmax(14rem,18rem)_1fr_auto]">
              <div>
                <h3 className="text-[1.625rem] leading-[1.15] font-[540] [font-stretch:114%]">
                  <Link href={`/projects/${p.slug}/`} className="tap hover:text-metal">
                    {p.name}
                  </Link>
                </h3>
                <p className="mt-2 t-micro text-shale">
                  {p.domains.map((d) => domainLabel[d]).join(" and ")}
                </p>
                <p className="t-micro text-shale">{p.role}</p>
                <Hallmark project={p} className="mt-3" />
              </div>
              <div>
                <p className="measure text-[1.1875rem] leading-[1.55]">{p.gold}</p>
                {!deep && (
                  <p className="mt-3 t-small text-shale">
                    {p.stack.slice(0, 6).join(", ")}
                  </p>
                )}
              </div>
              {p.diagram && (
                <Link
                  href={`/projects/${p.slug}/`}
                  tabIndex={-1}
                  aria-hidden
                  title={`Trace a request through ${p.name}`}
                  className="hidden self-start rounded-md border border-seam/70 bg-slab/40 p-2 transition-colors group-hover:border-trace/40 lg:block"
                >
                  <CoreSample diagram={p.diagram} />
                </Link>
              )}
            </div>
            {deep && (
              <div className="mt-8 md:pl-[calc(min(18rem,100%)+2.5rem)]">
                <ProjectDetail project={p} />
              </div>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
