import { existsSync, readFileSync } from "node:fs";
import { ContractError, validateState } from "./contract.js";
import { engineeringPreconfirmationPhase, validateEngineeringState } from "./engineering-contract.js";
import {
  engineeringChangeHash,
  engineeringChangeSnapshotHash,
} from "./engineering-meaning.js";
import { renderEngineeringArtifacts } from "./engineering-render.js";
import {
  confirmedEngineeringAction,
  engineeringReviewAction,
  firstEngineeringGap,
} from "./engineering-routing.js";
import type {
  EngineeringChangeRevision,
  EngineeringFoundationContract,
  EngineeringFoundationState,
  EngineeringRenderedArtifacts,
} from "./engineering-types.js";
import { renderArtifacts } from "./render.js";
import type { ProductStartContract, ProductStartState, RenderedArtifacts } from "./types.js";
import { validateLivingRoadmapState } from "./living-roadmap-contract.js";
import { renderLivingRoadmapArtifacts } from "./living-roadmap-render.js";
import type { LivingRoadmapContract, LivingRoadmapState } from "./living-roadmap-types.js";
import { validateMilestoneDefinitionState } from "./milestone-definition-contract.js";
import { renderMilestoneDefinitionArtifacts } from "./milestone-definition-render.js";
import type { MilestoneDefinitionArtifacts, MilestoneDefinitionState } from "./milestone-definition-types.js";
import { validateChangeManagementState } from "./change-management-contract.js";
import { renderChangeManagementArtifacts } from "./change-management-render.js";
import type { ChangeManagementArtifacts, ChangeManagementState } from "./change-management-types.js";
import { validateMilestonePlanningState } from "./milestone-planning-contract.js";
import { renderMilestonePlanningArtifacts, synchronizePlanningLifecycle } from "./milestone-planning-render.js";
import type { MilestonePlanningArtifacts, MilestonePlanningState } from "./milestone-planning-types.js";
import { renderRoadmapDependencyMap } from "./roadmap-dependency-render.js";
import {
  canonicalWorkspaceRoot,
  resolveInsideWorkspace,
  type FileSetWriteHooks,
  sha256,
  WorkspaceError,
  writeFileSetInsideWorkspace,
} from "./workspace.js";

export const PRODUCT_STATE_PATH = ".loopy/start-or-adopt/state.json";
export const ENGINEERING_PROJECT_STATE_PATH = ".loopy/engineering-foundation/state.json";
export const LIVING_ROADMAP_STATE_PATH = ".loopy/living-roadmap/state.json";
export const MILESTONE_DEFINITION_STATE_PATH = ".loopy/milestone-definition/state.json";
export const CHANGE_MANAGEMENT_STATE_PATH = ".loopy/change-management/state.json";
export const MILESTONE_PLANNING_STATE_PATH = ".loopy/milestone-planning/state.json";

export interface ProjectViewSet {
  product: RenderedArtifacts;
  engineering?: EngineeringRenderedArtifacts;
  milestoneDefinition?: MilestoneDefinitionArtifacts;
  changeManagement?: ChangeManagementArtifacts;
  milestonePlanning?: MilestonePlanningArtifacts;
}

export function loadChangeManagementStateIfPresent(workspaceRoot: string): ChangeManagementState | undefined {
  const statePath = resolveInsideWorkspace(workspaceRoot, CHANGE_MANAGEMENT_STATE_PATH);
  if (!existsSync(statePath)) return undefined;
  const state = JSON.parse(readFileSync(statePath, "utf8")) as unknown;
  validateChangeManagementState(state);
  return state;
}

export function loadMilestoneDefinitionStateIfPresent(workspaceRoot: string): MilestoneDefinitionState | undefined {
  const statePath = resolveInsideWorkspace(workspaceRoot, MILESTONE_DEFINITION_STATE_PATH);
  if (!existsSync(statePath)) return undefined;
  const state = JSON.parse(readFileSync(statePath, "utf8")) as unknown;
  validateMilestoneDefinitionState(state);
  return state;
}

export function loadMilestonePlanningStateIfPresent(workspaceRoot: string): MilestonePlanningState | undefined { const statePath = resolveInsideWorkspace(workspaceRoot, MILESTONE_PLANNING_STATE_PATH); if (!existsSync(statePath)) return undefined; const state = JSON.parse(readFileSync(statePath, "utf8")) as unknown; validateMilestonePlanningState(state); return state; }

function planningAnchorsMatch(planning: MilestonePlanningState, product: ProductStartState, engineering: EngineeringFoundationState | undefined, roadmap: LivingRoadmapState | undefined, definition: MilestoneDefinitionState | undefined): boolean {
  return Boolean(roadmap && definition) && planning.productRevision === product.revision && planning.engineeringRevision === (engineering?.revision ?? null) && planning.roadmapRevision === roadmap!.revision && planning.definitionStateRevision === definition!.revision;
}

function appendEngineeringChange(state: EngineeringFoundationState): void {
  const withoutHash: Omit<EngineeringChangeRevision, "contentHash"> = {
    version: state.changeHistory.length + 1,
    kind: "material",
    draftVersion: state.draftVersion + 1,
    snapshotHash: engineeringChangeSnapshotHash(state),
    previousHash: state.changeHistoryHead,
  };
  const revision = { ...withoutHash, contentHash: engineeringChangeHash(withoutHash) };
  state.changeHistory.push(revision);
  state.changeHistoryHead = revision.contentHash;
}

function reconcileEngineeringAnchor(product: ProductStartState, engineering: EngineeringFoundationState): void {
  if (product.phase !== "product-foundation-confirmed" || product.revision === engineering.productRevision) return;
  const receipt = product.confirmedHistory.at(-1);
  if (!receipt || receipt.revision !== product.revision) {
    throw new ContractError("Current Product confirmation receipt is missing.");
  }
  engineering.productRevision = product.revision;
  engineering.productConfirmationHash = receipt.contentHash;
  appendEngineeringChange(engineering);
  engineering.draftVersion += 1;
  engineering.reviewedDraftVersion = null;
  engineering.responsibilityConfirmations = [];
  engineering.phase = engineeringPreconfirmationPhase(engineering);
  engineering.session = { status: "active", resumeTopic: firstEngineeringGap(engineering) };
  engineering.nextActions = [engineeringReviewAction(engineering)];
}

export function renderProjectViews(
  product: ProductStartState,
  templateRoot: string,
  engineering?: EngineeringFoundationState,
  livingRoadmap?: LivingRoadmapState,
  milestoneDefinition?: MilestoneDefinitionState,
  changeManagement?: ChangeManagementState,
  milestonePlanning?: MilestonePlanningState,
): ProjectViewSet {
  const productOnly = renderArtifacts(product, templateRoot);
  const engineeringViews = engineering ? renderEngineeringArtifacts(product, engineering, templateRoot) : undefined;
  const combined: RenderedArtifacts = engineeringViews ? {
    "LOOPY.md": engineeringViews["LOOPY.md"],
    "docs/loopy/Project-Definition.md": productOnly["docs/loopy/Project-Definition.md"],
    "docs/loopy/Roadmap.md": engineeringViews["docs/loopy/Roadmap.md"],
  } : productOnly;
  if (livingRoadmap) {
    const committedCandidates = new Set(milestoneDefinition?.definitions.filter((item) => item.phase === "committed").map((item) => item.sourceCandidateId) ?? []);
    const living = renderLivingRoadmapArtifacts(combined, livingRoadmap, committedCandidates);
    combined["LOOPY.md"] = living["LOOPY.md"];
    combined["docs/loopy/Roadmap.md"] = living["docs/loopy/Roadmap.md"];
    if (engineeringViews) {
      engineeringViews["LOOPY.md"] = living["LOOPY.md"];
      engineeringViews["docs/loopy/Roadmap.md"] = living["docs/loopy/Roadmap.md"];
    }
  }
  let milestoneViews: MilestoneDefinitionArtifacts | undefined;
  if (milestoneDefinition) {
    milestoneViews = renderMilestoneDefinitionArtifacts(combined, milestoneDefinition, templateRoot);
    combined["LOOPY.md"] = milestoneViews["LOOPY.md"];
    combined["docs/loopy/Roadmap.md"] = milestoneViews["docs/loopy/Roadmap.md"];
    if (engineeringViews) {
      engineeringViews["LOOPY.md"] = combined["LOOPY.md"];
      engineeringViews["docs/loopy/Roadmap.md"] = combined["docs/loopy/Roadmap.md"];
    }
  }
  let changeViews: ChangeManagementArtifacts | undefined;
  if (changeManagement) {
    const base: Record<string, string> = { ...combined, ...(milestoneViews ?? {}) };
    changeViews = renderChangeManagementArtifacts(base, changeManagement, templateRoot);
    for (const path of Object.keys(combined)) if (changeViews[path]) combined[path as keyof RenderedArtifacts] = changeViews[path];
    if (engineeringViews) for (const path of Object.keys(engineeringViews)) if (changeViews[path]) engineeringViews[path as keyof EngineeringRenderedArtifacts] = changeViews[path];
    if (milestoneViews) for (const path of Object.keys(milestoneViews)) if (changeViews[path]) milestoneViews[path] = changeViews[path];
  }
  let planningViews: MilestonePlanningArtifacts | undefined;
  if (milestonePlanning) {
    if (!milestoneDefinition) throw new ContractError("Milestone Planning requires Milestone Definition state.");
    const base: Record<string, string> = { ...combined, ...(milestoneViews ?? {}), ...(changeViews ?? {}) };
    planningViews = synchronizePlanningLifecycle(renderMilestonePlanningArtifacts(base, milestonePlanning, milestoneDefinition, templateRoot), milestonePlanning, milestoneDefinition);
    combined["LOOPY.md"] = planningViews["LOOPY.md"];
    combined["docs/loopy/Roadmap.md"] = planningViews["docs/loopy/Roadmap.md"];
    if (engineeringViews) { engineeringViews["LOOPY.md"] = combined["LOOPY.md"]; engineeringViews["docs/loopy/Roadmap.md"] = combined["docs/loopy/Roadmap.md"]; }
    if (milestoneViews) { milestoneViews["LOOPY.md"] = combined["LOOPY.md"]; milestoneViews["docs/loopy/Roadmap.md"] = combined["docs/loopy/Roadmap.md"]; }
    if (changeViews) { changeViews["LOOPY.md"] = combined["LOOPY.md"]; changeViews["docs/loopy/Roadmap.md"] = combined["docs/loopy/Roadmap.md"]; }
  }
  combined["docs/loopy/Roadmap.md"] = renderRoadmapDependencyMap(
    combined["docs/loopy/Roadmap.md"], livingRoadmap, milestoneDefinition,
  );
  if (engineeringViews) engineeringViews["docs/loopy/Roadmap.md"] = combined["docs/loopy/Roadmap.md"];
  if (milestoneViews) milestoneViews["docs/loopy/Roadmap.md"] = combined["docs/loopy/Roadmap.md"];
  if (changeViews) changeViews["docs/loopy/Roadmap.md"] = combined["docs/loopy/Roadmap.md"];
  if (planningViews) planningViews["docs/loopy/Roadmap.md"] = combined["docs/loopy/Roadmap.md"];
  if (!engineeringViews) return { product: combined, milestoneDefinition: milestoneViews, changeManagement: changeViews, milestonePlanning: planningViews };
  return {
    product: combined,
    engineering: engineeringViews,
    milestoneDefinition: milestoneViews,
    changeManagement: changeViews,
    milestonePlanning: planningViews,
  };
}

export function writeProjectViews(input: {
  workspaceRoot: string;
  templateRoot: string;
  productContract: ProductStartContract;
  product: ProductStartState;
  engineeringContract?: EngineeringFoundationContract;
  engineering?: EngineeringFoundationState;
  livingRoadmapContract?: LivingRoadmapContract;
  livingRoadmap?: LivingRoadmapState;
  milestoneDefinition?: MilestoneDefinitionState;
  changeManagement?: ChangeManagementState;
  milestonePlanning?: MilestonePlanningState;
  writeHooks?: FileSetWriteHooks;
}): ProjectViewSet {
  const root = canonicalWorkspaceRoot(input.workspaceRoot);
  if (input.product.workspaceRoot !== root) throw new WorkspaceError("Product state does not belong to the target workspace.");
  if (input.engineering && input.engineering.workspaceRoot !== root) {
    throw new WorkspaceError("Engineering state does not belong to the target workspace.");
  }
  if (Boolean(input.engineering) !== Boolean(input.engineeringContract)) {
    throw new ContractError("Engineering state and contract must be supplied together.");
  }
  if (Boolean(input.livingRoadmap) !== Boolean(input.livingRoadmapContract)) {
    throw new ContractError("Living Roadmap state and contract must be supplied together.");
  }
  if (input.engineering) reconcileEngineeringAnchor(input.product, input.engineering);
  if (input.engineering && input.product.phase === "product-foundation-confirmed" &&
      input.engineering.phase === "engineering-foundation-confirmed" &&
      input.engineering.productRevision === input.product.revision) {
    input.engineering.nextActions = [confirmedEngineeringAction(input.engineering, input.product)];
  }
  validateState(input.productContract, input.product);
  if (input.engineering && input.engineeringContract) validateEngineeringState(input.engineeringContract, input.engineering);
  if (input.livingRoadmap && input.livingRoadmapContract) validateLivingRoadmapState(input.livingRoadmapContract, input.livingRoadmap);

  const milestoneDefinition = input.milestoneDefinition ?? loadMilestoneDefinitionStateIfPresent(root);
  const changeManagement = input.changeManagement ?? loadChangeManagementStateIfPresent(root);
  const discoveredPlanning = input.milestonePlanning ?? loadMilestonePlanningStateIfPresent(root);
  if (discoveredPlanning && discoveredPlanning.workspaceRoot !== root) throw new WorkspaceError("Milestone Planning state does not belong to the target workspace.");
  if (milestoneDefinition && milestoneDefinition.workspaceRoot !== root) throw new WorkspaceError("Milestone Definition state does not belong to the target workspace.");
  if (milestoneDefinition && (milestoneDefinition.productRevision !== input.product.revision || (milestoneDefinition.productDraftVersion !== undefined && milestoneDefinition.productDraftVersion !== input.product.draftVersion))) {
    throw new ContractError("Milestone Definitions cannot be rendered against a different Product revision; a material change requires the later Change Management route.");
  }
  if (milestoneDefinition && (!input.livingRoadmap || milestoneDefinition.definitions.some((definition) =>
    !input.livingRoadmap!.candidates.some((candidate) => candidate.id === definition.sourceCandidateId && candidate.state === "Selected for definition")))) {
    throw new ContractError("Milestone Definitions require their preserved Living Roadmap selections.");
  }
  if (milestoneDefinition && milestoneDefinition.engineeringRevision !== null && input.engineering?.revision !== milestoneDefinition.engineeringRevision) {
    throw new ContractError("Milestone Definitions cannot be rendered against a different Engineering revision.");
  }
  if (changeManagement && changeManagement.workspaceRoot !== root) throw new WorkspaceError("Change Management state does not belong to the target workspace.");
  if (input.milestonePlanning && !planningAnchorsMatch(input.milestonePlanning, input.product, input.engineering, input.livingRoadmap, milestoneDefinition)) throw new ContractError("Milestone Planning cannot publish against changed foundation revisions without explicit Host semantic revalidation.");
  const milestonePlanning = discoveredPlanning && planningAnchorsMatch(discoveredPlanning, input.product, input.engineering, input.livingRoadmap, milestoneDefinition) ? discoveredPlanning : undefined;
  const rendered = renderProjectViews(input.product, input.templateRoot, input.engineering, input.livingRoadmap, milestoneDefinition, changeManagement, milestonePlanning);
  for (const [path, content] of Object.entries(rendered.product)) {
    if (!input.productContract.allowed_generated_artifacts.includes(path)) {
      throw new ContractError(`Product contract does not allow ${path}.`);
    }
    input.product.generatedViews[path] = {
      revision: input.product.revision,
      draftVersion: input.product.draftVersion,
      sha256: sha256(content),
    };
  }
  if (input.engineering && input.engineeringContract && rendered.engineering) {
    for (const [path, content] of Object.entries(rendered.engineering)) {
      if (!input.engineeringContract.allowed_generated_artifacts.includes(path)) {
        throw new ContractError(`Engineering contract does not allow ${path}.`);
      }
      input.engineering.generatedViews[path] = {
        revision: input.engineering.revision,
        draftVersion: input.engineering.draftVersion,
        sha256: sha256(content),
      };
    }
  }
  if (input.livingRoadmap && input.livingRoadmapContract) {
    for (const path of input.livingRoadmapContract.generated_artifacts) {
      const content = rendered.product[path];
      input.livingRoadmap.generatedViews[path] = { revision: input.livingRoadmap.revision, sha256: sha256(content) };
    }
  }
  if (milestoneDefinition && rendered.milestoneDefinition) {
    milestoneDefinition.generatedViews = {};
    for (const [path, content] of Object.entries(rendered.milestoneDefinition)) {
      milestoneDefinition.generatedViews[path] = { revision: milestoneDefinition.revision, sha256: sha256(content) };
    }
  }
  if (changeManagement && rendered.changeManagement) {
    changeManagement.generatedViews = {};
    for (const [path, content] of Object.entries(rendered.changeManagement)) changeManagement.generatedViews[path] = { revision: changeManagement.revision, sha256: sha256(content) };
    validateChangeManagementState(changeManagement);
  }
  if (milestonePlanning && rendered.milestonePlanning) { milestonePlanning.generatedViews = {}; for (const [path, content] of Object.entries(rendered.milestonePlanning)) milestonePlanning.generatedViews[path] = { revision: milestonePlanning.revision, sha256: sha256(content) }; validateMilestonePlanningState(milestonePlanning); }
  validateState(input.productContract, input.product);
  if (input.engineering && input.engineeringContract) validateEngineeringState(input.engineeringContract, input.engineering);
  if (input.livingRoadmap && input.livingRoadmapContract) validateLivingRoadmapState(input.livingRoadmapContract, input.livingRoadmap);
  if (milestoneDefinition) validateMilestoneDefinitionState(milestoneDefinition);

  const files = new Map<string, string>(Object.entries(rendered.product));
  if (rendered.engineering) {
    for (const [path, content] of Object.entries(rendered.engineering)) files.set(path, content);
  }
  if (rendered.milestoneDefinition) {
    for (const [path, content] of Object.entries(rendered.milestoneDefinition)) files.set(path, content);
  }
  if (rendered.changeManagement) for (const [path, content] of Object.entries(rendered.changeManagement)) files.set(path, content);
  files.set(PRODUCT_STATE_PATH, `${JSON.stringify(input.product, null, 2)}\n`);
  if (input.engineering) files.set(ENGINEERING_PROJECT_STATE_PATH, `${JSON.stringify(input.engineering, null, 2)}\n`);
  if (input.livingRoadmap) files.set(LIVING_ROADMAP_STATE_PATH, `${JSON.stringify(input.livingRoadmap, null, 2)}\n`);
  if (milestoneDefinition) files.set(MILESTONE_DEFINITION_STATE_PATH, `${JSON.stringify(milestoneDefinition, null, 2)}\n`);
  if (changeManagement) files.set(CHANGE_MANAGEMENT_STATE_PATH, `${JSON.stringify(changeManagement, null, 2)}\n`);
  if (rendered.milestonePlanning) for (const [path, content] of Object.entries(rendered.milestonePlanning)) files.set(path, content);
  if (milestonePlanning) files.set(MILESTONE_PLANNING_STATE_PATH, `${JSON.stringify(milestonePlanning, null, 2)}\n`);
  writeFileSetInsideWorkspace(root, [...files.entries()], input.writeHooks);
  return rendered;
}
