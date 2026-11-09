// Silver checks for the site's own claims: fetch each cited file at its pinned
// commit and confirm the claim still holds. Writes src/data/evidence-report.json,
// which the /evidence page shows, and exits non-zero if anything fails, so a
// false claim stops a deploy. Run with `npm run verify`.

import { setDefaultResultOrder } from "node:dns";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { allEvidence, evidenceKey } from "../src/content/projects.ts";

const OUT = join(process.cwd(), "src", "data", "evidence-report.json");

// Some networks resolve GitHub to IPv6 addresses they cannot route; trying IPv4
// first avoids timeouts there and changes nothing where both work.
setDefaultResultOrder("ipv4first");
const HEADERS = { "User-Agent": "refinery-verify", Accept: "application/vnd.github+json" };
if (process.env.GITHUB_TOKEN) HEADERS.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

// Failing to reach GitHub says nothing about a claim, so it is kept apart from
// a claim that was checked and found false.
class Unreachable extends Error {}
let offline = false; // Once GitHub has failed every retry, stop waiting on it.

async function fetchText(url, tries = 4) {
  if (offline) throw new Unreachable("GitHub was unreachable earlier in this run");
  for (let i = 1; ; i++) {
    let res;
    try {
      res = await fetch(url, { headers: HEADERS });
    } catch (err) {
      if (i >= tries) {
        offline = true;
        throw new Unreachable(`could not reach GitHub: ${err.cause?.code ?? err.message}`);
      }
      await new Promise((r) => setTimeout(r, 1000 * i));
      continue;
    }
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
    // A file path counts inside that file; a folder counts across its Python files.
    const files = tree.filter((f) => f.type === "blob" && (f.path === e.path || (f.path.startsWith(`${e.path}/`) && f.path.endsWith(".py"))));
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
let unreachable = 0;
for (const { evidence: e } of allEvidence) {
  try {
    await check(e);
    results[evidenceKey(e)] = { ok: true };
    console.log(`ok    ${e.claim}`);
  } catch (err) {
    if (err instanceof Unreachable) unreachable++;
    failed++;
    results[evidenceKey(e)] = { ok: false, error: err.message };
    console.error(`FAIL  ${e.claim}: ${err.message}`);
  }
}

const total = allEvidence.length;
if (unreachable) {
  // Keep the last good report: an outage must not publish claims as false.
  console.error(`\n${unreachable} of ${total} claims could not be checked; GitHub was unreachable. The last report is unchanged.`);
  process.exit(2);
}
writeFileSync(OUT, `${JSON.stringify({ checkedAt: new Date().toISOString().slice(0, 10), total, passed: total - failed, results }, null, 2)}\n`);
console.log(`\n${total - failed} of ${total} claims verified`);
if (failed) process.exit(1);
