import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { parseCliArguments } from "../src/cli-arguments.js";
import { ProductStartEngine } from "../src/engine.js";
import { LivingRoadmapEngine } from "../src/living-roadmap-engine.js";
import { EngineeringFoundationEngine } from "../src/engineering-engine.js";
import type { RoadmapOperation } from "../src/living-roadmap-types.js";
import type { ProductStartUpdate, RoadmapCandidate } from "../src/types.js";

const sourceRoot = resolve(import.meta.dirname, "../..");
const workspaces: string[] = [];
let productEngine: ProductStartEngine;
let roadmapEngine: LivingRoadmapEngine;
let engineeringEngine: EngineeringFoundationEngine;

beforeAll(async () => {
  productEngine = await ProductStartEngine.create(sourceRoot);
  roadmapEngine = await LivingRoadmapEngine.create(sourceRoot);
  engineeringEngine = await EngineeringFoundationEngine.create(sourceRoot);
});

afterEach(() => {
  for (const path of workspaces.splice(0)) rmSync(path, { recursive: true, force: true });
});

function candidate(title: string, priority: RoadmapCandidate["priority"]): RoadmapCandidate {
  return { title, outcome: `${title} produces an independently understandable customer outcome.`, priority,
    rationale: `${title} matters to the current Product direction.`, dependencies: [], nextAction: `Shape ${title}`,
    commitment: "uncommitted" };
}

function completeUpdate(candidates: RoadmapCandidate[]): ProductStartUpdate {
  return {
    product: { summary: "Harbor improves dependable customer operations.", purpose: "Reduce operational friction.",
      primaryPeople: "Customer operators", need: "Complete important work without support.",
      outcome: "Operators complete work confidently.", inScope: ["Core operator outcomes"],
      nonGoals: ["Implementation workspace policy"], constraints: ["Preserve existing access"],
      successSignals: ["Fewer blocked customer workflows"] },
    roadmap: { summary: candidates.length ? "Outcome-first portfolio." : "No candidates are proposed yet.", lifecycleState: "Product foundation established",
      lifecycleExplanation: "Product direction is ready; no Milestone has been committed.", candidates },
    decisions: { purpose: { status: "established" }, people_and_need: { status: "established" },
      outcome: { status: "established" }, evidence_and_intent: { status: "explicitly_none" },
      boundaries: { status: "established" }, success: { status: "established" },
      roadmap_state: { status: candidates.length ? "established" : "explicitly_none" }, uncertainty: { status: "explicitly_none" } },
    nextActions: [{ participant: "Product", action: "Review the Product foundation", reason: "Coverage is complete." }],
  };
}

async function initialized(titles = ["Customer recovery", "Partner status", "Operational risk"]): Promise<string> {
  return initializedCandidates(titles.map((title, index) => candidate(title, index ? "High" : "Highest")));
}

async function initializedCandidates(candidates: RoadmapCandidate[]): Promise<string> {
  const root = mkdtempSync(join(tmpdir(), "loopy-roadmap-")); workspaces.push(root);
  await productEngine.initialize(root, "Harbor", { participantResponsibilities: ["product"] });
  productEngine.applyUpdate(root, completeUpdate(candidates));
  await productEngine.recordProductReview(root); await productEngine.confirmProduct(root);
  roadmapEngine.initialize(root); return root;
}

function productOperation<T extends Omit<RoadmapOperation, "actor">>(operation: T): RoadmapOperation {
  return { ...operation, actor: { name: "Priya", responsibility: "product" } } as RoadmapOperation;
}

describe("Living Roadmap Management", () => {
  it("imports confirmed candidates and renders readable views without internal identities", async () => {
    const root = await initialized();
    const state = roadmapEngine.loadState(root);
    expect(state.candidates.map((item) => item.id)).toEqual(["candidate-1", "candidate-2", "candidate-3"]);
    const roadmap = readFileSync(join(root, "docs/loopy/Roadmap.md"), "utf8");
    const home = readFileSync(join(root, "LOOPY.md"), "utf8");
    expect(roadmap).toContain("## Living Roadmap");
    expect(roadmap).toContain("Eligible for Milestone Definition");
    expect(roadmap).not.toContain("## Delivery relationships");
    expect(roadmap).not.toContain("candidate-1");
    expect(home.match(/^## Next action$/gm)).toHaveLength(1);
    expect(await roadmapEngine.detectStaleViews(root)).toEqual([]);
  });

  it("preserves identity on rename and creates visible lineage for combine and split", async () => {
    const root = await initialized();
    roadmapEngine.applyOperation(root, productOperation({ type: "rename", candidateId: "candidate-1", title: "Customer self-recovery" }));
    expect(roadmapEngine.loadState(root).candidates[0].id).toBe("candidate-1");
    roadmapEngine.applyOperation(root, productOperation({ type: "combine", candidateIds: ["candidate-1", "candidate-2"],
      candidate: { title: "Customer continuity", outcome: "Customers recover and see consistent status.", priority: "Highest",
        rationale: "The outcomes now form one coherent customer promise.", nextShapingStep: "Clarify the continuity boundary" } }));
    let state = roadmapEngine.loadState(root);
    expect(state.candidates.slice(0, 2).map((item) => item.state)).toEqual(["Superseded", "Superseded"]);
    expect(state.candidates[3].lineage[0].candidateIds).toEqual(["candidate-1", "candidate-2"]);
    roadmapEngine.applyOperation(root, productOperation({ type: "split", candidateId: "candidate-3", candidates: [
      { title: "Risk visibility", outcome: "Operators see current risk.", priority: "High", rationale: "Visibility is independently valuable.", nextShapingStep: "Define useful risk visibility" },
      { title: "Risk response", outcome: "Operators act on current risk.", priority: "High", rationale: "Response is independently valuable.", nextShapingStep: "Define safe response" },
    ] }));
    state = roadmapEngine.loadState(root);
    expect(state.candidates.find((item) => item.id === "candidate-3")?.state).toBe("Superseded");
    expect(new Set(state.candidates.map((item) => item.order)).size).toBe(state.candidates.length);
    const roadmap = readFileSync(join(root, "docs/loopy/Roadmap.md"), "utf8");
    expect(roadmap).toContain("combined from: Customer self-recovery, Partner status");
    expect(roadmap).toContain("split from: Operational risk");
  });

  it("separates Definition eligibility from implementation readiness and preserves recommendation authority", async () => {
    const root = await initialized(["Foundation", "Dependent outcome", "Independent outcome"]);
    roadmapEngine.applyOperation(root, { type: "set-dependencies", candidateId: "candidate-2",
      dependencies: [
        { candidateId: "candidate-1", kind: "required-before", boundary: "implementation",
          note: "The shared interface must land before implementation.", recommendedBy: "Engineering" },
        { external: "Partner research", kind: "helpful-non-blocking", boundary: "definition",
          note: "Fresh research would reduce uncertainty.", recommendedBy: "Engineering" },
      ],
      actor: { name: "Emi", responsibility: "engineering" } });
    let state = roadmapEngine.loadState(root);
    expect(state.candidates[1].priority).toBe("High");
    expect(state.candidates[1].state).toBe("Open");
    expect(readFileSync(join(root, "docs/loopy/Roadmap.md"), "utf8")).toContain("Required before implementation");
    expect(readFileSync(join(root, "docs/loopy/Roadmap.md"), "utf8")).toContain("Helpful, non-blocking: Partner research");
    roadmapEngine.applyOperation(root, { type: "set-dependencies", candidateId: "candidate-3",
      dependencies: [{ candidateId: "candidate-1", kind: "independent-potentially-parallel", boundary: "implementation",
        note: "No ordering dependency is currently known.", recommendedBy: "Engineering" }],
      actor: { name: "Emi", responsibility: "engineering" } });
    const mapView = readFileSync(join(root, "docs/loopy/Roadmap.md"), "utf8");
    expect(mapView).toContain("## Delivery relationships\n\n```text");
    const required = "Foundation\n└─> Dependent outcome (implementation)";
    const independent = "Independent outcome + Foundation (implementation)";
    expect(mapView).toContain("Must happen in order");
    expect(mapView).toContain(required);
    expect(mapView).toContain("Potentially parallel");
    expect(mapView).toContain(independent);
    expect(mapView).not.toContain("Partner research -- helpful");
    expect(mapView.indexOf(required)).toBeLessThan(mapView.indexOf(independent));
    expect(mapView).not.toContain("candidate-1");
    writeFileSync(join(root, "docs/loopy/Roadmap.md"), "stale\n", "utf8");
    expect(await roadmapEngine.detectStaleViews(root)).toContain("docs/loopy/Roadmap.md");
    roadmapEngine.renderCurrent(root);
    expect(readFileSync(join(root, "docs/loopy/Roadmap.md"), "utf8")).toContain(independent);
    state = roadmapEngine.applyOperation(root, productOperation({ type: "select", candidateIds: ["candidate-2", "candidate-3"] }));
    expect(state.selectedBatches[0].candidateIds).toEqual(["candidate-2", "candidate-3"]);
    expect(state.nextActions[0].action).toContain("Begin Milestone Definition");
    expect(existsSync(join(root, "docs/loopy/milestones"))).toBe(false);
  });

  it("rejects multi-selection atomically and leaves state and views unchanged", async () => {
    const root = await initialized(["Foundation", "Dependent outcome"]);
    roadmapEngine.applyOperation(root, productOperation({ type: "set-dependencies", candidateId: "candidate-2",
      dependencies: [{ candidateId: "candidate-1", kind: "required-before", boundary: "definition",
        note: "The foundation outcome must be understood first.", recommendedBy: "Product" }] }));
    const paths = [".loopy/living-roadmap/state.json", "LOOPY.md", "docs/loopy/Roadmap.md"];
    const before = Object.fromEntries(paths.map((path) => [path, readFileSync(join(root, path), "utf8")]));
    expect(() => roadmapEngine.applyOperation(root, productOperation({ type: "select", candidateIds: ["candidate-1", "candidate-2"] })))
      .toThrow("No candidates selected");
    expect(Object.fromEntries(paths.map((path) => [path, readFileSync(join(root, path), "utf8")]))).toEqual(before);
    expect(() => roadmapEngine.applyOperation(root, productOperation({ type: "add", candidate: {
      title: "Workspace-shaped candidate", outcome: "A customer outcome.", priority: "High", rationale: "Customer value.",
      nextShapingStep: "Clarify the outcome", workspace: "/tmp/not-allowed",
    } } as never))).toThrow("operation.candidate contains unknown properties: workspace");
    expect(Object.fromEntries(paths.map((path) => [path, readFileSync(join(root, path), "utf8")]))).toEqual(before);
  });

  it("enforces responsibility boundaries without treating participation as authority", async () => {
    const root = await initialized();
    roadmapEngine.applyOperation(root, { type: "record-participation", candidateId: "candidate-1",
      participants: [{ name: "Sam", responsibility: "Demo or quality" }], actor: { name: "Sam", responsibility: "engineering" } });
    expect(() => roadmapEngine.applyOperation(root, { type: "prioritize", candidateId: "candidate-1", priority: "Later", order: 0,
      actor: { name: "Sam", responsibility: "engineering" } })).toThrow("requires Product or Loopy");
    expect(roadmapEngine.loadState(root).candidates[0].priority).toBe("Highest");
    expect(readFileSync(join(root, "docs/loopy/Roadmap.md"), "utf8")).toContain("Sam (Demo or quality)");
    expect(() => roadmapEngine.applyOperation(root, { type: "rename", candidateId: "candidate-1", title: "Loopy rename",
      actor: { name: "Loopy", responsibility: "loopy" } })).toThrow("requires a recorded basis in explicit Product intent");
    roadmapEngine.applyOperation(root, { type: "rename", candidateId: "candidate-1", title: "Guided customer recovery",
      actor: { name: "Loopy", responsibility: "loopy", intentBasis: "Product asked to use this clearer outcome name." } });
    expect(roadmapEngine.loadState(root).candidates[0].title).toBe("Guided customer recovery");
  });

  it("prevents legacy candidate writes after Living Roadmap becomes canonical", async () => {
    const root = await initialized();
    const before = readFileSync(join(root, ".loopy/start-or-adopt/state.json"), "utf8");
    expect(() => productEngine.applyUpdate(root, { roadmap: { candidates: [candidate("Legacy rewrite", "Highest")] } }))
      .toThrow("Use Living Roadmap operations");
    expect(readFileSync(join(root, ".loopy/start-or-adopt/state.json"), "utf8")).toBe(before);
  });

  it("reconciles to a newer current Product draft without pretending it is confirmed", async () => {
    const root = await initialized();
    const candidateSnapshot = roadmapEngine.loadState(root).candidates;
    productEngine.applyUpdate(root, { product: { outcome: "Operators and partners complete work confidently." },
      nextActions: [{ participant: "Product", action: "Review the changed Product outcome", reason: "Confirmed Product meaning changed." }] });
    const reconciled = roadmapEngine.applyOperation(root, productOperation({ type: "reconcile-product" }));
    expect(reconciled.productRevision).toBe(1);
    expect(reconciled.productDraftVersion).toBe(productEngine.loadState(root).draftVersion);
    expect(reconciled.candidates).toEqual(candidateSnapshot);
    expect(reconciled.history.at(-1)?.operation).toBe("reconcile-product");
    expect(readFileSync(join(root, "docs/loopy/Roadmap.md"), "utf8")).toContain("## Living Roadmap");
    expect(productEngine.loadState(root).phase).toBe("ready-for-product-confirmation");
  });

  it("preserves pause, resume, history integrity, stale detection, and shared rendering", async () => {
    const root = await initialized();
    roadmapEngine.interrupt(root, "finish classifying the recovery dependency");
    expect(roadmapEngine.loadState(root).session.status).toBe("interrupted");
    await roadmapEngine.resume(root);
    const state = roadmapEngine.loadState(root);
    expect(state.history.map((item) => item.operation)).toEqual(["interrupt", "resume"]);
    expect(state.history[1].previousHash).toBe(state.history[0].contentHash);
    writeFileSync(join(root, "LOOPY.md"), "stale\n", "utf8");
    expect(await roadmapEngine.detectStaleViews(root)).toEqual(["LOOPY.md"]);
    roadmapEngine.renderCurrent(root);
    expect(await roadmapEngine.detectStaleViews(root)).toEqual([]);
    productEngine.renderCurrent(root);
    expect(readFileSync(join(root, "LOOPY.md"), "utf8")).toContain("## Living Roadmap");
    const statePath = join(root, ".loopy/living-roadmap/state.json");
    const tampered = JSON.parse(readFileSync(statePath, "utf8"));
    tampered.history[0].summary = "Rewritten pause history";
    writeFileSync(statePath, `${JSON.stringify(tampered)}\n`, "utf8");
    expect(() => roadmapEngine.loadState(root)).toThrow("Living Roadmap history integrity failed");
  });

  it("keeps the accepted Engineering overlay and Living Roadmap synchronized", async () => {
    const root = await initialized();
    engineeringEngine.initialize(root, { participantResponsibilities: ["engineering"] });
    expect(existsSync(join(root, "docs/loopy/Engineering-Guide.md"))).toBe(true);
    expect(readFileSync(join(root, "docs/loopy/Roadmap.md"), "utf8")).toContain("## Living Roadmap");
    engineeringEngine.renderCurrent(root);
    expect(readFileSync(join(root, "LOOPY.md"), "utf8").match(/^## Next action$/gm)).toHaveLength(1);
    expect(await roadmapEngine.detectStaleViews(root)).toEqual([]);
  });

  it("exposes only internal one-skill routing and bounded CLI operations", () => {
    expect(parseCliArguments(["roadmap-init", "--workspace", "/tmp/project"]).command).toBe("roadmap-init");
    expect(() => parseCliArguments(["roadmap-interrupt", "--workspace", "/tmp/project"]))
      .toThrow("Missing required option: --resume-action");
    const skill = readFileSync(join(sourceRoot, "skills/loopy/SKILL.md"), "utf8");
    const reference = readFileSync(join(sourceRoot, "skills/loopy/references/interviews/Living-Roadmap.md"), "utf8");
    expect(skill).toContain("references/interviews/Living-Roadmap.md");
    expect(reference).toContain("Never expose this route as a separate skill or command");
    expect(reference).toContain("Selection is atomic");
    expect(reference).toContain("creates no folder, Definition, commitment, Plan, workspace, worktree, or implementation authority");
  });

  it("rejects an imported unresolved dependency before meaningful Definition without mutation", async () => {
    const unresolved = candidate("Safe account recovery", "Highest");
    unresolved.dependencies = ["Product must choose the supported recovery action before this outcome can be meaningfully defined."];
    const root = await initializedCandidates([unresolved]);
    const paths = [".loopy/living-roadmap/state.json", "LOOPY.md", "docs/loopy/Roadmap.md"];
    const before = Object.fromEntries(paths.map((path) => [path, readFileSync(join(root, path), "utf8")]));
    expect(() => roadmapEngine.applyOperation(root, productOperation({ type: "select", candidateIds: ["candidate-1"] })))
      .toThrow("unresolved dependency that must be classified");
    expect(Object.fromEntries(paths.map((path) => [path, readFileSync(join(root, path), "utf8")]))).toEqual(before);
  });

  it("shows Definition and implementation blockers truthfully in both human views", async () => {
    const root = await initialized(["Customer recovery", "Partner status", "Risk visibility"]);
    roadmapEngine.applyOperation(root, productOperation({ type: "set-dependencies", candidateId: "candidate-1", dependencies: [{
      candidateId: "candidate-2", kind: "required-before", boundary: "definition",
      note: "Status meaning must be understood first.", recommendedBy: "Product",
    }] }));
    roadmapEngine.applyOperation(root, { type: "set-blockers", candidateId: "candidate-2", blockers: [{
      reason: "Partner sandbox access is not yet available for implementation.", responsibility: "Engineering", blocksDefinition: false,
    }], actor: { name: "Emi", responsibility: "engineering" } });
    const roadmap = readFileSync(join(root, "docs/loopy/Roadmap.md"), "utf8");
    const home = readFileSync(join(root, "LOOPY.md"), "utf8");
    expect(roadmap).toContain("| Blockers |");
    expect(roadmap).toContain("Definition eligibility — Partner status is required before Definition");
    expect(roadmap).toContain("Implementation readiness — Engineering: Partner sandbox access");
    expect(home).not.toContain("No current blockers.");
    expect(home).toContain("**Customer recovery:** Definition eligibility");
    expect(home).toContain("**Partner status:** Implementation readiness");
    expect(home.indexOf("**Customer recovery:**")).toBeLessThan(home.indexOf("**Partner status:**"));
    roadmapEngine.applyOperation(root, productOperation({ type: "select", candidateIds: ["candidate-2", "candidate-3"] }));
    const selectedHome = readFileSync(join(root, "LOOPY.md"), "utf8");
    expect(selectedHome).not.toContain("No current blockers.");
    expect(selectedHome).toContain("**Customer recovery:** Definition eligibility");
    expect(selectedHome).toContain("**Partner status:** Implementation readiness");
  });

  it("requires explicit stale-view repair before resume and preserves state on rejection", async () => {
    const root = await initialized([]);
    roadmapEngine.interrupt(root, "finish adding the first outcome candidate");
    writeFileSync(join(root, "LOOPY.md"), "stale\n", "utf8");
    const beforeState = readFileSync(join(root, ".loopy/living-roadmap/state.json"), "utf8");
    await expect(roadmapEngine.resume(root)).rejects.toThrow("explicitly repair them with roadmap-render");
    expect(readFileSync(join(root, ".loopy/living-roadmap/state.json"), "utf8")).toBe(beforeState);
    expect(readFileSync(join(root, "LOOPY.md"), "utf8")).toBe("stale\n");
    roadmapEngine.renderCurrent(root);
    expect((await roadmapEngine.resume(root)).session.status).toBe("active");
  });

  it("moves a reprioritized candidate to a unique deterministic first position", async () => {
    const root = await initialized(["Self-serve account recovery", "Service status clarity"]);
    const state = roadmapEngine.applyOperation(root, productOperation({
      type: "prioritize", candidateId: "candidate-2", priority: "Highest", order: 0,
    }));
    const ordered = [...state.candidates].sort((left, right) => left.order - right.order);
    expect(ordered.map((item) => item.title)).toEqual(["Service status clarity", "Self-serve account recovery"]);
    expect(new Set(state.candidates.map((item) => item.order)).size).toBe(state.candidates.length);
    const roadmap = readFileSync(join(root, "docs/loopy/Roadmap.md"), "utf8");
    expect(roadmap.indexOf("Service status clarity")).toBeLessThan(roadmap.indexOf("Self-serve account recovery"));
  });

  it("records direct supersede lineage in both directions", async () => {
    const root = await initialized(["Partner status", "Legacy partner feed"]);
    const state = roadmapEngine.applyOperation(root, productOperation({
      type: "supersede", candidateId: "candidate-2", replacementCandidateId: "candidate-1",
      reason: "Stable partner status replaces a second feed.",
    }));
    expect(state.candidates[1].lineage).toContainEqual({ relation: "supersedes", candidateIds: ["candidate-1"] });
    expect(state.candidates[0].lineage).toContainEqual({ relation: "superseded-from", candidateIds: ["candidate-2"] });
    expect(readFileSync(join(root, "docs/loopy/Roadmap.md"), "utf8")).toContain("superseded from: Legacy partner feed");
  });

  it("regenerates the Roadmap summary from current candidate state", async () => {
    const root = await initialized([]);
    for (const [title, priority] of [["Account recovery", "Highest"], ["Service status", "High"], ["Onboarding", "Medium"], ["Preferences", "Later"]] as const) {
      roadmapEngine.applyOperation(root, productOperation({ type: "add", candidate: {
        title, outcome: `${title} produces a customer outcome.`, priority,
        rationale: `${title} addresses a Product need.`, nextShapingStep: `Clarify ${title}`,
      } }));
    }
    roadmapEngine.applyOperation(root, productOperation({ type: "rename", candidateId: "candidate-1", title: "Self-serve account recovery" }));
    roadmapEngine.applyOperation(root, productOperation({ type: "prioritize", candidateId: "candidate-2", priority: "Highest", order: 0 }));
    roadmapEngine.applyOperation(root, productOperation({ type: "defer", candidateId: "candidate-3", reason: "Recovery is more urgent.", reconsiderWhen: "Recovery is stable." }));
    roadmapEngine.applyOperation(root, productOperation({ type: "cancel", candidateId: "candidate-4", reason: "Product no longer wants this outcome." }));
    const roadmap = readFileSync(join(root, "docs/loopy/Roadmap.md"), "utf8");
    expect(roadmap).toContain("The portfolio has 2 open candidates, 0 selected for Definition, and 2 deferred or ended.");
    expect(roadmap).not.toContain("No candidates are proposed yet.");
  });
});
