"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { depthInfo } from "@/content/site";
import { useDepth } from "./DepthProvider";

const SHOW_MS = 6000;

/**
 * Says what the depth switch just did. Without it, changing depth at the top
 * of the home page looks like a colour change, because the detail opens further down.
 */
export function DepthToast() {
  const { depth, changes } = useDepth();
  const path = usePathname();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!changes) return;
    setShown(true);
    const t = window.setTimeout(() => setShown(false), SHOW_MS);
    return () => window.clearTimeout(t);
  }, [changes]);

  const info = depthInfo[depth];
  const home = path === "/";

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-16 z-40 flex justify-center lg:bottom-6">
      {shown && (
        <div className="pointer-events-auto flex max-w-full items-center gap-3 rounded-md border border-signal/50 bg-slab px-3 py-1.5 t-data text-quartz">
          <span>
            {info.label} detail: {info.hint.toLowerCase()}.{!home && " Pick a row to read it."}
          </span>
          {home && depth !== "gold" && (
            <button
              onClick={() => {
                setShown(false);
                document.getElementById("work-detail")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="tap shrink-0 text-metal underline underline-offset-4"
            >
              Show me
            </button>
          )}
        </div>
      )}
    </div>
  );
}
