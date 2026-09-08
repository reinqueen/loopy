import { createHash } from "node:crypto";
import type { ConfirmedRevision, ProductStartState, RoadmapRevision } from "./types.js";

type MeaningSource = Pick<
  ProductStartState,
  "product" | "decisions" | "conditionalDecisions" | "contextGrants" | "roadmap" |
  "responsibilityConfirmations"
> | Pick<
  ConfirmedRevision,
  "product" | "decisions" | "conditionalDecisions" | "contextGrants" | "roadmap" |
  "responsibilityConfirmations"
>;

export function productMeaningSnapshot(source: MeaningSource): unknown {
  const { product, decisions, conditionalDecisions, contextGrants, roadmap, responsibilityConfirmations } = source;
  return {
    product,
    contextGrants,
    decisions: Object.fromEntries(
      Object.entries(decisions).filter(([topic]) => topic !== "roadmap_state"),
    ),
    conditionalDecisions,
    roadmap: { ...roadmap, candidates: [] },
    responsibilityConfirmations,
  };
}

type RevisionHashInput = Omit<ConfirmedRevision, "contentHash">;

export function confirmationRevisionHash(revision: RevisionHashInput): string {
  return createHash("sha256").update(JSON.stringify(revision)).digest("hex");
}

type RoadmapHashInput = Omit<RoadmapRevision, "contentHash">;

export function roadmapRevisionHash(revision: RoadmapHashInput): string {
  return createHash("sha256").update(JSON.stringify(revision)).digest("hex");
}
