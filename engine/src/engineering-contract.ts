import { readFile } from "node:fs/promises";
import { isDeepStrictEqual } from "node:util";
import { parse } from "yaml";
import { ContractError, normalizeContextGrants } from "./contract.js";
import {
  COMMAND_CONFIDENCE,
  COMMAND_PURPOSES,
  ENGINEERING_COVERAGE,
  ENGINEERING_PHASES,
  GUIDE_TRIGGER_KINDS,
  type EngineeringCommand,
  type EngineeringContent,
  type EngineeringCoverage,
  type EngineeringFoundationContract,
  type EngineeringFoundationState,
  type EngineeringFoundationUpdate,
  type EngineeringInitializeOptions,
} from "./engineering-types.js";
import {
  engineeringChangeHash,
  engineeringChangeSnapshotHash,
  engineeringConfirmationHash,
  engineeringMeaningSnapshot,
} from "./engineering-meaning.js";
import { CONTEXT_GRANT_BASES, CONTEXT_GRANT_KINDS, SESSION_STATUSES, type ContextGrant, type DecisionStatus } from "./types.js";

const RESOLVED: DecisionStatus[] = [
  "established", "established_from_evidence", "explicitly_none", "not_applicable", "deferred_non_blocking",
];
const ALL_STATUSES: DecisionStatus[] = [...RESOLVED, "unresolved", "deferred_blocking"];
const CONTENT_KEYS = [
  "summary", "evidence", "projectDefaults", "components", "commands", "relationships", "triggers",
  "assumptions", "unknowns", "deferrals",
] as const;
const DEFAULT_KEYS = [
  "languages", "runtimes", "frameworks", "dependencyTools", "practices", "requiredChecks", "environments",
  "deliveryConstraints", "compatibility", "security", "operations",
] as const;

function record(value: unknown, label: string): asserts value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new ContractError(`${label} must be an object.`);
  }
}

function known(value: Record<string, unknown>, allowed: readonly string[], label: string): void {
  const unknown = Object.keys(value).filter((key) => !allowed.includes(key));
  if (unknown.length) throw new ContractError(`${label} contains unknown properties: ${unknown.join(", ")}.`);
}

function nonEmpty(value: unknown, label: string): asserts value is string {
  if (typeof value !== "string" || !value.trim()) throw new ContractError(`${label} must be a non-empty string.`);
}

function text(value: unknown, label: string): asserts value is string {
  if (typeof value !== "string") throw new ContractError(`${label} must be a string.`);
}

function understandable(value: unknown, label: string): asserts value is string {
  nonEmpty(value, label);
  if (!/[\p{L}\p{N}]/u.test(value)) throw new ContractError(`${label} must contain letters or numbers.`);
}

function strings(value: unknown, label: string): asserts value is string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || !item.trim())) {
    throw new ContractError(`${label} must be an array of non-empty strings.`);
  }
}

function exact(value: unknown, expected: readonly string[], label: string): void {
  strings(value, label);
  if (value.length !== expected.length || new Set(value).size !== value.length || expected.some((item) => !value.includes(item))) {
    throw new ContractError(`${label} must contain exactly the supported values.`);
  }
}

function enumeration(value: unknown, allowed: readonly string[], label: string): asserts value is string {
  if (typeof value !== "string" || !allowed.includes(value)) {
    throw new ContractError(`${label} must be one of: ${allowed.join(", ")}.`);
  }
}

export async function loadEngineeringContract(path: string): Promise<EngineeringFoundationContract> {
  const value = parse(await readFile(path, "utf8")) as unknown;
  validateEngineeringContract(value);
  return value;
}

export function validateEngineeringContract(value: unknown): asserts value is EngineeringFoundationContract {
  record(value, "Engineering contract");
  known(value, [
    "version", "id", "responsibility", "required_product_phase", "coverage", "resolved_states", "phases",
    "command_confidence", "trigger_kinds", "allowed_generated_artifacts", "guarantees", "forbidden_authority",
  ], "Engineering contract");
  if (value.version !== 1 || value.id !== "establish-engineering-foundation" || value.responsibility !== "engineering" ||
      value.required_product_phase !== "product-foundation-confirmed") {
    throw new ContractError("Unsupported Engineering-foundation contract.");
  }
  exact(value.coverage, ENGINEERING_COVERAGE, "Engineering contract coverage");
  exact(value.resolved_states, RESOLVED, "Engineering contract resolved states");
  exact(value.phases, ENGINEERING_PHASES, "Engineering contract phases");
  exact(value.command_confidence, COMMAND_CONFIDENCE, "Engineering command confidence");
  exact(value.trigger_kinds, GUIDE_TRIGGER_KINDS, "Engineering trigger kinds");
  exact(value.allowed_generated_artifacts, ["LOOPY.md", "docs/loopy/Roadmap.md", "docs/loopy/Engineering-Guide.md"], "Engineering artifacts");
  record(value.guarantees, "Engineering guarantees");
  const guarantees = [
    "product_confirmation_required", "loopy_state_readable_without_project_grant", "project_context_requires_engineering_grant",
    "evidence_requires_matching_grant", "confirmed_commands_require_execution_evidence", "blocking_deferrals_forbid_confirmation",
    "current_review_required", "engineering_only_confirmation", "material_changes_reopen_engineering_only",
    "routine_evidence_refresh_preserves_confirmation", "append_only_history", "exactly_one_next_action",
    "synchronized_recoverable_writes", "shared_project_views_synchronized",
    "product_revision_anchor_requires_revisit", "confirmed_route_engine_owned", "workspace_containment",
    "stale_detection", "strict_runtime_validation",
  ];
  exact(Object.keys(value.guarantees), guarantees, "Engineering guarantees");
  if (Object.values(value.guarantees).some((item) => item !== true)) throw new ContractError("Engineering guarantees must be enabled.");
  exact(value.forbidden_authority, ["product", "architecture", "demo-acceptance", "release-authorization", "publication", "deployment-authorization"], "Engineering forbidden authority");
}

function validateGrantShape(grant: unknown, label: string): void {
  record(grant, label);
  known(grant, ["scope", "kind", "basis"], label);
  nonEmpty(grant.scope, `${label}.scope`);
  enumeration(grant.kind, CONTEXT_GRANT_KINDS, `${label}.kind`);
  enumeration(grant.basis, CONTEXT_GRANT_BASES, `${label}.basis`);
}

export function validateEngineeringInitializeOptions(value: unknown): asserts value is EngineeringInitializeOptions {
  record(value, "Engineering initialization options");
  known(value, ["participantResponsibilities", "contextGrants"], "Engineering initialization options");
  if (value.participantResponsibilities !== undefined) strings(value.participantResponsibilities, "participantResponsibilities");
  if (value.contextGrants !== undefined) {
    if (!Array.isArray(value.contextGrants)) throw new ContractError("contextGrants must be an array.");
    value.contextGrants.forEach((grant, index) => validateGrantShape(grant, `contextGrants[${index}]`));
  }
}

export function validateEngineeringUpdateShape(value: unknown): asserts value is EngineeringFoundationUpdate {
  record(value, "Engineering update");
  known(value, ["participantResponsibilities", "contextGrants", "engineering", "decisions", "nextActions"], "Engineering update");
  if (value.participantResponsibilities !== undefined) strings(value.participantResponsibilities, "participantResponsibilities");
  if (value.contextGrants !== undefined) {
    if (!Array.isArray(value.contextGrants)) throw new ContractError("contextGrants must be an array.");
    value.contextGrants.forEach((grant, index) => validateGrantShape(grant, `contextGrants[${index}]`));
  }
  if (value.engineering !== undefined) {
    record(value.engineering, "engineering");
    known(value.engineering, CONTENT_KEYS, "engineering");
  }
  if (value.decisions !== undefined) {
    record(value.decisions, "decisions");
    known(value.decisions, ENGINEERING_COVERAGE, "decisions");
  }
  if (value.nextActions !== undefined && !Array.isArray(value.nextActions)) {
    throw new ContractError("nextActions must be an array.");
  }
}

function validateEvidence(value: unknown, label: string, grants: ContextGrant[]): void {
  record(value, label);
  known(value, ["source", "finding", "contextScope"], label);
  nonEmpty(value.source, `${label}.source`);
  nonEmpty(value.finding, `${label}.finding`);
  nonEmpty(value.contextScope, `${label}.contextScope`);
  if (!grants.some((grant) => grant.scope === value.contextScope)) {
    throw new ContractError(`${label} is outside the authorized Engineering context.`);
  }
}

function validateDefaults(value: unknown, label: string): void {
  record(value, label);
  known(value, DEFAULT_KEYS, label);
  for (const key of DEFAULT_KEYS) strings(value[key], `${label}.${key}`);
}

function validateCommand(value: unknown, label: string, grants: ContextGrant[]): asserts value is EngineeringCommand {
  record(value, label);
  known(value, ["purpose", "command", "scope", "confidence", "source", "contextScope", "executionEvidence"], label);
  enumeration(value.purpose, COMMAND_PURPOSES, `${label}.purpose`);
  nonEmpty(value.command, `${label}.command`);
  nonEmpty(value.scope, `${label}.scope`);
  enumeration(value.confidence, COMMAND_CONFIDENCE, `${label}.confidence`);
  if ((value.source === undefined) !== (value.contextScope === undefined)) {
    throw new ContractError(`${label} source and contextScope must be supplied together.`);
  }
  if (value.source !== undefined) {
    nonEmpty(value.source, `${label}.source`);
    nonEmpty(value.contextScope, `${label}.contextScope`);
    if (!grants.some((grant) => grant.scope === value.contextScope)) {
      throw new ContractError(`${label} source is outside the authorized Engineering context.`);
    }
  }
  if (value.confidence === "observed" && value.source === undefined) {
    throw new ContractError(`${label} observed command requires an attributed source.`);
  }
  if (value.confidence === "confirmed") {
    record(value.executionEvidence, `${label}.executionEvidence`);
    known(value.executionEvidence, ["exactCommand", "observedResult", "environment"], `${label}.executionEvidence`);
    for (const key of ["exactCommand", "observedResult", "environment"] as const) {
      nonEmpty(value.executionEvidence[key], `${label}.executionEvidence.${key}`);
    }
    if (value.executionEvidence.exactCommand !== value.command) {
      throw new ContractError(`${label} confirmed command must match its exact execution evidence.`);
    }
  } else if (value.executionEvidence !== undefined) {
    throw new ContractError(`${label} execution evidence requires confirmed confidence.`);
  }
}

function validateContent(content: unknown, grants: ContextGrant[]): asserts content is EngineeringContent {
  record(content, "engineering");
  known(content, CONTENT_KEYS, "engineering");
  text(content.summary, "engineering.summary");
  if (!Array.isArray(content.evidence)) throw new ContractError("engineering.evidence must be an array.");
  content.evidence.forEach((item, index) => validateEvidence(item, `engineering.evidence[${index}]`, grants));
  validateDefaults(content.projectDefaults, "engineering.projectDefaults");
  if (!Array.isArray(content.components)) throw new ContractError("engineering.components must be an array.");
  content.components.forEach((item, index) => {
    const label = `engineering.components[${index}]`;
    record(item, label);
    known(item, ["name", "purpose", "path", "languages", "runtimes", "frameworks", "dependencyTools", "exceptions"], label);
    for (const key of ["name", "purpose", "path"] as const) nonEmpty(item[key], `${label}.${key}`);
    for (const key of ["languages", "runtimes", "frameworks", "dependencyTools", "exceptions"] as const) strings(item[key], `${label}.${key}`);
  });
  const componentNames = content.components.map((item) => item.name.toLowerCase());
  if (new Set(componentNames).size !== componentNames.length) throw new ContractError("Engineering component names must be unique.");
  if (!Array.isArray(content.commands)) throw new ContractError("engineering.commands must be an array.");
  content.commands.forEach((item, index) => validateCommand(item, `engineering.commands[${index}]`, grants));
  if (!Array.isArray(content.relationships)) throw new ContractError("engineering.relationships must be an array.");
  content.relationships.forEach((item, index) => {
    const label = `engineering.relationships[${index}]`;
    record(item, label);
    known(item, ["from", "to", "description", "deliveryConsequence"], label);
    for (const key of ["from", "to", "description", "deliveryConsequence"] as const) nonEmpty(item[key], `${label}.${key}`);
  });
  if (!Array.isArray(content.triggers)) throw new ContractError("engineering.triggers must be an array.");
  content.triggers.forEach((item, index) => {
    const label = `engineering.triggers[${index}]`;
    record(item, label);
    known(item, ["kind", "triggered", "reason", "nextResponsibility"], label);
    enumeration(item.kind, GUIDE_TRIGGER_KINDS, `${label}.kind`);
    if (typeof item.triggered !== "boolean") throw new ContractError(`${label}.triggered must be boolean.`);
    text(item.reason, `${label}.reason`);
    text(item.nextResponsibility, `${label}.nextResponsibility`);
    if (item.triggered) {
      nonEmpty(item.reason, `${label}.reason`);
      nonEmpty(item.nextResponsibility, `${label}.nextResponsibility`);
      const expected = { architecture: "Architecture", "demo-strategy": "Demo or quality", "release-strategy": "Release" }[item.kind];
      if (item.nextResponsibility !== expected) {
        throw new ContractError(`${label} must route to ${expected} responsibility.`);
      }
    } else if (item.reason || item.nextResponsibility) {
      throw new ContractError(`${label} cannot route an untriggered guide.`);
    }
  });
  exact(content.triggers.map((item) => item.kind), GUIDE_TRIGGER_KINDS, "engineering trigger kinds");
  for (const key of ["assumptions", "unknowns"] as const) strings(content[key], `engineering.${key}`);
  if (!Array.isArray(content.deferrals)) throw new ContractError("engineering.deferrals must be an array.");
  content.deferrals.forEach((item, index) => {
    const label = `engineering.deferrals[${index}]`;
    record(item, label);
    known(item, ["topic", "question", "consequence", "revisitWhen", "blocking"], label);
    enumeration(item.topic, ENGINEERING_COVERAGE, `${label}.topic`);
    for (const key of ["question", "consequence", "revisitWhen"] as const) nonEmpty(item[key], `${label}.${key}`);
    if (typeof item.blocking !== "boolean") throw new ContractError(`${label}.blocking must be boolean.`);
  });
}

function populated(content: EngineeringContent, topic: EngineeringCoverage): boolean {
  const defaults = content.projectDefaults;
  switch (topic) {
    case "project_defaults": return Object.values(defaults).some((items) => items.length > 0);
    case "components": return content.components.length > 0;
    case "technology": return [...defaults.languages, ...defaults.runtimes, ...defaults.frameworks, ...defaults.dependencyTools,
      ...content.components.flatMap((item) => [...item.languages, ...item.runtimes, ...item.frameworks, ...item.dependencyTools])].length > 0;
    case "commands": return content.commands.length > 0;
    case "relationships": return content.relationships.length > 0;
    case "practices_and_checks": return defaults.practices.length > 0 || defaults.requiredChecks.length > 0;
    case "operating_context": return [...defaults.environments, ...defaults.deliveryConstraints, ...defaults.compatibility,
      ...defaults.security, ...defaults.operations].length > 0;
    case "open_matters": return content.assumptions.length > 0 || content.unknowns.length > 0 || content.deferrals.length > 0;
  }
}

function validateCoverage(state: EngineeringFoundationState): void {
  const deferred = new Set<EngineeringCoverage>();
  for (const item of state.engineering.deferrals) {
    if (deferred.has(item.topic)) throw new ContractError(`Engineering deferrals duplicate ${item.topic}.`);
    deferred.add(item.topic);
    const expected = item.blocking ? "deferred_blocking" : "deferred_non_blocking";
    if (state.decisions[item.topic].status !== expected) {
      throw new ContractError(`${item.topic} deferral must match ${expected}.`);
    }
  }
  for (const topic of ENGINEERING_COVERAGE) {
    const entry = state.decisions[topic];
    if (!ALL_STATUSES.includes(entry.status)) throw new ContractError(`decisions.${topic} has an invalid state.`);
    if ((entry.status === "established" || entry.status === "established_from_evidence") && !populated(state.engineering, topic)) {
      throw new ContractError(`${topic} cannot be established without readable Engineering content.`);
    }
    if ((entry.status === "explicitly_none" || entry.status === "not_applicable") && populated(state.engineering, topic)) {
      throw new ContractError(`${topic} cannot be ${entry.status} while corresponding content exists.`);
    }
    if (entry.status === "established_from_evidence" && state.engineering.evidence.length === 0) {
      throw new ContractError(`${topic} cannot be established from evidence without attributed evidence.`);
    }
    if (entry.status === "deferred_blocking" && !state.engineering.deferrals.some((item) => item.topic === topic && item.blocking)) {
      throw new ContractError(`${topic} requires a visible blocking deferral.`);
    }
    if (entry.status === "deferred_non_blocking" && !state.engineering.deferrals.some((item) => item.topic === topic && !item.blocking)) {
      throw new ContractError(`${topic} requires a visible nonblocking deferral.`);
    }
  }
}

function validateDecisionRecord(value: unknown, label: string): void {
  record(value, label);
  known(value, ENGINEERING_COVERAGE, label);
  for (const topic of ENGINEERING_COVERAGE) {
    const entry = value[topic];
    record(entry, `${label}.${topic}`);
    known(entry, ["status", "note"], `${label}.${topic}`);
    enumeration(entry.status, ALL_STATUSES, `${label}.${topic}.status`);
    if (entry.note !== undefined) text(entry.note, `${label}.${topic}.note`);
    if (["deferred_non_blocking", "deferred_blocking"].includes(entry.status as string)) {
      nonEmpty(entry.note, `${label}.${topic}.note`);
    }
  }
}

function validateHistory(state: EngineeringFoundationState): void {
  let previous: string | null = null;
  state.confirmedHistory.forEach((item, index) => {
    record(item, `confirmedHistory[${index}]`);
    known(item, [
      "revision", "draftVersion", "productRevision", "productConfirmationHash", "engineering", "decisions",
      "contextGrants", "responsibilityConfirmations", "previousHash", "contentHash",
    ], `confirmedHistory[${index}]`);
    if (item.revision !== index + 1 || !Number.isInteger(item.draftVersion) || item.draftVersion < 0 ||
        !Number.isInteger(item.productRevision) || item.productRevision < 1 ||
        !/^[a-f0-9]{64}$/.test(item.productConfirmationHash)) {
      throw new ContractError("Engineering confirmation history versions are invalid.");
    }
    if (!Array.isArray(item.contextGrants)) throw new ContractError("Engineering confirmation grants must be an array.");
    item.contextGrants.forEach((grant, grantIndex) => validateGrantShape(grant, `confirmedHistory[${index}].contextGrants[${grantIndex}]`));
    if (!isDeepStrictEqual(normalizeContextGrants(state.workspaceRoot, item.contextGrants), item.contextGrants)) {
      throw new ContractError("Engineering confirmation grants must use canonical scopes.");
    }
    validateContent(item.engineering, item.contextGrants);
    validateDecisionRecord(item.decisions, `confirmedHistory[${index}].decisions`);
    strings(item.responsibilityConfirmations, `confirmedHistory[${index}].responsibilityConfirmations`);
    if (!isDeepStrictEqual(item.responsibilityConfirmations, ["engineering"])) {
      throw new ContractError("Engineering confirmation history requires Engineering-only receipts.");
    }
    const { contentHash, ...withoutHash } = item;
    if (!/^[a-f0-9]{64}$/.test(contentHash) || item.previousHash !== previous || engineeringConfirmationHash(withoutHash) !== contentHash) {
      throw new ContractError("Engineering confirmation history integrity failed.");
    }
    previous = contentHash;
  });
  if (state.confirmedHistory.length !== state.revision) throw new ContractError("Engineering confirmation revision count is invalid.");
  let changePrevious: string | null = null;
  state.changeHistory.forEach((item, index) => {
    record(item, `changeHistory[${index}]`);
    known(item, ["version", "kind", "draftVersion", "snapshotHash", "previousHash", "contentHash"], `changeHistory[${index}]`);
    enumeration(item.kind, ["material", "evidence-refresh"], `changeHistory[${index}].kind`);
    if (!Number.isInteger(item.draftVersion) || item.draftVersion < 0 || !/^[a-f0-9]{64}$/.test(item.snapshotHash) ||
        !/^[a-f0-9]{64}$/.test(item.contentHash)) throw new ContractError("Engineering change history values are invalid.");
    const { contentHash, ...withoutHash } = item;
    if (item.version !== index + 1 || item.previousHash !== changePrevious || engineeringChangeHash(withoutHash) !== contentHash) {
      throw new ContractError("Engineering change history integrity failed.");
    }
    changePrevious = contentHash;
  });
  if (state.changeHistoryHead !== changePrevious) throw new ContractError("Engineering change-history anchor is invalid.");
  const latestChange = state.changeHistory.at(-1);
  if (latestChange && latestChange.snapshotHash !== engineeringChangeSnapshotHash(state)) {
    throw new ContractError("Current Engineering state does not match its append-only change history.");
  }
  if (state.phase === "engineering-foundation-confirmed") {
    const latest = state.confirmedHistory.at(-1);
    if (!latest || !isDeepStrictEqual(engineeringMeaningSnapshot(latest), engineeringMeaningSnapshot(state))) {
      throw new ContractError("Confirmed Engineering meaning does not match its append-only receipt.");
    }
    if (latest.productRevision !== state.productRevision || latest.productConfirmationHash !== state.productConfirmationHash) {
      throw new ContractError("Confirmed Engineering state does not match its receipt's Product anchor.");
    }
  }
}

export function engineeringConfirmationBlockers(state: EngineeringFoundationState): string[] {
  const blockers = ENGINEERING_COVERAGE.filter((topic) => !RESOLVED.includes(state.decisions[topic].status));
  if (!state.participantResponsibilities.includes("engineering")) blockers.push("engineering-participation" as EngineeringCoverage);
  if (state.engineering.deferrals.some((item) => item.blocking)) blockers.push("blocking-deferral" as EngineeringCoverage);
  return blockers;
}

export function engineeringPreconfirmationPhase(state: EngineeringFoundationState): EngineeringFoundationState["phase"] {
  if (state.engineering.deferrals.some((item) => item.blocking) ||
      ENGINEERING_COVERAGE.some((topic) => state.decisions[topic].status === "deferred_blocking")) return "blocked";
  if (!engineeringConfirmationBlockers(state).length) return "ready-for-engineering-confirmation";
  return "draft";
}

export function validateEngineeringState(contract: EngineeringFoundationContract, value: unknown, forConfirmation = false): asserts value is EngineeringFoundationState {
  record(value, "Engineering state");
  known(value, [
    "schemaVersion", "stage", "workspaceClass", "workspaceRoot", "productRevision", "productConfirmationHash", "phase",
    "revision", "draftVersion", "reviewedDraftVersion", "participantResponsibilities", "contextGrants", "engineering",
    "decisions", "nextActions", "responsibilityConfirmations", "session", "confirmedHistory", "changeHistory",
    "changeHistoryHead", "generatedViews",
  ], "Engineering state");
  if (value.schemaVersion !== 1 || value.stage !== "engineering-foundation" || value.workspaceClass !== "human-project") {
    throw new ContractError("Engineering state has an invalid schema or workspace class.");
  }
  nonEmpty(value.workspaceRoot, "workspaceRoot");
  if (!Number.isInteger(value.productRevision) || (value.productRevision as number) < 1) throw new ContractError("productRevision is invalid.");
  nonEmpty(value.productConfirmationHash, "productConfirmationHash");
  if (!/^[a-f0-9]{64}$/.test(value.productConfirmationHash)) throw new ContractError("productConfirmationHash must be a SHA-256 hash.");
  enumeration(value.phase, ENGINEERING_PHASES, "phase");
  for (const key of ["revision", "draftVersion"] as const) {
    if (!Number.isInteger(value[key]) || (value[key] as number) < 0) throw new ContractError(`${key} is invalid.`);
  }
  if (value.reviewedDraftVersion !== null && (!Number.isInteger(value.reviewedDraftVersion) ||
      (value.reviewedDraftVersion as number) < 0 || (value.reviewedDraftVersion as number) > (value.draftVersion as number))) {
    throw new ContractError("reviewedDraftVersion is invalid.");
  }
  strings(value.participantResponsibilities, "participantResponsibilities");
  if (!Array.isArray(value.contextGrants)) throw new ContractError("contextGrants must be an array.");
  value.contextGrants.forEach((grant, index) => validateGrantShape(grant, `contextGrants[${index}]`));
  const normalized = normalizeContextGrants(value.workspaceRoot, value.contextGrants as ContextGrant[]);
  if (!isDeepStrictEqual(normalized, value.contextGrants)) throw new ContractError("Engineering context grants must use canonical scopes.");
  validateContent(value.engineering, value.contextGrants as ContextGrant[]);
  validateDecisionRecord(value.decisions, "decisions");
  if (!Array.isArray(value.nextActions) || value.nextActions.length !== 1) throw new ContractError("Engineering state requires exactly one next action.");
  record(value.nextActions[0], "nextActions[0]");
  known(value.nextActions[0], ["participant", "action", "reason"], "nextActions[0]");
  for (const key of ["participant", "action", "reason"] as const) understandable(value.nextActions[0][key], `nextActions[0].${key}`);
  strings(value.responsibilityConfirmations, "responsibilityConfirmations");
  record(value.session, "session");
  known(value.session, ["status", "resumeTopic"], "session");
  enumeration(value.session.status, SESSION_STATUSES, "session.status");
  if (value.session.resumeTopic !== null) enumeration(value.session.resumeTopic, ENGINEERING_COVERAGE, "session.resumeTopic");
  if (!Array.isArray(value.confirmedHistory) || !Array.isArray(value.changeHistory)) throw new ContractError("Engineering history must be arrays.");
  if (value.changeHistoryHead !== null && (typeof value.changeHistoryHead !== "string" || !/^[a-f0-9]{64}$/.test(value.changeHistoryHead))) {
    throw new ContractError("changeHistoryHead must be a SHA-256 hash or null.");
  }
  record(value.generatedViews, "generatedViews");
  known(value.generatedViews, contract.allowed_generated_artifacts, "generatedViews");
  for (const [path, view] of Object.entries(value.generatedViews)) {
    record(view, `generatedViews.${path}`);
    known(view, ["revision", "draftVersion", "sha256"], `generatedViews.${path}`);
    if (!Number.isInteger(view.revision) || !Number.isInteger(view.draftVersion) || typeof view.sha256 !== "string" || !/^[a-f0-9]{64}$/.test(view.sha256)) {
      throw new ContractError(`generatedViews.${path} is invalid.`);
    }
  }
  validateCoverage(value as unknown as EngineeringFoundationState);
  validateHistory(value as unknown as EngineeringFoundationState);
  const state = value as unknown as EngineeringFoundationState;
  const blocking = state.engineering.deferrals.some((item) => item.blocking) ||
    ENGINEERING_COVERAGE.some((topic) => state.decisions[topic].status === "deferred_blocking");
  if (blocking && state.phase !== "blocked") throw new ContractError("A blocking Engineering deferral requires blocked phase.");
  if (state.phase === "blocked" && !blocking) throw new ContractError("Blocked Engineering state requires a blocking deferral.");
  if (state.phase === "ready-for-engineering-confirmation" && engineeringConfirmationBlockers(state).length) {
    throw new ContractError("Engineering state is marked ready while required coverage remains unresolved.");
  }
  if (state.phase === "engineering-foundation-confirmed" && !isDeepStrictEqual(state.responsibilityConfirmations, ["engineering"])) {
    throw new ContractError("Confirmed Engineering state requires an Engineering-only receipt.");
  }
  if (state.phase !== "engineering-foundation-confirmed" && state.nextActions[0].participant.toLowerCase() !== "engineering") {
    throw new ContractError("Before confirmation, the one next action must belong to Engineering.");
  }
  if (forConfirmation) {
    if (state.phase !== "ready-for-engineering-confirmation") throw new ContractError("Engineering foundation is not ready for confirmation.");
    if (state.reviewedDraftVersion !== state.draftVersion) throw new ContractError("The current Engineering Guide must be reviewed before confirmation.");
    if (!isDeepStrictEqual(state.responsibilityConfirmations, ["engineering"])) throw new ContractError("Only Engineering may confirm the Engineering Guide.");
    if (engineeringConfirmationBlockers(state).length) throw new ContractError("Engineering confirmation has unresolved blockers.");
  }
}
