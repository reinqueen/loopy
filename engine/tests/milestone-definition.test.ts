import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { parseCliArguments } from "../src/cli-arguments.js";
import { EngineeringFoundationEngine } from "../src/engineering-engine.js";
import type { EngineeringFoundationUpdate } from "../src/engineering-types.js";
import { ProductStartEngine } from "../src/engine.js";
import { LivingRoadmapEngine } from "../src/living-roadmap-engine.js";
import { MilestoneDefinitionEngine } from "../src/milestone-definition-engine.js";
import type { DefinitionPerspective, DefinitionUpdate } from "../src/milestone-definition-types.js";
import type { RoadmapOperation } from "../src/living-roadmap-types.js";
import type { ProductStartUpdate } from "../src/types.js";

const sourceRoot = resolve(import.meta.dirname, "../..");
const fixture = join(sourceRoot, "evaluation/scenarios/product-start/large-mixed-project/fixture");
const productSetup = join(sourceRoot, "evaluation/scenarios/product-start/large-mixed-project/setup/v1/product-update.json");
const workspaces: string[] = [];
let productEngine: ProductStartEngine;
let engineeringEngine: EngineeringFoundationEngine;
let roadmapEngine: LivingRoadmapEngine;
let definitionEngine: MilestoneDefinitionEngine;

beforeAll(async () => {
  productEngine = await ProductStartEngine.create(sourceRoot);
  engineeringEngine = await EngineeringFoundationEngine.create(sourceRoot);
  roadmapEngine = await LivingRoadmapEngine.create(sourceRoot);
  definitionEngine = await MilestoneDefinitionEngine.create(sourceRoot);
});
afterEach(() => { for (const workspaceRoot of workspaces.splice(0)) rmSync(workspaceRoot, { recursive: true, force: true }); });

function engineeringUpdates(): EngineeringFoundationUpdate[] {
  const reference = readFileSync(join(sourceRoot, "skills/loopy/references/engine/Engineering-Foundation-Apply.md"), "utf8");
  return [...reference.matchAll(/<!-- engineering-apply-example -->\n```json\n([\s\S]*?)\n```/g)].map((match) => JSON.parse(match[1]) as EngineeringFoundationUpdate);
}
async function selected(candidateIds = ["candidate-1", "candidate-2"], duplicateTitle = false): Promise<string> {
  const root = mkdtempSync(join(tmpdir(), "loopy-definition-")); workspaces.push(root); cpSync(fixture, root, { recursive: true });
  await productEngine.initialize(root, "Harbor", { participantResponsibilities: ["product"] });
  productEngine.applyUpdate(root, JSON.parse(readFileSync(productSetup, "utf8")) as ProductStartUpdate);
  await productEngine.recordProductReview(root); await productEngine.confirmProduct(root);
  engineeringEngine.initialize(root, { participantResponsibilities: ["engineering"] });
  for (const update of engineeringUpdates()) engineeringEngine.applyUpdate(root, update);
  engineeringEngine.recordReview(root); engineeringEngine.confirm(root);
  roadmapEngine.initialize(root);
  for (const candidateId of ["candidate-1", "candidate-2", "candidate-3"]) {
    roadmapEngine.applyOperation(root, { type: "set-dependencies", candidateId, dependencies: [], actor: { name: "Priya", responsibility: "product" } });
  }
  if (duplicateTitle) roadmapEngine.applyOperation(root, { type: "rename", candidateId: "candidate-2", title: "Customer recovery", actor: { name: "Priya", responsibility: "product" } });
  if (candidateIds.length) roadmapEngine.applyOperation(root, { type: "select", candidateIds, actor: { name: "Priya", responsibility: "product" } } as RoadmapOperation);
  return root;
}
function complete(definitionId: string, requiredPerspectives: DefinitionPerspective[] = ["product"]): DefinitionUpdate {
  return {
    type: "update", definitionId, actor: { name: "Loopy", perspectives: requiredPerspectives },
    content: {
      outcome: "Operators recover a customer account without support intervention.",
      requirements: ["An authorized operator can start and complete account recovery."],
      inScope: ["Operator-led account recovery"], nonGoals: ["Automated fraud adjudication"],
      acceptance: ["Given an eligible locked account, an authorized operator restores access and the customer can sign in; an ineligible account is rejected with a reason."],
      dependencies: [{ name: "Identity service", kind: "required-before", consequence: "implementation", note: "Its interface is required before implementation, not before Definition commitment." }],
      feasibilityAndConstraints: ["Preserve the confirmed access model"], risks: ["Recovery may expose sensitive account state"],
      assumptions: ["The existing identity service remains authoritative"], unknowns: [{ description: "Final operational runbook owner", blocking: false, revisitWhen: "Milestone Planning" }],
    },
    coherence: { status: "coherent", basis: "The Host assessed the outcome, boundary, consequences, and observable acceptance as mutually consistent." },
    requiredPerspectives,
  };
}
function tracked(root: string): Record<string, string> {
  const state = definitionEngine.loadState(root);
  const paths = [".loopy/milestone-definition/state.json", "LOOPY.md", "docs/loopy/Roadmap.md", ...state.definitions.map((item) => item.artifactPath)];
  return Object.fromEntries(paths.map((artifactPath) => [artifactPath, readFileSync(join(root, artifactPath), "utf8")]));
}

describe("Milestone Definition", () => {
  it("requires the atomic Living Roadmap handoff and creates nothing after failed or absent selection", async () => {
    const root = await selected([]);
    expect(() => definitionEngine.initialize(root)).toThrow("No candidate is selected");
    expect(existsSync(join(root, ".loopy/milestone-definition"))).toBe(false);
    expect(existsSync(join(root, "docs/loopy/milestones"))).toBe(false);
  });

  it("creates one collision-safe readable Definition per selected candidate without internal IDs in human views", async () => {
    const root = await selected(["candidate-1", "candidate-2", "candidate-3"], true);
    mkdirSync(join(root, "docs/loopy/milestones/customer-recovery"), { recursive: true });
    writeFileSync(join(root, "docs/loopy/milestones/customer-recovery/Definition.md"), "Existing human file.\n", "utf8");
    const state = definitionEngine.initialize(root);
    expect(state.definitions.map((item) => item.artifactPath)).toEqual([
      "docs/loopy/milestones/customer-recovery-2/Definition.md",
      "docs/loopy/milestones/customer-recovery-3/Definition.md",
      "docs/loopy/milestones/operational-risk/Definition.md",
    ]);
    for (const definition of state.definitions) expect(existsSync(join(root, definition.artifactPath))).toBe(true);
    expect(readFileSync(join(root, state.definitions[0].artifactPath), "utf8")).not.toContain("definition-1");
    expect(readFileSync(join(root, "LOOPY.md"), "utf8").match(/^## Next action$/gm)).toHaveLength(1);
  });

  it("does not infer semantic completeness from populated fields", async () => {
    const root = await selected(["candidate-1"]); const state = definitionEngine.initialize(root); const id = state.definitions[0].id;
    const update = complete(id); update.coherence = { status: "draft", basis: "" };
    definitionEngine.applyUpdate(root, update);
    expect(() => definitionEngine.review(root, [id])).toThrow("Host-AI coherence assessment");
    const reviewReady = definitionEngine.applyUpdate(root, { type: "update", definitionId: id, actor: { name: "Loopy", perspectives: ["product"] }, coherence: complete(id).coherence });
    expect(reviewReady.generatedViews[reviewReady.definitions[0].artifactPath].revision).toBe(reviewReady.revision);
    expect(await definitionEngine.detectStaleViews(root)).toEqual([]);
    const reviewed = definitionEngine.review(root, [id]);
    expect(reviewed.definitions[0].reviewedRevision).toBe(2);
    expect(readFileSync(join(root, reviewed.definitions[0].artifactPath), "utf8")).toContain("**Current review:** Recorded");
    const roadmapView = readFileSync(join(root, "docs/loopy/Roadmap.md"), "utf8");
    expect(roadmapView).toContain("Identity service\n└─> Customer recovery (implementation)");
    expect(roadmapView).not.toContain("definition-1");
  });

  it("persists ordinary interview updates privately until an explicit render or status boundary", async () => {
    const root = await selected(["candidate-1"]); let state = definitionEngine.initialize(root); const definition = state.definitions[0];
    const initialDefinition = readFileSync(join(root, definition.artifactPath), "utf8");
    const initialHome = readFileSync(join(root, "LOOPY.md"), "utf8");
    const initialRoadmap = readFileSync(join(root, "docs/loopy/Roadmap.md"), "utf8");
    expect(initialDefinition).toContain("Milestone Definition state revision 0");

    state = definitionEngine.applyUpdate(root, { type: "update", definitionId: definition.id, actor: { name: "Priya", perspectives: ["product"] },
      content: { requirements: ["An authorized operator can start account recovery."] } });
    state = definitionEngine.applyUpdate(root, { type: "update", definitionId: definition.id, actor: { name: "Priya", perspectives: ["product"] },
      content: { inScope: ["Operator-led recovery"] } });
    expect(state.revision).toBe(2);
    expect(state.definitions[0].content.inScope).toEqual(["Operator-led recovery"]);
    expect(state.definitions[0].history.filter((item) => item.operation === "update")).toHaveLength(2);
    expect(state.generatedViews[definition.artifactPath].revision).toBe(0);
    expect(readFileSync(join(root, definition.artifactPath), "utf8")).toBe(initialDefinition);
    expect(readFileSync(join(root, "LOOPY.md"), "utf8")).toBe(initialHome);
    expect(readFileSync(join(root, "docs/loopy/Roadmap.md"), "utf8")).toBe(initialRoadmap);
    expect(await definitionEngine.detectStaleViews(root)).toEqual(expect.arrayContaining(["LOOPY.md", "docs/loopy/Roadmap.md", definition.artifactPath]));

    definitionEngine.renderCurrent(root);
    expect(readFileSync(join(root, definition.artifactPath), "utf8")).toContain("Operator-led recovery");
    expect(readFileSync(join(root, definition.artifactPath), "utf8")).toContain("Milestone Definition state revision 2");
    expect(readFileSync(join(root, "LOOPY.md"), "utf8")).toContain("Published from Milestone Definition state revision 2");
    expect(readFileSync(join(root, "docs/loopy/Roadmap.md"), "utf8")).toContain("Published from Milestone Definition state revision 2");
    expect(await definitionEngine.detectStaleViews(root)).toEqual([]);

    definitionEngine.applyUpdate(root, { type: "update", definitionId: definition.id, actor: { name: "Priya", perspectives: ["product"] },
      content: { nonGoals: ["Automated adjudication"] } });
    expect(await definitionEngine.detectStaleViews(root)).not.toEqual([]);
    definitionEngine.status(root);
    expect(readFileSync(join(root, definition.artifactPath), "utf8")).toContain("Automated adjudication");
    expect(await definitionEngine.detectStaleViews(root)).toEqual([]);
  });

  it("supports Product-only, Engineering-only, and mixed responsibility sets on the same revision", async () => {
    const root = await selected(["candidate-1", "candidate-2", "candidate-3"]); let state = definitionEngine.initialize(root);
    const [productOnly, engineeringOnly, mixed] = state.definitions.map((item) => item.id);
    definitionEngine.applyUpdate(root, complete(productOnly, ["product"]));
    definitionEngine.applyUpdate(root, complete(engineeringOnly, ["engineering"]));
    definitionEngine.applyUpdate(root, complete(mixed, ["product", "engineering"]));
    definitionEngine.review(root, [productOnly, engineeringOnly, mixed]);
    definitionEngine.confirm(root, [{ definitionId: mixed, participant: "Emi", perspectives: ["engineering"], commit: false }]);
    const result = definitionEngine.confirm(root, [
      { definitionId: productOnly, participant: "Priya", perspectives: ["product"], commit: true },
      { definitionId: engineeringOnly, participant: "Emi", perspectives: ["engineering"], commit: true },
      { definitionId: mixed, participant: "Priya", perspectives: ["product"], commit: true },
    ]);
    expect(result.committed).toEqual([productOnly, engineeringOnly, mixed]);
    state = result.state;
    expect(state.definitions.every((item) => item.phase === "committed")).toBe(true);
    expect(state.definitions.every((item) => item.history.at(-1)?.operation === "commit")).toBe(true);
    const roadmap = readFileSync(join(root, "docs/loopy/Roadmap.md"), "utf8");
    const home = readFileSync(join(root, "LOOPY.md"), "utf8");
    expect(roadmap).toContain("3 Milestones have committed Definitions and are Planned.");
    expect(roadmap).not.toContain("no Milestone has been committed");
    for (const definition of state.definitions) {
      expect(roadmap).toContain(`Roadmap candidate: ${definition.sourceCandidateTitle}`);
      expect(home).toContain(`[${definition.sourceCandidateTitle}](${definition.artifactPath})`);
      expect(readFileSync(join(root, definition.artifactPath), "utf8")).toContain("**Status:** Committed — Planned Milestone");
    }
  });

  it("commits ready named Definitions independently and does not mutate an unready named Definition", async () => {
    const root = await selected(["candidate-1", "candidate-2"]); const initialized = definitionEngine.initialize(root);
    const [ready, unready] = initialized.definitions.map((item) => item.id);
    definitionEngine.applyUpdate(root, complete(ready)); definitionEngine.review(root, [ready]);
    definitionEngine.applyUpdate(root, { type: "update", definitionId: unready, actor: { name: "Priya", perspectives: ["product"] }, requiredPerspectives: ["product"] });
    const beforeUnready = definitionEngine.loadState(root).definitions.find((item) => item.id === unready);
    const result = definitionEngine.confirm(root, [
      { definitionId: ready, participant: "Priya", perspectives: ["product"], commit: true },
      { definitionId: unready, participant: "Priya", perspectives: ["product"], commit: true },
    ]);
    expect(result.committed).toEqual([ready]);
    expect(result.notCommitted[0].reason).toContain("Missing requirements");
    expect(result.state.definitions.find((item) => item.id === unready)).toEqual(beforeUnready);
    expect(readFileSync(join(root, "docs/loopy/Roadmap.md"), "utf8")).toContain("Planned Milestones");
  });

  it("separates Definition and implementation dependencies and blocks specialist input only when declared blocking", async () => {
    const root = await selected(["candidate-1"]); const id = definitionEngine.initialize(root).definitions[0].id;
    const update = complete(id, ["engineering", "architecture"]);
    update.specialistInputs = [{ perspective: "architecture", reason: "A durable trust boundary must be decided.", mode: "blocking", status: "needed" },
      { perspective: "release", reason: "Distribution constraints should be checked before release.", mode: "just-in-time", status: "needed" }];
    let state = definitionEngine.applyUpdate(root, update);
    expect(state.definitions[0].phase).toBe("blocked");
    expect(state.definitions[0].content.dependencies[0].consequence).toBe("implementation");
    expect(state.definitions[0].content.dependencies[0].kind).toBe("required-before");
    expect(readFileSync(join(root, "LOOPY.md"), "utf8")).not.toContain("No current blockers.");
    expect(readFileSync(join(root, "LOOPY.md"), "utf8")).toContain("architecture input is required");
    definitionEngine.applyUpdate(root, { type: "update", definitionId: id, actor: { name: "Ari", perspectives: ["architecture"] },
      specialistInputs: [{ perspective: "architecture", reason: "The trust boundary is bounded.", mode: "blocking", status: "satisfied" },
        { perspective: "release", reason: "Distribution constraints should be checked before release.", mode: "just-in-time", status: "needed" }] });
    state = definitionEngine.loadState(root);
    expect(state.definitions[0].phase).toBe("draft");
    expect(readFileSync(join(root, state.definitions[0].artifactPath), "utf8")).toContain("Route just in time");
  });

  it("protects the authoritative committed boundary and creates no later-stage artifacts", async () => {
    const root = await selected(["candidate-1"]); const id = definitionEngine.initialize(root).definitions[0].id;
    definitionEngine.applyUpdate(root, complete(id)); definitionEngine.review(root, [id]);
    definitionEngine.confirm(root, [{ definitionId: id, participant: "Priya", perspectives: ["product"], commit: true }]);
    const before = tracked(root);
    expect(() => definitionEngine.applyUpdate(root, complete(id))).toThrow("cannot be silently changed");
    expect(tracked(root)).toEqual(before);
    expect(readFileSync(join(root, definitionEngine.loadState(root).definitions[0].artifactPath), "utf8")).toContain("authoritative delivery boundary");
    const roadmap = readFileSync(join(root, "docs/loopy/Roadmap.md"), "utf8");
    const home = readFileSync(join(root, "LOOPY.md"), "utf8");
    const definition = readFileSync(join(root, definitionEngine.loadState(root).definitions[0].artifactPath), "utf8");
    expect(roadmap).toContain("Roadmap candidate: Customer recovery");
    expect(roadmap).toContain("One Milestone has a committed Definition and is Planned.");
    expect(roadmap).not.toContain("no Milestone has been committed");
    expect(roadmap).not.toContain("No Milestones have been committed.");
    expect(home).toContain("**Planned:** [Customer recovery](docs/loopy/milestones/customer-recovery/Definition.md)");
    expect(definition).toContain("**Status:** Committed — Planned Milestone");
    expect(definition).toContain("authoritative delivery boundary");
    for (const forbidden of ["Plan.md", "Proof.md", "Demo.md", "Release.md"]) expect(existsSync(join(root, "docs/loopy/milestones/customer-recovery", forbidden))).toBe(false);
  });

  it("requires explicit stale-view repair before resume and preserves hash-linked history", async () => {
    const root = await selected(["candidate-1"]); const id = definitionEngine.initialize(root).definitions[0].id;
    const updated = definitionEngine.applyUpdate(root, { type: "update", definitionId: id, actor: { name: "Priya", perspectives: ["product"] },
      content: { requirements: ["Preserve the participant's recovery choice."] } });
    expect(updated.generatedViews[updated.definitions[0].artifactPath].revision).toBeLessThan(updated.revision);
    expect(await definitionEngine.detectStaleViews(root)).not.toEqual([]);
    definitionEngine.interrupt(root, "resolve the acceptance example");
    expect(readFileSync(join(root, definitionEngine.loadState(root).definitions[0].artifactPath), "utf8")).toContain("Preserve the participant's recovery choice.");
    expect(await definitionEngine.detectStaleViews(root)).toEqual([]);
    writeFileSync(join(root, "LOOPY.md"), "stale\n", "utf8");
    const before = readFileSync(join(root, ".loopy/milestone-definition/state.json"), "utf8");
    await expect(definitionEngine.resume(root)).rejects.toThrow("explicitly repair");
    expect(readFileSync(join(root, ".loopy/milestone-definition/state.json"), "utf8")).toBe(before);
    definitionEngine.renderCurrent(root); await definitionEngine.resume(root);
    const definition = definitionEngine.loadState(root).definitions[0];
    expect(definition.history.slice(-2).map((item) => item.operation)).toEqual(["interrupt", "resume"]);
    expect(definition.history.at(-1)?.previousHash).toBe(definition.history.at(-2)?.contentHash);
  });

  it("rolls back the complete file set when a generated Definition cannot commit", async () => {
    const root = await selected(["candidate-1"]); const id = definitionEngine.initialize(root).definitions[0].id; const before = tracked(root);
    const failing = await MilestoneDefinitionEngine.create(sourceRoot, { beforeCommit: (artifactPath) => { if (artifactPath.endsWith("Definition.md")) throw new Error("injected write failure"); } });
    expect(() => failing.applyUpdate(root, complete(id))).toThrow("injected write failure");
    expect(tracked(root)).toEqual(before);
  });

  it("rejects an invalid Definition dependency kind without mutation", async () => {
    const root = await selected(["candidate-1"]); const id = definitionEngine.initialize(root).definitions[0].id;
    const before = tracked(root); const update = complete(id);
    update.content!.dependencies[0].kind = "synthesized-required" as never;
    expect(() => definitionEngine.applyUpdate(root, update)).toThrow("dependencies[0].kind");
    expect(tracked(root)).toEqual(before);
  });

  it("keeps earlier renderers synchronized and exposes only bounded internal CLI routes", async () => {
    const root = await selected(["candidate-1"]); definitionEngine.initialize(root);
    await productEngine.renderCurrent(root); engineeringEngine.renderCurrent(root); roadmapEngine.renderCurrent(root);
    expect(await definitionEngine.detectStaleViews(root)).toEqual([]);
    expect(parseCliArguments(["definition-init", "--workspace", "/tmp/project"]).command).toBe("definition-init");
    expect(() => parseCliArguments(["definition-confirm", "--workspace", "/tmp/project"])).toThrow("Missing required option: --input");
    const skill = readFileSync(join(sourceRoot, "skills/loopy/SKILL.md"), "utf8"); const reference = readFileSync(join(sourceRoot, "skills/loopy/references/interviews/Milestone-Definition.md"), "utf8");
    expect(skill).toContain("references/interviews/Milestone-Definition.md");
    expect(reference).toContain("Never expose this route as a separate skill or command");
    expect(reference).toContain("Filled fields never allow the Engine to infer semantic completeness");
    expect(reference).toContain("technical Definition requires Product");
    expect(reference).toContain("ordinary `definition-apply` may advance canonical state without publishing Markdown");
    expect(reference).toContain("when the Definition reaches review readiness, when the Human asks to see it, when work is paused or blocked");
    expect(reference).toContain("Published views identify the exact state revision they represent");
    expect(reference).toContain("Final commitment and status responses provide the relevant Definition references");
    expect(reference).toContain("otherwise provide clear, exact paths");
    expect(reference).not.toContain("After success, show the relevant `Definition.md` links");
    expect(definitionEngine.contract.ordinary_updates_may_defer_publication).toBe(true);
    expect(definitionEngine.contract.published_revision_metadata_required).toBe(true);
    expect(definitionEngine.contract.inherited_dependency_kinds_preserved).toBe(true);
  });
});
