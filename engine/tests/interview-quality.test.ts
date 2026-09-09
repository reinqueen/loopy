import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { EngineeringFoundationEngine } from "../src/engineering-engine.js";
import { ProductStartEngine } from "../src/engine.js";
import type { ProductStartUpdate } from "../src/types.js";

const sourceRoot = resolve(import.meta.dirname, "../..");
const workspaces: string[] = [];
let productEngine: ProductStartEngine;
let engineeringEngine: EngineeringFoundationEngine;

beforeAll(async () => {
  productEngine = await ProductStartEngine.create(sourceRoot);
  engineeringEngine = await EngineeringFoundationEngine.create(sourceRoot);
});

afterEach(() => {
  for (const path of workspaces.splice(0)) rmSync(path, { recursive: true, force: true });
});

function workspace(): string {
  const path = mkdtempSync(join(tmpdir(), "loopy-interview-quality-"));
  workspaces.push(path);
  return path;
}

function ambiguousTransformationUpdate(): ProductStartUpdate {
  return {
    product: {
      summary: "Product wants to reorganize records; whether this is one operation or a reusable product is unresolved.",
      purpose: "Help people reason about reorganizing important records.",
      primaryPeople: "People responsible for reorganization decisions",
      need: "Understand ordering and consequences.",
      outcome: "Reorganization decisions are understandable and explainable.",
      inScope: ["Planning reorganization decisions"],
      nonGoals: ["Executing the reorganization"],
      constraints: ["Material ambiguity must remain visible."],
      successSignals: ["People can explain the basis of a reorganization decision."],
      unknowns: ["Whether this is one operation or a reusable product."],
    },
    roadmap: {
      summary: "Candidate grouping remains provisional until the transformation meaning is coherent.",
      lifecycleState: "Product foundation in progress",
      lifecycleExplanation: "Transformation framing remains unresolved; no Milestone is committed.",
      productNotes: "Do not rely on the provisional candidate grouping yet.",
      candidates: [{
        title: "Provisional reorganization outcome",
        outcome: "People can understand a reorganization plan.",
        priority: "Highest",
        rationale: "This records the stated need without resolving its product boundary.",
        dependencies: [],
        nextAction: "Clarify the product boundary",
        commitment: "uncommitted",
      }],
    },
    decisions: {
      purpose: { status: "established" },
      people_and_need: { status: "established" },
      outcome: { status: "established" },
      evidence_and_intent: { status: "explicitly_none" },
      boundaries: { status: "established" },
      success: { status: "established" },
      roadmap_state: { status: "established" },
      uncertainty: { status: "established" },
    },
    conditionalDecisions: {
      replacement_or_migration: {
        triggered: true,
        status: "unresolved",
        note: "One-off operation versus reusable-product meaning is unresolved.",
      },
    },
    nextActions: [{
      participant: "Product",
      action: "Clarify the product boundary",
      reason: "The current interpretation could change Product direction and Roadmap outcomes.",
    }],
  };
}

async function confirmedProduct(): Promise<string> {
  const root = workspace();
  await productEngine.initialize(root, "Record Reorganization", { participantResponsibilities: ["product"] });
  const update = ambiguousTransformationUpdate();
  update.product = {
    ...update.product,
    unknowns: [],
  };
  update.conditionalDecisions = {
    replacement_or_migration: {
      triggered: true,
      status: "established",
      note: "Product defined a reusable product for multiple reorganization operations.",
    },
  };
  update.decisions = {
    ...update.decisions,
    uncertainty: { status: "explicitly_none" },
  };
  productEngine.applyUpdate(root, update);
  await productEngine.recordProductReview(root);
  await productEngine.confirmProduct(root);
  return root;
}

describe("default Socratic decision-coverage interview correction", () => {
  it("keeps materially ambiguous Product meaning unready until resolved or explicitly non-blockingly deferred", async () => {
    const root = workspace();
    await productEngine.initialize(root, "Record Reorganization", { participantResponsibilities: ["product"] });

    expect(productEngine.applyUpdate(root, ambiguousTransformationUpdate()).phase).toBe("draft");
    const beforeRejectedReview = productEngine.loadState(root);
    await expect(productEngine.recordProductReview(root)).rejects.toThrow("must be ready");
    expect(productEngine.loadState(root)).toEqual(beforeRejectedReview);

    const state = productEngine.applyUpdate(root, {
      product: {
        deferrals: [{
          topic: "replacement_or_migration",
          question: "Which operating context should the reusable product support first?",
          why: "Product has established the reusable-product boundary; the first operating context does not change it.",
          revisitWhen: "The first candidate enters Milestone Definition.",
          blocking: false,
        }],
      },
      conditionalDecisions: {
        replacement_or_migration: {
          triggered: true,
          status: "deferred_non_blocking",
          note: "The reusable-product meaning is coherent; the first operating context is deferred.",
        },
      },
      nextActions: [{
        participant: "Product",
        action: "Review the Product foundation",
        reason: "The remaining operating-context detail is explicitly non-blocking.",
      }],
    });
    expect(state.phase).toBe("ready-for-product-confirmation");
  });

  it("keeps Engineering responsibility and context authorization as independent Engine state", async () => {
    const responsibilityRoot = await confirmedProduct();
    const withResponsibility = engineeringEngine.initialize(responsibilityRoot, {
      participantResponsibilities: ["engineering"],
    });
    expect(withResponsibility.participantResponsibilities).toEqual(["engineering"]);
    expect(withResponsibility.contextGrants).toEqual([]);

    const accessRoot = await confirmedProduct();
    const withAccess = engineeringEngine.initialize(accessRoot, {
      contextGrants: [{ scope: ".", kind: "whole-repository", basis: "explicitly-authorized" }],
    });
    expect(withAccess.participantResponsibilities).toEqual([]);
    expect(withAccess.contextGrants).toEqual([
      { scope: ".", kind: "whole-repository", basis: "explicitly-authorized" },
    ]);
  });

  it("makes a prerequisite-aware question frontier the shared default and preserves the observed regression", () => {
    const skill = readFileSync(join(sourceRoot, "skills/loopy/SKILL.md"), "utf8");
    const lifecycle = readFileSync(join(sourceRoot, "docs/product/PRODUCT-LIFECYCLE.md"), "utf8");
    const product = readFileSync(join(sourceRoot, "skills/loopy/references/interviews/Product-Start.md"), "utf8");
    const engineering = readFileSync(join(sourceRoot, "skills/loopy/references/interviews/Engineering-Foundation.md"), "utf8");
    const roadmap = readFileSync(join(sourceRoot, "skills/loopy/references/interviews/Living-Roadmap.md"), "utf8");
    const scenario = readFileSync(join(
      sourceRoot,
      "evaluation/scenarios/interview-quality/migration-planner/Scenario.md",
    ), "utf8");
    const scenarioGuide = readFileSync(join(sourceRoot, "evaluation/scenarios/README.md"), "utf8");
    const crossDomain = readFileSync(join(
      sourceRoot,
      "evaluation/scenarios/interview-quality/cross-domain/Scenario.md",
    ), "utf8");

    expect(skill).toContain("Use a Socratic decision-coverage interview by default");
    expect(skill).toContain("dependency-aware tree");
    expect(skill).toContain("question frontier");
    expect(skill).toContain("at most five related answerable decisions");
    expect(skill).toContain("including nested subquestions, bullets, alternatives, and clauses");
    expect(skill).toContain("Prefer fewer high-information questions");
    expect(skill).toContain("recompute the frontier");
    expect(skill).toContain("Inspect and attribute available facts instead of asking the Human to retrieve them");
    expect(skill).toContain("Never silently treat a material assumption as settled");
    expect(skill).toContain("If a prerequisite is missing, ask first instead of inventing a recommendation");
    expect(skill).toContain("An example helps answer the current decision; it must not silently add more requested decisions");
    expect(skill).toContain("Keep responsibility and context authorization as separate decisions");
    expect(skill).toContain("not when every conceivable future branch is exhausted");
    expect(skill).toContain("Humans may contribute across lifecycle concerns");
    expect(skill).toContain("confirm each consequential decision under the responsibility boundary");
    expect(skill).toContain("### Select the move after each response");
    expect(skill).toContain("rank them by impact on the current target");
    expect(skill).toContain("normally batch the next two or three related questions");
    expect(skill).toContain("Five related questions is the hard per-round maximum");
    expect(skill).toContain("Claude Code's when available");
    expect(skill).toContain("what was learned or confirmed");
    expect(skill).toContain("what remains materially unclear or unresolved");
    expect(skill).toContain("whether the answer introduced ambiguity, conflict, an assumption, a dependency, or an evidence need");
    expect(skill).toContain("whether authorized evidence can resolve the gap");
    expect(skill).toContain("the single highest-value next conversational move");
    expect(skill).toContain("An **understanding gap** means");
    expect(skill).toContain("A **decision gap** means");
    expect(skill).toContain("A response does not by itself authorize advancing coverage");
    expect(skill).toContain("Prefer a small batch of related");
    expect(skill).toContain("A transient understanding gap stays in the conversation");
    for (const move of [
      "probe current meaning",
      "reflect an interpretation and ask for correction",
      "surface a contradiction or consequence",
      "inspect authorized evidence",
      "ask the next prerequisite",
      "ask for human decision or judgment",
      "defer under the current stage's rules",
      "summarize and proceed toward review when coverage is sufficient",
    ]) expect(skill).toContain(move);
    expect(lifecycle).toContain("defined canonically in the single Loopy skill");
    expect(lifecycle).toContain("currently answerable frontier");
    expect(product).toContain("materially ambiguous nouns, verbs, transformations, actors, boundaries, or operating context");
    expect(product).toContain("identify the earliest ambiguity that could change downstream Product meaning");
    expect(product).toContain("ask one small prerequisite question");
    expect(product).toContain("do not finalize Roadmap outcomes or declare readiness");
    expect(product).toContain("Roadmap grouping becomes answerable only after the Product meaning it groups is coherent");
    expect(product).toContain("apply the skill's canonical move-selection loop before changing coverage");
    expect(product).toContain("In a greenfield project, current human intent and supplied context normally provide most of the available basis");
    expect(product).toContain("In a brownfield project, after explicit authorization, inspect discoverable facts before asking the person");
    expect(product).toContain("Evidence about dependency, feasibility, technical independence, or delivery chronology does not by itself establish Product priority");
    expect(product).toContain("Keep Product priority distinct from prerequisite-driven delivery order");
    expect(product).toContain("reflect what the evidence does establish and ask Product, or leave the priority visibly unresolved");
    expect(product).toContain("Do not turn “can proceed independently” or an Engineering sequencing fact into an inferred priority label or “after” relationship");
    expect(product).toContain("including any Roadmap summary, lifecycle explanation, Product notes, candidate wording, next action, or other human-facing text that the new answer makes stale");
    expect(product).toContain("reread the rendered Product artifacts and remove resolved questions or superseded explanations");
    expect(engineering).toContain("workspace is already known to be blank, reuse that fact");
    expect(engineering).toContain("Keep a declaration of Engineering responsibility separate from any context grant");
    expect(engineering).toContain("Elicit applicable Engineering intent and constraints before proposing solution hypotheses");
    expect(engineering).toContain("relevant Engineering intent and constraints are prerequisites for solution hypotheses");
    expect(engineering).toContain("Start with the earliest prerequisite");
    expect(engineering).toContain("Ask about integrations only when that answer makes them relevant");
    expect(engineering).toContain("Never enumerate all possible constraint categories in one round");
    expect(engineering).toContain("Never invent scale, interface form, technology constraints, or other evidence");
    expect(engineering).toContain("apply the skill's canonical move-selection loop before changing coverage");
    expect(engineering).toContain("In brownfield work, after explicit authorization, inspect source, documentation, manifests, and automation");
    expect(roadmap).toContain("canonical question-frontier mechanics only to Roadmap decisions");
    expect(scenario).toContain("**Scenario version:** 1");
    expect(scenario).toContain("before Roadmap finalization");
    expect(scenario).toContain("Applicable context and Engineering intent still precede stack hypotheses");
    expect(scenario).toContain("unfolds over multiple adaptive rounds");
    expect(scenario).toContain("regardless of paragraph or question-mark count");
    expect(scenario).toContain("questionnaire wall");
    expect(scenario).toContain("remains Host-AI behavior requiring conversation evaluation");
    expect(scenario).toContain("known-regression rubric");
    expect(scenario).toContain("complete transcript");
    expect(scenario).toContain("instead of treating the response as permission to advance coverage");

    expect(scenarioGuide).toContain("Structural checks and behavioral evaluation");
    expect(scenarioGuide).toContain("They do not prove that a Host AI understood an answer");
    expect(scenarioGuide).toContain("actual independent multi-turn conversation evaluation");
    for (const evidenceItem of [
      "exact Loopy candidate and Host AI",
      "fresh workspace or fixture identity and starting contents",
      "supplied context and every recorded context grant",
      "per-turn observations",
      "evaluator's reasoned judgment",
    ]) expect(scenarioGuide).toContain(evidenceItem);
    expect(scenarioGuide).toContain("Do not call a run blind or independent if the evaluator revealed expected questions");

    expect(crossDomain).toContain("Run each case independently");
    for (const expectedCase of [
      "Ambiguous answer",
      "Authorized brownfield facts",
      "Understanding gap versus decision gap",
      "Contradiction",
      "Prerequisite ordering",
      "Unsupported recommendation",
      "Current-stage sufficiency",
    ]) expect(crossDomain).toContain(`**${expectedCase}:**`);
    expect(crossDomain).toContain("Passing structural tests cannot substitute for these runs");
    expect(crossDomain).toContain("Add Engine state for transient conversation understanding");
    expect(crossDomain).toContain("does not establish Product priority or serial Roadmap order");
    expect(crossDomain).toContain("keeps Product priority distinct from prerequisite-driven delivery order");

    const productionInterviewGuidance = [skill, product, engineering, roadmap].join("\n").toLowerCase();
    const heldOutLabel = ["migration", "planner"].join(" ");
    const scriptedFragments = [
      ["origin", "and", "destination"].join(" "),
      ["what", "unit", "moves"].join(" "),
      ["what", "may", "transform"].join(" "),
    ];
    expect(productionInterviewGuidance).not.toContain(heldOutLabel);
    for (const fragment of scriptedFragments) expect(productionInterviewGuidance).not.toContain(fragment);
  });
});
