import Link from "next/link";
import { profile } from "@/content/profile";
import { Assayed } from "./Assayed";
import { Panel } from "./Panel";

const Heading = ({ children }: { children: string }) => <p className="text-[0.75rem] font-medium text-signal">## {children}</p>;

export function ReadmePanel() {
  return (
    <Panel name="readme_txt" tag="TXT" portId="readme" in="left" out="right" className="op order-5" style={{ "--x": "calc(100% - 22.75rem)", "--y": "35.5rem", "--w": "21.125rem" } as React.CSSProperties}>
      <div className="space-y-1.5 p-3.5 font-[family-name:var(--font-code)] text-[0.75rem] leading-[1.65] text-quartz/90">
        <Heading>about</Heading>
        <p>
          <Assayed text="Software engineer, AI and data → a researcher-matching pipeline for Zayed University → LLM extraction over 40,065 hiring posts → a stock research tool that drops unsourced claims." />
        </p>
        <p className="text-shale">Dotted figures open their proof.</p>
        <Heading>status</Heading>
        <p>
          {profile.location}
          {profile.available && <span className="text-signal"> &middot; open to work</span>}
        </p>
        <Heading>depth</Heading>
        <p>Gold is the outcome. Silver is the build. Bronze is the code that proves it.</p>
        <p>
          <Link href="/evidence/" className="tap underline underline-offset-4 hover:text-signal">
            Check the evidence.
          </Link>
        </p>
      </div>
    </Panel>
  );
}
