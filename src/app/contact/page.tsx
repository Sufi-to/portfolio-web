import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/PageIntro";
import { Panel } from "@/components/Panel";
import { profile } from "@/content/profile";

export const metadata: Metadata = { title: "Contact" };

const links = [
  { label: "Email", value: profile.email, href: `mailto:${profile.email}` },
  { label: "GitHub", value: `github.com/${profile.githubHandle}`, href: profile.github },
  { label: "LinkedIn", value: "linkedin.com/in/tomas-teclehaimanot", href: profile.linkedin },
];

export default function ContactPage() {
  return (
    <>
      <div className="page">
      <div className="page-col page-side">
      <PageIntro name="contact_txt" title="Contact" lead="Email is the fastest way to reach me.">
        <p>
          Based in {profile.location}.{profile.available && " Open to work."}
        </p>
        <p>
          <Link href="/certificate/" className="tap underline decoration-seam underline-offset-4 hover:text-signal">
            Print a one-page summary of the verified work
          </Link>
        </p>
      </PageIntro>
      </div>
      <Panel name="contact_out" meta="say hi" tag="DATA" portId="links" in="left" out="right">
      <ul>
        {links.map((l, i) => (
          <li key={l.label} className={i > 0 ? "border-t border-seam/70" : ""}>
            <a
              href={l.href}
              target={l.href.startsWith("mailto") ? undefined : "_blank"}
              rel="me noopener"
              className="group grid gap-1 p-3.5 sm:grid-cols-[7rem_1fr]"
            >
              <span className="t-data text-shale">{l.label.toLowerCase()}</span>
              <span className="t-data text-small transition-colors group-hover:text-signal">
                {l.value}
              </span>
            </a>
          </li>
        ))}
      </ul>
      </Panel>
      </div>
    </>
  );
}
