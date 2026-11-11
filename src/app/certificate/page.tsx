import { createHash } from "node:crypto";
import type { Metadata } from "next";
import Link from "next/link";
import { PrintButton } from "@/components/PrintButton";
import { Seal } from "@/components/Seal";
import { evidenceKey, featured, statusLabel } from "@/content/projects";
import { profile } from "@/content/profile";
import { siteUrl } from "@/content/site";
import bronze from "@/data/bronze.json";
import report from "@/data/evidence-report.json";

export const metadata: Metadata = {
  title: "Assay certificate",
  description: "A one-page, printable summary of this portfolio, generated only from verified data.",
};

const results: Record<string, { ok: boolean }> = report.results;

// The certificate's number: a hash of every claim, its pinned commit and its
// result. Change any of them and the number and the seal change with it.
const fingerprint = createHash("sha256")
  .update(JSON.stringify(featured.map((p) => (p.evidence ?? []).map((e) => [evidenceKey(e), e.sha, results[evidenceKey(e)]?.ok]))))
  .digest("hex");

const date = new Date(`${report.checkedAt}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** A refinery issues a certificate for each batch it assays. This is the portfolio's. */
export default function CertificatePage() {
  return (
    <div className="mx-auto max-w-[54rem] px-5 py-8 print:max-w-none print:p-0">
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="t-data text-[0.6875rem] text-shale">Generated from the evidence ledger. Not a CV: it lists only what has been checked.</p>
        <PrintButton />
      </div>

      <article className="sheet">
        <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 border-b-2 border-current pb-4">
          <div>
            <p className="sheet-label">Assay certificate</p>
            <h1 className="mt-1 text-[clamp(1.375rem,6vw,2rem)] font-black uppercase leading-none tracking-[-0.01em]">{profile.name}</h1>
            <p className="mt-2 text-[0.9375rem]">
              {profile.role} &middot; {profile.location}
              {profile.available && " · open to work"}
            </p>
          </div>
          <dl className="shrink-0 text-right">
            <dt className="sheet-label">No.</dt>
            <dd className="sheet-mono">{fingerprint.slice(0, 12)}</dd>
            <dt className="sheet-label mt-2">Assayed</dt>
            <dd className="sheet-mono">{date}</dd>
          </dl>
        </header>

        <p className="mt-4 text-[0.9375rem] leading-[1.55]">
          This certifies that <strong>{report.passed} of {report.total} claims</strong> made about the work below were checked against the source code
          they cite, each at a pinned commit, on {date}. A claim passes only if the cited file still says what the claim says.
        </p>

        <div className="overflow-x-auto print:overflow-visible">
        <table className="mt-5 w-full min-w-[34rem] border-collapse text-left">
          <thead>
            <tr className="sheet-label border-b border-current">
              <th className="py-1.5 pr-3 font-normal">Sample</th>
              <th className="py-1.5 pr-3 font-normal">Finding</th>
              <th className="py-1.5 pr-3 font-normal">Claims</th>
              <th className="py-1.5 font-normal">Commit</th>
            </tr>
          </thead>
          <tbody>
            {featured.map((p) => {
              const claims = p.evidence ?? [];
              const passed = claims.filter((e) => results[evidenceKey(e)]?.ok).length;
              return (
                <tr key={p.slug} className="border-b border-current/25 align-top">
                  <td className="py-2 pr-3">
                    <Link href={`/projects/${p.slug}/`} className="font-bold">
                      {p.name}
                    </Link>
                    <span className="sheet-mono block opacity-70">
                      {statusLabel[p.status].toLowerCase()}, {p.year}
                    </span>
                  </td>
                  <td className="py-2 pr-3 text-[0.8125rem] leading-[1.45]">{p.gold}</td>
                  <td className="sheet-mono whitespace-nowrap py-2 pr-3">
                    {passed}/{claims.length}
                  </td>
                  <td className="sheet-mono py-2">{[...new Set(claims.map((e) => e.sha.slice(0, 7)))].join(", ")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] print:grid-cols-[minmax(0,1fr)_auto]">
          <div className="space-y-3">
            <div>
              <p className="sheet-label">Composition, by code across {bronze.github.ownPublicRepos} own public repositories</p>
              <p className="sheet-mono mt-1">
                {bronze.github.languages
                  .filter((l) => l.share >= 1)
                  .map((l) => `${l.name} ${l.share}%`)
                  .join(" · ")}
              </p>
            </div>
            <div>
              <p className="sheet-label">History</p>
              <p className="sheet-mono mt-1">
                {bronze.totalCommits.toLocaleString("en-US")} commits since {bronze.months[0].month}, counted from git history
              </p>
            </div>
            <div>
              <p className="sheet-label">Not assayed</p>
              <p className="mt-1 text-[0.8125rem] leading-[1.45]">
                Code quality, ResearchMatch&rsquo;s matching accuracy, and the smaller projects on the site. A pass means the cited code says what
                the claim says, nothing more.
              </p>
            </div>
            <div>
              <p className="sheet-label">Contact</p>
              <p className="sheet-mono mt-1">
                {profile.email} &middot; github.com/{profile.githubHandle}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1 self-end">
            <Seal fingerprint={fingerprint} label={`${report.passed}/${report.total}`} />
            <p className="sheet-label">Seal drawn from the fingerprint</p>
          </div>
        </div>

        <footer className="sheet-mono mt-5 border-t border-current pt-2 opacity-80">
          Check every claim yourself: {siteUrl.replace("https://", "")}/evidence/ &middot; sha256 {fingerprint.slice(0, 32)}
        </footer>
      </article>
    </div>
  );
}
