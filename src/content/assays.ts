import type { Evidence, Project } from "./types";
import { allEvidence } from "./projects";

// Figures in the site's prose that a checked claim backs. Wherever one of these
// phrases appears in a sentence, it becomes an assay mark that opens its proof.
const FIGURES: [phrase: string, claim: string][] = [
  ["40,065", "Full extraction coverage report"],
  ["82 monthly threads", "82 months of threads covered"],
  ["19 of 20", "Five-model comparison results"],
  ["36 Zayed University researchers", "36 verified profiles"],
  ["2,097 eligible publications", "36 verified profiles"],
  ["eleven Bronze Delta tables", "Eleven Bronze tables"],
];

export interface Assay {
  phrase: string;
  evidence: Evidence;
  project: Project;
}

export const assays: Assay[] = FIGURES.map(([phrase, claim]) => {
  const hit = allEvidence.find(({ evidence }) => evidence.claim.startsWith(claim));
  if (!hit) throw new Error(`No evidence backs the figure "${phrase}"`);
  return { phrase, ...hit };
});
