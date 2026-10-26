import { ExtractionHero } from "@/components/ExtractionHero";
import { DepthIntro } from "@/components/DepthIntro";
import { FeaturedWork } from "@/components/FeaturedWork";
import { CommitStrata } from "@/components/CommitStrata";

export default function Home() {
  return (
    <>
      <ExtractionHero />
      <DepthIntro />
      <FeaturedWork />
      <section aria-label="Commit history" className="mx-auto mt-28 max-w-[76rem] px-5 sm:px-8">
        <CommitStrata />
      </section>
    </>
  );
}
