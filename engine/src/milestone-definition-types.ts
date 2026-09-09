import type { NextAction } from "./types.js";
import type { DependencyKind } from "./living-roadmap-types.js";

export const DEFINITION_PHASES = ["draft", "blocked", "ready-for-commitment", "committed"] as const;
export const DEFINITION_COHERENCE = ["draft", "blocked", "coherent"] as const;
export const DEFINITION_PERSPECTIVES = ["product", "engineering", "architecture", "demo-quality", "release"] as const;
export const SPECIALIST_MODES = ["blocking", "just-in-time"] as const;

export type DefinitionPhase = (typeof DEFINITION_PHASES)[number];
export type DefinitionPerspective = (typeof DEFINITION_PERSPECTIVES)[number];

export interface DefinitionDependency {
  name: string;
  kind: DependencyKind;
  consequence: "definition" | "implementation";
  note: string;
}

export interface DefinitionUnknown {
  description: string;
  blocking: boolean;
  revisitWhen: string;
}

export interface SpecialistInput {
  perspective: Exclude<DefinitionPerspective, "product" | "engineering">;
  reason: string;
  mode: (typeof SPECIALIST_MODES)[number];
  status: "needed" | "satisfied";
}

export interface DefinitionContent {
  outcome: string;
  requirements: string[];
  currentBehavior: string[];
  intendedBehavior: string[];
  evidence: DefinitionEvidence[];
  reconciliations: DefinitionReconciliation[];
  inScope: string[];
  nonGoals: string[];
  acceptance: string[];
  dependencies: DefinitionDependency[];
  feasibilityAndConstraints: string[];
  risks: string[];
  assumptions: string[];
  unknowns: DefinitionUnknown[];
}

export interface DefinitionEvidence {
  source: string;
  kind: "product-intent" | "engineering-intent" | "code" | "test" | "configuration" | "documentation" | "prior-artifact" | "inference";
  finding: string;
}

export interface DefinitionReconciliation {
  disagreement: string;
  sources: string[];
  status: "resolved" | "unresolved";
  resolution: string;
  material: boolean;
}

export interface DirectDefinitionStart {
  projectName: string;
  participantResponsibilities: string[];
  title: string;
  outcome: string;
  priority: "Highest" | "High" | "Medium" | "Later";
  rationale: string;
  nextShapingStep: string;
  actor: { name: string; responsibility: "product" | "loopy"; intentBasis?: string };
}

export interface DefinitionReceipt {
  perspective: DefinitionPerspective;
  participant: string;
  revision: number;
}

export interface DefinitionHistoryEntry {
  version: number;
  operation: "update" | "review" | "confirm" | "commit" | "interrupt" | "resume" | "change-management";
  summary: string;
  beforeHash: string;
  afterHash: string;
  previousHash: string | null;
  contentHash: string;
}

export interface MilestoneDefinition {
  id: string;
  sourceCandidateId: string;
  sourceCandidateTitle: string;
  selectedBatchVersion: number;
  order: number;
  artifactPath: string;
  phase: DefinitionPhase;
  revision: number;
  reviewedRevision: number | null;
  coherence: { status: (typeof DEFINITION_COHERENCE)[number]; basis: string };
  content: DefinitionContent;
  requiredPerspectives: DefinitionPerspective[];
  receipts: DefinitionReceipt[];
  specialistInputs: SpecialistInput[];
  history: DefinitionHistoryEntry[];
  historyHead: string | null;
}

export interface MilestoneDefinitionState {
  schemaVersion: 1;
  stage: "milestone-definition";
  workspaceClass: "human-project";
  workspaceRoot: string;
  productRevision: number;
  productDraftVersion?: number;
  engineeringRevision: number | null;
  roadmapRevision: number;
  revision: number;
  definitions: MilestoneDefinition[];
  nextActions: NextAction[];
  session: { status: "active" | "interrupted"; resumeAction: string | null };
  generatedViews: Record<string, { revision: number; sha256: string }>;
}

export interface DefinitionUpdate {
  type: "update";
  definitionId: string;
  actor: { name: string; perspectives: DefinitionPerspective[] };
  content?: Partial<DefinitionContent>;
  coherence?: MilestoneDefinition["coherence"];
  requiredPerspectives?: DefinitionPerspective[];
  specialistInputs?: SpecialistInput[];
}

export interface DefinitionCommitRequest {
  definitionId: string;
  participant: string;
  perspectives: DefinitionPerspective[];
  commit: boolean;
}

export interface MilestoneDefinitionContract {
  version: 1;
  id: "milestone-definition";
  source_candidate_state: "Selected for definition";
  direct_entry_bootstraps_existing_state: true;
  product_confirmation_required_for_definition_drafting: false;
  authoritative_delivery_boundary: true;
  semantic_coherence_owned_by_host_ai: true;
  independent_definition_commitment: true;
  same_revision_receipts: true;
  exactly_one_next_action: true;
  append_only_hash_linked_history: true;
  rejected_operations_do_not_mutate: true;
  ordinary_updates_may_defer_publication: true;
  published_revision_metadata_required: true;
  inherited_dependency_kinds_preserved: true;
  later_stages_out_of_scope: true;
}

export type MilestoneDefinitionArtifacts = Record<string, string>;
