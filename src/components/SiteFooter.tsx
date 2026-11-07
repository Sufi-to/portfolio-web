import Link from "next/link";
import { profile } from "@/content/profile";
import bronze from "@/data/bronze.json";
import report from "@/data/evidence-report.json";

const link = "tap underline decoration-seam underline-offset-4 hover:decoration-trace";

export function SiteFooter() {
  return (
    <footer className="relative mt-24 border-t border-seam bg-slate">
      <div className="mx-auto flex max-w-[76rem] flex-wrap items-center justify-between gap-x-8 gap-y-3 px-5 py-5 t-data text-shale sm:px-8">
        <p>
          {bronze.generatedAt.slice(0, 4)} {profile.name}.{" "}
          <Link href="/evidence/" className="tap underline decoration-seam underline-offset-4 hover:decoration-trace">
            {report.passed} of {report.total} claims verified {report.checkedAt}
          </Link>
          . Git history ingested {bronze.generatedAt}.
        </p>
        <ul className="flex flex-wrap items-center gap-x-5">
          <li>
            <a className={link} href={`mailto:${profile.email}`}>
              email
            </a>
          </li>
          <li>
            <a className={link} href={profile.github} rel="me noopener" target="_blank">
              github
            </a>
          </li>
          <li>
            <a className={link} href={profile.linkedin} rel="me noopener" target="_blank">
              linkedin
            </a>
          </li>
          {profile.cvUrl && (
            <li>
              <Link className={link} href={profile.cvUrl}>
                cv
              </Link>
            </li>
          )}
        </ul>
      </div>
    </footer>
  );
}
