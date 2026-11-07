"use client";

import { useState } from "react";
import { profile } from "@/content/profile";
import { Panel } from "./Panel";

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
    <section aria-labelledby="close-title" className="min-w-0">
      <Panel name="contact_out" meta="say hi" tag="TXT" portId="contact" in="right">
      <div className="p-3.5">
      <h2 id="close-title" className="text-lg font-extrabold leading-tight">
        Building something with data or LLMs? Tell me about it.
      </h2>
      <a
        href={`mailto:${profile.email}`}
        className="ghost mt-3 block font-black uppercase leading-none text-[clamp(1.25rem,2vw,1.625rem)] [overflow-wrap:anywhere] transition-colors hover:text-signal"
      >
        {profile.email}
      </a>
      <button
        onClick={copy}
        className="chip tap mt-3"
      >
        <span aria-live="polite">{copied ? "ADDRESS COPIED" : "COPY ADDRESS"}</span>
      </button>
      </div>
      </Panel>
    </section>
  );
}
