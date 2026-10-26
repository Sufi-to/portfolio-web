// Personal details, from Tomas's GitHub profile README and his answers.
// Fields marked TODO are deliberately empty until Tomas supplies them.

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
  /** TODO: location, education and current role are not yet confirmed. */
  location: null as string | null,
};

/**
 * The hero's raw input: a Hacker News style post written in Tomas's voice.
 * Every statement in it is backed by the GitHub audit. `[[...|field]]` marks
 * the spans the extractor pulls into the structured record.
 */
export const rawPost =
  "hey HN, [[Tomas|name]] here. [[software engineer|role]], mostly [[python|languages]]. lately I pulled [[82 months of who's-hiring threads|evidence]] into [[databricks|stack]] and had LLMs extract skills and salaries, with the SQL shown under every answer. before that, a [[stock research app|evidence]] that throws out any model claim whose source doesn't exist. comfortable in [[FastAPI, LangGraph, Next.js, Postgres + pgvector|stack]]. started out writing a [[unix shell in C|languages]]. say hi: [[3thomas225@gmail.com|contact]]";

/** The structured record the extractor produces, in display order. */
export const extractedRecord: { field: string; label: string; value: string }[] = [
  { field: "name", label: "name", value: "Tomas Teclehaimanot" },
  { field: "role", label: "role", value: "Software engineer" },
  { field: "languages", label: "languages", value: "Python, C" },
  { field: "stack", label: "stack", value: "Databricks, FastAPI, LangGraph, Next.js, Postgres, pgvector" },
  { field: "evidence", label: "shipped", value: "HN Hiring Observatory, FinRadar" },
  { field: "contact", label: "contact", value: "3thomas225@gmail.com" },
];
