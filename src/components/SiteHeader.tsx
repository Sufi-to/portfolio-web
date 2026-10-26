"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav } from "@/content/site";
import { profile } from "@/content/profile";
import { DepthSwitch } from "./DepthSwitch";
import { openPalette } from "./CommandPalette";

const isActive = (path: string, href: string) => (href === "/" ? path === "/" : path.startsWith(href));

export function SiteHeader() {
  const path = usePathname() ?? "/";
  const [menu, setMenu] = useState(false);
  const [mac, setMac] = useState(true);

  useEffect(() => setMenu(false), [path]);
  useEffect(() => setMac(/Mac|iPhone|iPad/.test(navigator.platform)), []);

  return (
    <header className="sticky top-0 z-40 border-b border-seam bg-slate/85 backdrop-blur-md">
      {/* A one-pixel line in the current depth's metal. */}
      <div aria-hidden className="absolute inset-x-0 bottom-[-1px] h-px bg-metal/70 transition-colors duration-300" />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:rounded focus:bg-slab focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-16 max-w-[76rem] items-center gap-4 px-5 sm:px-8">
        <Link href="/" className="mr-auto shrink-0 leading-none" aria-label={`${profile.name}, home`}>
          <span className="block text-[1.0625rem] font-[620] [font-stretch:118%] tracking-[-0.01em]">
            <span className="hidden sm:inline">{profile.name}</span>
            <span className="sm:hidden">Tomas T.</span>
          </span>
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {nav.slice(1).map((n) => {
              const on = isActive(path, n.href);
              return (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    aria-current={on ? "page" : undefined}
                    className={`relative rounded-md px-3 py-1.5 t-small transition-colors ${on ? "text-quartz" : "text-shale hover:text-quartz"}`}
                  >
                    {n.label}
                    {on && <span aria-hidden className="absolute inset-x-3 bottom-0 h-px bg-metal" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <DepthSwitch compact />

        <button
          onClick={openPalette}
          className="hidden items-center gap-2 rounded-md border border-seam px-2.5 py-1.5 t-micro text-shale transition-colors hover:border-shale/50 hover:text-quartz sm:flex"
          aria-label="Open command palette"
        >
          <span>Search</span>
          <kbd className="t-data text-[0.75rem]">{mac ? "⌘K" : "Ctrl K"}</kbd>
        </button>

        <button
          className="rounded-md border border-seam px-3 py-1.5 t-small md:hidden"
          aria-expanded={menu}
          aria-controls="mobile-nav"
          onClick={() => setMenu((m) => !m)}
        >
          {menu ? "Close" : "Menu"}
        </button>
      </div>

      <div id="mobile-nav" className="reveal md:hidden" data-open={menu}>
        <div>
          <nav aria-label="Main, mobile" className="border-t border-seam px-5 pb-5 pt-2">
            <ul className="flex flex-col">
              {nav.map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    tabIndex={menu ? 0 : -1}
                    aria-current={isActive(path, n.href) ? "page" : undefined}
                    className="flex items-center justify-between border-b border-seam/60 py-3.5 text-[1.3125rem] [font-stretch:110%]"
                  >
                    {n.label}
                    {isActive(path, n.href) && <span aria-hidden className="h-2 w-2 rounded-full bg-metal" />}
                  </Link>
                </li>
              ))}
            </ul>
            <button
              tabIndex={menu ? 0 : -1}
              onClick={openPalette}
              className="mt-4 w-full rounded-md border border-seam py-3 t-small text-shale"
            >
              Search pages and projects
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
