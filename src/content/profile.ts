// Personal details, from Tomas's GitHub profile and his answers. Location,
// affiliation and availability are read from GitHub by scripts/ingest.mjs.

import bronze from "@/data/bronze.json";

export const profile = {
  name: "Tomas Teclehaimanot",
  shortName: "Tomas",
  role: "Software engineer, AI and data",
  email: "3thomas225@gmail.com",
  github: "https://github.com/Sufi-to",
  githubHandle: "Sufi-to",
  linkedin: "https://www.linkedin.com/in/tomas-teclehaimanot",
  /** TODO: add when Tomas uploads it; the link stays hidden while null. */
  cvUrl: null as string | null,
  location: bronze.github.location,
  /** As listed on GitHub; the profile doesn't say whether this is study or work. */
  affiliation: bronze.github.affiliation,
  /** GitHub's "available for hire" setting. */
  available: bronze.github.hireable,
};

/**
 * The hero's raw input: a Hacker News style post written in Tomas's voice.
 * Every statement in it is backed by the GitHub audit. `[[...|field]]` marks
 * the spans the extractor pulls into the structured record.
 */
export const rawPost =
  "hey HN, [[Tomas|name]] here, [[software engineer|role]] [[based in abu dhabi|location]]. mostly [[python|languages]], some [[typescript|languages]]. lately I built a [[researcher-matching pipeline|evidence]] on [[databricks|stack]] and pulled [[82 months of who's-hiring threads|evidence]] through LLM extraction, with the SQL shown under every answer. comfortable in [[FastAPI, LangGraph, Next.js, Postgres + pgvector|stack]]. started out writing a [[unix shell in C|languages]]. say hi: [[3thomas225@gmail.com|contact]]";

/** The structured record the extractor produces, in display order. */
export const extractedRecord: { field: string; label: string; value: string }[] = [
  { field: "name", label: "name", value: "Tomas Teclehaimanot" },
  { field: "role", label: "role", value: "Software engineer" },
  { field: "location", label: "location", value: "Abu Dhabi" },
  { field: "languages", label: "languages", value: "Python, TypeScript, C" },
  { field: "stack", label: "stack", value: "Databricks, FastAPI, LangGraph, Next.js, Postgres, pgvector" },
  { field: "evidence", label: "shipped", value: "ResearchMatch, HN Hiring Observatory" },
  { field: "contact", label: "contact", value: "3thomas225@gmail.com" },
];
