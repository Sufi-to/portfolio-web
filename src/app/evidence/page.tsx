import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/PageIntro";
import { Panel } from "@/components/Panel";
import { evidenceKey, evidenceUrl, featured } from "@/content/projects";
import report from "@/data/evidence-report.json";

export const metadata: Metadata = {
  title: "Evidence",
  description: "Every checkable claim on this site, re-verified against the commit it cites.",
};

const results: Record<string, { ok: boolean; error?: string }> = report.results;

/** The site's own ledger: what it claims, where that is, and whether it still holds. */
export default function EvidencePage() {
  return (
    <>
      <div className="page">
      <div className="page-col page-side">
      <PageIntro name="evidence_txt" title="Evidence" lead={`${report.passed} of ${report.total} claims verified on ${report.checkedAt}.`}>
        <p>A script fetches each file at the commit it cites and confirms the claim is still there. If one fails, the site doesn&rsquo;t deploy.</p>
      </PageIntro>
      <Panel name="what_this_proves" tag="TXT">
        <div className="space-y-2 p-3.5 t-small text-quartz/85">
          <p>A check confirms that the cited code says what the claim says, at that commit. It doesn&rsquo;t judge whether the code is good.</p>
          <p>Claims exist for the four case studies. The smaller projects on this site have no checked claims yet.</p>
          <p>
            The check runs on every deploy and once a week:{" "}
            <a href="https://github.com/Sufi-to/portfolio-web/blob/main/scripts/verify-evidence.mjs" target="_blank" rel="noopener" className="underline decoration-seam underline-offset-4 hover:decoration-trace">
              scripts/verify-evidence.mjs
            </a>
            .
          </p>
        </div>
      </Panel>
      </div>
      <div className="page-col">
        {featured.map((p) => (
          <section key={p.slug} id={p.slug} aria-labelledby={`ledger-${p.slug}`} className="scroll-mt-16">
            <h2 id={`ledger-${p.slug}`} className="text-[0.9375rem] font-bold">
              <Link href={`/projects/${p.slug}/`} className="hover:text-metal">
                {p.name}
              </Link>
            </h2>
            <Panel name={`${p.slug.replaceAll("-", "_")}_claims`} meta={`${p.evidence?.length ?? 0} rows`} tag="DATA" className="mt-2">
              <ul className="divide-y divide-seam/70">
                {p.evidence?.map((e) => {
                  const r = results[evidenceKey(e)];
                  return (
                    <li key={evidenceKey(e)}>
                      <a
                        href={evidenceUrl(e)}
                        target="_blank"
                        rel="noopener"
                        className="group grid grid-cols-[minmax(0,1fr)] gap-1 px-3.5 py-2 transition-colors hover:bg-slab-2 sm:grid-cols-[4.5rem_minmax(0,1fr)_auto] sm:gap-4"
                      >
                        <span className={`t-data text-[0.625rem] ${r?.ok ? "text-signal" : "text-reject"}`}>{r?.ok ? "verified" : "not verified"}</span>
                        <span className="text-[0.8125rem] leading-[1.45]">{e.claim}</span>
                        <span className="t-data text-[0.625rem] text-shale [overflow-wrap:anywhere] group-hover:text-signal">
                          {e.path}
                          {e.line ? `:${e.line}` : ""} @ {e.sha.slice(0, 7)}
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </Panel>
          </section>
        ))}

      </div>
      </div>
    </>
  );
}
