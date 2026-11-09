import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { Panel } from "@/components/Panel";
import { CommitStrata } from "@/components/CommitStrata";
import { SlagPanel } from "@/components/SlagPanel";
import { profile } from "@/content/profile";
import bronze from "@/data/bronze.json";

export const metadata: Metadata = {
  title: "About",
  description: "Software engineer in Abu Dhabi working on AI and data systems, from C foundations to Databricks pipelines.",
};

// Only facts visible on Tomas's GitHub are stated here, dated by when each
// repository was active. Languages and counts come from scripts/ingest.mjs.
const path = [
  {
    when: "2023",
    what: "Low-level programming in C",
    detail: "ALX software engineering curriculum: a Unix shell, sorting algorithms and systems scripting.",
  },
  {
    when: "2024",
    what: "Python, web and backend",
    detail: "An AirBnB clone with a Flask app and REST API, a backend track in MySQL, Redis, authentication and Node, and Enmar and TooB, built with Neftalem Mussie.",
  },
  {
    when: "2025",
    what: "Data, vision and C again",
    detail: "MIT Emerging Talent data science project, libft and ft_printf at 42 Abu Dhabi, and Assay: YOLOv8 and EXIF checks for credit signals.",
  },
  {
    when: "2026",
    what: "AI and data engineering",
    detail: "FinRadar, the Gatehouse LLM gateway, a Databricks bootcamp, ResearchMatch for Zayed University and the HN Hiring Observatory.",
  },
];

const gh = bronze.github;

export default function AboutPage() {
  return (
    <>
      <div className="page">
      <div className="page-col page-side">
      <PageIntro name="bio_txt" title="About" lead="Raw evidence in, checkable claims out.">
        <p>
          I&rsquo;m {profile.shortName}, a software engineer in {profile.location} who builds AI and data systems. What I care about most is that a
          system can show its work: the query behind a chart, the source behind a claim, the reason a request was refused.
        </p>
      </PageIntro>
      </div>
      <div className="page-col">

      <section aria-labelledby="path-title">
        <h2 id="path-title" className="sr-only">
          How I got here
        </h2>
        <Panel name="career_log" meta="2023 to 2026" tag="DATA" portId="career" in="left" out="right">
        <ol>
          {path.map((p, i) => (
            <li key={p.when} className={`grid gap-1 p-3.5 md:grid-cols-[3.5rem_13rem_1fr] md:gap-5 ${i > 0 ? "border-t border-seam/70" : ""}`}>
              <span className="t-data text-shale">{p.when}</span>
              <span className="text-[0.9375rem] font-bold">{p.what}</span>
              <span className="t-small text-quartz/85">{p.detail}</span>
            </li>
          ))}
        </ol>
        </Panel>
      </section>

      <Panel name="github_data" meta={`ingested ${bronze.generatedAt}`} tag="DATA" portId="github" in="left" out="right">
        <div className="grid gap-5 p-3.5 md:grid-cols-[minmax(0,1fr)_14rem]">
          <div>
            <h2 className="t-data text-[0.625rem] uppercase tracking-[0.1em] text-signal">Languages by code, across my own repositories</h2>
            <ul className="mt-3 space-y-1.5">
              {gh.languages.filter((l) => l.share >= 1).map((l) => (
                <li key={l.name} className="grid grid-cols-[6rem_minmax(0,1fr)_3rem] items-center gap-3 t-data text-[0.75rem]">
                  <span>{l.name}</span>
                  <span aria-hidden className="h-1.5 bg-seam">
                    <span className="block h-full bg-signal" style={{ width: `${l.share}%` }} />
                  </span>
                  <span className="text-right text-shale">{l.share}%</span>
                </li>
              ))}
            </ul>
          </div>
          <dl className="grid grid-cols-2 content-start gap-x-4 gap-y-3 t-data text-[0.75rem]">
            <div>
              <dt className="text-[0.625rem] text-shale">own public repos</dt>
              <dd className="text-lg text-quartz">{gh.ownPublicRepos}</dd>
            </div>
            <div>
              <dt className="text-[0.625rem] text-shale">commits</dt>
              <dd className="text-lg text-quartz">{bronze.totalCommits.toLocaleString("en-US")}</dd>
            </div>
            <div>
              <dt className="text-[0.625rem] text-shale">based in</dt>
              <dd>{gh.location}</dd>
            </div>
            <div>
              <dt className="text-[0.625rem] text-shale">status</dt>
              <dd className={gh.hireable ? "text-signal" : ""}>{gh.hireable ? "open to work" : "not looking"}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-[0.625rem] text-shale">affiliation on GitHub</dt>
              <dd>{gh.affiliation}</dd>
            </div>
          </dl>
        </div>
      </Panel>

      <SlagPanel />

      <section aria-label="Commit history">
        <CommitStrata />
      </section>
      </div>
      </div>
    </>
  );
}
