"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav } from "@/content/site";
import { profile } from "@/content/profile";
import { button } from "@/lib/button";
import { depthApplies } from "./DepthProvider";
import { MotionToggle } from "./MotionToggle";
import { DepthSwitch } from "./DepthSwitch";
import { openPalette } from "./CommandPalette";

const isActive = (path: string, href: string) => (href === "/" ? path === "/" : path.startsWith(href));

export function SiteHeader() {
  const path = usePathname() ?? "/";
  const [menu, setMenu] = useState(false);
  const [mac, setMac] = useState(true);
  const [run, setRun] = useState<{ step: number; total: number } | null>(null);

  useEffect(() => setMenu(false), [path]);
  useEffect(() => setMac(/Mac|iPhone|iPad/.test(navigator.platform)), []);

  // Only the home page runs an extraction; everywhere else reads as finished.
  useEffect(() => {
    setRun(null);
    const onStep = (e: Event) => setRun((e as CustomEvent<{ step: number; total: number }>).detail);
    window.addEventListener("extract:step", onStep);
    return () => window.removeEventListener("extract:step", onStep);
  }, [path]);

  const running = run !== null && run.step < run.total;
  const crumb = path === "/" ? "/" : path.replace(/\/$/, "");

  // The 404 page is built once and served for every unknown address, so the
  // path is only known in the browser. Rendering it here keeps hydration clean.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-40 border-b border-seam bg-slate/95 backdrop-blur-md">
      {/* A one-pixel line in the current depth's metal. */}
      <div aria-hidden className="absolute inset-x-0 bottom-[-1px] h-px bg-metal/70 transition-colors duration-300" />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:rounded-sm focus:bg-slab focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-14 max-w-[76rem] items-center gap-2 px-5 sm:gap-4 sm:px-8 lg:h-11">
        <div className="mr-auto flex min-w-0 items-center gap-3">
          <Link href="/" className="tap flex shrink-0 items-center gap-2 leading-none" aria-label={`${profile.name}, home`}>
            {/* The three metals, the same mark as the favicon. */}
            <span aria-hidden className="flex w-3.5 flex-col gap-[2px]">
              <span className="h-[3px] w-full bg-gold" />
              <span className="h-[3px] w-3/4 bg-silver" />
              <span className="h-[3px] w-1/2 bg-bronze" />
            </span>
            <span className="block text-small font-[620] [font-stretch:118%] tracking-[-0.01em]">
              <span className="hidden md:inline">{profile.name}</span>
              <span className="md:hidden">{profile.shortName}</span>
            </span>
          </Link>
          {mounted && <span className="hidden max-w-[11rem] min-w-0 truncate rounded-sm border border-seam px-1.5 t-data text-label text-shale xl:block">{crumb}</span>}
        </div>

        <nav aria-label="Main" className="hidden shrink-0 lg:block">
          <ul className="flex items-center gap-1">
            {nav.slice(1).map((n) => {
              const on = isActive(path, n.href);
              return (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    aria-current={on ? "page" : undefined}
                    className={`rounded-md px-2 py-1 t-data transition-colors ${on ? "text-metal" : "text-shale hover:text-quartz"}`}
                  >
                    <span aria-hidden className="text-shale/90">/ </span>
                    {n.label.toLowerCase()}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <span aria-hidden className="hidden shrink-0 items-center gap-1.5 whitespace-nowrap t-data text-label text-shale xl:flex">
          <span className={`h-1.5 w-1.5 rounded-full bg-metal ${running ? "animate-pulse" : ""}`} />
          {running ? `extracting ${run.step}/${run.total}` : "refined"}
        </span>

        {depthApplies(path) && (
          <div className="flex shrink-0 items-center gap-2">
            <span aria-hidden className="hidden t-micro text-shale lg:inline">Detail</span>
            <DepthSwitch compact />
          </div>
        )}

        <button
          onClick={openPalette}
          className={`hidden shrink-0 items-center gap-2 whitespace-nowrap sm:flex ${button("outline", "sm")}`}
          aria-label="Open command palette"
        >
          <span>Search</span>
          <kbd className="hidden t-data text-label xl:inline">{mac ? "⌘K" : "Ctrl K"}</kbd>
        </button>

        <button
          className={`lg:hidden ${button("outline", "sm")}`}
          aria-expanded={menu}
          aria-controls="mobile-nav"
          onClick={() => setMenu((m) => !m)}
        >
          {menu ? "Close" : "Menu"}
        </button>
      </div>

      <div id="mobile-nav" className="reveal lg:hidden" data-open={menu}>
        <div inert={!menu}>
          <nav aria-label="Main, mobile" className="border-t border-seam px-5 pb-5 pt-2">
            <ul className="flex flex-col">
              {nav.map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    aria-current={isActive(path, n.href) ? "page" : undefined}
                    className="flex items-center justify-between border-b border-seam/60 py-3.5 text-title [font-stretch:110%]"
                  >
                    {n.label}
                    {isActive(path, n.href) && <span aria-hidden className="h-2 w-2 rounded-full bg-metal" />}
                  </Link>
                </li>
              ))}
            </ul>
            <button
              onClick={openPalette}
              className={`mt-4 w-full justify-center ${button("outline")}`}
            >
              Search pages and projects
            </button>
            <MotionToggle inMenu />
          </nav>
        </div>
      </div>
    </header>
  );
}
