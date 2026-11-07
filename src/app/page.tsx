import { ExtractionHero } from "@/components/ExtractionHero";
import { DepthIntro } from "@/components/DepthIntro";
import { WorkIndex } from "@/components/WorkIndex";
import { CommitStrata } from "@/components/CommitStrata";
import { CloseContact } from "@/components/CloseContact";
import { PatchCables } from "@/components/PatchCables";

export default function Home() {
  return (
    <PatchCables>
      <ExtractionHero />
      <WorkIndex />
      <DepthIntro />
      <section aria-label="Commit history" className="mx-auto mt-16 max-w-[76rem] px-5 sm:px-8">
        <CommitStrata />
      </section>
      <CloseContact />
    </PatchCables>
  );
}
