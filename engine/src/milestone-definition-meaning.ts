import { createHash } from "node:crypto";
import type { DefinitionHistoryEntry, MilestoneDefinition } from "./milestone-definition-types.js";

export function definitionSnapshot(definition: MilestoneDefinition): unknown {
  return {
    sourceCandidateId: definition.sourceCandidateId,
    artifactPath: definition.artifactPath,
    phase: definition.phase,
    revision: definition.revision,
    reviewedRevision: definition.reviewedRevision,
    coherence: definition.coherence,
    content: definition.content,
    requiredPerspectives: definition.requiredPerspectives,
    receipts: definition.receipts,
    specialistInputs: definition.specialistInputs,
  };
}

export function definitionSnapshotHash(definition: MilestoneDefinition): string {
  return createHash("sha256").update(JSON.stringify(definitionSnapshot(definition))).digest("hex");
}

export function definitionHistoryHash(entry: Omit<DefinitionHistoryEntry, "contentHash">): string {
  return createHash("sha256").update(JSON.stringify(entry)).digest("hex");
}
