import { lstatSync, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ContractError } from "./contract.js";
import { validateEngineeringState } from "./engineering-contract.js";
import { ProductStartEngine } from "./engine.js";
import { definitionEligibility, loadLivingRoadmapContract, validateLivingRoadmapState, validateRoadmapOperation } from "./living-roadmap-contract.js";
import { livingRoadmapHistoryHash, livingRoadmapSnapshotHash } from "./living-roadmap-meaning.js";
import { loadChangeManagementStateIfPresent, loadMilestoneDefinitionStateIfPresent, renderProjectViews, writeProjectViews, LIVING_ROADMAP_STATE_PATH } from "./project-views.js";
import {
  ROADMAP_PRIORITIES,
  type LivingRoadmapCandidate,
  type LivingRoadmapContract,
  type LivingRoadmapHistoryEntry,
  type LivingRoadmapRenderedArtifacts,
  type LivingRoadmapState,
  type RoadmapOperation,
} from "./living-roadmap-types.js";
import { canonicalWorkspaceRoot, resolveInsideWorkspace, sha256, WorkspaceError } from "./workspace.js";

function clone<T>(value: T): T { return structuredClone(value); }
function exists(path: string): boolean {
  try { lstatSync(path); return true; } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}
function text(value: unknown, label: string): string {
  if (typeof value !== "string" || !/[\p{L}\p{N}]/u.test(value)) throw new ContractError(`${label} must contain letters or numbers.`);
  return value.trim();
}

export class LivingRoadmapEngine {
  readonly sourceRoot: string;
  readonly templateRoot: string;
  readonly contract: LivingRoadmapContract;
  readonly productEngine: ProductStartEngine;

  private constructor(sourceRoot: string, contract: LivingRoadmapContract, productEngine: ProductStartEngine) {
    this.sourceRoot = sourceRoot;
    this.templateRoot = join(sourceRoot, "templates");
    this.contract = contract;
    this.productEngine = productEngine;
  }

  static async create(sourceRoot: string): Promise<LivingRoadmapEngine> {
    const root = canonicalWorkspaceRoot(sourceRoot);
    const [contract, productEngine] = await Promise.all([
      loadLivingRoadmapContract(join(root, "engine/contracts/interviews/living-roadmap.yaml")),
      ProductStartEngine.create(root),
    ]);
    return new LivingRoadmapEngine(root, contract, productEngine);
  }

  initialize(workspaceRoot: string): LivingRoadmapState {
    const root = canonicalWorkspaceRoot(workspaceRoot);
    if (root === this.sourceRoot) throw new WorkspaceError("Loopy source cannot become its own Human project.");
    if (exists(resolveInsideWorkspace(root, LIVING_ROADMAP_STATE_PATH))) throw new ContractError("Living Roadmap already exists. Use roadmap-status or roadmap-resume.");
    const product = this.productEngine.loadState(root);
    if (product.phase !== this.contract.required_product_phase) throw new ContractError("A confirmed Product foundation is required before Living Roadmap management.");
    const candidates: LivingRoadmapCandidate[] = product.roadmap.candidates.map((candidate, index) => ({
      id: `candidate-${index + 1}`,
      title: candidate.title,
      outcome: candidate.outcome,
      priority: candidate.priority,
      order: index,
      rationale: candidate.rationale,
      state: "Open",
      dependencies: [],
      unresolvedDependencyNotes: clone(candidate.dependencies),
      blockers: [],
      nextShapingStep: candidate.nextAction,
      participants: [],
      lineage: [],
      dispositionReason: "",
      reconsiderWhen: "",
    }));
    const state: LivingRoadmapState = {
      schemaVersion: 1, stage: "living-roadmap", workspaceClass: "human-project", workspaceRoot: root,
      productRevision: product.revision, revision: 0, nextCandidateNumber: candidates.length + 1,
      candidates, selectedBatches: [], nextActions: [], session: { status: "active", resumeAction: null },
      history: [], historyHead: null, generatedViews: {},
    };
    state.nextActions = [this.route(state)];
    this.write(root, state);
    return clone(state);
  }

  loadState(workspaceRoot: string): LivingRoadmapState {
    const root = canonicalWorkspaceRoot(workspaceRoot);
    const value = JSON.parse(readFileSync(resolveInsideWorkspace(root, LIVING_ROADMAP_STATE_PATH), "utf8")) as unknown;
    validateLivingRoadmapState(this.contract, value);
    if (value.workspaceRoot !== root) throw new WorkspaceError("Living Roadmap state does not belong to the target workspace.");
    return value;
  }

  applyOperation(workspaceRoot: string, operation: RoadmapOperation): LivingRoadmapState {
    validateRoadmapOperation(operation);
    const current = this.loadState(workspaceRoot);
    if (operation.type !== "reconcile-product") this.assertCurrentProduct(workspaceRoot, current);
    const next = clone(current);
    const summary = this.perform(next, operation);
    this.normalizeOrdering(next);
    next.session = { status: "active", resumeAction: null };
    next.nextActions = [this.route(next)];
    this.appendHistory(current, next, operation.type, summary);
    this.write(workspaceRoot, next);
    return clone(next);
  }

  interrupt(workspaceRoot: string, resumeAction: string): LivingRoadmapState {
    const current = this.loadState(workspaceRoot);
    this.assertCurrentProduct(workspaceRoot, current);
    const next = clone(current);
    const action = text(resumeAction, "resumeAction");
    next.session = { status: "interrupted", resumeAction: action };
    next.nextActions = [{ participant: "Roadmap participant", action: `Resume: ${action}`, reason: "The portfolio and incomplete Roadmap work have been preserved." }];
    this.appendHistory(current, next, "interrupt", `Paused Roadmap work: ${action}`);
    this.write(workspaceRoot, next);
    return clone(next);
  }

  async resume(workspaceRoot: string): Promise<LivingRoadmapState> {
    const current = this.loadState(workspaceRoot);
    this.assertCurrentProduct(workspaceRoot, current);
    if (current.session.status !== "interrupted") throw new ContractError("Living Roadmap work is not interrupted.");
    const stale = await this.detectStaleViews(workspaceRoot);
    if (stale.length) throw new ContractError(`Living Roadmap views are stale: ${stale.join(", ")}. Detect and explicitly repair them with roadmap-render before resuming.`);
    const next = clone(current);
    const action = next.session.resumeAction!;
    next.session = { status: "active", resumeAction: null };
    next.nextActions = [{ participant: "Roadmap participant", action, reason: "Continue from the preserved Roadmap operation." }];
    this.appendHistory(current, next, "resume", `Resumed Roadmap work: ${action}`);
    this.write(workspaceRoot, next);
    return clone(next);
  }

  renderCurrent(workspaceRoot: string): LivingRoadmapRenderedArtifacts {
    const state = this.loadState(workspaceRoot);
    this.assertCurrentProduct(workspaceRoot, state);
    return this.write(workspaceRoot, state);
  }

  async detectStaleViews(workspaceRoot: string): Promise<string[]> {
    const state = this.loadState(workspaceRoot);
    const product = this.productEngine.loadState(workspaceRoot);
    const engineering = this.productEngine.loadEngineeringStateIfPresent(workspaceRoot);
    const expected = renderProjectViews(product, this.templateRoot, engineering, state, loadMilestoneDefinitionStateIfPresent(workspaceRoot), loadChangeManagementStateIfPresent(workspaceRoot)).product;
    const stale: string[] = [];
    for (const path of this.contract.generated_artifacts) {
      const content = expected[path];
      const recorded = state.generatedViews[path];
      if (!recorded || recorded.revision !== state.revision || recorded.sha256 !== sha256(content)) { stale.push(path); continue; }
      try { if (await readFile(resolveInsideWorkspace(workspaceRoot, path), "utf8") !== content) stale.push(path); } catch { stale.push(path); }
    }
    return stale;
  }

  private assertCurrentProduct(workspaceRoot: string, state: LivingRoadmapState): void {
    const product = this.productEngine.loadState(workspaceRoot);
    if (product.phase !== "product-foundation-confirmed" || product.revision !== state.productRevision) {
      throw new ContractError("Living Roadmap is not anchored to the current confirmed Product foundation; reconcile Product meaning before portfolio work.");
    }
  }

  private candidate(state: LivingRoadmapState, id: string): LivingRoadmapCandidate {
    const candidate = state.candidates.find((item) => item.id === id);
    if (!candidate) throw new ContractError(`Unknown candidate identity: ${id}.`);
    return candidate;
  }

  private requireProductMeaning(operation: RoadmapOperation): void {
    if (!["product", "loopy"].includes(operation.actor.responsibility)) {
      throw new ContractError(`${operation.type} changes Product portfolio meaning and requires Product or Loopy acting on explicit Product intent.`);
    }
    if (operation.actor.responsibility === "loopy" && !operation.actor.intentBasis?.trim()) {
      throw new ContractError(`${operation.type} by Loopy requires a recorded basis in explicit Product intent.`);
    }
  }

  private freshCandidate(state: LivingRoadmapState, input: { title: string; outcome: string; priority: LivingRoadmapCandidate["priority"]; rationale: string; nextShapingStep: string }): LivingRoadmapCandidate {
    if (!ROADMAP_PRIORITIES.includes(input.priority)) throw new ContractError("Candidate priority is invalid.");
    const candidate: LivingRoadmapCandidate = {
      id: `candidate-${state.nextCandidateNumber++}`,
      title: text(input.title, "candidate.title"), outcome: text(input.outcome, "candidate.outcome"), priority: input.priority,
      order: state.candidates.length, rationale: text(input.rationale, "candidate.rationale"), state: "Open",
      dependencies: [], unresolvedDependencyNotes: [], blockers: [], nextShapingStep: text(input.nextShapingStep, "candidate.nextShapingStep"),
      participants: [], lineage: [], dispositionReason: "", reconsiderWhen: "",
    };
    return candidate;
  }

  private perform(state: LivingRoadmapState, operation: RoadmapOperation): string {
    switch (operation.type) {
      case "add": {
        this.requireProductMeaning(operation); const candidate = this.freshCandidate(state, operation.candidate);
        state.candidates.push(candidate); return `Added ${candidate.title}.`;
      }
      case "rename": {
        this.requireProductMeaning(operation); const candidate = this.candidate(state, operation.candidateId);
        const before = candidate.title; candidate.title = text(operation.title, "title"); return `Renamed ${before} to ${candidate.title} without changing identity.`;
      }
      case "combine": {
        this.requireProductMeaning(operation);
        const ids = [...new Set(operation.candidateIds)];
        if (ids.length < 2) throw new ContractError("Combine requires at least two distinct candidates.");
        const sources = ids.map((id) => this.candidate(state, id));
        if (sources.some((item) => item.state !== "Open")) throw new ContractError("Only Open candidates can be combined.");
        const combined = this.freshCandidate(state, operation.candidate); combined.lineage = [{ relation: "combined-from", candidateIds: ids }];
        state.candidates.push(combined);
        for (const source of sources) { source.state = "Superseded"; source.dispositionReason = `Combined into ${combined.title}.`; source.lineage.push({ relation: "supersedes", candidateIds: [combined.id] }); }
        return `Combined ${sources.map((item) => item.title).join(", ")} into ${combined.title}.`;
      }
      case "split": {
        this.requireProductMeaning(operation); const source = this.candidate(state, operation.candidateId);
        if (source.state !== "Open" || operation.candidates.length < 2) throw new ContractError("Split requires one Open source and at least two new candidates.");
        const children = operation.candidates.map((input) => this.freshCandidate(state, input));
        children.forEach((child) => { child.lineage = [{ relation: "split-from", candidateIds: [source.id] }]; });
        state.candidates.push(...children); source.state = "Superseded"; source.dispositionReason = `Split into ${children.map((item) => item.title).join(", ")}.`;
        source.lineage.push({ relation: "supersedes", candidateIds: children.map((item) => item.id) });
        return `Split ${source.title} into ${children.map((item) => item.title).join(", ")}.`;
      }
      case "prioritize": {
        this.requireProductMeaning(operation); const candidate = this.candidate(state, operation.candidateId);
        if (!ROADMAP_PRIORITIES.includes(operation.priority) || !Number.isInteger(operation.order) || operation.order < 0) throw new ContractError("Priority and order must be valid.");
        const groups = ROADMAP_PRIORITIES.map((priority) => this.ordered(state)
          .filter((item) => item.id !== candidate.id && item.priority === priority));
        candidate.priority = operation.priority;
        const target = groups[ROADMAP_PRIORITIES.indexOf(operation.priority)];
        target.splice(Math.min(operation.order, target.length), 0, candidate);
        groups.flat().forEach((item, index) => { item.order = index; });
        return `Prioritized ${candidate.title}.`;
      }
      case "defer": {
        this.requireProductMeaning(operation); const candidate = this.candidate(state, operation.candidateId);
        if (candidate.state !== "Open") throw new ContractError("Only an Open candidate can be deferred.");
        candidate.state = "Deferred"; candidate.dispositionReason = text(operation.reason, "reason"); candidate.reconsiderWhen = text(operation.reconsiderWhen, "reconsiderWhen"); return `Deferred ${candidate.title}.`;
      }
      case "cancel": {
        this.requireProductMeaning(operation); const candidate = this.candidate(state, operation.candidateId);
        if (candidate.state !== "Open") throw new ContractError("Only an Open candidate can be cancelled.");
        candidate.state = "Cancelled"; candidate.dispositionReason = text(operation.reason, "reason"); return `Cancelled ${candidate.title}.`;
      }
      case "supersede": {
        this.requireProductMeaning(operation); const source = this.candidate(state, operation.candidateId); const replacement = this.candidate(state, operation.replacementCandidateId);
        if (source.id === replacement.id || source.state !== "Open" || ["Cancelled", "Superseded"].includes(replacement.state)) throw new ContractError("Supersede requires a distinct current replacement and an Open source.");
        source.state = "Superseded"; source.dispositionReason = text(operation.reason, "reason"); source.lineage.push({ relation: "supersedes", candidateIds: [replacement.id] });
        replacement.lineage.push({ relation: "superseded-from", candidateIds: [source.id] });
        return `Superseded ${source.title} with ${replacement.title}.`;
      }
      case "set-dependencies": {
        const candidate = this.candidate(state, operation.candidateId);
        if (candidate.state !== "Open") throw new ContractError("Dependencies can be changed here only while a candidate is Open.");
        if (operation.actor.responsibility === "engineering" && operation.dependencies.some((item) => item.recommendedBy !== "Engineering")) throw new ContractError("Engineering dependency recommendations must remain attributed to Engineering.");
        if (operation.actor.responsibility === "product" && operation.dependencies.some((item) => item.recommendedBy !== "Product")) throw new ContractError("Product dependency decisions must remain attributed to Product.");
        if (operation.actor.responsibility === "loopy" && !operation.actor.intentBasis?.trim()) throw new ContractError("Dependencies recorded by Loopy require an explicit Product or Engineering basis.");
        candidate.dependencies = clone(operation.dependencies); candidate.unresolvedDependencyNotes = [];
        return `Updated dependencies for ${candidate.title}.`;
      }
      case "set-blockers": {
        const candidate = this.candidate(state, operation.candidateId);
        if (candidate.state !== "Open") throw new ContractError("Blockers can be changed here only while a candidate is Open.");
        candidate.blockers = clone(operation.blockers); return `Updated blockers for ${candidate.title}.`;
      }
      case "record-participation": {
        const candidate = this.candidate(state, operation.candidateId);
        operation.participants.forEach((item, index) => { text(item.name, `participants[${index}].name`); text(item.responsibility, `participants[${index}].responsibility`); });
        candidate.participants = clone(operation.participants); return `Updated participation for ${candidate.title}.`;
      }
      case "select": {
        const ids = [...new Set(operation.candidateIds)];
        if (!ids.length || ids.length !== operation.candidateIds.length) throw new ContractError("Selection requires distinct candidate identities.");
        ids.forEach((id) => this.candidate(state, id));
        const candidates = this.ordered(state).filter((candidate) => ids.includes(candidate.id));
        const ineligible = candidates.map((candidate) => ({ candidate, result: definitionEligibility(candidate) })).find((item) => !item.result.eligible);
        if (ineligible) throw new ContractError(`No candidates selected. ${ineligible.result.reason} Retry with an eligible set.`);
        candidates.forEach((candidate) => { candidate.state = "Selected for definition"; candidate.nextShapingStep = "Begin Milestone Definition"; });
        state.selectedBatches.push({ version: state.selectedBatches.length + 1, candidateIds: candidates.map((item) => item.id) });
        return `Selected ${candidates.map((item) => item.title).join(", ")} for Milestone Definition without commitment.`;
      }
      case "reconcile-product": {
        this.requireProductMeaning(operation);
        const product = this.productEngine.loadState(state.workspaceRoot);
        if (product.phase !== "product-foundation-confirmed") throw new ContractError("Product must be confirmed before Roadmap reconciliation.");
        if (product.revision === state.productRevision) throw new ContractError("Living Roadmap already matches the current Product revision.");
        if (product.revision < state.productRevision) throw new ContractError("Living Roadmap cannot reconcile to an older Product revision.");
        state.productRevision = product.revision;
        return `Reconciled the portfolio with confirmed Product revision ${product.revision} without changing candidates or commitments.`;
      }
    }
  }

  private route(state: LivingRoadmapState) {
    const selected = this.ordered(state).filter((item) => item.state === "Selected for definition");
    if (selected.length) return { participant: "Product and Engineering", action: `Begin Milestone Definition for ${selected.map((item) => item.title).join(", ")}`, reason: "These candidates were selected without commitment; the next Slice establishes each bounded Definition." };
    const blocked = this.ordered(state).find((item) => item.state === "Open" && !definitionEligibility(item).eligible);
    if (blocked) return { participant: blocked.blockers.find((item) => item.blocksDefinition)?.responsibility ?? "Product", action: `Resolve Definition eligibility for ${blocked.title}`, reason: definitionEligibility(blocked).reason };
    const eligible = this.ordered(state).find((item) => definitionEligibility(item).eligible);
    if (eligible) return { participant: "Product", action: `Select or refine ${eligible.title}`, reason: "It is the highest-priority candidate currently eligible for Milestone Definition." };
    return { participant: "Product", action: "Add or reconsider a Roadmap candidate", reason: "No candidate is currently open and eligible for Milestone Definition." };
  }

  private ordered(state: LivingRoadmapState): LivingRoadmapCandidate[] {
    return [...state.candidates].sort((a, b) => ROADMAP_PRIORITIES.indexOf(a.priority) - ROADMAP_PRIORITIES.indexOf(b.priority) || a.order - b.order || a.id.localeCompare(b.id));
  }

  private normalizeOrdering(state: LivingRoadmapState): void {
    this.ordered(state).forEach((candidate, index) => { candidate.order = index; });
  }

  private appendHistory(current: LivingRoadmapState, next: LivingRoadmapState, operation: LivingRoadmapHistoryEntry["operation"], summary: string): void {
    next.revision = current.revision + 1;
    const withoutHash: Omit<LivingRoadmapHistoryEntry, "contentHash"> = {
      version: current.history.length + 1, operation, summary, beforeHash: livingRoadmapSnapshotHash(current),
      afterHash: livingRoadmapSnapshotHash(next), previousHash: current.historyHead,
    };
    const entry = { ...withoutHash, contentHash: livingRoadmapHistoryHash(withoutHash) };
    next.history.push(entry); next.historyHead = entry.contentHash;
  }

  private write(workspaceRoot: string, state: LivingRoadmapState): LivingRoadmapRenderedArtifacts {
    const product = this.productEngine.loadState(workspaceRoot);
    const engineering = this.productEngine.loadEngineeringStateIfPresent(workspaceRoot);
    if (engineering) validateEngineeringState(this.productEngine.engineeringContract, engineering);
    const rendered = writeProjectViews({ workspaceRoot, templateRoot: this.templateRoot, productContract: this.productEngine.contract,
      product, engineeringContract: engineering ? this.productEngine.engineeringContract : undefined, engineering,
      livingRoadmapContract: this.contract, livingRoadmap: state });
    return { "LOOPY.md": rendered.product["LOOPY.md"], "docs/loopy/Roadmap.md": rendered.product["docs/loopy/Roadmap.md"] };
  }
}
