import { existsSync, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ContractError } from "./contract.js";
import { ProductStartEngine } from "./engine.js";
import { validateEngineeringState } from "./engineering-contract.js";
import { validateLivingRoadmapState } from "./living-roadmap-contract.js";
import { LivingRoadmapEngine } from "./living-roadmap-engine.js";
import { definitionHistoryHash, definitionSnapshotHash } from "./milestone-definition-meaning.js";
import { formalDefinitionGaps, loadMilestoneDefinitionContract, validateDefinitionUpdate, validateDirectDefinitionStart, validateMilestoneDefinitionState } from "./milestone-definition-contract.js";
import type {
  DefinitionCommitRequest,
  DirectDefinitionStart,
  DefinitionHistoryEntry,
  DefinitionPerspective,
  DefinitionUpdate,
  MilestoneDefinition,
  MilestoneDefinitionArtifacts,
  MilestoneDefinitionContract,
  MilestoneDefinitionState,
} from "./milestone-definition-types.js";
import { LIVING_ROADMAP_STATE_PATH, MILESTONE_DEFINITION_STATE_PATH, PRODUCT_STATE_PATH, loadChangeManagementStateIfPresent, renderProjectViews, writeProjectViews } from "./project-views.js";
import { canonicalWorkspaceRoot, resolveInsideWorkspace, sha256, type FileSetWriteHooks, WorkspaceError, writeFileSetInsideWorkspace } from "./workspace.js";

function clone<T>(value: T): T { return structuredClone(value); }
function meaningful(value: string, label: string): string {
  if (!/[\p{L}\p{N}]/u.test(value)) throw new ContractError(`${label} must contain letters or numbers.`);
  return value.trim();
}
function slug(value: string): string {
  const normalized = value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return normalized || "milestone";
}
function normalizePerspectives(values: DefinitionPerspective[]): DefinitionPerspective[] {
  return [...new Set(values)];
}

export class MilestoneDefinitionEngine {
  readonly sourceRoot: string;
  readonly templateRoot: string;
  readonly contract: MilestoneDefinitionContract;
  readonly productEngine: ProductStartEngine;
  readonly roadmapEngine: LivingRoadmapEngine;
  private readonly writeHooks: FileSetWriteHooks;

  private constructor(sourceRoot: string, contract: MilestoneDefinitionContract, productEngine: ProductStartEngine, roadmapEngine: LivingRoadmapEngine, writeHooks: FileSetWriteHooks) {
    this.sourceRoot = sourceRoot; this.templateRoot = join(sourceRoot, "templates"); this.contract = contract;
    this.productEngine = productEngine; this.roadmapEngine = roadmapEngine; this.writeHooks = writeHooks;
  }

  static async create(sourceRoot: string, writeHooks: FileSetWriteHooks = {}): Promise<MilestoneDefinitionEngine> {
    const root = canonicalWorkspaceRoot(sourceRoot);
    const [contract, productEngine, roadmapEngine] = await Promise.all([
      loadMilestoneDefinitionContract(join(root, "engine/contracts/interviews/milestone-definition.yaml")),
      ProductStartEngine.create(root), LivingRoadmapEngine.create(root),
    ]);
    return new MilestoneDefinitionEngine(root, contract, productEngine, roadmapEngine, writeHooks);
  }

  initialize(workspaceRoot: string): MilestoneDefinitionState {
    const root = canonicalWorkspaceRoot(workspaceRoot);
    if (root === this.sourceRoot) throw new WorkspaceError("Loopy source cannot become its own Human project.");
    if (existsSync(resolveInsideWorkspace(root, MILESTONE_DEFINITION_STATE_PATH))) throw new ContractError("Milestone Definition already exists. Use definition-status or definition-resume.");
    if (!existsSync(resolveInsideWorkspace(root, LIVING_ROADMAP_STATE_PATH))) throw new ContractError("Living Roadmap selection is required before Milestone Definition.");
    const product = this.productEngine.loadState(root);
    const roadmap = this.roadmapEngine.loadState(root);
    const selected = [...roadmap.candidates].filter((candidate) => candidate.state === this.contract.source_candidate_state)
      .sort((left, right) => left.order - right.order || left.id.localeCompare(right.id));
    if (!selected.length) throw new ContractError("No candidate is selected for Milestone Definition; select an eligible set atomically first.");
    const paths = new Set<string>();
    const definitions = selected.map((candidate, index): MilestoneDefinition => {
      const base = slug(candidate.title); let suffix = 1; let readable = base;
      while (paths.has(readable) || existsSync(resolveInsideWorkspace(root, `docs/loopy/milestones/${readable}/Definition.md`))) readable = `${base}-${++suffix}`;
      paths.add(readable);
      const batch = roadmap.selectedBatches.find((item) => item.candidateIds.includes(candidate.id));
      if (!batch) throw new ContractError("Selected candidate is missing its atomic selection batch.");
      return {
        id: `definition-${index + 1}`, sourceCandidateId: candidate.id, sourceCandidateTitle: candidate.title,
        selectedBatchVersion: batch.version, order: index, artifactPath: `docs/loopy/milestones/${readable}/Definition.md`,
        phase: "draft", revision: 0, reviewedRevision: null, coherence: { status: "draft", basis: "" },
        content: {
          outcome: candidate.outcome, requirements: [], currentBehavior: [], intendedBehavior: [], evidence: [], reconciliations: [], inScope: [], nonGoals: [], acceptance: [],
          dependencies: candidate.dependencies.map((item) => ({
            name: item.candidateId ? roadmap.candidates.find((candidateItem) => candidateItem.id === item.candidateId)?.title ?? "Roadmap dependency" : item.external!,
            kind: item.kind, consequence: item.boundary, note: item.note,
          })),
          feasibilityAndConstraints: [], risks: [], assumptions: [], unknowns: [],
        },
        requiredPerspectives: [], receipts: [], specialistInputs: [], history: [], historyHead: null,
      };
    });
    const engineering = this.productEngine.loadEngineeringStateIfPresent(root);
    const state: MilestoneDefinitionState = {
      schemaVersion: 1, stage: "milestone-definition", workspaceClass: "human-project", workspaceRoot: root,
      productRevision: product.revision, productDraftVersion: product.draftVersion, engineeringRevision: engineering?.revision ?? null, roadmapRevision: roadmap.revision,
      revision: 0, definitions, nextActions: [], session: { status: "active", resumeAction: null }, generatedViews: {},
    };
    state.nextActions = [this.route(state)];
    this.write(root, state);
    return clone(state);
  }

  async initializeDirect(workspaceRoot: string, input: DirectDefinitionStart): Promise<MilestoneDefinitionState> {
    validateDirectDefinitionStart(input);
    const root = canonicalWorkspaceRoot(workspaceRoot);
    if (existsSync(resolveInsideWorkspace(root, MILESTONE_DEFINITION_STATE_PATH))) {
      throw new ContractError("Milestone Definition already exists. Reuse its current state instead of starting direct discovery again.");
    }
    if (!existsSync(resolveInsideWorkspace(root, PRODUCT_STATE_PATH))) {
      await this.productEngine.initialize(root, input.projectName, { participantResponsibilities: input.participantResponsibilities });
    }
    if (!existsSync(resolveInsideWorkspace(root, LIVING_ROADMAP_STATE_PATH))) this.roadmapEngine.initialize(root);
    const roadmap = this.roadmapEngine.loadState(root);
    const operation = {
      type: "add" as const,
      candidate: { title: input.title, outcome: input.outcome, priority: input.priority, rationale: input.rationale, nextShapingStep: input.nextShapingStep },
      actor: input.actor,
    };
    const added = this.roadmapEngine.applyOperation(root, operation);
    const candidate = added.candidates.find((item) => item.title === input.title && item.outcome === input.outcome && item.state === "Open");
    if (!candidate) throw new ContractError("Direct Definition could not identify its newly created Roadmap candidate.");
    this.roadmapEngine.applyOperation(root, { type: "select", candidateIds: [candidate.id], actor: input.actor });
    return this.initialize(root);
  }

  loadState(workspaceRoot: string): MilestoneDefinitionState {
    const root = canonicalWorkspaceRoot(workspaceRoot);
    const value = JSON.parse(readFileSync(resolveInsideWorkspace(root, MILESTONE_DEFINITION_STATE_PATH), "utf8")) as unknown;
    validateMilestoneDefinitionState(value);
    if (value.workspaceRoot !== root) throw new WorkspaceError("Milestone Definition state does not belong to the target workspace.");
    this.assertAnchors(root, value);
    return value;
  }

  applyUpdate(workspaceRoot: string, update: DefinitionUpdate): MilestoneDefinitionState {
    validateDefinitionUpdate(update);
    const current = this.loadState(workspaceRoot); const next = clone(current); const definition = this.find(next, update.definitionId);
    if (definition.phase === "committed") throw new ContractError("A committed Definition cannot be silently changed; use later Change Management for affected decisions.");
    const before = clone(definition);
    if (update.content) definition.content = { ...definition.content, ...clone(update.content) };
    if (update.coherence) definition.coherence = clone(update.coherence);
    if (update.requiredPerspectives) definition.requiredPerspectives = normalizePerspectives(update.requiredPerspectives);
    if (update.specialistInputs) definition.specialistInputs = clone(update.specialistInputs);
    definition.revision += 1; definition.reviewedRevision = null; definition.receipts = [];
    this.rephase(definition); this.appendHistory(before, definition, "update", `Updated ${definition.sourceCandidateTitle} from ${update.actor.name}.`);
    this.advance(next);
    if (definition.phase === "blocked" || formalDefinitionGaps(definition).length === 0) this.write(workspaceRoot, next);
    else this.writeStateOnly(workspaceRoot, next);
    return clone(next);
  }

  review(workspaceRoot: string, definitionIds: string[]): MilestoneDefinitionState {
    if (!definitionIds.length || new Set(definitionIds).size !== definitionIds.length) throw new ContractError("Review requires distinct named Definitions.");
    const current = this.loadState(workspaceRoot); const next = clone(current);
    const definitions = definitionIds.map((id) => this.find(next, id));
    for (const definition of definitions) {
      if (definition.phase === "committed") throw new ContractError(`${definition.sourceCandidateTitle} is already committed.`);
      const gaps = formalDefinitionGaps(definition);
      if (gaps.length) throw new ContractError(`${definition.sourceCandidateTitle} is not formally reviewable: ${gaps.join(", ")}. The Host AI remains responsible for semantic coherence.`);
    }
    for (const definition of definitions) {
      const before = clone(definition); definition.reviewedRevision = definition.revision; this.rephase(definition);
      this.appendHistory(before, definition, "review", `Reviewed ${definition.sourceCandidateTitle} revision ${definition.revision}.`);
    }
    this.advance(next); this.write(workspaceRoot, next); return clone(next);
  }

  confirm(workspaceRoot: string, requests: DefinitionCommitRequest[]): { state: MilestoneDefinitionState; committed: string[]; notCommitted: Array<{ definitionId: string; reason: string }> } {
    if (!Array.isArray(requests) || !requests.length) throw new ContractError("Confirmation requires at least one explicitly named Definition.");
    for (const [index, request] of requests.entries()) {
      if (typeof request !== "object" || request === null || Array.isArray(request)) throw new ContractError(`Confirmation request ${index} must be an object.`);
      const extras = Object.keys(request).filter((key) => !["definitionId", "participant", "perspectives", "commit"].includes(key));
      if (extras.length) throw new ContractError(`Confirmation request ${index} contains unknown properties: ${extras.join(", ")}.`);
      if (!Array.isArray(request.perspectives) || typeof request.commit !== "boolean") throw new ContractError(`Confirmation request ${index} has invalid perspectives or commit intent.`);
    }
    const ids = requests.map((item) => item.definitionId);
    if (new Set(ids).size !== ids.length) throw new ContractError("Each Definition may appear only once in a confirmation response.");
    const current = this.loadState(workspaceRoot); const next = clone(current); const committed: string[] = []; const notCommitted: Array<{ definitionId: string; reason: string }> = [];
    for (const request of requests) {
      meaningful(request.definitionId, "definitionId"); meaningful(request.participant, "participant");
      const perspectives = normalizePerspectives(request.perspectives);
      if (!perspectives.length || perspectives.some((item) => !["product", "engineering", "architecture", "demo-quality", "release"].includes(item))) throw new ContractError("Confirmation perspectives are invalid.");
      const definition = this.find(next, request.definitionId);
      if (definition.phase === "committed") { notCommitted.push({ definitionId: definition.id, reason: "Already committed." }); continue; }
      const candidate = clone(definition);
      for (const perspective of perspectives) {
        if (!candidate.requiredPerspectives.includes(perspective)) throw new ContractError(`${perspective} is not a required perspective for ${candidate.sourceCandidateTitle}.`);
        candidate.receipts = candidate.receipts.filter((item) => item.perspective !== perspective);
        candidate.receipts.push({ perspective, participant: request.participant.trim(), revision: candidate.revision });
      }
      this.rephase(candidate);
      if (request.commit) {
        const reason = this.commitmentGap(candidate);
        if (reason) { notCommitted.push({ definitionId: candidate.id, reason }); continue; }
        const before = clone(definition); Object.assign(definition, candidate); definition.phase = "committed";
        this.appendHistory(before, definition, "commit", `Committed ${definition.sourceCandidateTitle} as a Planned Milestone with current-revision responsibility agreement.`);
        committed.push(definition.id);
      } else {
        const before = clone(definition); Object.assign(definition, candidate); this.rephase(definition);
        this.appendHistory(before, definition, "confirm", `Recorded ${perspectives.join(", ")} agreement for ${definition.sourceCandidateTitle} revision ${definition.revision}.`);
      }
    }
    if (!committed.length && requests.every((item) => item.commit)) throw new ContractError(`No Definition was committed. ${notCommitted.map((item) => item.reason).join(" ")}`);
    this.advance(next); this.write(workspaceRoot, next); return { state: clone(next), committed, notCommitted };
  }

  interrupt(workspaceRoot: string, resumeAction: string): MilestoneDefinitionState {
    const current = this.loadState(workspaceRoot); const next = clone(current); const action = meaningful(resumeAction, "resumeAction");
    next.session = { status: "interrupted", resumeAction: action };
    for (const definition of next.definitions.filter((item) => item.phase !== "committed")) {
      const before = clone(definition); this.appendHistory(before, definition, "interrupt", `Paused Definition work: ${action}`);
    }
    next.revision += 1; next.nextActions = [{ participant: "Milestone participant", action: `Resume: ${action}`, reason: "Definition drafts and their decision frontier are preserved." }];
    this.write(workspaceRoot, next); return clone(next);
  }

  async resume(workspaceRoot: string): Promise<MilestoneDefinitionState> {
    const current = this.loadState(workspaceRoot);
    if (current.session.status !== "interrupted") throw new ContractError("Milestone Definition work is not interrupted.");
    const stale = await this.detectStaleViews(workspaceRoot);
    if (stale.length) throw new ContractError(`Milestone Definition views are stale: ${stale.join(", ")}. Detect and explicitly repair them with definition-render before resuming.`);
    const next = clone(current); const action = next.session.resumeAction!; next.session = { status: "active", resumeAction: null };
    for (const definition of next.definitions.filter((item) => item.phase !== "committed")) {
      const before = clone(definition); this.appendHistory(before, definition, "resume", `Resumed Definition work: ${action}`);
    }
    next.revision += 1; next.nextActions = [{ participant: "Milestone participant", action, reason: "Continue from the preserved Definition decision frontier." }];
    this.write(workspaceRoot, next); return clone(next);
  }

  renderCurrent(workspaceRoot: string): MilestoneDefinitionArtifacts { const state = this.loadState(workspaceRoot); return this.write(workspaceRoot, state); }

  status(workspaceRoot: string): MilestoneDefinitionState {
    const state = this.loadState(workspaceRoot);
    this.write(workspaceRoot, state);
    return clone(state);
  }

  async detectStaleViews(workspaceRoot: string): Promise<string[]> {
    const state = this.loadState(workspaceRoot); const rendered = this.renderWithoutWrite(workspaceRoot, clone(state)); const stale: string[] = [];
    for (const [artifactPath, content] of Object.entries(rendered)) {
      const recorded = state.generatedViews[artifactPath];
      if (!recorded || recorded.revision !== state.revision || recorded.sha256 !== sha256(content)) { stale.push(artifactPath); continue; }
      try { if (await readFile(resolveInsideWorkspace(workspaceRoot, artifactPath), "utf8") !== content) stale.push(artifactPath); } catch { stale.push(artifactPath); }
    }
    return stale;
  }

  private find(state: MilestoneDefinitionState, id: string): MilestoneDefinition {
    const definition = state.definitions.find((item) => item.id === id);
    if (!definition) throw new ContractError(`Unknown Definition identity: ${id}.`);
    return definition;
  }
  private assertAnchors(workspaceRoot: string, state: MilestoneDefinitionState): void {
    const product = this.productEngine.loadState(workspaceRoot); const roadmap = this.roadmapEngine.loadState(workspaceRoot);
    if (product.revision !== state.productRevision || (state.productDraftVersion !== undefined && product.draftVersion !== state.productDraftVersion)) throw new ContractError("Milestone Definitions are not anchored to the current Product state.");
    for (const definition of state.definitions) {
      const candidate = roadmap.candidates.find((item) => item.id === definition.sourceCandidateId);
      if (!candidate || candidate.state !== "Selected for definition") throw new ContractError("Milestone Definition source selection is no longer valid.");
    }
    const engineering = this.productEngine.loadEngineeringStateIfPresent(workspaceRoot);
    if (engineering && state.engineeringRevision !== null && engineering.revision !== state.engineeringRevision) throw new ContractError("Milestone Definitions are not anchored to the current Engineering foundation.");
  }
  private rephase(definition: MilestoneDefinition): void {
    if (definition.phase === "committed") return;
    if (definition.coherence.status === "blocked" || definition.content.unknowns.some((item) => item.blocking) || (definition.content.reconciliations ?? []).some((item) => item.material && item.status === "unresolved") || definition.specialistInputs.some((item) => item.mode === "blocking" && item.status === "needed")) definition.phase = "blocked";
    else if (!this.commitmentGap(definition)) definition.phase = "ready-for-commitment";
    else definition.phase = "draft";
  }
  private commitmentGap(definition: MilestoneDefinition): string | null {
    const formal = formalDefinitionGaps(definition); if (formal.length) return `Missing ${formal.join(", ")}.`;
    if (!definition.requiredPerspectives.length) return "Required responsibility perspectives are not declared.";
    if (definition.reviewedRevision !== definition.revision) return "The current Definition revision has not been reviewed.";
    const missing = definition.requiredPerspectives.filter((perspective) => !definition.receipts.some((receipt) => receipt.perspective === perspective && receipt.revision === definition.revision));
    return missing.length ? `Missing current-revision agreement from ${missing.join(", ")}.` : null;
  }
  private appendHistory(before: MilestoneDefinition, after: MilestoneDefinition, operation: DefinitionHistoryEntry["operation"], summary: string): void {
    const withoutHash: Omit<DefinitionHistoryEntry, "contentHash"> = { version: after.history.length + 1, operation, summary,
      beforeHash: definitionSnapshotHash(before), afterHash: definitionSnapshotHash(after), previousHash: after.historyHead };
    const entry = { ...withoutHash, contentHash: definitionHistoryHash(withoutHash) }; after.history.push(entry); after.historyHead = entry.contentHash;
  }
  private route(state: MilestoneDefinitionState) {
    if (state.session.status === "interrupted") return { participant: "Milestone participant", action: `Resume: ${state.session.resumeAction}`, reason: "Definition work is preserved." };
    const active = [...state.definitions].sort((a, b) => a.order - b.order).find((item) => item.phase !== "committed");
    if (!active) return { participant: "Planning participant", action: "Begin Milestone Planning for the committed Definitions", reason: "Definition commitment authorizes Planning only; no implementation authority has been granted." };
    const gaps = formalDefinitionGaps(active);
    if (active.phase === "blocked") return { participant: "Responsible Definition participant", action: `Resolve the blocker for ${active.sourceCandidateTitle}`, reason: active.coherence.status === "blocked" ? active.coherence.basis : gaps.join(", ") };
    if (active.reviewedRevision !== active.revision && !gaps.length) return { participant: "Required Definition perspectives", action: `Review ${active.sourceCandidateTitle}`, reason: "The current coherent Definition revision needs explicit review." };
    const missing = active.requiredPerspectives.filter((perspective) => !active.receipts.some((receipt) => receipt.perspective === perspective));
    if (!gaps.length && missing.length) return { participant: missing.join(" and "), action: `Confirm ${active.sourceCandidateTitle}`, reason: "Required perspectives must agree to the same current revision; the final response may also commit it." };
    return { participant: "Milestone participant", action: `Define ${active.sourceCandidateTitle}`, reason: gaps.length ? `Resolve ${gaps.join(", ")}.` : "Clarify the next bounded Definition decision." };
  }
  private advance(state: MilestoneDefinitionState): void { state.revision += 1; state.session = { status: "active", resumeAction: null }; state.nextActions = [this.route(state)]; }
  private renderWithoutWrite(workspaceRoot: string, state: MilestoneDefinitionState): MilestoneDefinitionArtifacts {
    const product = this.productEngine.loadState(workspaceRoot); const engineering = this.productEngine.loadEngineeringStateIfPresent(workspaceRoot); const roadmap = this.roadmapEngine.loadState(workspaceRoot);
    if (engineering) validateEngineeringState(this.productEngine.engineeringContract, engineering); validateLivingRoadmapState(this.roadmapEngine.contract, roadmap);
    return renderProjectViews(product, this.templateRoot, engineering, roadmap, state, loadChangeManagementStateIfPresent(workspaceRoot)).milestoneDefinition!;
  }
  private write(workspaceRoot: string, state: MilestoneDefinitionState): MilestoneDefinitionArtifacts {
    const product = this.productEngine.loadState(workspaceRoot); const engineering = this.productEngine.loadEngineeringStateIfPresent(workspaceRoot); const roadmap = this.roadmapEngine.loadState(workspaceRoot);
    const rendered = writeProjectViews({ workspaceRoot, templateRoot: this.templateRoot, productContract: this.productEngine.contract, product,
      engineeringContract: engineering ? this.productEngine.engineeringContract : undefined, engineering,
      livingRoadmapContract: this.roadmapEngine.contract, livingRoadmap: roadmap, milestoneDefinition: state, writeHooks: this.writeHooks });
    return rendered.milestoneDefinition!;
  }
  private writeStateOnly(workspaceRoot: string, state: MilestoneDefinitionState): void {
    const root = canonicalWorkspaceRoot(workspaceRoot);
    if (state.workspaceRoot !== root) throw new WorkspaceError("Milestone Definition state does not belong to the target workspace.");
    validateMilestoneDefinitionState(state);
    writeFileSetInsideWorkspace(root, [[MILESTONE_DEFINITION_STATE_PATH, `${JSON.stringify(state, null, 2)}\n`]], this.writeHooks);
  }
}
