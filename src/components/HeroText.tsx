import Link from "next/link";
import { profile } from "@/content/profile";
import { Panel } from "./Panel";

export function HeroText() {
  return (
    <Panel name="hero_txt" tag="TXT" portId="hero" out="right" className="op order-1" style={{ "--x": "1.625rem", "--y": "2.125rem", "--w": "28.5rem" } as React.CSSProperties}>
      <div className="px-4 pb-4 pt-3.5">
        <h1 id="hero-title" className="t-display">
          I turn messy <span className="text-signal">data</span>.
          <span className="ghost block">Into systems you can check.</span>
        </h1>
        <p className="mt-3 font-[family-name:var(--font-code)] text-[0.8125rem] text-signal">
          <span aria-hidden>&gt; </span>
          raw evidence in, checkable claims out
          <span aria-hidden className="caret" />
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/projects/" className="chip tap" data-on="true">
            <span aria-hidden>&#9656;</span> EXPLORE PROJECTS
          </Link>
          <a href={`mailto:${profile.email}`} className="chip tap">
            EMAIL ME
          </a>
          <a href={profile.github} target="_blank" rel="me noopener" className="chip tap" data-quiet="true">
            GITHUB
          </a>
        </div>
      </div>
    </Panel>
  );
}
