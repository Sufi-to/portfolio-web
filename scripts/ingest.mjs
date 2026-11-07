// Bronze ingestion: read real git history and profile data from Tomas's
// GitHub and write a small, committed JSON snapshot the site refines into the
// commit timeline and the About page. Run with `npm run ingest`; the site never fetches GitHub at runtime.
//
// Only commits authored under Tomas's own identities are counted.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const CACHE = join(process.cwd(), ".cache", "repos");
const OUT = join(process.cwd(), "src", "data", "bronze.json");

// Author names Tomas has committed under (verified in the audit).
const IDENTITY = /^(Sufi-to|Tomas Teclehaimanot|Tomas Debrezion|Tomas Tecle)$/;

// The strata repositories belong to on the timeline. Repositories not listed
// here are found on GitHub and placed by language and subject (see stratumFor).
const STRATA = {
  "Sufi-to/simple_shell": "systems",
  "Sufi-to/sorting_algorithms": "systems",
  "Sufi-to/alx-low_level_programming": "systems",
  "Sufi-to/libft": "systems",
  "Sufi-to/ft_printf": "systems",
  "Sufi-to/django_ecommerce_project": "web",
  "Sufi-to/alx-higher_level_programming": "web",
  "Sufi-to/alx-system_engineering-devops": "web",
  "Sufi-to/AirBnB_clone_v2": "web",
  "Sufi-to/AirBnB_clone_v4": "web",
  "Sufi-to/Enmar-": "web",
  "Sufi-to/alx-backend-storage": "web",
  "Sufi-to/alx-backend-python": "web",
  "Sufi-to/alx-backend-user-data": "web",
  "Sufi-to/alx-backend-javascript": "web",
  "Sufi-to/alx-backend": "web",
  "Sufi-to/alx-files_manager": "web",
  "Sufi-to/alx-interview": "web",
  "Sufi-to/Subscription_tracker_api": "web",
  "Sufi-to/portfolio-web": "web",
  "Sufi-to/prompt-engineering": "ai",
  "Sufi-to/Object_detection_with_approximate_valuations": "ai",
  "Sufi-to/Rule_based_credit_scoring_payslip": "ai",
  "Sufi-to/FinRadar": "ai",
  "Sufi-to/EndToEndRag": "ai",
  "Sufi-to/research_match": "ai",
  "Sufi-to/hn-hiring-observatory": "ai",
};

// Work kept under other accounts: team repositories Tomas committed to.
const COLLABORATIONS = {
  "NeftalemMG/TooB": "web",
  "MIT-Emerging-Talent/ET6-CDSP-group-06-repo": "ai",
};

// Profile and repository repos that hold no project work.
const SKIP = new Set(["Sufi-to/Sufi-to", "Sufi-to/Sufi-to_"]);

const AI_WORDS = /databricks|rag|llm|ai|ml|data|match|research|radar|credit|detect|prompt|observ|vector|embed/i;
const stratumFor = (repo) =>
  STRATA[repo.full_name] ??
  (repo.language === "C" ? "systems" : AI_WORDS.test(`${repo.name} ${repo.description ?? ""}`) ? "ai" : "web");

// A token raises GitHub's rate limit; CI provides one, locally the gh CLI can.
const token =
  process.env.GITHUB_TOKEN ??
  (() => {
    try {
      return execFileSync("gh", ["auth", "token"], { encoding: "utf8" }).trim();
    } catch {
      return "";
    }
  })();

async function api(path) {
  const res = await fetch(`https://api.github.com/${path}`, {
    headers: { Accept: "application/vnd.github+json", "User-Agent": "refinery-ingest", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error(`${res.status} from ${path}`);
  return res.json();
}

const user = await api("users/Sufi-to");
const owned = (await api("users/Sufi-to/repos?per_page=100&type=owner")).filter((r) => !r.fork && !r.private && !SKIP.has(r.full_name));
const REPOS = [...owned.map((r) => [r.full_name, stratumFor(r)]), ...Object.entries(COLLABORATIONS)];

// Language totals over Tomas's own public repositories, in bytes of code.
const languages = new Map();
for (const r of owned) {
  for (const [name, bytes] of Object.entries(await api(`repos/${r.full_name}/languages`))) languages.set(name, (languages.get(name) ?? 0) + bytes);
}
const languageBytes = [...languages.values()].reduce((a, b) => a + b, 0);

const git = (args, cwd) =>
  execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

mkdirSync(CACHE, { recursive: true });

const months = new Map(); // "YYYY-MM" -> { systems, web, ai, repos:Set }
const repos = [];

for (const [full, stratum] of REPOS) {
  const dir = join(CACHE, full.replace("/", "__") + ".git");
  try {
    if (existsSync(dir)) git(["fetch", "--quiet", "origin", "+refs/heads/*:refs/heads/*"], dir);
    else git(["clone", "--quiet", "--bare", "--filter=blob:none", `https://github.com/${full}.git`, dir]);
  } catch (err) {
    console.warn(`skip ${full}: ${String(err.stderr || err.message).trim()}`);
    continue;
  }
  const log = git(["log", "--all", "--format=%an\t%ad", "--date=short"], dir)
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((l) => l.split("\t"))
    .filter(([author]) => IDENTITY.test(author));

  if (!log.length) continue;
  const dates = log.map(([, d]) => d).sort();
  repos.push({ repo: full, stratum, commits: log.length, first: dates[0], last: dates.at(-1) });

  for (const [, date] of log) {
    const key = date.slice(0, 7);
    const m = months.get(key) ?? { systems: 0, web: 0, ai: 0, repos: new Set() };
    m[stratum] += 1;
    m.repos.add(full.split("/")[1]);
    months.set(key, m);
  }
}

// Fill every month between the first and last commit so gaps show as gaps.
const keys = [...months.keys()].sort();
const [y0, m0] = keys[0].split("-").map(Number);
const [y1, m1] = keys.at(-1).split("-").map(Number);
const series = [];
for (let y = y0, m = m0; y < y1 || (y === y1 && m <= m1); m === 12 ? (y++, (m = 1)) : m++) {
  const key = `${y}-${String(m).padStart(2, "0")}`;
  const v = months.get(key);
  series.push({
    month: key,
    systems: v?.systems ?? 0,
    web: v?.web ?? 0,
    ai: v?.ai ?? 0,
    repos: v ? [...v.repos].sort() : [],
  });
}

const snapshot = {
  generatedAt: new Date().toISOString().slice(0, 10),
  github: {
    location: user.location,
    affiliation: user.company,
    hireable: user.hireable === true,
    ownPublicRepos: owned.length,
    languages: [...languages]
      .sort((x, y) => y[1] - x[1])
      .slice(0, 8)
      .map(([name, bytes]) => ({ name, share: Math.round((bytes / languageBytes) * 1000) / 10 })),
  },
  identities: IDENTITY.source,
  totalCommits: repos.reduce((s, r) => s + r.commits, 0),
  repos: repos.sort((a, b) => a.first.localeCompare(b.first)),
  months: series,
};

mkdirSync(join(process.cwd(), "src", "data"), { recursive: true });
writeFileSync(OUT, JSON.stringify(snapshot, null, 2) + "\n");
console.log(`wrote ${OUT}: ${snapshot.totalCommits} commits across ${repos.length} repos, ${series.length} months`);
