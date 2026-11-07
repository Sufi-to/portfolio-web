// Content model. Presentation components read these types; adding a project
// means adding one object to projects.ts, nothing else.

export type Depth = "gold" | "silver" | "bronze";

export type Domain = "ai" | "data" | "backend" | "fullstack" | "systems";

export type Status =
  | "shipped" // complete and deployed or runnable end to end
  | "prototype" // works, with known gaps that are stated
  | "coursework" // built inside a programme or bootcamp
  | "archived"; // older work kept for context

export type Shelf = "featured" | "lab" | "archive" | "foundations";

/** A checkable claim: words on the site plus the exact place in a repo that proves it. */
export interface Evidence {
  claim: string;
  repo: string; // "owner/name"
  path: string;
  line?: number;
  sha: string;
  /** Text that must appear at that line, or in the file when there is no line. */
  expect: string;
  /** For a claim about a whole folder: how many times a pattern must occur in it. */
  count?: { pattern: string; equals: number };
  /** Regex sources that must match the file's list exactly. */
  patterns?: readonly string[];
}

/** One of the project's own images, shown as it was recorded. */
export interface Media {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface DiagramNode {
  id: string;
  label: string;
  /** Optional second line, kept short. */
  sub?: string;
  /** Column and row on a coarse grid; the renderer turns these into pixels. */
  col: number;
  row: number;
  kind?: "external" | "store" | "guard" | "model" | "service";
}

export interface DiagramScenario {
  id: string;
  label: string;
  /** Node ids in the order a request visits them. */
  path: string[];
  /** Node where the request stops early, drawn as a rejection. */
  stopsAt?: string;
  /** Optional example input shown while the trace runs. */
  sample?: string;
  outcome: string;
}

export interface Diagram {
  cols: number;
  rows: number;
  nodes: DiagramNode[];
  /** Directed edges as [from, to]. */
  edges: [string, string][];
  scenarios: DiagramScenario[];
}

export interface Project {
  slug: string;
  /** Display name on the site (may differ from the repo name). */
  name: string;
  shelf: Shelf;
  domains: Domain[];
  status: Status;
  year: number;
  role: string;
  stack: string[];
  repos: { label: string; url: string }[];
  /** Gold: one sentence a recruiter can read in five seconds. */
  gold: string;
  /** Silver: the problem, the build, the decisions. */
  silver?: {
    problem: string;
    build: string;
    decisions: { title: string; body: string }[];
    boundaries: string[];
  };
  /** Bronze: claims with file and line references. */
  evidence?: Evidence[];
  diagram?: Diagram;
  media?: Media[];
  /** When the media was recorded, shown beside it. */
  mediaDate?: string;
}
