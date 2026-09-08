import type { NextAction } from "./types.js";

export const ROADMAP_PRIORITIES = ["Highest", "High", "Medium", "Later"] as const;
export const CANDIDATE_STATES = ["Open", "Selected for definition", "Deferred", "Cancelled", "Superseded"] as const;
export const DEPENDENCY_KINDS = ["required-before", "helpful-non-blocking", "independent-potentially-parallel"] as const;
export const DEPENDENCY_BOUNDARIES = ["definition", "implementation"] as const;
export const ROADMAP_SESSION_STATUSES = ["active", "interrupted"] as const;
export const ROADMAP_RESPONSIBILITIES = ["product", "engineering", "loopy"] as const;
export const ROADMAP_OPERATION_TYPES = ["add", "rename", "combine", "split", "prioritize", "defer", "cancel", "supersede", "set-dependencies", "set-blockers", "record-participation", "select", "reconcile-product"] as const;

export type RoadmapPriority = (typeof ROADMAP_PRIORITIES)[number];
export type CandidateState = (typeof CANDIDATE_STATES)[number];
export type DependencyKind = (typeof DEPENDENCY_KINDS)[number];
export type DependencyBoundary = (typeof DEPENDENCY_BOUNDARIES)[number];
export type RoadmapResponsibility = (typeof ROADMAP_RESPONSIBILITIES)[number];

export interface CandidateDependency {
  candidateId?: string;
  external?: string;
  kind: DependencyKind;
  boundary: DependencyBoundary;
  note: string;
  recommendedBy: "Product" | "Engineering";
}

export interface CandidateBlocker {
  reason: string;
  responsibility: "Product" | "Engineering";
  blocksDefinition: boolean;
}

export interface RoadmapParticipant {
  name: string;
  responsibility: string;
}

export interface CandidateLineage {
  relation: "combined-from" | "split-from" | "supersedes" | "superseded-from";
  candidateIds: string[];
}

export interface LivingRoadmapCandidate {
  id: string;
  title: string;
  outcome: string;
  priority: RoadmapPriority;
  order: number;
  rationale: string;
  state: CandidateState;
  dependencies: CandidateDependency[];
  unresolvedDependencyNotes: string[];
  blockers: CandidateBlocker[];
  nextShapingStep: string;
  participants: RoadmapParticipant[];
  lineage: CandidateLineage[];
  dispositionReason: string;
  reconsiderWhen: string;
}

export interface SelectedBatch {
  version: number;
  candidateIds: string[];
}

export interface LivingRoadmapHistoryEntry {
  version: number;
  operation: RoadmapOperation["type"] | "interrupt" | "resume" | "change-management";
  summary: string;
  beforeHash: string;
  afterHash: string;
  previousHash: string | null;
  contentHash: string;
}

export interface LivingRoadmapState {
  schemaVersion: 1;
  stage: "living-roadmap";
  workspaceClass: "human-project";
  workspaceRoot: string;
  productRevision: number;
  revision: number;
  nextCandidateNumber: number;
  candidates: LivingRoadmapCandidate[];
  selectedBatches: SelectedBatch[];
  nextActions: NextAction[];
  session: { status: (typeof ROADMAP_SESSION_STATUSES)[number]; resumeAction: string | null };
  history: LivingRoadmapHistoryEntry[];
  historyHead: string | null;
  generatedViews: Record<string, { revision: number; sha256: string }>;
}

interface Actor {
  actor: { name: string; responsibility: RoadmapResponsibility; intentBasis?: string };
}

export type RoadmapOperation = Actor & (
  | { type: "add"; candidate: { title: string; outcome: string; priority: RoadmapPriority; rationale: string; nextShapingStep: string } }
  | { type: "rename"; candidateId: string; title: string }
  | { type: "combine"; candidateIds: string[]; candidate: { title: string; outcome: string; priority: RoadmapPriority; rationale: string; nextShapingStep: string } }
  | { type: "split"; candidateId: string; candidates: Array<{ title: string; outcome: string; priority: RoadmapPriority; rationale: string; nextShapingStep: string }> }
  | { type: "prioritize"; candidateId: string; priority: RoadmapPriority; order: number }
  | { type: "defer"; candidateId: string; reason: string; reconsiderWhen: string }
  | { type: "cancel"; candidateId: string; reason: string }
  | { type: "supersede"; candidateId: string; replacementCandidateId: string; reason: string }
  | { type: "set-dependencies"; candidateId: string; dependencies: CandidateDependency[] }
  | { type: "set-blockers"; candidateId: string; blockers: CandidateBlocker[] }
  | { type: "record-participation"; candidateId: string; participants: RoadmapParticipant[] }
  | { type: "select"; candidateIds: string[] }
  | { type: "reconcile-product" }
);

export interface LivingRoadmapContract {
  version: 1;
  id: "living-roadmap-management";
  required_product_phase: "product-foundation-confirmed";
  generated_artifacts: ["LOOPY.md", "docs/loopy/Roadmap.md"];
  priority_order: RoadmapPriority[];
  candidate_states: CandidateState[];
  dependency_kinds: DependencyKind[];
  dependency_boundaries: DependencyBoundary[];
  multi_selection_atomic: true;
  candidates_remain_uncommitted: true;
  implementation_workspace_out_of_scope: true;
  append_only_hash_linked_history: true;
  rejected_operations_do_not_mutate: true;
}

export type LivingRoadmapRenderedArtifacts = Pick<Record<"LOOPY.md" | "docs/loopy/Roadmap.md", string>, "LOOPY.md" | "docs/loopy/Roadmap.md">;
