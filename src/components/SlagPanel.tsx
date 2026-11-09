import Link from "next/link";
import { projects } from "@/content/projects";
import bronze from "@/data/bronze.json";
import { Panel } from "./Panel";

const unchecked = projects.filter((p) => !p.evidence?.length).length;

// Refining leaves slag: what was taken out so the rest could be claimed.
// Each line is something this site deliberately does not say.
const SLAG: { what: string; why: React.ReactNode }[] = [
  { what: "ResearchMatch accuracy", why: "Not claimed. Its relevance has not been labelled independently yet." },
  { what: "TooB and Enmar demos", why: "Not linked. Both returned 404 when checked on 8 November 2026." },
  { what: `${bronze.github.forks} forked repositories`, why: "Not counted. They are other people's code." },
  {
    what: `${unchecked} smaller projects`,
    why: (
      <>
        Listed, but with no checked claims. Only the case studies are on the{" "}
        <Link href="/evidence/" className="underline underline-offset-4 hover:text-signal">
          evidence ledger
        </Link>
        .
      </>
    ),
  },
  { what: "FinRadar's advice", why: "Not offered. It is research support, not investment advice." },
];

export function SlagPanel() {
  return (
    <Panel name="slag_out" meta="what was refined out" tag="SYS" portId="slag" in="left">
      <ul className="divide-y divide-seam/70">
        {SLAG.map((s) => (
          <li key={s.what} className="grid gap-1 px-3.5 py-2.5 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-4">
            <span className="t-data text-[0.75rem] text-shale">
              <span aria-hidden className="text-reject">&times; </span>
              {s.what}
            </span>
            <span className="t-small text-quartz/85">{s.why}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
