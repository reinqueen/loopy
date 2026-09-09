import { createHash } from "node:crypto";
import type { LivingRoadmapHistoryEntry, LivingRoadmapState } from "./living-roadmap-types.js";

export function livingRoadmapSnapshot(state: LivingRoadmapState): unknown {
  return {
    productRevision: state.productRevision,
    productDraftVersion: state.productDraftVersion,
    nextCandidateNumber: state.nextCandidateNumber,
    candidates: state.candidates,
    selectedBatches: state.selectedBatches,
    nextActions: state.nextActions,
    session: state.session,
  };
}

export function livingRoadmapSnapshotHash(state: LivingRoadmapState): string {
  return createHash("sha256").update(JSON.stringify(livingRoadmapSnapshot(state))).digest("hex");
}

export function livingRoadmapHistoryHash(entry: Omit<LivingRoadmapHistoryEntry, "contentHash">): string {
  return createHash("sha256").update(JSON.stringify(entry)).digest("hex");
}
