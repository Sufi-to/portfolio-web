"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav } from "@/content/site";
import { profile } from "@/content/profile";
import { openPalette } from "./CommandPalette";
import { ModeToggle } from "./ModeToggle";
import { MotionToggle } from "./MotionToggle";

const isActive = (path: string, href: string) => (href === "/" ? path === "/" : path.startsWith(href));

export function SiteHeader() {
  const path = usePathname() ?? "/";
  const [menu, setMenu] = useState(false);
  const [mac, setMac] = useState(true);
  const [run, setRun] = useState<{ step: number; total: number } | null>(null);
  // The 404 page is built once and served for every unknown address, so the
  // path is only known in the browser. Rendering it here keeps hydration clean.
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMenu(false), [path]);
  useEffect(() => setMac(/Mac|iPhone|iPad/.test(navigator.platform)), []);
  useEffect(() => setMounted(true), []);

  // Only the home page runs an extraction; everywhere else reads as finished.
  useEffect(() => {
    setRun(null);
    const onStep = (e: Event) => setRun((e as CustomEvent<{ step: number; total: number }>).detail);
    window.addEventListener("extract:step", onStep);
    return () => window.removeEventListener("extract:step", onStep);
  }, [path]);

  const running = run !== null && run.step < run.total;
  const crumb = path === "/" ? "/refinery/home" : `/refinery${path.replace(/\/$/, "")}`;

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--rule)] bg-slate/80 backdrop-blur-md">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:rounded-sm focus:bg-slab focus:px-3 focus:py-2">
        Skip to content
      </a>
      <div className="flex h-14 items-center gap-3 px-5 font-[family-name:var(--font-mono)] sm:px-10 xl:h-11">
        <div className="mr-auto flex min-w-0 items-center gap-3">
          <Link href="/" className="tap flex shrink-0 items-center gap-2 leading-none" aria-label={`${profile.name}, home`}>
            <svg aria-hidden viewBox="0 0 14 14" className="h-3.5 w-3.5 fill-signal">
              <path d="M1 1h5v5H1zM1 8h3v5H1zM8 1h3v8H8zM6 9h5v4H6z" />
            </svg>
            <span className="text-xs font-bold tracking-[0.02em]">tomas.teclehaimanot</span>
          </Link>
          {mounted && <span className="hidden max-w-[14rem] min-w-0 truncate rounded border border-signal/30 bg-signal/[0.05] px-2 py-0.5 text-[0.625rem] tracking-[0.06em] text-signal md:block">{crumb}</span>}
        </div>

        <nav aria-label="Main" className="hidden shrink-0 xl:block">
          <ul className="flex items-center gap-1">
            {nav.slice(1).map((n) => {
              const on = isActive(path, n.href);
              return (
                <li key={n.href}>
                  <Link href={n.href} aria-current={on ? "page" : undefined} className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[0.6875rem] tracking-[0.04em] transition-colors ${on ? "text-signal" : "text-shale hover:text-quartz"}`}>
                    <span aria-hidden className={`h-1 w-1 rounded-full border ${on ? "border-signal bg-signal" : "border-shale"}`} />
                    <span aria-hidden>/ </span>
                    {n.label.toLowerCase()}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <span aria-hidden className="mx-1 hidden h-4 w-px bg-seam xl:block" />

        <button onClick={openPalette} aria-label="Open command palette" className="hidden shrink-0 items-center gap-1.5 text-[0.625rem] tracking-[0.06em] text-shale hover:text-quartz sm:flex">
          <kbd className="rounded border border-seam px-1 py-px text-[0.5625rem]">{mac ? "⌘K" : "CTRL K"}</kbd>
          ops
        </button>

        <MotionToggle className="hidden xl:inline-flex" />
        <ModeToggle />

        <span aria-hidden className="hidden shrink-0 items-center gap-1.5 whitespace-nowrap text-[0.625rem] tracking-[0.1em] text-signal xl:flex">
          <span className="status-dot h-1.5 w-1.5 rounded-full bg-signal" />
          {running ? `EXTRACTING ${run.step}/${run.total}` : "REFINED"}
        </span>

        <button className="chip tap xl:hidden" aria-expanded={menu} aria-controls="mobile-nav" onClick={() => setMenu((m) => !m)}>
          {menu ? "CLOSE" : "MENU"}
        </button>
      </div>

      <div id="mobile-nav" className="reveal xl:hidden" data-open={menu}>
        <div inert={!menu}>
          <nav aria-label="Main, mobile" className="border-t border-seam px-5 pb-5 pt-2">
            <ul className="flex flex-col font-[family-name:var(--font-mono)]">
              {nav.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} aria-current={isActive(path, n.href) ? "page" : undefined} className={`flex items-center justify-between border-b border-seam py-3.5 text-[0.9375rem] ${isActive(path, n.href) ? "text-signal" : ""}`}>
                    / {n.label.toLowerCase()}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={openPalette} className="chip tap">
                SEARCH
              </button>
              <MotionToggle className="tap" />
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
