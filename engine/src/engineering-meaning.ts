import { createHash } from "node:crypto";
import type {
  EngineeringChangeRevision,
  EngineeringConfirmedRevision,
  EngineeringContent,
  EngineeringFoundationState,
} from "./engineering-types.js";

function hash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export function engineeringMeaning(content: EngineeringContent): unknown {
  const { evidence: _evidence, ...meaning } = content;
  return meaning;
}

export function engineeringMeaningSnapshot(
  source: Pick<EngineeringFoundationState, "engineering" | "decisions" | "responsibilityConfirmations"> |
    Pick<EngineeringConfirmedRevision, "engineering" | "decisions" | "responsibilityConfirmations">,
): unknown {
  return {
    engineering: engineeringMeaning(source.engineering),
    decisions: source.decisions,
    responsibilityConfirmations: source.responsibilityConfirmations,
  };
}

export function engineeringConfirmationHash(
  revision: Omit<EngineeringConfirmedRevision, "contentHash">,
): string {
  return hash(revision);
}

export function engineeringChangeHash(
  revision: Omit<EngineeringChangeRevision, "contentHash">,
): string {
  return hash(revision);
}

export function engineeringChangeSnapshotHash(
  state: Pick<EngineeringFoundationState,
    "productRevision" | "productConfirmationHash" | "engineering" | "decisions" | "contextGrants" | "participantResponsibilities">,
): string {
  return hash({
    productRevision: state.productRevision,
    productConfirmationHash: state.productConfirmationHash,
    engineering: state.engineering,
    decisions: state.decisions,
    contextGrants: state.contextGrants,
    participantResponsibilities: state.participantResponsibilities,
  });
}
