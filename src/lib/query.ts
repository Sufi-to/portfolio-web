import type { Project } from "@/content/types";

// A tiny query language for the project catalog:
//   domain:ai status:shipped stack:fastapi year:2026 shelf:lab role:solo
// plus free words matched against name, summary and stack. Values of the same
// key are OR-ed; different keys and free words are AND-ed.

export const KEYS = ["domain", "status", "shelf", "stack", "year", "role"] as const;
export type Key = (typeof KEYS)[number];

export interface Parsed {
  filters: Partial<Record<Key, string[]>>;
  words: string[];
  unknown: string[];
}

export function parseQuery(q: string): Parsed {
  const filters: Parsed["filters"] = {};
  const words: string[] = [];
  const unknown: string[] = [];
  for (const raw of q.trim().split(/\s+/).filter(Boolean)) {
    const m = raw.match(/^(\w+):(.+)$/);
    if (m) {
      const key = m[1].toLowerCase() as Key;
      if ((KEYS as readonly string[]).includes(key)) {
        (filters[key] ??= []).push(m[2].toLowerCase());
      } else unknown.push(raw);
    } else words.push(raw.toLowerCase());
  }
  return { filters, words, unknown };
}

const field = (p: Project, key: Key): string[] => {
  switch (key) {
    case "domain":
      return p.domains;
    case "status":
      return [p.status];
    case "shelf":
      return [p.shelf];
    case "stack":
      return p.stack.map((s) => s.toLowerCase());
    case "year":
      return [String(p.year)];
    case "role":
      return [p.role.toLowerCase()];
  }
};

export function matches(p: Project, q: Parsed): boolean {
  for (const key of KEYS) {
    const want = q.filters[key];
    if (!want?.length) continue;
    const have = field(p, key);
    const hit = want.some((w) => have.some((h) => (key === "stack" || key === "role" ? h.includes(w) : h === w)));
    if (!hit) return false;
  }
  const hay = `${p.name} ${p.gold} ${p.stack.join(" ")} ${p.repos.map((r) => r.label).join(" ")}`.toLowerCase();
  return q.words.every((w) => hay.includes(w));
}

/** Toggle a key:value token in a query string, keeping everything else. */
export function toggleToken(q: string, key: Key, value: string): string {
  const token = `${key}:${value}`;
  const parts = q.trim().split(/\s+/).filter(Boolean);
  const i = parts.findIndex((t) => t.toLowerCase() === token);
  if (i >= 0) parts.splice(i, 1);
  else parts.push(token);
  return parts.join(" ");
}

export const hasToken = (q: Parsed, key: Key, value: string) => q.filters[key]?.includes(value) ?? false;

const sqlStr = (v: string) => `'${v.replace(/'/g, "''")}'`;

/** The same query written as SQL, shown under the results. */
export function toSql(q: Parsed): string {
  const where: string[] = [];
  for (const key of KEYS) {
    const vals = q.filters[key];
    if (!vals?.length) continue;
    const col = key === "domain" ? "domains" : key;
    if (key === "domain") where.push(vals.map((v) => `${sqlStr(v)} = ANY(domains)`).join(" OR "));
    else if (key === "stack" || key === "role") where.push(vals.map((v) => `${col} ILIKE ${sqlStr(`%${v}%`)}`).join(" OR "));
    else if (vals.length === 1) where.push(`${col} = ${key === "year" ? vals[0] : sqlStr(vals[0])}`);
    else where.push(`${col} IN (${vals.map((v) => (key === "year" ? v : sqlStr(v))).join(", ")})`);
  }
  for (const w of q.words) where.push(`search_text ILIKE ${sqlStr(`%${w}%`)}`);
  const clause = where.length ? `\nWHERE ${where.map((w) => (w.includes(" OR ") ? `(${w})` : w)).join("\n  AND ")}` : "";
  return `SELECT name, status, year\nFROM projects${clause}\nORDER BY shelf, year DESC;`;
}
