"use client";

import { useEffect } from "react";
import { extractedRecord, profile } from "@/content/profile";

/** For whoever opens devtools: the hero's extracted record, as the data it is. */
export function ConsoleRecord() {
  useEffect(() => {
    const record = Object.fromEntries(extractedRecord.map((f) => [f.label, f.value]));
    console.log(
      "%c refinery %c raw evidence in, checkable claims out",
      "background:#d9b65b;color:#1a1e21;font-weight:700;padding:2px 6px;border-radius:3px",
      "color:#9aa4a9",
    );
    console.log(JSON.stringify({ ...record, github: profile.github }, null, 2));
  }, []);
  return null;
}
