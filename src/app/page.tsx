import { HeroText } from "@/components/HeroText";
import { ExtractionHero } from "@/components/ExtractionHero";
import { WorkIndex } from "@/components/WorkIndex";
import { CommitStrata } from "@/components/CommitStrata";
import { CloseContact } from "@/components/CloseContact";
import { PatchCables } from "@/components/PatchCables";
import { OreOps, DepthOp } from "@/components/OreOps";
import { ReadmePanel } from "@/components/ReadmePanel";

export default function Home() {
  return (
    <PatchCables>
      <WorkIndex>
        <HeroText />
        <OreOps />
        <DepthOp />
        <ReadmePanel />
      </WorkIndex>
      <div className="field mt-6 grid grid-cols-[minmax(0,1fr)] gap-5 px-5 xl:grid-cols-[minmax(0,1fr)_21.125rem] xl:gap-10 xl:px-[1.625rem]">
        <ExtractionHero />
        <CloseContact />
        <section aria-label="Commit history" className="min-w-0 xl:col-span-2">
          <CommitStrata wide />
        </section>
      </div>
    </PatchCables>
  );
}
