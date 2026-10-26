import Link from "next/link";
import { profile } from "@/content/profile";
import bronze from "@/data/bronze.json";

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-seam">
      <div className="mx-auto grid max-w-[76rem] gap-8 px-5 py-12 sm:px-8 md:grid-cols-[1fr_auto]">
        <div>
          <p className="t-h3">{profile.name}</p>
          <p className="mt-2 max-w-md t-small text-shale">
            Every project claim on this site links to the file and commit that backs it. Git history last ingested{" "}
            {new Date(bronze.generatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}.
          </p>
        </div>
        <ul className="flex flex-wrap items-start gap-x-6 gap-y-2 t-small">
          <li>
            <a className="underline decoration-seam underline-offset-4 hover:decoration-trace" href={`mailto:${profile.email}`}>
              {profile.email}
            </a>
          </li>
          <li>
            <a className="underline decoration-seam underline-offset-4 hover:decoration-trace" href={profile.github} rel="me noopener" target="_blank">
              GitHub
            </a>
          </li>
          <li>
            <a className="underline decoration-seam underline-offset-4 hover:decoration-trace" href={profile.linkedin} rel="me noopener" target="_blank">
              LinkedIn
            </a>
          </li>
          {profile.cvUrl && (
            <li>
              <Link className="underline decoration-seam underline-offset-4 hover:decoration-trace" href={profile.cvUrl}>
                CV
              </Link>
            </li>
          )}
        </ul>
      </div>
    </footer>
  );
}
