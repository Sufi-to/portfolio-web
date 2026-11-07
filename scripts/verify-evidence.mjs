// Silver checks for the site's own claims: fetch each cited file at its pinned
// commit and confirm the claim still holds. Writes src/data/evidence-report.json,
// which the /evidence page shows, and exits non-zero if anything fails, so a
// false claim stops a deploy. Run with `npm run verify`.

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { allEvidence, evidenceKey } from "../src/content/projects.ts";

const OUT = join(process.cwd(), "src", "data", "evidence-report.json");
const HEADERS = { "User-Agent": "refinery-verify", Accept: "application/vnd.github+json" };
if (process.env.GITHUB_TOKEN) HEADERS.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

async function fetchText(url, tries = 3) {
  for (let i = 1; ; i++) {
    const res = await fetch(url, { headers: HEADERS });
    if (res.ok) return res.text();
    if (res.status === 404 || i >= tries) throw new Error(`${res.status} from ${url}`);
    await new Promise((r) => setTimeout(r, 1000 * i));
  }
}

const raw = (e, path = e.path) => fetchText(`https://raw.githubusercontent.com/${e.repo}/${e.sha}/${path}`);

// Python regex strings in a named list, as written in the source.
const pythonList = (text, name) => {
  const start = text.indexOf(`${name} = [`);
  if (start < 0) throw new Error(`no ${name} list`);
  const block = text.slice(start, text.indexOf("]\n", start));
  return [...block.matchAll(/r"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]);
};

async function check(e) {
  if (e.count) {
    const tree = JSON.parse(await fetchText(`https://api.github.com/repos/${e.repo}/git/trees/${e.sha}?recursive=1`)).tree;
    const files = tree.filter((f) => f.type === "blob" && f.path.startsWith(`${e.path}/`) && f.path.endsWith(".py"));
    const texts = await Promise.all(files.map((f) => raw(e, f.path)));
    const found = texts.reduce((n, t) => n + t.split(e.count.pattern).length - 1, 0);
    if (found !== e.count.equals) throw new Error(`expected ${e.count.equals} of "${e.count.pattern}", found ${found}`);
    return;
  }
  const text = await raw(e);
  const where = e.line ? text.split("\n")[e.line - 1] ?? "" : text;
  if (!where.includes(e.expect)) throw new Error(`"${e.expect}" not found${e.line ? ` at line ${e.line}` : ""}`);
  if (e.patterns) {
    const source = pythonList(text, "INJECTION_PATTERNS");
    if (JSON.stringify(source) !== JSON.stringify([...e.patterns])) throw new Error("patterns differ from the source");
  }
}

const results = {};
let failed = 0;
for (const { evidence: e } of allEvidence) {
  try {
    await check(e);
    results[evidenceKey(e)] = { ok: true };
    console.log(`ok    ${e.claim}`);
  } catch (err) {
    failed++;
    results[evidenceKey(e)] = { ok: false, error: err.message };
    console.error(`FAIL  ${e.claim}: ${err.message}`);
  }
}

const total = allEvidence.length;
writeFileSync(OUT, `${JSON.stringify({ checkedAt: new Date().toISOString().slice(0, 10), total, passed: total - failed, results }, null, 2)}\n`);
console.log(`\n${total - failed} of ${total} claims verified`);
if (failed) process.exit(1);
