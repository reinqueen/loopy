import { createHash } from "node:crypto";
import type { DemoHistoryEntry, MilestoneDemo } from "./milestone-demo-types.js";

export function demoSnapshot(demo: MilestoneDemo): unknown {
  return {
    id: demo.id, buildId: demo.buildId, definitionId: demo.definitionId, planId: demo.planId,
    candidateId: demo.candidateId, title: demo.title, artifactPath: demo.artifactPath, order: demo.order,
    definitionRevision: demo.definitionRevision, planRevision: demo.planRevision, buildRevision: demo.buildRevision,
    candidateSequence: demo.candidateSequence, sourceFingerprint: demo.sourceFingerprint,
    workspaceFingerprint: demo.workspaceFingerprint, phase: demo.phase, revision: demo.revision, modes: demo.modes,
    method: demo.method, authority: demo.authority, scenarios: demo.scenarios, coverage: demo.coverage,
    whatDemonstrated: demo.whatDemonstrated, observedResult: demo.observedResult, limitations: demo.limitations,
    unproven: demo.unproven, readiness: demo.readiness, evidence: demo.evidence,
    advisoryInputs: demo.advisoryInputs, decision: demo.decision,
  };
}
export function demoSnapshotHash(demo: MilestoneDemo): string { return createHash("sha256").update(JSON.stringify(demoSnapshot(demo))).digest("hex"); }
export function demoHistoryHash(entry: Omit<DemoHistoryEntry, "contentHash">): string { return createHash("sha256").update(JSON.stringify(entry)).digest("hex"); }
