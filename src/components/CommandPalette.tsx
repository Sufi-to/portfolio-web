"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { nav, depthInfo } from "@/content/site";
import { projects } from "@/content/projects";
import { profile } from "@/content/profile";
import { toggleShortcuts, useDepth } from "./DepthProvider";
import type { Depth } from "@/content/types";

interface Command {
  id: string;
  group: "Go to" | "Projects" | "Detail level" | "Contact" | "Query";
  label: string;
  hint?: string;
  keywords?: string;
  run: () => void;
}

const FEATURED_IDS = new Set(projects.filter((p) => p.shelf === "featured").map((p) => `p-${p.slug}`));

export const openPalette = () => window.dispatchEvent(new Event("palette:open"));

/** Cmd+K / Ctrl+K palette for pages, projects, detail level and catalog queries. */
export function CommandPalette() {
  const router = useRouter();
  const { setDepth } = useDepth();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [active, setActive] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("palette:open", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("palette:open", onOpen);
    };
  }, []);

  useEffect(() => {
    // The page behind stays out of reach while the palette is open.
    document.querySelectorAll<HTMLElement>("header, main, footer").forEach((el) => (el.inert = open));
    if (open) {
      restoreFocus.current = document.activeElement as HTMLElement;
      setText("");
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      restoreFocus.current?.focus?.();
    }
  }, [open]);

  const close = () => setOpen(false);

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const commands = useMemo<Command[]>(() => {
    const go = (href: string) => () => {
      close();
      router.push(href);
    };
    const list: Command[] = [
      ...nav.map((n) => ({ id: `nav-${n.href}`, group: "Go to" as const, label: n.label, run: go(n.href) })),
      ...projects.map((p) => ({
        id: `p-${p.slug}`,
        group: "Projects" as const,
        label: p.name,
        hint: p.stack.slice(0, 3).join(", "),
        keywords: `${p.stack.join(" ")} ${p.domains.join(" ")} ${p.repos.map((r) => r.label).join(" ")}`,
        run: go(`/projects/${p.slug}/`),
      })),
      ...(["gold", "silver", "bronze"] as Depth[]).map((d) => ({
        id: `d-${d}`,
        group: "Detail level" as const,
        label: `Show ${depthInfo[d].label.toLowerCase()} detail`,
        hint: `${depthInfo[d].hint} (${depthInfo[d].key})`,
        keywords: "depth level detail",
        run: () => {
          setDepth(d);
          close();
        },
      })),
      {
        id: "shortcuts",
        group: "Detail level",
        label: "Turn single-key shortcuts on or off",
        hint: "G, S, B and /",
        keywords: "keyboard accessibility",
        run: () => {
          flash(toggleShortcuts() ? "Single-key shortcuts on" : "Single-key shortcuts off");
          close();
        },
      },
      {
        id: "copy-email",
        group: "Contact",
        label: "Copy email address",
        hint: profile.email,
        keywords: "mail contact",
        run: async () => {
          try {
            await navigator.clipboard.writeText(profile.email);
            flash("Email address copied");
          } catch {
            flash(profile.email);
          }
          close();
        },
      },
      {
        id: "github",
        group: "Contact",
        label: "Open GitHub profile",
        hint: `github.com/${profile.githubHandle}`,
        run: () => {
          window.open(profile.github, "_blank", "noopener");
          close();
        },
      },
      {
        id: "linkedin",
        group: "Contact",
        label: "Open LinkedIn profile",
        run: () => {
          window.open(profile.linkedin, "_blank", "noopener");
          close();
        },
      },
    ];
    return list;
  }, [router, setDepth]);

  const results = useMemo(() => {
    const words = text.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const matched = words.length
      ? commands.filter((c) => {
          const hay = `${c.group} ${c.label} ${c.hint ?? ""} ${c.keywords ?? ""}`.toLowerCase();
          return words.every((w) => hay.includes(w));
        })
      : // With no input, list only the featured projects to keep the menu short.
        commands.filter((c) => c.group !== "Projects" || FEATURED_IDS.has(c.id));
    // A query with filters (domain:ai) or no matches can run in the project catalog.
    if (text.trim() && (text.includes(":") || matched.length === 0)) {
      matched.unshift({
        id: "query",
        group: "Query",
        label: `Search projects for “${text.trim()}”`,
        run: () => {
          close();
          router.push(`/projects/?q=${encodeURIComponent(text.trim())}`);
        },
      });
    }
    return matched;
  }, [text, commands, router]);

  useEffect(() => setActive(0), [text]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "Tab") {
      // The input is the only stop in here, so Tab stays on it.
      e.preventDefault();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      results[active]?.run();
    }
  };

  useEffect(() => {
    document.getElementById(`cmd-${results[active]?.id}`)?.scrollIntoView({ block: "nearest" });
  }, [active, results]);

  let lastGroup = "";

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-slate/70 px-4 pt-[12vh] backdrop-blur-[2px]"
          onMouseDown={(e) => e.target === e.currentTarget && close()}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            className="w-full max-w-xl overflow-hidden rounded-lg border border-seam bg-slab shadow-[0_24px_80px_-24px_rgba(0,0,0,0.7)]"
            onKeyDown={onKeyDown}
          >
            <div className="flex items-center gap-3 border-b border-seam px-4 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-trace">
              <span aria-hidden className="t-data text-trace">›</span>
              <input
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Jump to a page or project, or filter: domain:ai status:shipped"
                aria-label="Search commands"
                aria-controls="cmd-list"
                aria-activedescendant={results[active] ? `cmd-${results[active].id}` : undefined}
                role="combobox"
                aria-expanded="true"
                className="h-13 w-full bg-transparent py-4 text-quartz placeholder:text-shale focus-visible:outline-transparent"
              />
              <kbd className="t-data rounded-sm border border-seam px-1.5 text-shale">esc</kbd>
            </div>
            <ul id="cmd-list" role="listbox" className="max-h-[52vh] overflow-y-auto py-2">
              {results.length === 0 && <li className="px-4 py-6 text-shale t-small">No matches. Try a project name or a technology.</li>}
              {results.map((c, i) => {
                const header = c.group !== lastGroup ? c.group : null;
                lastGroup = c.group;
                return (
                  <li key={c.id} role="presentation">
                    {header && <div className="px-4 pb-1 pt-3 t-micro text-shale">{header}</div>}
                    <div
                      id={`cmd-${c.id}`}
                      role="option"
                      aria-selected={i === active}
                      onMouseMove={() => setActive(i)}
                      onClick={() => c.run()}
                      className={`mx-2 flex cursor-pointer items-baseline justify-between gap-4 rounded-md px-3 py-2 ${
                        i === active ? "bg-slab-2 text-quartz" : "text-quartz/90"
                      }`}
                    >
                      <span>{c.label}</span>
                      {c.hint && <span className="truncate t-micro text-shale">{c.hint}</span>}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
      <div aria-live="polite" className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
        {toast && <div className="rounded-full border border-seam bg-slab px-4 py-2 t-small text-quartz">{toast}</div>}
      </div>
    </>
  );
}
