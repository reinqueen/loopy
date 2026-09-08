import { lstatSync, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { isDeepStrictEqual } from "node:util";
import { ContractError, normalizeContextGrants, normalizeEvidenceScopes } from "./contract.js";
import {
  engineeringPreconfirmationPhase,
  loadEngineeringContract,
  validateEngineeringInitializeOptions,
  validateEngineeringState,
  validateEngineeringUpdateShape,
} from "./engineering-contract.js";
import {
  ENGINEERING_COVERAGE,
  GUIDE_TRIGGER_KINDS,
  type EngineeringChangeRevision,
  type EngineeringConfirmedRevision,
  type EngineeringContent,
  type EngineeringCoverage,
  type EngineeringFoundationContract,
  type EngineeringFoundationState,
  type EngineeringFoundationUpdate,
  type EngineeringInitializeOptions,
  type EngineeringRenderedArtifacts,
} from "./engineering-types.js";
import {
  engineeringChangeHash,
  engineeringChangeSnapshotHash,
  engineeringConfirmationHash,
  engineeringMeaning,
} from "./engineering-meaning.js";
import {
  confirmedEngineeringAction,
  engineeringReviewAction,
  firstEngineeringGap,
} from "./engineering-routing.js";
import { ProductStartEngine } from "./engine.js";
import {
  ENGINEERING_PROJECT_STATE_PATH,
  loadMilestoneDefinitionStateIfPresent,
  loadChangeManagementStateIfPresent,
  renderProjectViews,
  writeProjectViews,
} from "./project-views.js";
import type { ProductStartState } from "./types.js";
import {
  canonicalWorkspaceRoot,
  type FileSetWriteHooks,
  resolveInsideWorkspace,
  sha256,
  WorkspaceError,
} from "./workspace.js";

export const ENGINEERING_STATE_PATH = ENGINEERING_PROJECT_STATE_PATH;

function clone<T>(value: T): T {
  return structuredClone(value);
}

function normalizedResponsibilities(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim().toLowerCase()).filter(Boolean))];
}

function exists(path: string): boolean {
  try {
    lstatSync(path);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

function emptyContent(): EngineeringContent {
  return {
    summary: "",
    evidence: [],
    projectDefaults: {
      languages: [], runtimes: [], frameworks: [], dependencyTools: [], practices: [], requiredChecks: [],
      environments: [], deliveryConstraints: [], compatibility: [], security: [], operations: [],
    },
    components: [],
    commands: [],
    relationships: [],
    triggers: GUIDE_TRIGGER_KINDS.map((kind) => ({ kind, triggered: false, reason: "", nextResponsibility: "" })),
    assumptions: [],
    unknowns: [],
    deferrals: [],
  };
}

function initialDecisions(): EngineeringFoundationState["decisions"] {
  return Object.fromEntries(ENGINEERING_COVERAGE.map((topic) => [topic, { status: "unresolved" }])) as EngineeringFoundationState["decisions"];
}

export class EngineeringFoundationEngine {
  readonly sourceRoot: string;
  readonly templateRoot: string;
  readonly contract: EngineeringFoundationContract;
  readonly productEngine: ProductStartEngine;
  private readonly writeHooks: FileSetWriteHooks;

  private constructor(
    sourceRoot: string,
    contract: EngineeringFoundationContract,
    productEngine: ProductStartEngine,
    writeHooks: FileSetWriteHooks,
  ) {
    this.sourceRoot = sourceRoot;
    this.templateRoot = join(sourceRoot, "templates");
    this.contract = contract;
    this.productEngine = productEngine;
    this.writeHooks = writeHooks;
  }

  static async create(sourceRoot: string, writeHooks: FileSetWriteHooks = {}): Promise<EngineeringFoundationEngine> {
    const root = canonicalWorkspaceRoot(sourceRoot);
    const [contract, productEngine] = await Promise.all([
      loadEngineeringContract(join(root, "engine/contracts/interviews/engineering-foundation.yaml")),
      ProductStartEngine.create(root),
    ]);
    return new EngineeringFoundationEngine(root, contract, productEngine, writeHooks);
  }

  initialize(workspaceRoot: string, options: EngineeringInitializeOptions = {}): EngineeringFoundationState {
    validateEngineeringInitializeOptions(options);
    if (typeof workspaceRoot !== "string" || !workspaceRoot.trim()) throw new ContractError("Engineering workspace must be a non-empty string.");
    const root = canonicalWorkspaceRoot(workspaceRoot);
    if (root === this.sourceRoot) throw new WorkspaceError("Loopy source cannot become its own Human project.");
    if (exists(resolveInsideWorkspace(root, ENGINEERING_STATE_PATH))) {
      throw new ContractError("Engineering foundation already exists. Use engineering-status or engineering-resume.");
    }
    const product = this.productEngine.loadState(root);
    if (product.phase !== this.contract.required_product_phase) {
      throw new ContractError("A confirmed Product foundation is required before Engineering setup.");
    }
    const confirmedProduct = product.confirmedHistory.at(-1);
    if (!confirmedProduct) throw new ContractError("The confirmed Product receipt is missing.");
    const participants = normalizedResponsibilities(options.participantResponsibilities ?? []);
    const state: EngineeringFoundationState = {
      schemaVersion: 1,
      stage: "engineering-foundation",
      workspaceClass: "human-project",
      workspaceRoot: root,
      productRevision: product.revision,
      productConfirmationHash: confirmedProduct.contentHash,
      phase: "draft",
      revision: 0,
      draftVersion: 0,
      reviewedDraftVersion: null,
      participantResponsibilities: participants,
      contextGrants: normalizeContextGrants(root, clone(options.contextGrants ?? [])),
      engineering: emptyContent(),
      decisions: initialDecisions(),
      nextActions: [{
        participant: "Engineering",
        action: participants.includes("engineering") ? "Establish the Engineering foundation" : "Invite Engineering participation",
        reason: "Product is confirmed, but the component-aware Engineering Guide is not established.",
      }],
      responsibilityConfirmations: [],
      session: { status: "active", resumeTopic: "project_defaults" },
      confirmedHistory: [],
      changeHistory: [],
      changeHistoryHead: null,
      generatedViews: {},
    };
    this.renderAndWrite(root, product, state);
    return clone(state);
  }

  loadState(workspaceRoot: string): EngineeringFoundationState {
    const root = canonicalWorkspaceRoot(workspaceRoot);
    const state = JSON.parse(readFileSync(resolveInsideWorkspace(root, ENGINEERING_STATE_PATH), "utf8")) as unknown;
    validateEngineeringState(this.contract, state);
    if (state.workspaceRoot !== root) throw new WorkspaceError("Engineering state does not belong to the target workspace.");
    const product = this.productEngine.loadState(root);
    const anchors = [
      { revision: state.productRevision, contentHash: state.productConfirmationHash },
      ...state.confirmedHistory.map((item) => ({ revision: item.productRevision, contentHash: item.productConfirmationHash })),
    ];
    if (anchors.some((candidate) => !product.confirmedHistory.some((item) =>
      item.revision === candidate.revision && item.contentHash === candidate.contentHash))) {
      throw new ContractError("Engineering state no longer matches a durable confirmed Product receipt.");
    }
    if (state.phase === "engineering-foundation-confirmed") {
      const expected = confirmedEngineeringAction(state, product);
      if (!isDeepStrictEqual(state.nextActions, [expected])) {
        throw new ContractError("The confirmed Engineering route does not match the Engine-owned lifecycle route.");
      }
    }
    return state;
  }

  applyUpdate(workspaceRoot: string, update: EngineeringFoundationUpdate): EngineeringFoundationState {
    validateEngineeringUpdateShape(update);
    const current = this.loadState(workspaceRoot);
    if (current.phase === "engineering-foundation-confirmed" && update.nextActions !== undefined) {
      throw new ContractError("The confirmed Engineering route is Engine-owned; omit nextActions.");
    }
    const next = clone(current);
    if (update.participantResponsibilities) next.participantResponsibilities = normalizedResponsibilities(update.participantResponsibilities);
    if (update.contextGrants) next.contextGrants = normalizeContextGrants(workspaceRoot, clone(update.contextGrants));
    if (update.engineering) next.engineering = { ...next.engineering, ...clone(update.engineering) };
    next.engineering.evidence = normalizeEvidenceScopes(workspaceRoot, next.engineering.evidence, next.contextGrants);
    next.engineering.commands = next.engineering.commands.map((command) => {
      if (!command.contextScope) return command;
      const [normalized] = normalizeEvidenceScopes(workspaceRoot, [{ source: command.source ?? "command", finding: command.command, contextScope: command.contextScope }], next.contextGrants);
      return { ...command, contextScope: normalized.contextScope };
    });
    if (update.decisions) {
      for (const [topic, entry] of Object.entries(update.decisions)) {
        next.decisions[topic as EngineeringCoverage] = clone(entry!);
      }
    }
    if (update.nextActions) next.nextActions = clone(update.nextActions);

    const materialChanged = !isDeepStrictEqual(
      {
        engineering: engineeringMeaning(current.engineering), decisions: current.decisions,
        engineeringParticipant: current.participantResponsibilities.includes("engineering"),
      },
      {
        engineering: engineeringMeaning(next.engineering), decisions: next.decisions,
        engineeringParticipant: next.participantResponsibilities.includes("engineering"),
      },
    );
    const trackedChanged = Boolean(update.engineering || update.decisions || update.contextGrants || update.participantResponsibilities);
    if (trackedChanged) this.appendChange(next, materialChanged ? "material" : "evidence-refresh");

    if (current.phase !== "engineering-foundation-confirmed" && trackedChanged) {
      next.draftVersion += 1;
      next.reviewedDraftVersion = null;
    } else if (current.phase === "engineering-foundation-confirmed" && materialChanged) {
      next.draftVersion += 1;
      next.reviewedDraftVersion = null;
      next.responsibilityConfirmations = [];
    }
    next.phase = current.phase === "engineering-foundation-confirmed" && !materialChanged
      ? "engineering-foundation-confirmed"
      : this.preconfirmationPhase(next);
    const product = this.productEngine.loadState(workspaceRoot);
    next.session.resumeTopic = firstEngineeringGap(next);
    if (current.phase === "engineering-foundation-confirmed") {
      next.nextActions = [materialChanged ? engineeringReviewAction(next) : confirmedEngineeringAction(next, product)];
    }
    this.renderAndWrite(workspaceRoot, product, next);
    return clone(next);
  }

  recordReview(workspaceRoot: string): EngineeringFoundationState {
    const state = this.loadState(workspaceRoot);
    if (state.phase !== "ready-for-engineering-confirmation") {
      throw new ContractError("The Engineering foundation must be ready before review.");
    }
    state.reviewedDraftVersion = state.draftVersion;
    state.nextActions = [{ participant: "Engineering", action: "Confirm the Engineering foundation", reason: "The current Engineering Guide has been reviewed." }];
    this.renderAndWrite(workspaceRoot, this.productEngine.loadState(workspaceRoot), state);
    return clone(state);
  }

  confirm(
    workspaceRoot: string,
    responsibilities: string[] = ["engineering"],
  ): EngineeringFoundationState {
    const product = this.productEngine.loadState(workspaceRoot);
    if (product.phase !== this.contract.required_product_phase) {
      throw new ContractError("Current Product confirmation is required before Engineering confirmation.");
    }
    const state = this.loadState(workspaceRoot);
    state.responsibilityConfirmations = normalizedResponsibilities(responsibilities);
    validateEngineeringState(this.contract, state, true);
    state.phase = "engineering-foundation-confirmed";
    state.revision += 1;
    state.session = { status: "active", resumeTopic: null };
    state.nextActions = [confirmedEngineeringAction(state, product)];
    const withoutHash: Omit<EngineeringConfirmedRevision, "contentHash"> = {
      revision: state.revision,
      draftVersion: state.draftVersion,
      productRevision: state.productRevision,
      productConfirmationHash: state.productConfirmationHash,
      engineering: clone(state.engineering),
      decisions: clone(state.decisions),
      contextGrants: clone(state.contextGrants),
      responsibilityConfirmations: clone(state.responsibilityConfirmations),
      previousHash: state.confirmedHistory.at(-1)?.contentHash ?? null,
    };
    state.confirmedHistory.push({ ...withoutHash, contentHash: engineeringConfirmationHash(withoutHash) });
    this.renderAndWrite(workspaceRoot, product, state);
    return clone(state);
  }

  interrupt(workspaceRoot: string): EngineeringFoundationState {
    const state = this.loadState(workspaceRoot);
    const gap = firstEngineeringGap(state);
    state.session = { status: "interrupted", resumeTopic: gap };
    const product = this.productEngine.loadState(workspaceRoot);
    state.nextActions = state.phase === "engineering-foundation-confirmed"
      ? [confirmedEngineeringAction(state, product)]
      : [{ participant: "Engineering", action: gap ? `Resume with ${gap.replaceAll("_", " ")}` : "Resume Engineering review", reason: "The Engineering draft and context grants are preserved." }];
    this.renderAndWrite(workspaceRoot, product, state);
    return clone(state);
  }

  resume(workspaceRoot: string): { state: EngineeringFoundationState; nextTopic: EngineeringCoverage | null } {
    const state = this.loadState(workspaceRoot);
    const gap = firstEngineeringGap(state);
    state.session = { status: "active", resumeTopic: gap };
    const product = this.productEngine.loadState(workspaceRoot);
    state.nextActions = state.phase === "engineering-foundation-confirmed"
      ? [confirmedEngineeringAction(state, product)]
      : [{ participant: "Engineering", action: gap ? `Continue with ${gap.replaceAll("_", " ")}` : "Review the Engineering foundation", reason: gap ? "This is the next unresolved or blocking Engineering decision." : "The Engineering foundation is ready for review." }];
    this.renderAndWrite(workspaceRoot, product, state);
    return { state: clone(state), nextTopic: gap };
  }

  renderCurrent(workspaceRoot: string): EngineeringRenderedArtifacts {
    const state = this.loadState(workspaceRoot);
    return this.renderAndWrite(workspaceRoot, this.productEngine.loadState(workspaceRoot), state);
  }

  async detectStaleViews(workspaceRoot: string): Promise<string[]> {
    const state = this.loadState(workspaceRoot);
    const product = this.productEngine.loadState(workspaceRoot);
    const loadedLivingRoadmap = this.productEngine.loadLivingRoadmapStateIfPresent(workspaceRoot);
    const livingRoadmap = product.phase === "product-foundation-confirmed" && loadedLivingRoadmap?.productRevision === product.revision
      ? loadedLivingRoadmap : undefined;
    const expected = renderProjectViews(product, this.templateRoot, state, livingRoadmap, loadMilestoneDefinitionStateIfPresent(workspaceRoot), loadChangeManagementStateIfPresent(workspaceRoot)).engineering!;
    const stale: string[] = [];
    for (const [path, content] of Object.entries(expected)) {
      const recorded = state.generatedViews[path];
      if (!recorded || recorded.sha256 !== sha256(content) || recorded.revision !== state.revision || recorded.draftVersion !== state.draftVersion) {
        stale.push(path);
        continue;
      }
      try {
        if (await readFile(resolveInsideWorkspace(workspaceRoot, path), "utf8") !== content) stale.push(path);
      } catch {
        stale.push(path);
      }
    }
    return stale;
  }

  private preconfirmationPhase(state: EngineeringFoundationState): EngineeringFoundationState["phase"] {
    return engineeringPreconfirmationPhase(state);
  }

  private appendChange(state: EngineeringFoundationState, kind: EngineeringChangeRevision["kind"]): void {
    const withoutHash: Omit<EngineeringChangeRevision, "contentHash"> = {
      version: state.changeHistory.length + 1,
      kind,
      draftVersion: state.draftVersion + (kind === "material" ? 1 : 0),
      snapshotHash: engineeringChangeSnapshotHash(state),
      previousHash: state.changeHistoryHead,
    };
    const revision = { ...withoutHash, contentHash: engineeringChangeHash(withoutHash) };
    state.changeHistory.push(revision);
    state.changeHistoryHead = revision.contentHash;
  }

  private renderAndWrite(
    workspaceRoot: string,
    product: ProductStartState,
    state: EngineeringFoundationState,
  ): EngineeringRenderedArtifacts {
    const loadedLivingRoadmap = this.productEngine.loadLivingRoadmapStateIfPresent(workspaceRoot);
    const livingRoadmap = product.phase === "product-foundation-confirmed" && loadedLivingRoadmap?.productRevision === product.revision
      ? loadedLivingRoadmap : undefined;
    const rendered = writeProjectViews({
      workspaceRoot,
      templateRoot: this.templateRoot,
      productContract: this.productEngine.contract,
      product,
      engineeringContract: this.contract,
      engineering: state,
      livingRoadmapContract: livingRoadmap ? this.productEngine.livingRoadmapContract : undefined,
      livingRoadmap,
      writeHooks: this.writeHooks,
    });
    return rendered.engineering!;
  }
}
