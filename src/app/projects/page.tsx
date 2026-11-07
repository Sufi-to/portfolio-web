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
    <ProjectExplorer
      intro={
        <PageIntro name="work_txt" title="Projects">
          <p>{projects.length} projects from my GitHub, from C coursework to LLM pipelines. Filter with the chips or type a query; pick a row to preview it in the viewer.</p>
        </PageIntro>
      }
    />
  );
}
