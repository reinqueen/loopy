import type { NextAction } from "./types.js";

export const CHANGE_STATUSES = ["draft", "blocked", "ready", "accepted", "rejected", "withdrawn", "deferred", "paused"] as const;
export const CHANGE_PERSPECTIVES = ["product", "engineering", "architecture", "demo-quality", "release"] as const;
export const CHANGE_TARGET_KINDS = ["product", "engineering", "roadmap-candidate", "milestone-definition"] as const;
export const ROUTINE_CATEGORIES = ["typo-grammar", "formatting", "broken-link", "equivalent-wording", "confirmed-synchronization"] as const;

export type ChangeStatus = (typeof CHANGE_STATUSES)[number];
export type ChangePerspective = (typeof CHANGE_PERSPECTIVES)[number];
export type ChangeTargetKind = (typeof CHANGE_TARGET_KINDS)[number];
export type RoutineCategory = (typeof ROUTINE_CATEGORIES)[number];

export interface ChangeTarget {
  kind: ChangeTargetKind;
  targetId?: string;
  field: string;
  baseRevision: number;
  value: unknown;
  artifactPath: string;
  currentMeaning: string;
  proposedMeaning: string;
  baseValueHash?: string;
}

export interface ChangeUnknown {
  description: string;
  blocking: boolean;
  consequence: string;
  revisitWhen: string;
}

export interface ChangeParticipant {
  name: string;
  perspective: ChangePerspective;
}

export interface ChangeReceipt {
  participant: string;
  perspective: ChangePerspective;
  revision: number;
}

export interface ChangeHistoryEntry {
  version: number;
  operation: "create" | "update" | "review" | "agree" | "accept" | "reject" | "withdraw" | "defer" | "pause" | "resume" | "render";
  summary: string;
  beforeHash: string;
  afterHash: string;
  previousHash: string | null;
  contentHash: string;
}

export interface MaterialChange {
  id: string;
  title: string;
  artifactPath: string;
  status: ChangeStatus;
  revision: number;
  reviewedRevision: number | null;
  reason: string;
  targets: ChangeTarget[];
  downstreamConsequences: string[];
  unaffectedWork: string[];
  participants: ChangeParticipant[];
  unknowns: ChangeUnknown[];
  deferrals: string[];
  requiredPerspectives: ChangePerspective[];
  receipts: ChangeReceipt[];
  coherence: { status: "draft" | "blocked" | "coherent"; basis: string };
  authorityRequested: string;
  earliestStage: "product-start" | "engineering-foundation" | "living-roadmap" | "milestone-definition";
  nextAction: NextAction;
  dispositionReason: string;
  history: ChangeHistoryEntry[];
  historyHead: string | null;
}

export interface RoutineChangeRecord {
  version: number;
  category: RoutineCategory;
  summary: string;
  classificationBasis: string;
  target: ChangeTarget;
  actor: string;
  stateHash: string;
  previousHash: string | null;
  contentHash: string;
}

export interface ChangeManagementState {
  schemaVersion: 1;
  stage: "change-management";
  workspaceClass: "human-project";
  workspaceRoot: string;
  revision: number;
  nextChangeNumber: number;
  changes: MaterialChange[];
  routineHistory: RoutineChangeRecord[];
  routineHistoryHead: string | null;
  nextActions: NextAction[];
  session: { status: "active" | "interrupted"; changeId: string | null; resumeAction: string | null };
  generatedViews: Record<string, { revision: number; sha256: string }>;
}

export interface CreateMaterialChange {
  title: string;
  reason: string;
  targets: ChangeTarget[];
  downstreamConsequences: string[];
  unaffectedWork: string[];
  participants: ChangeParticipant[];
  unknowns: ChangeUnknown[];
  deferrals: string[];
  requiredPerspectives: ChangePerspective[];
  coherence: MaterialChange["coherence"];
  authorityRequested: string;
  earliestStage: MaterialChange["earliestStage"];
  nextAction: NextAction;
}

export interface UpdateMaterialChange extends Partial<Omit<CreateMaterialChange, "title">> {
  changeId: string;
}

export interface ChangeDecision {
  changeId: string;
  participant: string;
  perspectives: ChangePerspective[];
  decision: "accept" | "reject" | "withdraw" | "defer";
  basis: string;
  reason?: string;
  explicitlyRepresents?: ChangePerspective[];
}

export interface RoutineChangeRequest {
  category: RoutineCategory;
  summary: string;
  actor: string;
  meaningPreserved: true;
  meaningUncertainty: "none";
  classificationBasis: string;
  target: ChangeTarget;
}

export interface ChangeManagementContract {
  version: 1;
  id: "change-management";
  proposal_is_not_canonical: true;
  exact_base_revisions: true;
  no_partial_acceptance: true;
  natural_language_authority: true;
  one_acceptance_reconciles: true;
  affected_only_atomic_reconciliation: true;
  overlapping_changes_are_ordered: true;
  append_only_hash_linked_history: true;
  ordinary_updates_may_defer_publication: true;
  rejected_operations_do_not_mutate: true;
  later_stages_out_of_scope: true;
  routine_requires_resolved_meaning_declaration: true;
}

export type ChangeManagementArtifacts = Record<string, string>;
