import { readFile } from "node:fs/promises";
import { relative, sep } from "node:path";
import { isDeepStrictEqual } from "node:util";
import { parse } from "yaml";
import { classifyRoadmapChange } from "./candidates.js";
import { confirmationRevisionHash, productMeaningSnapshot, roadmapRevisionHash } from "./meaning.js";
import { confirmedRoadmapContradiction } from "./roadmap-semantics.js";
import { canonicalPathInsideWorkspace, canonicalWorkspaceRoot } from "./workspace.js";
import {
  CONTEXT_GRANT_BASES,
  CONTEXT_GRANT_KINDS,
  CONDITIONAL_DECISIONS,
  ESSENTIAL_DECISIONS,
  MILESTONE_STATES,
  PRODUCT_START_PHASES,
  SESSION_STATUSES,
  SUPPORTING_DECISIONS,
  type DecisionEntry,
  type DecisionStatus,
  type DecisionTopic,
  type EvidenceItem,
  type ContextGrant,
  type ProductStartContract,
  type ProductStartInitializeOptions,
  type ProductStartState,
  type ProductStartUpdate,
  type RoadmapCandidate,
  type RoadmapContent,
} from "./types.js";

export class ContractError extends Error {
  override name = "ContractError";
}

const ALL_DECISIONS = [...ESSENTIAL_DECISIONS, ...SUPPORTING_DECISIONS] as const;
const ALL_STATUSES: DecisionStatus[] = [
  "unresolved",
  "established",
  "established_from_evidence",
  "explicitly_none",
  "not_applicable",
  "deferred_non_blocking",
  "deferred_blocking",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireString(value: unknown, label: string): asserts value is string {
  if (typeof value !== "string") throw new ContractError(`${label} must be a string.`);
}

function requireNonEmptyString(value: unknown, label: string): asserts value is string {
  requireString(value, label);
  if (!value.trim()) throw new ContractError(`${label} must not be empty.`);
}

function requireUnderstandableText(value: unknown, label: string): asserts value is string {
  requireNonEmptyString(value, label);
  if (!/[\p{L}\p{N}]/u.test(value)) {
    throw new ContractError(`${label} must contain letters or numbers.`);
  }
}

function requireStringArray(value: unknown, label: string): asserts value is string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || !item.trim())) {
    throw new ContractError(`${label} must be an array of non-empty strings.`);
  }
}

function requireExactValues(value: unknown, expected: readonly string[], label: string): void {
  requireStringArray(value, label);
  if (value.length !== expected.length || new Set(value).size !== value.length ||
      expected.some((item) => !value.includes(item))) {
    throw new ContractError(`${label} must contain exactly the supported values.`);
  }
}

function requireKnownKeys(value: Record<string, unknown>, allowed: readonly string[], label: string): void {
  const unknown = Object.keys(value).filter((key) => !allowed.includes(key));
  if (unknown.length > 0) throw new ContractError(`${label} contains unknown properties: ${unknown.join(", ")}.`);
}

function requireEnum(value: unknown, allowed: readonly string[], label: string): asserts value is string {
  if (typeof value !== "string" || !allowed.includes(value)) {
    throw new ContractError(`${label} must be one of: ${allowed.join(", ")}.`);
  }
}

export async function loadContract(path: string): Promise<ProductStartContract> {
  const contract = parse(await readFile(path, "utf8")) as unknown;
  validateContractShape(contract);
  return contract;
}

export function validateContractShape(contract: unknown): asserts contract is ProductStartContract {
  if (!isRecord(contract) || contract.version !== 2 ||
      contract.id !== "start-or-adopt-product-foundation" || contract.responsibility !== "product") {
    throw new ContractError("Unsupported Start-or-Adopt Product-foundation contract.");
  }
  if (!isRecord(contract.context_boundary) ||
      contract.context_boundary.selecting_project_authorizes_repository_read !== false ||
      contract.context_boundary.evidence_requires_matching_grant !== true ||
      contract.context_boundary.whole_repository_requires_explicit_authorization !== true ||
      contract.context_boundary.repository_equivalent_paths_require_whole_repository_grant !== true ||
      contract.context_boundary.grant_fields_are_closed_enums !== true ||
      contract.context_boundary.canonical_grant_identity_required !== true ||
      contract.context_boundary.evidence_uses_normalized_scope !== true) {
    throw new ContractError("The contract must preserve Human-controlled context expansion.");
  }
  requireExactValues(
    contract.context_boundary.allowed_grant_kinds,
    ["whole-repository", "workspace-path", "external-resource", "supplied-content"],
    "context_boundary.allowed_grant_kinds",
  );
  if (!isRecord(contract.decision_coverage)) {
    throw new ContractError("Decision coverage rules are missing.");
  }
  requireExactValues(contract.decision_coverage.essential, ESSENTIAL_DECISIONS, "decision_coverage.essential");
  requireExactValues(contract.decision_coverage.supporting, SUPPORTING_DECISIONS, "decision_coverage.supporting");
  requireExactValues(
    contract.decision_coverage.confirmation_resolved_states,
    ["established", "established_from_evidence", "explicitly_none", "not_applicable", "deferred_non_blocking"],
    "decision_coverage.confirmation_resolved_states",
  );
  if (!isRecord(contract.decision_coverage.allowed_by_topic)) {
    throw new ContractError("Per-topic decision rules are missing.");
  }
  for (const topic of ALL_DECISIONS) {
    const allowed = contract.decision_coverage.allowed_by_topic[topic];
    requireStringArray(allowed, `decision_coverage.allowed_by_topic.${topic}`);
    if (allowed.length === 0 || allowed.some((status) => !ALL_STATUSES.includes(status as DecisionStatus))) {
      throw new ContractError(`Invalid decision states for ${topic}.`);
    }
  }
  if (!Array.isArray(contract.conditional_coverage) || contract.conditional_coverage.some((entry) =>
    !isRecord(entry) || typeof entry.trigger !== "string" || typeof entry.cover !== "string")) {
    throw new ContractError("Conditional decision coverage is invalid.");
  }
  requireExactValues(
    contract.conditional_coverage.map((entry) => entry.trigger),
    CONDITIONAL_DECISIONS,
    "conditional_coverage triggers",
  );
  if (!isRecord(contract.confirmation_preconditions) ||
      contract.confirmation_preconditions.responsibility_must_equal !== "product" ||
      contract.confirmation_preconditions.product_participation_required !== true ||
      contract.confirmation_preconditions.current_draft_review_required !== true ||
      contract.confirmation_preconditions.blocking_deferrals_forbidden !== true ||
      contract.confirmation_preconditions.deferrals_and_dispositions_must_match !== true ||
      contract.confirmation_preconditions.exactly_one_next_action !== true) {
    throw new ContractError("Product-foundation confirmation preconditions are invalid.");
  }
  if (!isRecord(contract.roadmap_rules) || contract.roadmap_rules.candidates_are_uncommitted !== true ||
      contract.roadmap_rules.candidate_management_requires_approval !== false ||
      contract.roadmap_rules.append_history !== true ||
      contract.roadmap_rules.confirmed_lifecycle_state !== "Product foundation confirmed" ||
      contract.roadmap_rules.confirmed_lifecycle_explanation !==
        "The Product foundation is confirmed; no Milestone has been committed." ||
      contract.roadmap_rules.standard_post_confirmation_action !== "Shape this candidate before Milestone commitment" ||
      contract.roadmap_rules.candidate_meaning_remains_host_ai_responsibility !== true) {
    throw new ContractError("Roadmap rules are invalid.");
  }
  requireExactValues(contract.roadmap_rules.priority_order, ["Highest", "High", "Medium", "Later"], "priority order");
  requireExactValues(
    contract.roadmap_rules.standard_product_review_actions,
    ["Review the Product foundation", "Confirm the Product foundation"],
    "standard Product review actions",
  );
  requireExactValues(
    contract.allowed_generated_artifacts,
    ["LOOPY.md", "docs/loopy/Project-Definition.md", "docs/loopy/Roadmap.md"],
    "allowed_generated_artifacts",
  );
  if (!isRecord(contract.generated_views) || contract.generated_views.render_from_current_state !== true ||
      contract.generated_views.stale_views_are_errors !== true ||
      contract.generated_views.refresh_on_every_successful_state_change !== true ||
      contract.generated_views.validation_before_writes !== true ||
      contract.generated_views.staged_file_set_commit_with_rollback !== true ||
      !isRecord(contract.history) || contract.history.confirmed_revisions_append_only !== true ||
      contract.history.confirmed_revision_hash_chain !== true ||
      contract.history.roadmap_revisions_append_only !== true ||
      contract.history.roadmap_revision_hash_chain !== true ||
      contract.history.roadmap_head_anchor_required !== true ||
      contract.history.responsibility_receipt_in_confirmed_revision !== true ||
      !isRecord(contract.runtime_validation) || contract.runtime_validation.reject_unknown_properties !== true ||
      contract.runtime_validation.validate_persisted_enums !== true ||
      contract.runtime_validation.require_non_empty_required_strings !== true ||
      contract.runtime_validation.next_action_requires_letters_or_numbers !== true ||
      contract.runtime_validation.semantic_text_quality_remains_host_ai_and_human_evaluated !== true ||
      contract.runtime_validation.cli_option_values_must_not_be_blank !== true ||
      contract.runtime_validation.initialize_options_are_strict_before_filesystem_mutation !== true ||
      !isRecord(contract.workspace) ||
      contract.workspace.required_class !== "human-project" ||
      contract.workspace.writes_must_remain_inside_target !== true ||
      contract.workspace.initialization_refuses_existing_state !== true) {
    throw new ContractError("Generated-view or workspace guarantees are invalid.");
  }
  requireStringArray(contract.forbidden_responsibility_areas, "forbidden_responsibility_areas");
  for (const area of ["engineering", "architecture", "demo", "quality", "release", "publication", "deployment", "rollback"]) {
    if (!contract.forbidden_responsibility_areas.includes(area)) {
      throw new ContractError(`Forbidden responsibility area is missing: ${area}.`);
    }
  }
}

function validateDecisionEntry(entry: unknown, label: string, conditional = false): asserts entry is DecisionEntry {
  if (!isRecord(entry) || typeof entry.status !== "string" ||
      !ALL_STATUSES.includes(entry.status as DecisionStatus)) {
    throw new ContractError(`${label} has an invalid state.`);
  }
  requireKnownKeys(entry, conditional ? ["status", "note", "triggered"] : ["status", "note"], label);
  if (entry.note !== undefined && typeof entry.note !== "string") {
    throw new ContractError(`${label}.note must be a string.`);
  }
  if ((entry.status === "deferred_non_blocking" || entry.status === "deferred_blocking") &&
      (typeof entry.note !== "string" || !entry.note.trim())) {
    throw new ContractError(`${label} requires a deferral note.`);
  }
}

function validateCandidate(candidate: unknown, label: string): asserts candidate is RoadmapCandidate {
  if (!isRecord(candidate)) throw new ContractError(`${label} must be an object.`);
  requireKnownKeys(candidate, ["title", "outcome", "priority", "rationale", "dependencies", "nextAction", "commitment"], label);
  for (const field of ["title", "outcome", "priority", "rationale", "nextAction", "commitment"] as const) {
    requireNonEmptyString(candidate[field], `${label}.${field}`);
  }
  requireStringArray(candidate.dependencies, `${label}.dependencies`);
  const priority = candidate.priority;
  if (!["Highest", "High", "Medium", "Later"].includes(priority as string) ||
      candidate.commitment !== "uncommitted") {
    throw new ContractError(`${label} must be an uncommitted candidate with a valid priority.`);
  }
}

function validateRoadmap(roadmap: unknown, label: string): asserts roadmap is RoadmapContent {
  if (!isRecord(roadmap)) throw new ContractError(`${label} must be an object.`);
  requireKnownKeys(roadmap, ["summary", "lifecycleState", "lifecycleExplanation", "productNotes", "candidates", "milestones"], label);
  for (const field of ["summary", "lifecycleState", "lifecycleExplanation", "productNotes"] as const) {
    requireString(roadmap[field], `${label}.${field}`);
  }
  if (!Array.isArray(roadmap.candidates)) throw new ContractError(`${label}.candidates must be an array.`);
  roadmap.candidates.forEach((candidate, index) => validateCandidate(candidate, `${label}.candidates[${index}]`));
  if (!Array.isArray(roadmap.milestones)) throw new ContractError(`${label}.milestones must be an array.`);
  roadmap.milestones.forEach((milestone, index) => {
    if (!isRecord(milestone)) throw new ContractError(`${label}.milestones[${index}] must be an object.`);
    requireKnownKeys(milestone, ["title", "state", "outcome", "nextAction"], `${label}.milestones[${index}]`);
    for (const field of ["title", "state", "outcome", "nextAction"] as const) {
      requireNonEmptyString(milestone[field], `${label}.milestones[${index}].${field}`);
    }
    requireEnum(milestone.state, MILESTONE_STATES, `${label}.milestones[${index}].state`);
  });
}

const PRODUCT_KEYS = [
  "projectName", "summary", "purpose", "primaryPeople", "need", "currentAlternative",
  "secondaryPeople", "outcome", "evidence", "remainsTrue", "shouldChange", "uncertain",
  "inScope", "nonGoals", "constraints", "successSignals", "assumptions", "unknowns", "deferrals",
] as const;

function validateProduct(product: unknown, label: string): void {
  if (!isRecord(product)) throw new ContractError(`${label} must be an object.`);
  requireKnownKeys(product, PRODUCT_KEYS, label);
  for (const field of ["projectName", "summary", "purpose", "primaryPeople", "need", "currentAlternative", "secondaryPeople", "outcome"] as const) {
    requireString(product[field], `${label}.${field}`);
  }
  requireNonEmptyString(product.projectName, `${label}.projectName`);
  for (const field of ["remainsTrue", "shouldChange", "uncertain", "inScope", "nonGoals", "constraints", "successSignals", "assumptions", "unknowns"] as const) {
    requireStringArray(product[field], `${label}.${field}`);
  }
  if (!Array.isArray(product.evidence)) throw new ContractError(`${label}.evidence must be an array.`);
  product.evidence.forEach((item, index) => {
    if (!isRecord(item)) throw new ContractError(`${label}.evidence[${index}] must be an object.`);
    requireKnownKeys(item, ["source", "finding", "contextScope", "conflictsWithIntent"], `${label}.evidence[${index}]`);
    for (const field of ["source", "finding", "contextScope"] as const) {
      requireNonEmptyString(item[field], `${label}.evidence[${index}].${field}`);
    }
    if (item.conflictsWithIntent !== undefined && typeof item.conflictsWithIntent !== "boolean") {
      throw new ContractError(`${label}.evidence[${index}].conflictsWithIntent must be boolean.`);
    }
  });
  if (!Array.isArray(product.deferrals)) throw new ContractError(`${label}.deferrals must be an array.`);
  product.deferrals.forEach((item, index) => {
    if (!isRecord(item)) throw new ContractError(`${label}.deferrals[${index}] must be an object.`);
    requireKnownKeys(item, ["topic", "question", "why", "revisitWhen", "blocking"], `${label}.deferrals[${index}]`);
    requireEnum(item.topic, [...ALL_DECISIONS, ...CONDITIONAL_DECISIONS], `${label}.deferrals[${index}].topic`);
    for (const field of ["question", "why", "revisitWhen"] as const) {
      requireNonEmptyString(item[field], `${label}.deferrals[${index}].${field}`);
    }
    if (typeof item.blocking !== "boolean") throw new ContractError(`${label}.deferrals[${index}].blocking must be boolean.`);
  });
}

function validateContextGrant(grant: unknown, label: string, workspaceRoot: string): void {
  if (!isRecord(grant)) throw new ContractError(`${label} must be an object.`);
  requireKnownKeys(grant, ["scope", "kind", "basis"], label);
  requireNonEmptyString(grant.scope, `${label}.scope`);
  requireEnum(grant.kind, CONTEXT_GRANT_KINDS, `${label}.kind`);
  requireEnum(grant.basis, CONTEXT_GRANT_BASES, `${label}.basis`);
  const resolvedScope = grant.kind === "workspace-path"
    ? canonicalPathInsideWorkspace(workspaceRoot, grant.scope)
    : undefined;
  const coversRoot = (grant.kind === "workspace-path" && resolvedScope === canonicalWorkspaceRoot(workspaceRoot)) ||
    grant.kind === "whole-repository";
  if (coversRoot && (grant.kind !== "whole-repository" || grant.basis !== "explicitly-authorized")) {
    throw new ContractError(grant.kind === "whole-repository"
      ? "Whole-repository access requires explicit authorization with scope '.'."
      : "Repository-wide access requires a whole-repository grant with explicit authorization.");
  }
  if (grant.kind === "whole-repository" && grant.scope !== ".") {
    throw new ContractError("A whole-repository grant must use scope '.'.");
  }
}

export function validateInitializeOptions(
  options: unknown,
): asserts options is ProductStartInitializeOptions {
  if (!isRecord(options)) throw new ContractError("Initialization options must be an object.");
  requireKnownKeys(options, ["participantResponsibilities", "contextGrants"], "initialization options");
  if (options.participantResponsibilities !== undefined) {
    requireStringArray(options.participantResponsibilities, "initialization options.participantResponsibilities");
  }
  if (options.contextGrants !== undefined) {
    if (!Array.isArray(options.contextGrants)) {
      throw new ContractError("initialization options.contextGrants must be an array.");
    }
    options.contextGrants.forEach((grant, index) => {
      const label = `initialization options.contextGrants[${index}]`;
      if (!isRecord(grant)) throw new ContractError(`${label} must be an object.`);
      requireKnownKeys(grant, ["scope", "kind", "basis"], label);
      requireNonEmptyString(grant.scope, `${label}.scope`);
      if (typeof grant.kind !== "string" || !CONTEXT_GRANT_KINDS.includes(grant.kind as ContextGrant["kind"])) {
        throw new ContractError(`Unsupported context grant kind: ${String(grant.kind)}.`);
      }
      if (typeof grant.basis !== "string" || !CONTEXT_GRANT_BASES.includes(grant.basis as ContextGrant["basis"])) {
        throw new ContractError(`Unsupported context grant basis: ${String(grant.basis)}.`);
      }
    });
  }
}

function stableWorkspaceScope(workspaceRoot: string, scope: string): string {
  const root = canonicalWorkspaceRoot(workspaceRoot);
  const canonical = canonicalPathInsideWorkspace(root, scope);
  const projectRelative = relative(root, canonical);
  return projectRelative ? projectRelative.split(sep).join("/") : ".";
}

export function normalizeContextGrants(
  workspaceRoot: string,
  grants: ContextGrant[],
): ContextGrant[] {
  const normalized = grants.map((grant, index) => {
    validateContextGrant(grant, `contextGrants[${index}]`, workspaceRoot);
    return {
      ...grant,
      scope: grant.kind === "workspace-path"
        ? stableWorkspaceScope(workspaceRoot, grant.scope)
        : grant.scope.trim(),
    };
  });
  const seen = new Set<string>();
  for (const grant of normalized) {
    if (seen.has(grant.scope)) {
      throw new ContractError(`Context grants resolve to the same canonical scope: ${grant.scope}.`);
    }
    seen.add(grant.scope);
  }
  return normalized;
}

export function normalizeEvidenceScopes(
  workspaceRoot: string,
  evidence: EvidenceItem[],
  grants: ContextGrant[],
): EvidenceItem[] {
  return evidence.map((item) => {
    const direct = grants.find((grant) => grant.scope === item.contextScope.trim());
    if (direct) return { ...item, contextScope: direct.scope };
    for (const grant of grants) {
      if (grant.kind !== "workspace-path") continue;
      try {
        if (stableWorkspaceScope(workspaceRoot, item.contextScope) === grant.scope) {
          return { ...item, contextScope: grant.scope };
        }
      } catch {
        // State validation reports evidence that is outside the authorized ledger.
      }
    }
    return item;
  });
}

function validateRuntimeShape(state: ProductStartState): void {
  if (!isRecord(state)) throw new ContractError("Product-foundation state must be an object.");
  requireKnownKeys(state, [
    "schemaVersion", "workspaceClass", "workspaceRoot", "phase", "revision", "draftVersion",
    "reviewedDraftVersion", "participantResponsibilities", "contextGrants", "product", "roadmap",
    "decisions", "conditionalDecisions", "nextActions", "responsibilityConfirmations", "session",
    "confirmedHistory", "roadmapHistory", "generatedViews",
    "roadmapHistoryHead",
  ], "state");
  if (state.schemaVersion !== 2 || !Number.isInteger(state.revision) || state.revision < 0 ||
      !Number.isInteger(state.draftVersion) || state.draftVersion < 0) {
    throw new ContractError("Product-foundation state has an invalid schema or version.");
  }
  if (state.reviewedDraftVersion !== null &&
      (!Number.isInteger(state.reviewedDraftVersion) || state.reviewedDraftVersion < 0 || state.reviewedDraftVersion > state.draftVersion)) {
    throw new ContractError("reviewedDraftVersion must identify an existing draft or be null.");
  }
  requireNonEmptyString(state.workspaceRoot, "workspaceRoot");
  requireEnum(state.phase, PRODUCT_START_PHASES, "phase");
  requireStringArray(state.participantResponsibilities, "participantResponsibilities");
  requireStringArray(state.responsibilityConfirmations, "responsibilityConfirmations");
  if ([...state.participantResponsibilities, ...state.responsibilityConfirmations].some((item) => !item.trim())) {
    throw new ContractError("Responsibilities must not contain empty values.");
  }
  if (!Array.isArray(state.contextGrants)) throw new ContractError("contextGrants must be an array.");
  state.contextGrants.forEach((grant, index) => validateContextGrant(grant, `contextGrants[${index}]`, state.workspaceRoot));
  validateProduct(state.product, "product");
  validateRoadmap(state.roadmap, "roadmap");
  if (!isRecord(state.decisions)) throw new ContractError("decisions must be an object.");
  requireKnownKeys(state.decisions, ALL_DECISIONS, "decisions");
  for (const topic of ALL_DECISIONS) validateDecisionEntry(state.decisions[topic], `decisions.${topic}`);
  if (!isRecord(state.conditionalDecisions)) throw new ContractError("conditionalDecisions must be an object.");
  requireKnownKeys(state.conditionalDecisions, CONDITIONAL_DECISIONS, "conditionalDecisions");
  for (const topic of CONDITIONAL_DECISIONS) {
    validateDecisionEntry(state.conditionalDecisions[topic], `conditionalDecisions.${topic}`, true);
    if (typeof state.conditionalDecisions[topic].triggered !== "boolean") {
      throw new ContractError(`conditionalDecisions.${topic}.triggered must be boolean.`);
    }
  }
  if (!Array.isArray(state.nextActions) || state.nextActions.length !== 1 || !isRecord(state.nextActions[0])) {
    throw new ContractError("LOOPY.md requires exactly one next action.");
  }
  requireKnownKeys(state.nextActions[0], ["participant", "action", "reason"], "nextActions[0]");
  for (const field of ["participant", "action", "reason"] as const) {
    requireUnderstandableText(state.nextActions[0][field], `nextActions[0].${field}`);
  }
  if (!isRecord(state.session)) throw new ContractError("session must be an object.");
  requireKnownKeys(state.session, ["status", "resumeTopic"], "session");
  requireEnum(state.session.status, SESSION_STATUSES, "session.status");
  if (state.session.resumeTopic !== null) {
    requireEnum(state.session.resumeTopic, [...ALL_DECISIONS, ...CONDITIONAL_DECISIONS], "session.resumeTopic");
  }
  if (!Array.isArray(state.confirmedHistory) || !Array.isArray(state.roadmapHistory)) {
    throw new ContractError("Confirmation and Roadmap history must be arrays.");
  }
  if (state.roadmapHistoryHead !== null &&
      (typeof state.roadmapHistoryHead !== "string" || !/^[a-f0-9]{64}$/.test(state.roadmapHistoryHead))) {
    throw new ContractError("roadmapHistoryHead must be a SHA-256 hash or null.");
  }
  if (!isRecord(state.generatedViews)) throw new ContractError("generatedViews must be an object.");
  for (const [path, view] of Object.entries(state.generatedViews)) {
    if (!isRecord(view)) throw new ContractError(`generatedViews.${path} must be an object.`);
    requireKnownKeys(view, ["revision", "draftVersion", "sha256"], `generatedViews.${path}`);
    if (!Number.isInteger(view.revision) || !Number.isInteger(view.draftVersion) ||
        typeof view.sha256 !== "string" || !/^[a-f0-9]{64}$/.test(view.sha256)) {
      throw new ContractError(`generatedViews.${path} is invalid.`);
    }
  }
}

function matchingDeferral(state: ProductStartState, topic: DecisionTopic, blocking: boolean): boolean {
  return state.product.deferrals.some((item) => item.topic === topic && item.blocking === blocking);
}

function decisionForDeferral(state: ProductStartState, topic: DecisionTopic): DecisionEntry {
  return CONDITIONAL_DECISIONS.includes(topic as (typeof CONDITIONAL_DECISIONS)[number])
    ? state.conditionalDecisions[topic as (typeof CONDITIONAL_DECISIONS)[number]]
    : state.decisions[topic as keyof typeof state.decisions];
}

function validateCoverageConsistency(state: ProductStartState): void {
  const deferredTopics = new Set<DecisionTopic>();
  for (const deferral of state.product.deferrals) {
    if (deferredTopics.has(deferral.topic)) {
      throw new ContractError(`Product deferrals must not duplicate or conflict for ${deferral.topic}.`);
    }
    deferredTopics.add(deferral.topic);
    const expectedStatus = deferral.blocking ? "deferred_blocking" : "deferred_non_blocking";
    if (decisionForDeferral(state, deferral.topic).status !== expectedStatus) {
      throw new ContractError(
        `${deferral.topic} has a ${deferral.blocking ? "blocking" : "non-blocking"} deferral and must be ${expectedStatus}.`,
      );
    }
  }
  const populated: Record<Exclude<DecisionTopic, (typeof CONDITIONAL_DECISIONS)[number]>, boolean> = {
    purpose: Boolean(state.product.purpose.trim()),
    people_and_need: Boolean(state.product.primaryPeople.trim() && state.product.need.trim()),
    outcome: Boolean(state.product.outcome.trim()),
    evidence_and_intent: state.product.evidence.length > 0 || state.product.remainsTrue.length > 0 ||
      state.product.shouldChange.length > 0 || state.product.uncertain.length > 0,
    boundaries: state.product.inScope.length > 0 || state.product.nonGoals.length > 0 || state.product.constraints.length > 0,
    success: state.product.successSignals.length > 0,
    roadmap_state: state.roadmap.candidates.length > 0,
    uncertainty: state.product.assumptions.length > 0 || state.product.unknowns.length > 0 ||
      state.product.deferrals.some((item) => !item.blocking),
  };
  for (const topic of ALL_DECISIONS) {
    const entry = state.decisions[topic];
    if ((entry.status === "established" || entry.status === "established_from_evidence") && !populated[topic]) {
      throw new ContractError(`${topic} cannot be established without corresponding human-facing content.`);
    }
    if (entry.status === "explicitly_none" && populated[topic]) {
      throw new ContractError(`${topic} cannot be explicitly none when corresponding content exists.`);
    }
    if (entry.status === "established_from_evidence" && state.product.evidence.length === 0) {
      throw new ContractError(`${topic} cannot be established from evidence when no evidence is recorded.`);
    }
    if (entry.status === "deferred_blocking" && !matchingDeferral(state, topic, true)) {
      throw new ContractError(`${topic} requires a visible blocking deferral.`);
    }
    if (entry.status === "deferred_non_blocking" && !matchingDeferral(state, topic, false)) {
      throw new ContractError(`${topic} requires a visible non-blocking deferral.`);
    }
  }
  if (state.conditionalDecisions.context_conflict.triggered !==
      state.product.evidence.some((item) => item.conflictsWithIntent === true)) {
    throw new ContractError("Context-conflict coverage must match attributed conflicting evidence.");
  }
}

function validateHistory(contract: ProductStartContract, state: ProductStartState): void {
  if (state.confirmedHistory.length !== state.revision) {
    throw new ContractError("Every Product confirmation must have one append-only revision.");
  }
  state.confirmedHistory.forEach((entry, index) => {
    if (!isRecord(entry)) throw new ContractError("Product confirmation history entries must be objects.");
    requireKnownKeys(entry, [
      "revision", "draftVersion", "product", "decisions", "conditionalDecisions", "contextGrants",
      "roadmap", "responsibilityConfirmations", "roadmapHistoryHead", "previousHash", "contentHash",
    ], `confirmedHistory[${index}]`);
    if (entry.revision !== index + 1 || !Number.isInteger(entry.draftVersion)) {
      throw new ContractError("Product confirmation history must be sequential.");
    }
    validateProduct(entry.product, `confirmedHistory[${index}].product`);
    validateRoadmap(entry.roadmap, `confirmedHistory[${index}].roadmap`);
    const roadmapContradiction = confirmedRoadmapContradiction(entry.roadmap, contract);
    if (roadmapContradiction) throw new ContractError(roadmapContradiction);
    if (!isRecord(entry.decisions)) throw new ContractError(`confirmedHistory[${index}].decisions must be an object.`);
    requireKnownKeys(entry.decisions, ALL_DECISIONS, `confirmedHistory[${index}].decisions`);
    for (const topic of ALL_DECISIONS) {
      validateDecisionEntry(entry.decisions[topic], `confirmedHistory[${index}].decisions.${topic}`);
    }
    if (!isRecord(entry.conditionalDecisions)) {
      throw new ContractError(`confirmedHistory[${index}].conditionalDecisions must be an object.`);
    }
    requireKnownKeys(entry.conditionalDecisions, CONDITIONAL_DECISIONS, `confirmedHistory[${index}].conditionalDecisions`);
    for (const topic of CONDITIONAL_DECISIONS) {
      validateDecisionEntry(
        entry.conditionalDecisions[topic],
        `confirmedHistory[${index}].conditionalDecisions.${topic}`,
        true,
      );
    }
    if (!Array.isArray(entry.contextGrants)) {
      throw new ContractError(`confirmedHistory[${index}].contextGrants must be an array.`);
    }
    entry.contextGrants.forEach((grant, grantIndex) =>
      validateContextGrant(grant, `confirmedHistory[${index}].contextGrants[${grantIndex}]`, state.workspaceRoot));
    if (!isDeepStrictEqual(normalizeContextGrants(state.workspaceRoot, entry.contextGrants), entry.contextGrants)) {
      throw new ContractError("Confirmed context grants must use normalized canonical scopes.");
    }
    requireStringArray(entry.responsibilityConfirmations, `confirmedHistory[${index}].responsibilityConfirmations`);
    if (entry.responsibilityConfirmations.length !== 1 || entry.responsibilityConfirmations[0] !== "product") {
      throw new ContractError("A confirmed Product revision must contain its Product responsibility receipt.");
    }
    const expectedRoadmapAnchor = state.roadmapHistory
      .filter((revision) => revision.productRevision < entry.revision)
      .at(-1)?.contentHash ?? null;
    if (entry.roadmapHistoryHead !== expectedRoadmapAnchor) {
      throw new ContractError("Confirmed Product revision has an invalid Roadmap history anchor.");
    }
    const expectedPreviousHash = index === 0 ? null : state.confirmedHistory[index - 1].contentHash;
    if (entry.previousHash !== expectedPreviousHash || typeof entry.contentHash !== "string") {
      throw new ContractError("Product confirmation history hash chain is invalid.");
    }
    const { contentHash: _contentHash, ...hashInput } = entry;
    if (confirmationRevisionHash(hashInput) !== entry.contentHash) {
      throw new ContractError("Product confirmation history content was changed.");
    }
  });
  state.roadmapHistory.forEach((entry, index) => {
    if (!isRecord(entry)) throw new ContractError("Roadmap history entries must be objects.");
    requireKnownKeys(
      entry,
      ["version", "productRevision", "change", "before", "after", "previousHash", "contentHash"],
      `roadmapHistory[${index}]`,
    );
    if (entry.version !== index + 1 || !Number.isInteger(entry.productRevision) ||
        entry.productRevision < 0 || entry.productRevision > state.revision ||
        !["candidate-management", "roadmap-update"].includes(String(entry.change))) {
      throw new ContractError("Roadmap history must be append-only and sequential.");
    }
    validateRoadmap(entry.before, `roadmapHistory[${index}].before`);
    validateRoadmap(entry.after, `roadmapHistory[${index}].after`);
    const expectedPreviousHash = index === 0 ? null : state.roadmapHistory[index - 1].contentHash;
    if (entry.previousHash !== expectedPreviousHash || typeof entry.contentHash !== "string") {
      throw new ContractError("Roadmap history hash chain is invalid.");
    }
    const { contentHash: _contentHash, ...hashInput } = entry;
    if (roadmapRevisionHash(hashInput) !== entry.contentHash) {
      throw new ContractError("Roadmap history content was changed.");
    }
    if (isDeepStrictEqual(entry.before, entry.after) ||
        classifyRoadmapChange(entry.before, entry.after) !== entry.change ||
        (index > 0 && !isDeepStrictEqual(state.roadmapHistory[index - 1].after, entry.before))) {
      throw new ContractError("Roadmap history must truthfully describe each state change.");
    }
  });
  if (state.roadmapHistory.length > 0 &&
      !isDeepStrictEqual(state.roadmapHistory.at(-1)?.after, state.roadmap)) {
    throw new ContractError("Current Roadmap must match its latest recorded version.");
  }
  const expectedRoadmapHead = state.roadmapHistory.at(-1)?.contentHash ?? null;
  if (state.roadmapHistoryHead !== expectedRoadmapHead) {
    throw new ContractError("Roadmap history head does not match its append-only chain.");
  }
  if (state.phase === "product-foundation-confirmed") {
    const latest = state.confirmedHistory.at(-1);
    if (!latest || !isDeepStrictEqual(productMeaningSnapshot(latest), productMeaningSnapshot(state))) {
      throw new ContractError("Confirmed Product meaning must match its latest revision.");
    }
  }
}

export function confirmationBlockers(contract: ProductStartContract, state: ProductStartState): string[] {
  const resolved = contract.decision_coverage.confirmation_resolved_states;
  const blockers: string[] = ALL_DECISIONS.filter(
    (topic) => !resolved.includes(state.decisions[topic].status),
  );
  for (const topic of CONDITIONAL_DECISIONS) {
    const entry = state.conditionalDecisions[topic];
    if (entry.triggered && !resolved.includes(entry.status)) blockers.push(topic);
  }
  for (const deferral of state.product.deferrals) {
    if (deferral.blocking && !blockers.includes(deferral.topic)) blockers.push(deferral.topic);
  }
  return blockers;
}

export function validateUpdateShape(update: unknown): asserts update is ProductStartUpdate {
  if (!isRecord(update)) throw new ContractError("Product update must be an object.");
  requireKnownKeys(update, [
    "participantResponsibilities", "contextGrants", "product", "roadmap", "decisions",
    "conditionalDecisions", "nextActions",
  ], "update");
}

export function validateState(
  contract: ProductStartContract,
  state: ProductStartState,
  options: { forConfirmation?: boolean } = {},
): void {
  validateRuntimeShape(state);
  if (state.workspaceClass !== contract.workspace.required_class) {
    throw new ContractError("State is not a Human project workspace.");
  }
  const normalizedGrants = normalizeContextGrants(state.workspaceRoot, state.contextGrants);
  if (!isDeepStrictEqual(normalizedGrants, state.contextGrants)) {
    throw new ContractError("Context grants must use normalized canonical scopes.");
  }
  const scopes = state.contextGrants.map((grant) => grant.scope);
  for (const grant of state.contextGrants) {
    if (!contract.context_boundary.allowed_grant_kinds.includes(grant.kind)) {
      throw new ContractError(`Unsupported context grant kind: ${grant.kind}.`);
    }
    if (grant.kind === "whole-repository" && grant.basis !== "explicitly-authorized") {
      throw new ContractError("Whole-repository inspection requires explicit Human authorization.");
    }
  }
  for (const evidence of state.product.evidence) {
    if (!scopes.includes(evidence.contextScope)) {
      throw new ContractError(`Evidence is outside the authorized context: ${evidence.source}.`);
    }
  }
  for (const topic of ALL_DECISIONS) {
    const entry = state.decisions[topic];
    if (entry.status !== "unresolved" &&
        !contract.decision_coverage.allowed_by_topic[topic].includes(entry.status)) {
      throw new ContractError(`Decision state ${entry.status} is not allowed for ${topic}.`);
    }
  }
  for (const topic of CONDITIONAL_DECISIONS) {
    const entry = state.conditionalDecisions[topic];
    if (!entry.triggered && entry.status !== "not_applicable") {
      throw new ContractError(`Untriggered conditional decision must be not applicable: ${topic}.`);
    }
    if (entry.triggered && entry.status === "not_applicable") {
      throw new ContractError(`Triggered conditional decision cannot be not applicable: ${topic}.`);
    }
    if (entry.status === "deferred_blocking" && !matchingDeferral(state, topic, true)) {
      throw new ContractError(`${topic} requires a visible blocking deferral.`);
    }
    if (entry.status === "deferred_non_blocking" && !matchingDeferral(state, topic, false)) {
      throw new ContractError(`${topic} requires a visible non-blocking deferral.`);
    }
  }
  validateCoverageConsistency(state);
  validateHistory(contract, state);
  if (state.phase === "product-foundation-confirmed") {
    const roadmapContradiction = confirmedRoadmapContradiction(state.roadmap, contract);
    if (roadmapContradiction) throw new ContractError(roadmapContradiction);
  }
  const forbidden = state.responsibilityConfirmations.filter((area) =>
    contract.forbidden_responsibility_areas.includes(area));
  if (forbidden.length > 0) {
    throw new ContractError(`Product responsibility cannot confirm: ${forbidden.join(", ")}.`);
  }
  if (state.phase !== "product-foundation-confirmed" &&
      state.nextActions[0].participant.toLowerCase() !== "product") {
    throw new ContractError("An unfinished Product foundation must route its next action to Product.");
  }
  for (const artifact of Object.keys(state.generatedViews)) {
    if (!contract.allowed_generated_artifacts.includes(artifact)) {
      throw new ContractError(`State contains a forbidden generated artifact: ${artifact}.`);
    }
  }
  if (!options.forConfirmation) return;
  if (!state.participantResponsibilities.includes("product")) {
    throw new ContractError("Product participation is required to confirm the Product foundation.");
  }
  if (state.phase !== "ready-for-product-confirmation") {
    throw new ContractError(`Product foundation is not ready for confirmation: ${confirmationBlockers(contract, state).join(", ") || state.phase}.`);
  }
  if (state.reviewedDraftVersion !== state.draftVersion) {
    throw new ContractError("The current Product-foundation draft must be reviewed before confirmation.");
  }
  if (state.responsibilityConfirmations.some((area) => area !== "product")) {
    throw new ContractError("Product confirmation cannot include another responsibility.");
  }
}
