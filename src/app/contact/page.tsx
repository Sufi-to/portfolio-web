import type { Metadata } from "next";
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
      <PageIntro title="Contact">Email is the fastest way to reach me.</PageIntro>
      <div className="mx-auto mt-12 max-w-[76rem] px-5 sm:px-8">
      <Panel name="contact_out" meta="say hi" tag="TXT">
      <ul>
        {links.map((l, i) => (
          <li key={l.label} className={i > 0 ? "border-t border-seam/70" : ""}>
            <a
              href={l.href}
              target={l.href.startsWith("mailto") ? undefined : "_blank"}
              rel="me noopener"
              className="group grid gap-1 p-5 sm:grid-cols-[10rem_1fr]"
            >
              <span className="t-small text-shale">{l.label}</span>
              <span className="text-title transition-[font-stretch] duration-300 [font-stretch:104%] group-hover:[font-stretch:118%]">
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
