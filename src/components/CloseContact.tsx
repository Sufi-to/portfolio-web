"use client";

import { useState } from "react";
import { profile } from "@/content/profile";

/** The home page's last word: the address itself, large, so nobody has to hunt for it. */
export function CloseContact() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard refused: the address is on screen and selectable.
    }
  };

  return (
    <section aria-labelledby="close-title" className="mx-auto mt-28 max-w-[76rem] px-5 sm:px-8">
      <h2 id="close-title" className="t-h2">
        Building something with data or LLMs? Tell me about it.
      </h2>
      <a
        href={`mailto:${profile.email}`}
        className="mt-6 block text-[clamp(1.375rem,5.4vw,4rem)] leading-[1.05] font-[560] tracking-[-0.02em] [font-stretch:108%] [overflow-wrap:anywhere] transition-[font-stretch,color] duration-500 hover:text-metal hover:[font-stretch:118%]"
      >
        {profile.email}
      </a>
      <button
        onClick={copy}
        className="tap mt-5 rounded-md border border-seam px-3 py-1.5 t-small transition-colors hover:border-shale/60"
      >
        <span aria-live="polite">{copied ? "Email address copied" : "Copy email address"}</span>
      </button>
    </section>
  );
}
