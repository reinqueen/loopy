import type { NextAction } from "./types.js";

export const DEMO_PHASES = ["preparing", "active", "ready-for-judgment", "blocked", "paused", "correction-requested", "deferred", "accepted"] as const;
export const DEMO_MODES = ["human-guided", "ai-operated-recorded"] as const;
export const DEMO_SCENARIO_STATUSES = ["planned", "in-progress", "demonstrated", "failed", "inaccessible", "unproven"] as const;
export const DEMO_COVERAGE_STATUSES = ["demonstrated", "failed", "deferred", "inaccessible", "unproven"] as const;
export type DemoPhase = (typeof DEMO_PHASES)[number];
export type DemoMode = (typeof DEMO_MODES)[number];
export type DemoScenarioStatus = (typeof DEMO_SCENARIO_STATUSES)[number];
export type DemoCoverageStatus = (typeof DEMO_COVERAGE_STATUSES)[number];

export interface DemoMethod { surface: string; summary: string; basis: string }
export interface DemoEnvironment { name: string; fingerprint: string }
export interface DemoTarget { name: string; fingerprint: string; verificationBasis: string }
export interface DemoAuthority {
  participant: string;
  perspectiveContext: string;
  candidateId: string;
  sourceFingerprint: string;
  workspaceFingerprint: string;
  environment: DemoEnvironment;
  target: DemoTarget;
  tools: string[];
  actions: string[];
  scope: string[];
  externalSystems: string[];
  externalEffects: string[];
  consequentialPermissions: string[];
  accessibilityNeeds: string[];
  productMutationAllowed: false;
}
export interface DemoEvidenceInput { key: string; kind: "command" | "output" | "log" | "screenshot" | "recording" | "observation" | "link"; summary: string; reference: string; referenceKind: "workspace-file" | "durable-uri" | "ephemeral"; fingerprint: string; result: "passed" | "failed" | "partial" | "unproven"; operator: "human" | "host-ai"; tool: string | null; action: string; externalSystem: string | null }
export interface DemoEvidence extends Omit<DemoEvidenceInput, "key"> { id: string; accessibility: "inspectable" | "inaccessible"; scenarioKey: string; candidateId: string; environmentFingerprint: string; targetFingerprint: string }
export interface DemoScenarioDefinition { key: string; title: string; whatToObserve: string; mode: DemoMode; replayable: boolean; order: number }
export interface DemoScenario extends DemoScenarioDefinition { status: DemoScenarioStatus; result: string; evidenceIds: string[]; limitations: string[]; partialEffects: string[] }
export interface DemoCoverage { criterion: string; status: DemoCoverageStatus; scenarioKeys: string[]; evidenceIds: string[]; note: string }
export interface DemoReadiness { status: "active" | "ready-for-judgment" | "blocked"; basis: string }
export interface DemoDecisionReceipt { human: string; perspectiveContext: string; naturalLanguageIntent: string; personalJudgment: true; candidateId: string; demoRevision: number; decision: "accept" | "request-correction" | "defer"; acceptedOutcome: string | null; acceptedBoundary: string[]; correctionRoute: "build" | "planning" | "change-management" | null; reason: string; revisitWhen: string | null }
export interface DemoAdvisoryInput { participant: string; actorKind: "simulated-participant" | "proxy-ai"; perspectiveContext: string; naturalLanguageInput: string; recommendation: "accept" | "request-correction" | "defer"; personalJudgment: false; demoRevision: number }
export interface DemoHistoryEntry { version: number; operation: "activate" | "authorize" | "observe" | "assessment" | "accept" | "correction" | "defer" | "block" | "pause" | "resume"; summary: string; beforeHash: string; afterHash: string; previousHash: string | null; contentHash: string }
export interface MilestoneDemo {
  id: string;
  buildId: string;
  definitionId: string;
  planId: string;
  candidateId: string;
  title: string;
  artifactPath: string;
  order: number;
  definitionRevision: number;
  planRevision: number;
  buildRevision: number;
  candidateSequence: number;
  sourceFingerprint: string;
  workspaceFingerprint: string;
  phase: DemoPhase;
  revision: number;
  modes: DemoMode[];
  method: DemoMethod;
  authority: DemoAuthority;
  scenarios: DemoScenario[];
  coverage: DemoCoverage[];
  whatDemonstrated: string;
  observedResult: string;
  limitations: string[];
  unproven: string[];
  readiness: DemoReadiness;
  evidence: DemoEvidence[];
  advisoryInputs: DemoAdvisoryInput[];
  decision: DemoDecisionReceipt | null;
  history: DemoHistoryEntry[];
  historyHead: string | null;
}
export interface MilestoneDemoState { schemaVersion: 1; stage: "milestone-demonstrate-and-accept"; workspaceClass: "human-project"; workspaceRoot: string; productRevision: number; engineeringRevision: number | null; roadmapRevision: number; definitionStateRevision: number; planningStateRevision: number; buildStateRevision: number; changeRevision: number | null; revision: number; demos: MilestoneDemo[]; nextActions: NextAction[]; session: { status: "active" | "interrupted"; demoId: string | null; resumeAction: string | null; resumePhase: "preparing" | "active" | "ready-for-judgment" | null }; generatedViews: Record<string, { revision: number; sha256: string }> }
export interface DemoActivation { buildId: string; candidateId: string; modes: DemoMode[]; method: DemoMethod; authority: DemoAuthority; scenarios: DemoScenarioDefinition[] }
export interface DemoAuthorization { demoId: string; explicitAuthorization: true; authority: DemoAuthority; reason: string }
export interface DemoObservation { demoId: string; sourceFingerprint: string; workspaceFingerprint: string; environmentFingerprint: string; targetVerification: { expectedTargetFingerprint: string; observedTargetFingerprint: string; method: string; evidenceIds: string[] }; productMutation: "none"; scenario: { key: string; status: DemoScenarioStatus; result: string; limitations: string[]; partialEffects: string[] }; evidence: DemoEvidenceInput[]; coverage: DemoCoverage[]; whatDemonstrated: string; observedResult: string; limitations: string[]; unproven: string[]; readiness: DemoReadiness }
export interface DemoDecision { demoId: string; candidateId: string; sourceFingerprint: string; workspaceFingerprint: string; environmentFingerprint: string; reviewedRevision: number; actorKind: "human" | "simulated-participant" | "proxy-ai"; participant: string; perspectiveContext: string; personalJudgment: boolean; naturalLanguageIntent: string; decision: "accept" | "request-correction" | "defer"; acceptedOutcome?: string; acceptedBoundary?: string[]; correctionRoute?: "build" | "planning" | "change-management"; reason: string; revisitWhen?: string }
export interface DemoBlock { demoId: string; reason: string; nextParticipant: string; nextAction: string }
export interface DemoResume { sourceFingerprint: string; workspaceFingerprint: string; environmentFingerprint: string; restartScenarioKeys: string[] }
export interface MilestoneDemoContract { version: 1; id: "milestone-demonstrate-and-accept"; exact_ready_candidate_required: true; current_definition_plan_proof_anchors_required: true; verified_demo_target_required: true; durable_evidence_references_required: true; human_guided_and_recorded_modes: true; surface_appropriate_method_owned_by_host_ai: true; exact_authority_reuse_only: true; product_mutation_forbidden: true; proxy_ai_cannot_accept: true; simulated_input_is_not_human_judgment: true; flexible_human_perspective: true; natural_language_human_judgment: true; evidence_proof_demo_acceptance_distinct: true; atomic_complete_unreleased_transition: true; append_only_hash_linked_history: true; ordinary_updates_may_defer_publication: true; rejected_operations_do_not_mutate: true; exactly_one_next_action: true; release_authority_out_of_scope: true }
export type MilestoneDemoArtifacts = Record<string, string>;
