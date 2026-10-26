import type { Metadata } from "next";
import { ProjectExplorer } from "@/components/ProjectExplorer";
import { PageIntro } from "@/components/PageIntro";
import { projects } from "@/content/projects";

export const metadata: Metadata = {
  title: "Projects",
  description: "Case studies, lab work and foundations, filterable by domain, status and stack.",
};

export default function ProjectsPage() {
  return (
    <>
      <PageIntro title="Projects">
        {projects.length} projects from my GitHub, from C coursework to LLM pipelines. Filter with the chips or type a query;
        open any row to read it at your chosen depth.
      </PageIntro>
      <div className="mx-auto mt-10 max-w-[76rem] px-5 sm:px-8">
        <ProjectExplorer />
      </div>
    </>
  );
}
