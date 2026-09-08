import { createHash } from "node:crypto";
import type { ChangeHistoryEntry, MaterialChange, RoutineChangeRecord } from "./change-management-types.js";

export function changeSnapshot(change: MaterialChange): unknown {
  return {
    title: change.title, artifactPath: change.artifactPath, status: change.status, revision: change.revision,
    reviewedRevision: change.reviewedRevision, reason: change.reason, targets: change.targets,
    downstreamConsequences: change.downstreamConsequences, unaffectedWork: change.unaffectedWork,
    participants: change.participants, unknowns: change.unknowns, deferrals: change.deferrals,
    requiredPerspectives: change.requiredPerspectives, receipts: change.receipts, coherence: change.coherence,
    authorityRequested: change.authorityRequested, earliestStage: change.earliestStage,
    nextAction: change.nextAction, dispositionReason: change.dispositionReason,
  };
}
export function changeSnapshotHash(change: MaterialChange): string {
  return createHash("sha256").update(JSON.stringify(changeSnapshot(change))).digest("hex");
}
export function changeHistoryHash(entry: Omit<ChangeHistoryEntry, "contentHash">): string {
  return createHash("sha256").update(JSON.stringify(entry)).digest("hex");
}
export function routineHistoryHash(entry: Omit<RoutineChangeRecord, "contentHash">): string {
  return createHash("sha256").update(JSON.stringify(entry)).digest("hex");
}
