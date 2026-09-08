export const ESSENTIAL_DECISIONS = [
  "purpose",
  "people_and_need",
  "outcome",
  "evidence_and_intent",
  "boundaries",
  "success",
  "roadmap_state",
] as const;

export const SUPPORTING_DECISIONS = ["uncertainty"] as const;

export const CONDITIONAL_DECISIONS = [
  "context_conflict",
  "multiple_audiences",
  "external_promise",
  "high_consequence_use",
  "replacement_or_migration",
] as const;

export const PRODUCT_START_PHASES = [
  "draft",
  "blocked",
  "ready-for-product-confirmation",
  "product-foundation-confirmed",
] as const;

export const SESSION_STATUSES = ["active", "interrupted"] as const;

export const MILESTONE_STATES = [
  "Planned",
  "Active",
  "Paused",
  "Blocked",
  "Complete",
  "Released",
  "Deferred",
  "Cancelled or superseded",
] as const;

export const CONTEXT_GRANT_KINDS = [
  "whole-repository",
  "workspace-path",
  "external-resource",
  "supplied-content",
] as const;

export const CONTEXT_GRANT_BASES = ["supplied", "selected", "explicitly-authorized"] as const;

export type EssentialDecision = (typeof ESSENTIAL_DECISIONS)[number];
export type SupportingDecision = (typeof SUPPORTING_DECISIONS)[number];
export type ConditionalDecision = (typeof CONDITIONAL_DECISIONS)[number];
export type DecisionTopic = EssentialDecision | SupportingDecision | ConditionalDecision;
export type ResumeTopic = DecisionTopic;

export type DecisionStatus =
  | "unresolved"
  | "established"
  | "established_from_evidence"
  | "explicitly_none"
  | "not_applicable"
  | "deferred_non_blocking"
  | "deferred_blocking";

export interface DecisionEntry {
  status: DecisionStatus;
  note?: string;
}

export interface ConditionalDecisionEntry extends DecisionEntry {
  triggered: boolean;
}

export type ContextGrantKind = (typeof CONTEXT_GRANT_KINDS)[number];

export interface ContextGrant {
  scope: string;
  kind: ContextGrantKind;
  basis: (typeof CONTEXT_GRANT_BASES)[number];
}

export interface ProductStartInitializeOptions {
  participantResponsibilities?: string[];
  contextGrants?: ContextGrant[];
}

export interface EvidenceItem {
  source: string;
  finding: string;
  contextScope: string;
  conflictsWithIntent?: boolean;
}

export interface Deferral {
  topic: DecisionTopic;
  question: string;
  why: string;
  revisitWhen: string;
  blocking: boolean;
}

export interface RoadmapCandidate {
  title: string;
  outcome: string;
  priority: "Highest" | "High" | "Medium" | "Later";
  rationale: string;
  dependencies: string[];
  nextAction: string;
  commitment: "uncommitted";
}

export interface CurrentMilestone {
  title: string;
  state: (typeof MILESTONE_STATES)[number];
  outcome: string;
  nextAction: string;
}

export interface NextAction {
  participant: string;
  action: string;
  reason: string;
}

export interface ProductContent {
  projectName: string;
  summary: string;
  purpose: string;
  primaryPeople: string;
  need: string;
  currentAlternative: string;
  secondaryPeople: string;
  outcome: string;
  evidence: EvidenceItem[];
  remainsTrue: string[];
  shouldChange: string[];
  uncertain: string[];
  inScope: string[];
  nonGoals: string[];
  constraints: string[];
  successSignals: string[];
  assumptions: string[];
  unknowns: string[];
  deferrals: Deferral[];
}

export interface RoadmapContent {
  summary: string;
  lifecycleState: string;
  lifecycleExplanation: string;
  productNotes: string;
  candidates: RoadmapCandidate[];
  milestones: CurrentMilestone[];
}

export interface ConfirmedRevision {
  revision: number;
  draftVersion: number;
  product: ProductContent;
  decisions: Record<EssentialDecision | SupportingDecision, DecisionEntry>;
  conditionalDecisions: Record<ConditionalDecision, ConditionalDecisionEntry>;
  contextGrants: ContextGrant[];
  roadmap: RoadmapContent;
  responsibilityConfirmations: string[];
  roadmapHistoryHead: string | null;
  previousHash: string | null;
  contentHash: string;
}

export interface RoadmapRevision {
  version: number;
  productRevision: number;
  change: "candidate-management" | "roadmap-update";
  before: RoadmapContent;
  after: RoadmapContent;
  previousHash: string | null;
  contentHash: string;
}

export interface ProductStartState {
  schemaVersion: 2;
  workspaceClass: "human-project";
  workspaceRoot: string;
  phase: (typeof PRODUCT_START_PHASES)[number];
  revision: number;
  draftVersion: number;
  reviewedDraftVersion: number | null;
  participantResponsibilities: string[];
  contextGrants: ContextGrant[];
  product: ProductContent;
  roadmap: RoadmapContent;
  decisions: Record<EssentialDecision | SupportingDecision, DecisionEntry>;
  conditionalDecisions: Record<ConditionalDecision, ConditionalDecisionEntry>;
  nextActions: NextAction[];
  responsibilityConfirmations: string[];
  session: { status: (typeof SESSION_STATUSES)[number]; resumeTopic: ResumeTopic | null };
  confirmedHistory: ConfirmedRevision[];
  roadmapHistory: RoadmapRevision[];
  roadmapHistoryHead: string | null;
  generatedViews: Record<string, { revision: number; draftVersion: number; sha256: string }>;
}

export interface ProductStartUpdate {
  participantResponsibilities?: string[];
  contextGrants?: ContextGrant[];
  product?: Partial<ProductContent>;
  roadmap?: Partial<RoadmapContent>;
  decisions?: Partial<Record<EssentialDecision | SupportingDecision, DecisionEntry>>;
  conditionalDecisions?: Partial<Record<ConditionalDecision, ConditionalDecisionEntry>>;
  nextActions?: NextAction[];
}

export interface ProductStartContract {
  version: 2;
  id: "start-or-adopt-product-foundation";
  responsibility: "product";
  context_boundary: {
    selecting_project_authorizes_repository_read: false;
    evidence_requires_matching_grant: true;
    whole_repository_requires_explicit_authorization: true;
    repository_equivalent_paths_require_whole_repository_grant: true;
    grant_fields_are_closed_enums: true;
    canonical_grant_identity_required: true;
    evidence_uses_normalized_scope: true;
    allowed_grant_kinds: ContextGrantKind[];
  };
  decision_coverage: {
    essential: EssentialDecision[];
    supporting: SupportingDecision[];
    confirmation_resolved_states: DecisionStatus[];
    allowed_by_topic: Record<EssentialDecision | SupportingDecision, DecisionStatus[]>;
  };
  conditional_coverage: Array<{ trigger: ConditionalDecision; cover: string }>;
  state_transitions: { phase: Record<string, string[]>; session: Record<string, string[]> };
  allowed_generated_artifacts: string[];
  confirmation_preconditions: {
    responsibility_must_equal: "product";
    product_participation_required: true;
    current_draft_review_required: true;
    blocking_deferrals_forbidden: true;
    deferrals_and_dispositions_must_match: true;
    exactly_one_next_action: true;
  };
  roadmap_rules: {
    candidates_are_uncommitted: true;
    candidate_management_requires_approval: false;
    append_history: true;
    priority_order: RoadmapCandidate["priority"][];
    confirmed_lifecycle_state: string;
    confirmed_lifecycle_explanation: string;
    standard_product_review_actions: string[];
    standard_post_confirmation_action: string;
    candidate_meaning_remains_host_ai_responsibility: true;
  };
  generated_views: {
    render_from_current_state: true;
    stale_views_are_errors: true;
    refresh_on_every_successful_state_change: true;
    validation_before_writes: true;
    staged_file_set_commit_with_rollback: true;
  };
  history: {
    confirmed_revisions_append_only: true;
    confirmed_revision_hash_chain: true;
    roadmap_revisions_append_only: true;
    roadmap_revision_hash_chain: true;
    roadmap_head_anchor_required: true;
    responsibility_receipt_in_confirmed_revision: true;
  };
  runtime_validation: {
    reject_unknown_properties: true;
    validate_persisted_enums: true;
    require_non_empty_required_strings: true;
    next_action_requires_letters_or_numbers: true;
    semantic_text_quality_remains_host_ai_and_human_evaluated: true;
    cli_option_values_must_not_be_blank: true;
    initialize_options_are_strict_before_filesystem_mutation: true;
  };
  workspace: {
    required_class: "human-project";
    writes_must_remain_inside_target: true;
    initialization_refuses_existing_state: true;
  };
  forbidden_responsibility_areas: string[];
}

export interface RenderedArtifacts {
  "LOOPY.md": string;
  "docs/loopy/Project-Definition.md": string;
  "docs/loopy/Roadmap.md": string;
}
