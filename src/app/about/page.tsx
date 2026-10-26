import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { CommitStrata } from "@/components/CommitStrata";
import { profile } from "@/content/profile";

export const metadata: Metadata = {
  title: "About",
  description: "Software engineer working on AI and data systems, from C foundations to LLM pipelines.",
};

// Only facts visible in Tomas's repositories are stated here. Education,
// current role and location are waiting on Tomas (see README, "Open items").
const path = [
  {
    when: "2023",
    what: "Low-level programming in C",
    detail: "ALX software engineering curriculum: a Unix shell, sorting algorithms and systems scripting.",
  },
  {
    when: "2024",
    what: "Python, web and backend",
    detail: "Flask and Django apps, an AirBnB clone with a REST API, Node services with Redis and MongoDB, and two deployed apps built with Neftalem Mussie.",
  },
  {
    when: "2025",
    what: "Data science and computer vision",
    detail: "MIT Emerging Talent collaborative data science project, and Assay: YOLOv8 and EXIF checks for credit signals.",
  },
  {
    when: "2026",
    what: "AI and data engineering",
    detail: "FinRadar, the Gatehouse LLM gateway, a Databricks bootcamp, and the HN Hiring Observatory pipeline.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageIntro title="About">
        <p>
          I&rsquo;m {profile.shortName}, a software engineer who builds AI and data systems. What I care about most is that a
          system can show its work: the query behind a chart, the source behind a claim, the reason a request was refused.
        </p>
      </PageIntro>

      <section aria-labelledby="path-title" className="mx-auto mt-16 max-w-[76rem] px-5 sm:px-8">
        <h2 id="path-title" className="t-h2">
          How I got here
        </h2>
        <ol className="mt-6 border-t border-seam">
          {path.map((p) => (
            <li key={p.when} className="grid gap-2 border-b border-seam py-5 md:grid-cols-[6rem_16rem_1fr] md:gap-8">
              <span className="t-data text-shale">{p.when}</span>
              <span className="t-h3">{p.what}</span>
              <span className="text-quartz/85">{p.detail}</span>
            </li>
          ))}
        </ol>
      </section>

      <section aria-label="Commit history" className="mx-auto mt-24 max-w-[76rem] px-5 sm:px-8">
        <CommitStrata />
      </section>
    </>
  );
}
