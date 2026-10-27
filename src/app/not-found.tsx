"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { nav } from "@/content/site";

// The static host serves this for any unknown path, so the path is read on the client.
export default function NotFound() {
  const [path, setPath] = useState("/…");
  useEffect(() => setPath(window.location.pathname), []);
  const sql = `SELECT *\nFROM pages\nWHERE path = '${path.replace(/'/g, "''")}';`;

  return (
    <div className="mx-auto max-w-[76rem] px-5 py-20 sm:px-8">
      <pre className="overflow-x-auto rounded-lg border border-seam bg-slab/60 p-5 t-data text-[0.9375rem] text-quartz/85">
        <span className="text-trace">› </span>
        {sql}
        {"\n\n"}
        <span className="text-reject">(0 rows)</span>
      </pre>
      <h1 className="mt-10 t-h1">That page doesn&rsquo;t exist.</h1>
      <p className="mt-4 text-quartz/80">The query ran fine; there was just nothing there to refine. These rows do exist:</p>
      <ul className="mt-6 flex flex-wrap gap-2">
        {nav.map((n) => (
          <li key={n.href}>
            <Link href={n.href} className="block rounded-md border border-seam px-3 py-1.5 t-data text-quartz transition-colors hover:border-trace/60">
              {n.href}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
