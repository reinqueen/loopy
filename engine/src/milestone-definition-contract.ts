import { readFile } from "node:fs/promises";
import { parse } from "yaml";
import { ContractError } from "./contract.js";
import { definitionHistoryHash, definitionSnapshotHash } from "./milestone-definition-meaning.js";
import {
  DEFINITION_COHERENCE,
  DEFINITION_PERSPECTIVES,
  DEFINITION_PHASES,
  SPECIALIST_MODES,
  type DefinitionContent,
  type DefinitionDraftRevalidation,
  type DirectDefinitionStart,
  type DefinitionPerspective,
  type DefinitionUpdate,
  type MilestoneDefinition,
  type MilestoneDefinitionContract,
  type MilestoneDefinitionState,
} from "./milestone-definition-types.js";
import { DEPENDENCY_KINDS } from "./living-roadmap-types.js";

function object(value: unknown, label: string): asserts value is Record<string, any> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new ContractError(`${label} must be an object.`);
}
function keys(value: Record<string, any>, allowed: readonly string[], label: string): void {
  const extras = Object.keys(value).filter((key) => !allowed.includes(key));
  if (extras.length) throw new ContractError(`${label} contains unknown properties: ${extras.join(", ")}.`);
}
function text(value: unknown, label: string): asserts value is string {
  if (typeof value !== "string" || !/[\p{L}\p{N}]/u.test(value)) throw new ContractError(`${label} must contain letters or numbers.`);
}
function texts(value: unknown, label: string): asserts value is string[] {
  if (!Array.isArray(value)) throw new ContractError(`${label} must be an array.`);
  value.forEach((item, index) => text(item, `${label}[${index}]`));
}
function enumeration<T extends string>(value: unknown, allowed: readonly T[], label: string): asserts value is T {
  if (!allowed.includes(value as T)) throw new ContractError(`${label} must be one of: ${allowed.join(", ")}.`);
}
function perspectives(value: unknown, label: string, allowEmpty = false): asserts value is DefinitionPerspective[] {
  if (!Array.isArray(value) || (!allowEmpty && value.length === 0)) throw new ContractError(`${label} must name at least one responsibility perspective.`);
  value.forEach((item, index) => enumeration(item, DEFINITION_PERSPECTIVES, `${label}[${index}]`));
  if (new Set(value).size !== value.length) throw new ContractError(`${label} must be unique.`);
}

export async function loadMilestoneDefinitionContract(path: string): Promise<MilestoneDefinitionContract> {
  const value = parse(await readFile(path, "utf8")) as unknown;
  object(value, "Milestone Definition contract");
  keys(value, ["version", "id", "source_candidate_state", "direct_entry_bootstraps_existing_state", "product_confirmation_required_for_definition_drafting", "authoritative_delivery_boundary", "semantic_coherence_owned_by_host_ai",
    "independent_definition_commitment", "same_revision_receipts", "exactly_one_next_action", "append_only_hash_linked_history",
    "rejected_operations_do_not_mutate", "ordinary_updates_may_defer_publication", "published_revision_metadata_required",
    "inherited_dependency_kinds_preserved", "later_stages_out_of_scope"], "Milestone Definition contract");
  if (value.version !== 1 || value.id !== "milestone-definition" || value.source_candidate_state !== "Selected for definition" ||
      value.direct_entry_bootstraps_existing_state !== true || value.product_confirmation_required_for_definition_drafting !== false ||
      value.authoritative_delivery_boundary !== true || value.semantic_coherence_owned_by_host_ai !== true ||
      value.independent_definition_commitment !== true || value.same_revision_receipts !== true ||
      value.exactly_one_next_action !== true || value.append_only_hash_linked_history !== true ||
      value.rejected_operations_do_not_mutate !== true || value.ordinary_updates_may_defer_publication !== true ||
      value.published_revision_metadata_required !== true || value.inherited_dependency_kinds_preserved !== true ||
      value.later_stages_out_of_scope !== true) {
    throw new ContractError("Milestone Definition contract does not preserve the accepted boundary.");
  }
  return value as MilestoneDefinitionContract;
}

function content(value: unknown, label: string, partial = false): asserts value is DefinitionContent {
  object(value, label);
  const allowed = ["outcome", "requirements", "currentBehavior", "intendedBehavior", "evidence", "reconciliations", "inScope", "nonGoals", "acceptance", "dependencies", "feasibilityAndConstraints", "risks", "assumptions", "unknowns"];
  keys(value, allowed, label);
  if (!partial || value.outcome !== undefined) {
    if (partial && value.outcome === "") { /* clearing a draft field is permitted */ } else text(value.outcome, `${label}.outcome`);
  }
  for (const field of ["requirements", "inScope", "nonGoals", "acceptance", "feasibilityAndConstraints", "risks", "assumptions"] as const) {
    if (!partial || value[field] !== undefined) texts(value[field], `${label}.${field}`);
  }
  for (const field of ["currentBehavior", "intendedBehavior"] as const) {
    if (value[field] !== undefined) texts(value[field], `${label}.${field}`);
  }
  if (value.evidence !== undefined) {
    if (!Array.isArray(value.evidence)) throw new ContractError(`${label}.evidence must be an array.`);
    value.evidence.forEach((item: unknown, index: number) => {
      object(item, `${label}.evidence[${index}]`); keys(item, ["source", "kind", "finding"], `${label}.evidence[${index}]`);
      text(item.source, `${label}.evidence[${index}].source`); text(item.finding, `${label}.evidence[${index}].finding`);
      enumeration(item.kind, ["product-intent", "engineering-intent", "code", "test", "configuration", "documentation", "prior-artifact", "inference"], `${label}.evidence[${index}].kind`);
    });
  }
  if (value.reconciliations !== undefined) {
    if (!Array.isArray(value.reconciliations)) throw new ContractError(`${label}.reconciliations must be an array.`);
    value.reconciliations.forEach((item: unknown, index: number) => {
      object(item, `${label}.reconciliations[${index}]`); keys(item, ["disagreement", "sources", "status", "resolution", "material"], `${label}.reconciliations[${index}]`);
      text(item.disagreement, `${label}.reconciliations[${index}].disagreement`); texts(item.sources, `${label}.reconciliations[${index}].sources`);
      enumeration(item.status, ["resolved", "unresolved"], `${label}.reconciliations[${index}].status`);
      if (typeof item.resolution !== "string") throw new ContractError(`${label}.reconciliations[${index}].resolution must be a string.`);
      if (item.status === "resolved") text(item.resolution, `${label}.reconciliations[${index}].resolution`);
      if (typeof item.material !== "boolean") throw new ContractError(`${label}.reconciliations[${index}].material must be boolean.`);
    });
  }
  if (!partial || value.dependencies !== undefined) {
    if (!Array.isArray(value.dependencies)) throw new ContractError(`${label}.dependencies must be an array.`);
    value.dependencies.forEach((item: unknown, index: number) => {
      object(item, `${label}.dependencies[${index}]`); keys(item, ["name", "kind", "consequence", "note"], `${label}.dependencies[${index}]`);
      text(item.name, `${label}.dependencies[${index}].name`); enumeration(item.kind, DEPENDENCY_KINDS, `${label}.dependencies[${index}].kind`);
      enumeration(item.consequence, ["definition", "implementation"], `${label}.dependencies[${index}].consequence`);
      text(item.note, `${label}.dependencies[${index}].note`);
    });
  }
  if (!partial || value.unknowns !== undefined) {
    if (!Array.isArray(value.unknowns)) throw new ContractError(`${label}.unknowns must be an array.`);
    value.unknowns.forEach((item: unknown, index: number) => {
      object(item, `${label}.unknowns[${index}]`); keys(item, ["description", "blocking", "revisitWhen"], `${label}.unknowns[${index}]`);
      text(item.description, `${label}.unknowns[${index}].description`);
      if (typeof item.blocking !== "boolean") throw new ContractError(`${label}.unknowns[${index}].blocking must be boolean.`);
      text(item.revisitWhen, `${label}.unknowns[${index}].revisitWhen`);
    });
  }
}

function definition(value: unknown, label: string): asserts value is MilestoneDefinition {
  object(value, label);
  keys(value, ["id", "sourceCandidateId", "sourceCandidateTitle", "selectedBatchVersion", "order", "artifactPath", "phase", "revision",
    "reviewedRevision", "coherence", "content", "requiredPerspectives", "receipts", "specialistInputs", "history", "historyHead"], label);
  for (const field of ["id", "sourceCandidateId", "sourceCandidateTitle", "artifactPath"] as const) text(value[field], `${label}.${field}`);
  for (const field of ["selectedBatchVersion", "order", "revision"] as const) if (!Number.isInteger(value[field]) || value[field] < 0) throw new ContractError(`${label}.${field} is invalid.`);
  enumeration(value.phase, DEFINITION_PHASES, `${label}.phase`);
  if (value.reviewedRevision !== null && (!Number.isInteger(value.reviewedRevision) || value.reviewedRevision < 0 || value.reviewedRevision > value.revision)) throw new ContractError(`${label}.reviewedRevision is invalid.`);
  object(value.coherence, `${label}.coherence`); keys(value.coherence, ["status", "basis"], `${label}.coherence`);
  enumeration(value.coherence.status, DEFINITION_COHERENCE, `${label}.coherence.status`);
  if (typeof value.coherence.basis !== "string") throw new ContractError(`${label}.coherence.basis must be a string.`);
  if (value.coherence.status !== "draft") text(value.coherence.basis, `${label}.coherence.basis`);
  content(value.content, `${label}.content`);
  perspectives(value.requiredPerspectives, `${label}.requiredPerspectives`, true);
  if (!Array.isArray(value.receipts)) throw new ContractError(`${label}.receipts must be an array.`);
  value.receipts.forEach((receipt: unknown, index: number) => {
    object(receipt, `${label}.receipts[${index}]`); keys(receipt, ["perspective", "participant", "revision"], `${label}.receipts[${index}]`);
    enumeration(receipt.perspective, DEFINITION_PERSPECTIVES, `${label}.receipts[${index}].perspective`); text(receipt.participant, `${label}.receipts[${index}].participant`);
    if (!Number.isInteger(receipt.revision) || receipt.revision !== value.revision) throw new ContractError(`${label} receipts must match the current revision.`);
  });
  if (new Set(value.receipts.map((item: any) => item.perspective)).size !== value.receipts.length) throw new ContractError(`${label} has duplicate perspective receipts.`);
  if (!Array.isArray(value.specialistInputs)) throw new ContractError(`${label}.specialistInputs must be an array.`);
  value.specialistInputs.forEach((input: unknown, index: number) => {
    object(input, `${label}.specialistInputs[${index}]`); keys(input, ["perspective", "reason", "mode", "status"], `${label}.specialistInputs[${index}]`);
    enumeration(input.perspective, ["architecture", "demo-quality", "release"], `${label}.specialistInputs[${index}].perspective`);
    text(input.reason, `${label}.specialistInputs[${index}].reason`); enumeration(input.mode, SPECIALIST_MODES, `${label}.specialistInputs[${index}].mode`);
    enumeration(input.status, ["needed", "satisfied"], `${label}.specialistInputs[${index}].status`);
  });
  if (!Array.isArray(value.history)) throw new ContractError(`${label}.history must be an array.`);
  let previous: string | null = null;
  value.history.forEach((entry: unknown, index: number) => {
    object(entry, `${label}.history[${index}]`); keys(entry, ["version", "operation", "summary", "beforeHash", "afterHash", "previousHash", "contentHash"], `${label}.history[${index}]`);
    if (entry.version !== index + 1) throw new ContractError(`${label} history versions must be sequential.`);
    enumeration(entry.operation, ["update", "review", "confirm", "commit", "interrupt", "resume", "draft-revalidation", "change-management"], `${label}.history[${index}].operation`);
    text(entry.summary, `${label}.history[${index}].summary`);
    for (const field of ["beforeHash", "afterHash", "contentHash"] as const) if (typeof entry[field] !== "string" || !/^[a-f0-9]{64}$/.test(entry[field])) throw new ContractError(`${label}.history[${index}].${field} is invalid.`);
    const { contentHash, ...withoutHash } = entry;
    if (entry.previousHash !== previous || definitionHistoryHash(withoutHash as any) !== contentHash) throw new ContractError(`${label} history integrity failed.`);
    previous = contentHash;
  });
  if (value.historyHead !== previous) throw new ContractError(`${label} history anchor is invalid.`);
  if (value.history.length && value.history.at(-1).afterHash !== definitionSnapshotHash(value as MilestoneDefinition)) throw new ContractError(`${label} does not match its history.`);
  if (value.phase === "committed" && (value.reviewedRevision !== value.revision || value.requiredPerspectives.some((perspective: DefinitionPerspective) => !value.receipts.some((receipt: any) => receipt.perspective === perspective)))) {
    throw new ContractError(`${label} commitment requires current review and all required perspectives.`);
  }
}

export function validateMilestoneDefinitionState(value: unknown): asserts value is MilestoneDefinitionState {
  object(value, "Milestone Definition state");
  keys(value, ["schemaVersion", "stage", "workspaceClass", "workspaceRoot", "productRevision", "productDraftVersion", "engineeringRevision", "roadmapRevision", "revision", "definitions", "nextActions", "session", "generatedViews"], "Milestone Definition state");
  if (value.schemaVersion !== 1 || value.stage !== "milestone-definition" || value.workspaceClass !== "human-project") throw new ContractError("Milestone Definition state has an invalid schema or workspace class.");
  text(value.workspaceRoot, "workspaceRoot");
  for (const field of ["productRevision", "roadmapRevision", "revision"] as const) if (!Number.isInteger(value[field]) || value[field] < 0) throw new ContractError(`${field} is invalid.`);
  if (value.productDraftVersion !== undefined && (!Number.isInteger(value.productDraftVersion) || value.productDraftVersion < 0)) throw new ContractError("productDraftVersion is invalid.");
  if (value.engineeringRevision !== null && (!Number.isInteger(value.engineeringRevision) || value.engineeringRevision < 0)) throw new ContractError("engineeringRevision is invalid.");
  if (!Array.isArray(value.definitions) || value.definitions.length === 0) throw new ContractError("At least one Definition is required.");
  value.definitions.forEach((item, index) => definition(item, `definitions[${index}]`));
  for (const field of ["id", "sourceCandidateId", "artifactPath", "order"] as const) if (new Set(value.definitions.map((item: any) => item[field])).size !== value.definitions.length) throw new ContractError(`Definition ${field} values must be unique.`);
  if (!Array.isArray(value.nextActions) || value.nextActions.length !== 1) throw new ContractError("Milestone Definition requires exactly one next action.");
  object(value.nextActions[0], "nextActions[0]"); keys(value.nextActions[0], ["participant", "action", "reason"], "nextActions[0]");
  for (const field of ["participant", "action", "reason"] as const) text(value.nextActions[0][field], `nextActions[0].${field}`);
  object(value.session, "session"); keys(value.session, ["status", "resumeAction"], "session"); enumeration(value.session.status, ["active", "interrupted"], "session.status");
  if (value.session.resumeAction !== null) text(value.session.resumeAction, "session.resumeAction");
  if (value.session.status === "interrupted" && value.session.resumeAction === null) throw new ContractError("Interrupted Definition work requires a resume action.");
  object(value.generatedViews, "generatedViews");
  for (const [viewPath, view] of Object.entries(value.generatedViews)) {
    object(view, `generatedViews.${viewPath}`); keys(view, ["revision", "sha256"], `generatedViews.${viewPath}`);
    if (!Number.isInteger(view.revision) || view.revision < 0 || view.revision > value.revision || typeof view.sha256 !== "string" || !/^[a-f0-9]{64}$/.test(view.sha256)) throw new ContractError(`generatedViews.${viewPath} is invalid.`);
  }
}

export function validateDefinitionUpdate(value: unknown): asserts value is DefinitionUpdate {
  object(value, "Definition update"); keys(value, ["type", "definitionId", "actor", "content", "coherence", "requiredPerspectives", "specialistInputs"], "Definition update");
  if (value.type !== "update") throw new ContractError("Definition update type must be update.");
  text(value.definitionId, "definitionId"); object(value.actor, "actor"); keys(value.actor, ["name", "perspectives"], "actor"); text(value.actor.name, "actor.name"); perspectives(value.actor.perspectives, "actor.perspectives");
  if (value.content !== undefined) content(value.content, "content", true);
  if (value.coherence !== undefined) { object(value.coherence, "coherence"); keys(value.coherence, ["status", "basis"], "coherence"); enumeration(value.coherence.status, DEFINITION_COHERENCE, "coherence.status"); if (typeof value.coherence.basis !== "string") throw new ContractError("coherence.basis must be a string."); if (value.coherence.status !== "draft") text(value.coherence.basis, "coherence.basis"); }
  if (value.requiredPerspectives !== undefined) perspectives(value.requiredPerspectives, "requiredPerspectives");
  if (value.specialistInputs !== undefined) {
    if (!Array.isArray(value.specialistInputs)) throw new ContractError("specialistInputs must be an array.");
    value.specialistInputs.forEach((input: unknown, index: number) => { object(input, `specialistInputs[${index}]`); keys(input, ["perspective", "reason", "mode", "status"], `specialistInputs[${index}]`); enumeration(input.perspective, ["architecture", "demo-quality", "release"], `specialistInputs[${index}].perspective`); text(input.reason, `specialistInputs[${index}].reason`); enumeration(input.mode, SPECIALIST_MODES, `specialistInputs[${index}].mode`); enumeration(input.status, ["needed", "satisfied"], `specialistInputs[${index}].status`); });
  }
  if (value.content === undefined && value.coherence === undefined && value.requiredPerspectives === undefined && value.specialistInputs === undefined) throw new ContractError("Definition update must change at least one field.");
}

export function validateDefinitionDraftRevalidation(value: unknown): asserts value is DefinitionDraftRevalidation {
  object(value, "Definition draft revalidation");
  keys(value, ["actor", "basis"], "Definition draft revalidation");
  object(value.actor, "Definition draft revalidation.actor");
  keys(value.actor, ["name", "perspectives"], "Definition draft revalidation.actor");
  text(value.actor.name, "Definition draft revalidation.actor.name");
  perspectives(value.actor.perspectives, "Definition draft revalidation.actor.perspectives");
  text(value.basis, "Definition draft revalidation.basis");
}

export function validateDirectDefinitionStart(value: unknown): asserts value is DirectDefinitionStart {
  object(value, "Direct Definition start");
  keys(value, ["projectName", "participantResponsibilities", "title", "outcome", "priority", "rationale", "nextShapingStep", "actor"], "Direct Definition start");
  for (const field of ["projectName", "title", "outcome", "rationale", "nextShapingStep"] as const) text(value[field], `Direct Definition start.${field}`);
  texts(value.participantResponsibilities, "Direct Definition start.participantResponsibilities");
  enumeration(value.priority, ["Highest", "High", "Medium", "Later"], "Direct Definition start.priority");
  object(value.actor, "Direct Definition start.actor");
  keys(value.actor, ["name", "responsibility", "intentBasis"], "Direct Definition start.actor");
  text(value.actor.name, "Direct Definition start.actor.name");
  enumeration(value.actor.responsibility, ["product", "loopy"], "Direct Definition start.actor.responsibility");
  if (value.actor.intentBasis !== undefined) text(value.actor.intentBasis, "Direct Definition start.actor.intentBasis");
  if (value.actor.responsibility === "loopy" && !value.actor.intentBasis) throw new ContractError("Direct Definition start by Loopy requires a basis in explicit Product intent.");
}

export function formalDefinitionGaps(definition: MilestoneDefinition): string[] {
  const gaps: string[] = [];
  if (!definition.content.outcome.trim()) gaps.push("outcome");
  if (!definition.content.requirements.length) gaps.push("requirements");
  if (!definition.content.acceptance.length) gaps.push("observable acceptance boundary");
  if (definition.coherence.status !== "coherent") gaps.push("Host-AI coherence assessment");
  if (definition.content.unknowns.some((item) => item.blocking)) gaps.push("blocking unknown");
  if ((definition.content.reconciliations ?? []).some((item) => item.material && item.status === "unresolved")) gaps.push("material unresolved evidence conflict");
  if (definition.specialistInputs.some((item) => item.mode === "blocking" && item.status === "needed")) gaps.push("blocking specialist input");
  return gaps;
}
