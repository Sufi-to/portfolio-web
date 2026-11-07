import Link from "next/link";
import { profile } from "@/content/profile";
import bronze from "@/data/bronze.json";
import report from "@/data/evidence-report.json";
import { Transport } from "./Transport";

const link = "tap hover:text-signal";

export function SiteFooter() {
  return (
    <footer className="relative mt-16 bg-slab">
      <Transport />
      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-2 border-t border-[color:var(--rule)] px-5 py-4 font-[family-name:var(--font-mono)] text-[0.625rem] uppercase tracking-[0.1em] text-quartz/85 sm:px-10">
        <p>
          &copy; {bronze.generatedAt.slice(0, 4)} {profile.name} &middot;{" "}
          <Link href="/evidence/" className="tap underline-offset-4 hover:text-signal hover:underline">
            {report.passed} of {report.total} claims verified {report.checkedAt}
          </Link>{" "}
          &mdash; git history ingested {bronze.generatedAt} &middot; design inspired by{" "}
          <a href="https://carlton.dev/" target="_blank" rel="noopener" className="tap underline-offset-4 hover:text-signal hover:underline">
            carlton.dev
          </a>
        </p>
        <ul className="flex flex-wrap items-center gap-x-5">
          <li>
            <a className={link} href={`mailto:${profile.email}`}>
              Email
            </a>
          </li>
          <li>
            <a className={link} href={profile.linkedin} rel="me noopener" target="_blank">
              LinkedIn
            </a>
          </li>
          <li>
            <a className={link} href={profile.github} rel="me noopener" target="_blank">
              GitHub
            </a>
          </li>
          {profile.cvUrl && (
            <li>
              <Link className={link} href={profile.cvUrl}>
                CV
              </Link>
            </li>
          )}
          <li>
            <Link className={link} href="/evidence/">
              Evidence
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
