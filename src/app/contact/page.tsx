import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
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
      <PageIntro title="Contact">Email is the fastest way to reach me.</PageIntro>
      <ul className="mx-auto mt-12 max-w-[76rem] border-t border-seam px-5 sm:px-8">
        {links.map((l) => (
          <li key={l.label} className="border-b border-seam">
            <a
              href={l.href}
              target={l.href.startsWith("mailto") ? undefined : "_blank"}
              rel="me noopener"
              className="group grid gap-1 py-6 sm:grid-cols-[10rem_1fr]"
            >
              <span className="t-small text-shale">{l.label}</span>
              <span className="text-[1.3125rem] transition-[font-stretch] duration-300 [font-stretch:104%] group-hover:[font-stretch:118%]">
                {l.value}
              </span>
            </a>
          </li>
        ))}
        {!profile.cvUrl && <li className="py-6 t-small text-shale">A downloadable CV will be added here soon.</li>}
      </ul>
    </>
  );
}
