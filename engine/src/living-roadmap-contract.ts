import { readFile } from "node:fs/promises";
import { isDeepStrictEqual } from "node:util";
import { parse } from "yaml";
import { ContractError } from "./contract.js";
import { livingRoadmapHistoryHash, livingRoadmapSnapshotHash } from "./living-roadmap-meaning.js";
import {
  CANDIDATE_STATES,
  DEPENDENCY_BOUNDARIES,
  DEPENDENCY_KINDS,
  ROADMAP_PRIORITIES,
  ROADMAP_OPERATION_TYPES,
  ROADMAP_RESPONSIBILITIES,
  ROADMAP_SESSION_STATUSES,
  type CandidateBlocker,
  type CandidateDependency,
  type LivingRoadmapCandidate,
  type LivingRoadmapContract,
  type LivingRoadmapState,
  type RoadmapOperation,
} from "./living-roadmap-types.js";

function record(value: unknown, label: string): asserts value is Record<string, any> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new ContractError(`${label} must be an object.`);
}
function known(value: Record<string, any>, keys: readonly string[], label: string): void {
  const extras = Object.keys(value).filter((key) => !keys.includes(key));
  if (extras.length) throw new ContractError(`${label} contains unknown properties: ${extras.join(", ")}.`);
}
function nonEmpty(value: unknown, label: string): asserts value is string {
  if (typeof value !== "string" || !/[\p{L}\p{N}]/u.test(value)) throw new ContractError(`${label} must contain letters or numbers.`);
}
function enumeration<T extends string>(value: unknown, values: readonly T[], label: string): asserts value is T {
  if (!values.includes(value as T)) throw new ContractError(`${label} must be one of: ${values.join(", ")}.`);
}
function strings(value: unknown, label: string): asserts value is string[] {
  if (!Array.isArray(value)) throw new ContractError(`${label} must be an array.`);
  value.forEach((item, index) => nonEmpty(item, `${label}[${index}]`));
}

export async function loadLivingRoadmapContract(path: string): Promise<LivingRoadmapContract> {
  const value = parse(await readFile(path, "utf8")) as unknown;
  record(value, "Living Roadmap contract");
  known(value, ["version", "id", "required_product_phase", "generated_artifacts", "priority_order", "candidate_states",
    "dependency_kinds", "dependency_boundaries", "multi_selection_atomic", "candidates_remain_uncommitted",
    "implementation_workspace_out_of_scope", "append_only_hash_linked_history", "rejected_operations_do_not_mutate"], "Living Roadmap contract");
  if (value.version !== 1 || value.id !== "living-roadmap-management" ||
      value.required_product_phase !== "product-foundation-confirmed" ||
      !isDeepStrictEqual(value.generated_artifacts, ["LOOPY.md", "docs/loopy/Roadmap.md"]) ||
      !isDeepStrictEqual(value.priority_order, ROADMAP_PRIORITIES) ||
      !isDeepStrictEqual(value.candidate_states, CANDIDATE_STATES) ||
      !isDeepStrictEqual(value.dependency_kinds, DEPENDENCY_KINDS) ||
      !isDeepStrictEqual(value.dependency_boundaries, DEPENDENCY_BOUNDARIES) ||
      value.multi_selection_atomic !== true || value.candidates_remain_uncommitted !== true ||
      value.implementation_workspace_out_of_scope !== true || value.append_only_hash_linked_history !== true ||
      value.rejected_operations_do_not_mutate !== true) throw new ContractError("Living Roadmap contract does not preserve the accepted boundary.");
  return value as LivingRoadmapContract;
}

function validateDependency(value: unknown, label: string): asserts value is CandidateDependency {
  record(value, label);
  known(value, ["candidateId", "external", "kind", "boundary", "note", "recommendedBy"], label);
  if (value.candidateId !== undefined) nonEmpty(value.candidateId, `${label}.candidateId`);
  if (value.external !== undefined) nonEmpty(value.external, `${label}.external`);
  if (Boolean(value.candidateId) === Boolean(value.external)) throw new ContractError(`${label} requires exactly one candidateId or external dependency target.`);
  enumeration(value.kind, DEPENDENCY_KINDS, `${label}.kind`);
  enumeration(value.boundary, DEPENDENCY_BOUNDARIES, `${label}.boundary`);
  nonEmpty(value.note, `${label}.note`);
  enumeration(value.recommendedBy, ["Product", "Engineering"], `${label}.recommendedBy`);
}

function validateBlocker(value: unknown, label: string): asserts value is CandidateBlocker {
  record(value, label);
  known(value, ["reason", "responsibility", "blocksDefinition"], label);
  nonEmpty(value.reason, `${label}.reason`);
  enumeration(value.responsibility, ["Product", "Engineering"], `${label}.responsibility`);
  if (typeof value.blocksDefinition !== "boolean") throw new ContractError(`${label}.blocksDefinition must be boolean.`);
}

function validateCandidate(value: unknown, label: string): asserts value is LivingRoadmapCandidate {
  record(value, label);
  known(value, ["id", "title", "outcome", "priority", "order", "rationale", "state", "dependencies", "unresolvedDependencyNotes", "blockers",
    "nextShapingStep", "participants", "lineage", "dispositionReason", "reconsiderWhen"], label);
  for (const key of ["id", "title", "outcome", "rationale", "nextShapingStep"] as const) nonEmpty(value[key], `${label}.${key}`);
  enumeration(value.priority, ROADMAP_PRIORITIES, `${label}.priority`);
  enumeration(value.state, CANDIDATE_STATES, `${label}.state`);
  if (!Number.isInteger(value.order) || value.order < 0) throw new ContractError(`${label}.order must be a non-negative integer.`);
  if (!Array.isArray(value.dependencies)) throw new ContractError(`${label}.dependencies must be an array.`);
  value.dependencies.forEach((item, index) => validateDependency(item, `${label}.dependencies[${index}]`));
  const dependencyKeys = value.dependencies.map((item: CandidateDependency) => `${item.candidateId ?? `external:${item.external}`}|${item.boundary}`);
  if (new Set(dependencyKeys).size !== dependencyKeys.length) throw new ContractError(`${label} has conflicting or duplicate dependency relationships.`);
  strings(value.unresolvedDependencyNotes, `${label}.unresolvedDependencyNotes`);
  if (!Array.isArray(value.blockers)) throw new ContractError(`${label}.blockers must be an array.`);
  value.blockers.forEach((item, index) => validateBlocker(item, `${label}.blockers[${index}]`));
  if (!Array.isArray(value.participants)) throw new ContractError(`${label}.participants must be an array.`);
  value.participants.forEach((item, index) => {
    record(item, `${label}.participants[${index}]`); known(item, ["name", "responsibility"], `${label}.participants[${index}]`);
    nonEmpty(item.name, `${label}.participants[${index}].name`); nonEmpty(item.responsibility, `${label}.participants[${index}].responsibility`);
  });
  if (!Array.isArray(value.lineage)) throw new ContractError(`${label}.lineage must be an array.`);
  value.lineage.forEach((item, index) => {
    record(item, `${label}.lineage[${index}]`); known(item, ["relation", "candidateIds"], `${label}.lineage[${index}]`);
    enumeration(item.relation, ["combined-from", "split-from", "supersedes", "superseded-from"], `${label}.lineage[${index}].relation`);
    strings(item.candidateIds, `${label}.lineage[${index}].candidateIds`);
  });
  if (typeof value.dispositionReason !== "string" || typeof value.reconsiderWhen !== "string") {
    throw new ContractError(`${label} disposition fields must be strings.`);
  }
  if (["Deferred", "Cancelled", "Superseded"].includes(value.state) && !value.dispositionReason.trim()) {
    throw new ContractError(`${label} requires a disposition reason.`);
  }
  if (value.state === "Deferred" && !value.reconsiderWhen.trim()) throw new ContractError(`${label} requires a reconsideration condition.`);
}

export function definitionEligibility(candidate: LivingRoadmapCandidate): { eligible: boolean; reason: string } {
  if (candidate.state !== "Open") return { eligible: false, reason: `${candidate.title} is ${candidate.state.toLowerCase()}.` };
  const blocker = candidate.blockers.find((item) => item.blocksDefinition);
  if (blocker) return { eligible: false, reason: `${candidate.title}: ${blocker.reason}` };
  const dependency = candidate.dependencies.find((item) => item.kind === "required-before" && item.boundary === "definition");
  if (dependency) return { eligible: false, reason: `${candidate.title} has a required-before Definition dependency.` };
  if (candidate.unresolvedDependencyNotes.length) return { eligible: false, reason: `${candidate.title} has an unresolved dependency that must be classified before Definition selection.` };
  return { eligible: true, reason: "Eligible for Milestone Definition." };
}

export function validateLivingRoadmapState(contract: LivingRoadmapContract, value: unknown): asserts value is LivingRoadmapState {
  record(value, "Living Roadmap state");
  known(value, ["schemaVersion", "stage", "workspaceClass", "workspaceRoot", "productRevision", "revision", "nextCandidateNumber",
    "candidates", "selectedBatches", "nextActions", "session", "history", "historyHead", "generatedViews"], "Living Roadmap state");
  if (value.schemaVersion !== 1 || value.stage !== "living-roadmap" || value.workspaceClass !== "human-project") {
    throw new ContractError("Living Roadmap state has an invalid schema or workspace class.");
  }
  nonEmpty(value.workspaceRoot, "workspaceRoot");
  for (const key of ["productRevision", "revision", "nextCandidateNumber"] as const) {
    if (!Number.isInteger(value[key]) || value[key] < (key === "productRevision" ? 1 : 0)) throw new ContractError(`${key} is invalid.`);
  }
  if (!Array.isArray(value.candidates)) throw new ContractError("candidates must be an array.");
  value.candidates.forEach((item, index) => validateCandidate(item, `candidates[${index}]`));
  const candidates = value.candidates as LivingRoadmapCandidate[];
  const ids = candidates.map((item) => item.id);
  if (new Set(ids).size !== ids.length) throw new ContractError("Candidate identities must be unique.");
  const orders = candidates.map((item) => item.order);
  if (new Set(orders).size !== orders.length) throw new ContractError("Candidate ordering must be stable and unique.");
  for (const candidate of candidates) {
    for (const dependency of candidate.dependencies) {
      if (dependency.candidateId && (dependency.candidateId === candidate.id || !ids.includes(dependency.candidateId))) throw new ContractError("Candidate dependencies must reference another current portfolio identity.");
    }
    for (const lineage of candidate.lineage) {
      if (lineage.candidateIds.some((id) => id === candidate.id || !ids.includes(id))) throw new ContractError("Candidate lineage must reference another current portfolio identity.");
    }
  }
  if (!Array.isArray(value.selectedBatches)) throw new ContractError("selectedBatches must be an array.");
  value.selectedBatches.forEach((batch, index) => {
    record(batch, `selectedBatches[${index}]`); known(batch, ["version", "candidateIds"], `selectedBatches[${index}]`);
    if (batch.version !== index + 1) throw new ContractError("Selected batch versions must be sequential.");
    strings(batch.candidateIds, `selectedBatches[${index}].candidateIds`);
    if (batch.candidateIds.some((id: string) => !ids.includes(id))) throw new ContractError("Selected batches must reference current candidates.");
  });
  if (!Array.isArray(value.nextActions) || value.nextActions.length !== 1) throw new ContractError("Living Roadmap requires exactly one next action.");
  record(value.nextActions[0], "nextActions[0]"); known(value.nextActions[0], ["participant", "action", "reason"], "nextActions[0]");
  for (const key of ["participant", "action", "reason"] as const) nonEmpty(value.nextActions[0][key], `nextActions[0].${key}`);
  record(value.session, "session"); known(value.session, ["status", "resumeAction"], "session");
  enumeration(value.session.status, ROADMAP_SESSION_STATUSES, "session.status");
  if (value.session.resumeAction !== null) nonEmpty(value.session.resumeAction, "session.resumeAction");
  if (value.session.status === "interrupted" && value.session.resumeAction === null) throw new ContractError("Interrupted Roadmap work requires a resume action.");
  if (!Array.isArray(value.history)) throw new ContractError("history must be an array.");
  let previous: string | null = null;
  value.history.forEach((item, index) => {
    record(item, `history[${index}]`); known(item, ["version", "operation", "summary", "beforeHash", "afterHash", "previousHash", "contentHash"], `history[${index}]`);
    if (item.version !== index + 1) throw new ContractError("Roadmap history versions must be sequential.");
    enumeration(item.operation, [...ROADMAP_OPERATION_TYPES, "interrupt", "resume", "change-management"], `history[${index}].operation`); nonEmpty(item.summary, `history[${index}].summary`);
    for (const key of ["beforeHash", "afterHash", "contentHash"] as const) if (typeof item[key] !== "string" || !/^[a-f0-9]{64}$/.test(item[key])) throw new ContractError(`history[${index}].${key} must be a SHA-256 hash.`);
    const { contentHash, ...withoutHash } = item;
    if (item.previousHash !== previous || livingRoadmapHistoryHash(withoutHash as any) !== contentHash) throw new ContractError("Living Roadmap history integrity failed.");
    previous = contentHash;
  });
  if (value.historyHead !== previous || value.revision !== value.history.length) throw new ContractError("Living Roadmap history anchor is invalid.");
  const latest = value.history.at(-1);
  if (latest && latest.afterHash !== livingRoadmapSnapshotHash(value as LivingRoadmapState)) throw new ContractError("Current Living Roadmap does not match its append-only history.");
  record(value.generatedViews, "generatedViews"); known(value.generatedViews, contract.generated_artifacts, "generatedViews");
  for (const [path, view] of Object.entries(value.generatedViews)) {
    record(view, `generatedViews.${path}`); known(view, ["revision", "sha256"], `generatedViews.${path}`);
    if (!Number.isInteger(view.revision) || view.revision > value.revision || typeof view.sha256 !== "string" || !/^[a-f0-9]{64}$/.test(view.sha256)) {
      throw new ContractError(`generatedViews.${path} is invalid.`);
    }
  }
}

export function validateRoadmapOperation(value: unknown): asserts value is RoadmapOperation {
  record(value, "Roadmap operation");
  enumeration(value.type, ROADMAP_OPERATION_TYPES, "operation.type");
  const fields: Record<(typeof ROADMAP_OPERATION_TYPES)[number], string[]> = {
    add: ["type", "actor", "candidate"], rename: ["type", "actor", "candidateId", "title"],
    combine: ["type", "actor", "candidateIds", "candidate"], split: ["type", "actor", "candidateId", "candidates"],
    prioritize: ["type", "actor", "candidateId", "priority", "order"], defer: ["type", "actor", "candidateId", "reason", "reconsiderWhen"],
    cancel: ["type", "actor", "candidateId", "reason"], supersede: ["type", "actor", "candidateId", "replacementCandidateId", "reason"],
    "set-dependencies": ["type", "actor", "candidateId", "dependencies"], "set-blockers": ["type", "actor", "candidateId", "blockers"],
    "record-participation": ["type", "actor", "candidateId", "participants"], select: ["type", "actor", "candidateIds"],
    "reconcile-product": ["type", "actor"],
  };
  known(value, fields[value.type], "Roadmap operation");
  record(value.actor, "operation.actor"); known(value.actor, ["name", "responsibility", "intentBasis"], "operation.actor");
  nonEmpty(value.actor.name, "operation.actor.name"); enumeration(value.actor.responsibility, ROADMAP_RESPONSIBILITIES, "operation.actor.responsibility");
  if (value.actor.intentBasis !== undefined) nonEmpty(value.actor.intentBasis, "operation.actor.intentBasis");
  const candidateInput = (input: unknown, label: string): void => {
    record(input, label); known(input, ["title", "outcome", "priority", "rationale", "nextShapingStep"], label);
    for (const key of ["title", "outcome", "rationale", "nextShapingStep"] as const) nonEmpty(input[key], `${label}.${key}`);
    enumeration(input.priority, ROADMAP_PRIORITIES, `${label}.priority`);
  };
  const candidateId = (): void => nonEmpty(value.candidateId, "operation.candidateId");
  switch (value.type) {
    case "add": candidateInput(value.candidate, "operation.candidate"); break;
    case "rename": candidateId(); nonEmpty(value.title, "operation.title"); break;
    case "combine": strings(value.candidateIds, "operation.candidateIds"); candidateInput(value.candidate, "operation.candidate"); break;
    case "split":
      candidateId();
      if (!Array.isArray(value.candidates)) throw new ContractError("operation.candidates must be an array.");
      value.candidates.forEach((item: unknown, index: number) => candidateInput(item, `operation.candidates[${index}]`));
      break;
    case "prioritize":
      candidateId(); enumeration(value.priority, ROADMAP_PRIORITIES, "operation.priority");
      if (!Number.isInteger(value.order) || value.order < 0) throw new ContractError("operation.order must be a non-negative integer.");
      break;
    case "defer": candidateId(); nonEmpty(value.reason, "operation.reason"); nonEmpty(value.reconsiderWhen, "operation.reconsiderWhen"); break;
    case "cancel": candidateId(); nonEmpty(value.reason, "operation.reason"); break;
    case "supersede": candidateId(); nonEmpty(value.replacementCandidateId, "operation.replacementCandidateId"); nonEmpty(value.reason, "operation.reason"); break;
    case "set-dependencies":
      candidateId();
      if (!Array.isArray(value.dependencies)) throw new ContractError("operation.dependencies must be an array.");
      value.dependencies.forEach((item: unknown, index: number) => validateDependency(item, `operation.dependencies[${index}]`));
      break;
    case "set-blockers":
      candidateId();
      if (!Array.isArray(value.blockers)) throw new ContractError("operation.blockers must be an array.");
      value.blockers.forEach((item: unknown, index: number) => validateBlocker(item, `operation.blockers[${index}]`));
      break;
    case "record-participation":
      candidateId();
      if (!Array.isArray(value.participants)) throw new ContractError("operation.participants must be an array.");
      value.participants.forEach((item: unknown, index: number) => {
        record(item, `operation.participants[${index}]`); known(item, ["name", "responsibility"], `operation.participants[${index}]`);
        nonEmpty(item.name, `operation.participants[${index}].name`); nonEmpty(item.responsibility, `operation.participants[${index}].responsibility`);
      });
      break;
    case "select": strings(value.candidateIds, "operation.candidateIds"); break;
    case "reconcile-product": break;
  }
}
