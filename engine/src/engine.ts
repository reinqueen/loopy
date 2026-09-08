import { lstatSync, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { isDeepStrictEqual } from "node:util";
import { classifyRoadmapChange } from "./candidates.js";
import {
  confirmationBlockers,
  ContractError,
  loadContract,
  normalizeContextGrants,
  normalizeEvidenceScopes,
  validateInitializeOptions,
  validateState,
  validateUpdateShape,
} from "./contract.js";
import { confirmationRevisionHash, productMeaningSnapshot, roadmapRevisionHash } from "./meaning.js";
import { normalizeRoadmapForConfirmation } from "./roadmap-semantics.js";
import { loadEngineeringContract, validateEngineeringState } from "./engineering-contract.js";
import type { EngineeringFoundationContract, EngineeringFoundationState } from "./engineering-types.js";
import { confirmedEngineeringAction } from "./engineering-routing.js";
import { loadLivingRoadmapContract, validateLivingRoadmapState } from "./living-roadmap-contract.js";
import type { LivingRoadmapContract, LivingRoadmapState } from "./living-roadmap-types.js";
import {
  ENGINEERING_PROJECT_STATE_PATH,
  LIVING_ROADMAP_STATE_PATH,
  loadMilestoneDefinitionStateIfPresent,
  loadChangeManagementStateIfPresent,
  PRODUCT_STATE_PATH,
  renderProjectViews,
  writeProjectViews,
} from "./project-views.js";
import {
  CONDITIONAL_DECISIONS,
  ESSENTIAL_DECISIONS,
  SUPPORTING_DECISIONS,
  type ConfirmedRevision,
  type DecisionTopic,
  type NextAction,
  type ProductContent,
  type ProductStartContract,
  type ProductStartInitializeOptions,
  type ProductStartState,
  type ProductStartUpdate,
  type RenderedArtifacts,
  type ResumeTopic,
  type RoadmapContent,
  type RoadmapRevision,
} from "./types.js";
import {
  canonicalWorkspaceRoot,
  resolveInsideWorkspace,
  sha256,
  WorkspaceError,
} from "./workspace.js";

function emptyProduct(projectName: string): ProductContent {
  return {
    projectName,
    summary: "",
    purpose: "",
    primaryPeople: "",
    need: "",
    currentAlternative: "",
    secondaryPeople: "",
    outcome: "",
    evidence: [],
    remainsTrue: [],
    shouldChange: [],
    uncertain: [],
    inScope: [],
    nonGoals: [],
    constraints: [],
    successSignals: [],
    assumptions: [],
    unknowns: [],
    deferrals: [],
  };
}

function emptyRoadmap(): RoadmapContent {
  return {
    summary: "Product direction and possible outcomes are being clarified.",
    lifecycleState: "Project foundation in progress",
    lifecycleExplanation: "No Milestone is committed. Product direction is still being established.",
    productNotes: "",
    candidates: [],
    milestones: [],
  };
}

function initialDecisions(): ProductStartState["decisions"] {
  return Object.fromEntries(
    [...ESSENTIAL_DECISIONS, ...SUPPORTING_DECISIONS].map((topic) => [topic, { status: "unresolved" }]),
  ) as ProductStartState["decisions"];
}

function initialConditionalDecisions(): ProductStartState["conditionalDecisions"] {
  return Object.fromEntries(
    CONDITIONAL_DECISIONS.map((topic) => [topic, { triggered: false, status: "not_applicable" }]),
  ) as ProductStartState["conditionalDecisions"];
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function normalizedResponsibilities(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim().toLowerCase()).filter(Boolean))];
}

function pathEntryExists(path: string): boolean {
  try {
    lstatSync(path);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

export class ProductStartEngine {
  readonly sourceRoot: string;
  readonly contract: ProductStartContract;
  readonly engineeringContract: EngineeringFoundationContract;
  readonly livingRoadmapContract: LivingRoadmapContract;
  readonly templateRoot: string;

  private constructor(
    sourceRoot: string,
    contract: ProductStartContract,
    engineeringContract: EngineeringFoundationContract,
    livingRoadmapContract: LivingRoadmapContract,
  ) {
    this.sourceRoot = sourceRoot;
    this.contract = contract;
    this.engineeringContract = engineeringContract;
    this.livingRoadmapContract = livingRoadmapContract;
    this.templateRoot = join(sourceRoot, "templates");
  }

  static async create(sourceRoot: string): Promise<ProductStartEngine> {
    const root = canonicalWorkspaceRoot(sourceRoot);
    const [contract, engineeringContract, livingRoadmapContract] = await Promise.all([
      loadContract(join(root, "engine/contracts/interviews/product-start.yaml")),
      loadEngineeringContract(join(root, "engine/contracts/interviews/engineering-foundation.yaml")),
      loadLivingRoadmapContract(join(root, "engine/contracts/interviews/living-roadmap.yaml")),
    ]);
    return new ProductStartEngine(root, contract, engineeringContract, livingRoadmapContract);
  }

  async initialize(
    workspaceRoot: string,
    projectName: string,
    options: ProductStartInitializeOptions = {},
  ): Promise<ProductStartState> {
    validateInitializeOptions(options);
    if (typeof workspaceRoot !== "string" || !workspaceRoot.trim()) {
      throw new ContractError("Initialization workspace must be a non-empty string.");
    }
    if (typeof projectName !== "string" || !projectName.trim()) {
      throw new ContractError("Initialization project name must be a non-empty string.");
    }
    const root = canonicalWorkspaceRoot(workspaceRoot);
    if (root === this.sourceRoot) {
      throw new WorkspaceError("Loopy source cannot be initialized as its own Human project.");
    }
    if (pathEntryExists(resolveInsideWorkspace(root, PRODUCT_STATE_PATH))) {
      throw new ContractError(
        "This workspace is already initialized. Use status or resume; initialization never resets canonical state.",
      );
    }
    const responsibilities = normalizedResponsibilities(options.participantResponsibilities ?? []);
    const contextGrants = normalizeContextGrants(root, clone(options.contextGrants ?? []));
    const state: ProductStartState = {
      schemaVersion: 2,
      workspaceClass: "human-project",
      workspaceRoot: root,
      phase: "draft",
      revision: 0,
      draftVersion: 0,
      reviewedDraftVersion: null,
      participantResponsibilities: responsibilities,
      contextGrants,
      product: emptyProduct(projectName),
      roadmap: emptyRoadmap(),
      decisions: initialDecisions(),
      conditionalDecisions: initialConditionalDecisions(),
      nextActions: [{
        participant: "Product",
        action: responsibilities.includes("product")
          ? "Clarify the Product foundation"
          : "Invite Product participation",
        reason: responsibilities.includes("product")
          ? "Essential Product decisions are still unresolved."
          : "Drafts can start now, but only Product can confirm Product direction.",
      }],
      responsibilityConfirmations: [],
      session: { status: "active", resumeTopic: "purpose" },
      confirmedHistory: [],
      roadmapHistory: [],
      roadmapHistoryHead: null,
      generatedViews: {},
    };
    await this.renderAndWrite(root, state);
    return clone(state);
  }

  loadState(workspaceRoot: string): ProductStartState {
    const path = resolveInsideWorkspace(workspaceRoot, PRODUCT_STATE_PATH);
    const state = JSON.parse(readFileSync(path, "utf8")) as ProductStartState;
    this.assertStateWorkspace(workspaceRoot, state);
    validateState(this.contract, state);
    return state;
  }

  applyUpdate(workspaceRoot: string, update: ProductStartUpdate): ProductStartState {
    validateUpdateShape(update);
    const current = this.loadState(workspaceRoot);
    if (this.loadLivingRoadmapStateIfPresent(workspaceRoot) && update.roadmap?.candidates) {
      throw new ContractError("Use Living Roadmap operations for candidate management after Slice 3 begins.");
    }
    const next = clone(current);
    if (update.participantResponsibilities) {
      next.participantResponsibilities = normalizedResponsibilities(update.participantResponsibilities);
    }
    if (update.contextGrants) {
      next.contextGrants = normalizeContextGrants(workspaceRoot, clone(update.contextGrants));
    }
    if (update.product) next.product = { ...next.product, ...clone(update.product) };
    next.product.evidence = normalizeEvidenceScopes(workspaceRoot, next.product.evidence, next.contextGrants);
    if (update.roadmap) next.roadmap = { ...next.roadmap, ...clone(update.roadmap) };
    if (update.decisions) {
      for (const [topic, entry] of Object.entries(update.decisions)) {
        if (![...ESSENTIAL_DECISIONS, ...SUPPORTING_DECISIONS].includes(topic as never)) {
          throw new ContractError(`Unknown Product decision: ${topic}.`);
        }
        if (!entry) throw new ContractError(`Missing Product decision entry: ${topic}.`);
        next.decisions[topic as keyof typeof next.decisions] = clone(entry);
      }
    }
    if (update.conditionalDecisions) {
      for (const [topic, entry] of Object.entries(update.conditionalDecisions)) {
        if (!CONDITIONAL_DECISIONS.includes(topic as never)) {
          throw new ContractError(`Unknown conditional Product decision: ${topic}.`);
        }
        if (!entry) throw new ContractError(`Missing conditional decision entry: ${topic}.`);
        next.conditionalDecisions[topic as keyof typeof next.conditionalDecisions] = clone(entry);
      }
    }
    if (update.nextActions) next.nextActions = clone(update.nextActions);
    const roadmapChanged = !isDeepStrictEqual(current.roadmap, next.roadmap);
    if (roadmapChanged) {
      this.appendRoadmapRevision(next, current.roadmap, next.roadmap, current.revision);
    }

    const productMeaningChanged = !isDeepStrictEqual(
      productMeaningSnapshot(current),
      productMeaningSnapshot(next),
    );
    const draftInputChanged = Boolean(
      update.product || update.decisions || update.conditionalDecisions || update.contextGrants || roadmapChanged,
    );
    if (current.phase !== "product-foundation-confirmed" && draftInputChanged) {
      next.draftVersion += 1;
      next.reviewedDraftVersion = null;
    } else if (current.phase === "product-foundation-confirmed" && productMeaningChanged) {
      next.draftVersion += 1;
      next.reviewedDraftVersion = null;
    }

    const desiredPhase = current.phase === "product-foundation-confirmed" && !productMeaningChanged
      ? "product-foundation-confirmed"
      : this.preconfirmationPhase(next);
    this.assertTransition("phase", current.phase, desiredPhase);
    next.phase = desiredPhase;
    next.session.resumeTopic = this.firstUnresolved(next);
    this.renderAndWrite(workspaceRoot, next);
    return clone(next);
  }

  async recordProductReview(workspaceRoot: string): Promise<ProductStartState> {
    const state = this.loadState(workspaceRoot);
    if (state.phase !== "ready-for-product-confirmation") {
      throw new ContractError("The Product foundation must be ready before its concise review is recorded.");
    }
    state.reviewedDraftVersion = state.draftVersion;
    state.nextActions = [{
      participant: "Product",
      action: "Confirm the Product foundation",
      reason: "The current Product Definition and Roadmap have been reviewed.",
    }];
    await this.renderAndWrite(workspaceRoot, state);
    return clone(state);
  }

  async confirmProduct(
    workspaceRoot: string,
    responsibilities: string[] = ["product"],
    nextAction: NextAction = {
      participant: "Engineering",
      action: "Establish the Engineering guide when delivery needs it",
      reason: "Product direction is confirmed; technical feasibility and practices remain separate.",
    },
  ): Promise<ProductStartState> {
    const state = this.loadState(workspaceRoot);
    state.responsibilityConfirmations = normalizedResponsibilities(responsibilities);
    validateState(this.contract, state, { forConfirmation: true });
    const reviewedRoadmap = clone(state.roadmap);
    state.roadmap = normalizeRoadmapForConfirmation(state.roadmap, this.contract);
    if (!isDeepStrictEqual(reviewedRoadmap, state.roadmap)) {
      this.appendRoadmapRevision(state, reviewedRoadmap, state.roadmap, state.revision);
    }
    this.assertTransition("phase", state.phase, "product-foundation-confirmed");
    state.phase = "product-foundation-confirmed";
    state.revision += 1;
    state.session = { status: "active", resumeTopic: null };
    state.nextActions = [clone(nextAction)];
    const revisionWithoutHash: Omit<ConfirmedRevision, "contentHash"> = {
      revision: state.revision,
      draftVersion: state.draftVersion,
      product: clone(state.product),
      decisions: clone(state.decisions),
      conditionalDecisions: clone(state.conditionalDecisions),
      contextGrants: clone(state.contextGrants),
      roadmap: clone(state.roadmap),
      responsibilityConfirmations: clone(state.responsibilityConfirmations),
      roadmapHistoryHead: state.roadmapHistoryHead,
      previousHash: state.confirmedHistory.at(-1)?.contentHash ?? null,
    };
    const confirmed: ConfirmedRevision = {
      ...revisionWithoutHash,
      contentHash: confirmationRevisionHash(revisionWithoutHash),
    };
    state.confirmedHistory.push(confirmed);
    await this.renderAndWrite(workspaceRoot, state);
    return clone(state);
  }

  async renderCurrent(workspaceRoot: string): Promise<RenderedArtifacts> {
    const state = this.loadState(workspaceRoot);
    return this.renderAndWrite(workspaceRoot, state);
  }

  async interrupt(workspaceRoot: string): Promise<ProductStartState> {
    const state = this.loadState(workspaceRoot);
    const resumeTopic = this.firstUnresolved(state);
    this.assertTransition("session", state.session.status, "interrupted");
    state.session = { status: "interrupted", resumeTopic };
    state.nextActions = [{
      participant: "Product",
      action: resumeTopic ? `Resume with ${resumeTopic.replaceAll("_", " ")}` : "Resume the Product review",
      reason: "The Product-foundation draft and authorized context have been preserved.",
    }];
    await this.renderAndWrite(workspaceRoot, state);
    return clone(state);
  }

  async resume(workspaceRoot: string): Promise<{ state: ProductStartState; nextTopic: ResumeTopic | null }> {
    const state = this.loadState(workspaceRoot);
    const nextTopic = this.firstUnresolved(state);
    this.assertTransition("session", state.session.status, "active");
    state.session = { status: "active", resumeTopic: nextTopic };
    state.nextActions = [{
      participant: "Product",
      action: nextTopic ? `Continue with ${nextTopic.replaceAll("_", " ")}` : "Review the Product foundation",
      reason: nextTopic ? "This is the next unresolved or blocking Product decision." : "The Product foundation is ready for review.",
    }];
    await this.renderAndWrite(workspaceRoot, state);
    return { state: clone(state), nextTopic };
  }

  async detectStaleViews(workspaceRoot: string): Promise<string[]> {
    const state = this.loadState(workspaceRoot);
    const engineering = this.loadEngineeringStateIfPresent(workspaceRoot);
    const loadedLivingRoadmap = this.loadLivingRoadmapStateIfPresent(workspaceRoot);
    const livingRoadmap = state.phase === "product-foundation-confirmed" && loadedLivingRoadmap?.productRevision === state.revision
      ? loadedLivingRoadmap : undefined;
    const expected = renderProjectViews(state, this.templateRoot, engineering, livingRoadmap, loadMilestoneDefinitionStateIfPresent(workspaceRoot), loadChangeManagementStateIfPresent(workspaceRoot)).product;
    const stale: string[] = [];
    for (const [relativePath, content] of Object.entries(expected)) {
      const recorded = state.generatedViews[relativePath];
      if (!recorded || recorded.sha256 !== sha256(content) || recorded.revision !== state.revision ||
          recorded.draftVersion !== state.draftVersion) {
        stale.push(relativePath);
        continue;
      }
      try {
        const actual = await readFile(resolveInsideWorkspace(workspaceRoot, relativePath), "utf8");
        if (actual !== content) stale.push(relativePath);
      } catch {
        stale.push(relativePath);
      }
    }
    return stale;
  }

  private preconfirmationPhase(state: ProductStartState): ProductStartState["phase"] {
    const blockers = confirmationBlockers(this.contract, state);
    const hasBlockingDeferral = [...Object.values(state.decisions), ...Object.values(state.conditionalDecisions)]
      .some((entry) => entry.status === "deferred_blocking") ||
      state.product.deferrals.some((deferral) => deferral.blocking);
    if (hasBlockingDeferral) return "blocked";
    if (blockers.length === 0 && state.participantResponsibilities.includes("product")) {
      return "ready-for-product-confirmation";
    }
    return "draft";
  }

  private firstUnresolved(state: ProductStartState): ResumeTopic | null {
    const ordinary = [...ESSENTIAL_DECISIONS, ...SUPPORTING_DECISIONS].find((topic) =>
      state.decisions[topic].status === "unresolved" || state.decisions[topic].status === "deferred_blocking");
    if (ordinary) return ordinary;
    return CONDITIONAL_DECISIONS.find((topic) => {
      const entry = state.conditionalDecisions[topic];
      return entry.triggered && (entry.status === "unresolved" || entry.status === "deferred_blocking");
    }) ?? null;
  }

  private assertTransition(group: "phase" | "session", from: string, to: string): void {
    if (!this.contract.state_transitions[group]?.[from]?.includes(to)) {
      throw new ContractError(`Invalid ${group} transition: ${from} -> ${to}.`);
    }
  }

  private appendRoadmapRevision(
    state: ProductStartState,
    before: RoadmapContent,
    after: RoadmapContent,
    productRevision: number,
  ): void {
    const revisionWithoutHash: Omit<RoadmapRevision, "contentHash"> = {
      version: state.roadmapHistory.length + 1,
      productRevision,
      change: classifyRoadmapChange(before, after),
      before: clone(before),
      after: clone(after),
      previousHash: state.roadmapHistoryHead,
    };
    const revision: RoadmapRevision = {
      ...revisionWithoutHash,
      contentHash: roadmapRevisionHash(revisionWithoutHash),
    };
    state.roadmapHistory.push(revision);
    state.roadmapHistoryHead = revision.contentHash;
  }

  private assertStateWorkspace(workspaceRoot: string, state: ProductStartState): void {
    const root = canonicalWorkspaceRoot(workspaceRoot);
    if (state.workspaceRoot !== root || state.workspaceClass !== "human-project") {
      throw new WorkspaceError("State does not belong to the target Human workspace.");
    }
  }

  private renderAndWrite(workspaceRoot: string, state: ProductStartState): RenderedArtifacts {
    this.assertStateWorkspace(workspaceRoot, state);
    const engineering = this.loadEngineeringStateIfPresent(workspaceRoot);
    const loadedLivingRoadmap = this.loadLivingRoadmapStateIfPresent(workspaceRoot);
    const livingRoadmap = state.phase === "product-foundation-confirmed" && loadedLivingRoadmap?.productRevision === state.revision
      ? loadedLivingRoadmap : undefined;
    return writeProjectViews({
      workspaceRoot,
      templateRoot: this.templateRoot,
      productContract: this.contract,
      product: state,
      engineeringContract: engineering ? this.engineeringContract : undefined,
      engineering,
      livingRoadmapContract: livingRoadmap ? this.livingRoadmapContract : undefined,
      livingRoadmap,
    }).product;
  }

  loadEngineeringStateIfPresent(workspaceRoot: string): EngineeringFoundationState | undefined {
    const path = resolveInsideWorkspace(workspaceRoot, ENGINEERING_PROJECT_STATE_PATH);
    if (!pathEntryExists(path)) return undefined;
    const state = JSON.parse(readFileSync(path, "utf8")) as unknown;
    validateEngineeringState(this.engineeringContract, state);
    if (state.phase === "engineering-foundation-confirmed") {
      const product = this.loadState(workspaceRoot);
      if (!isDeepStrictEqual(state.nextActions, [confirmedEngineeringAction(state, product)])) {
        throw new ContractError("The confirmed Engineering route does not match the Engine-owned lifecycle route.");
      }
    }
    return state;
  }

  loadLivingRoadmapStateIfPresent(workspaceRoot: string): LivingRoadmapState | undefined {
    const path = resolveInsideWorkspace(workspaceRoot, LIVING_ROADMAP_STATE_PATH);
    if (!pathEntryExists(path)) return undefined;
    const state = JSON.parse(readFileSync(path, "utf8")) as unknown;
    validateLivingRoadmapState(this.livingRoadmapContract, state);
    return state;
  }
}
