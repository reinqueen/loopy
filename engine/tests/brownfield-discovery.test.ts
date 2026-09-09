import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { ProductStartEngine } from "../src/engine.js";
import { LivingRoadmapEngine } from "../src/living-roadmap-engine.js";
import { MilestoneDefinitionEngine } from "../src/milestone-definition-engine.js";

const sourceRoot = resolve(import.meta.dirname, "../..");
const workspaces: string[] = [];
let product: ProductStartEngine;
let roadmap: LivingRoadmapEngine;
let definition: MilestoneDefinitionEngine;

beforeAll(async () => {
  product = await ProductStartEngine.create(sourceRoot);
  roadmap = await LivingRoadmapEngine.create(sourceRoot);
  definition = await MilestoneDefinitionEngine.create(sourceRoot);
});

afterEach(() => {
  for (const root of workspaces.splice(0)) rmSync(root, { recursive: true, force: true });
});

function workspace(): string {
  const root = mkdtempSync(join(tmpdir(), "loopy-brownfield-discovery-"));
  workspaces.push(root);
  return root;
}

describe("brownfield discovery and flexible entry", () => {
  it("allows Roadmap work against a current Product draft without claiming confirmation", async () => {
    const root = workspace();
    await product.initialize(root, "Billing Service", { participantResponsibilities: [] });
    const state = roadmap.initialize(root);
    expect(state.productRevision).toBe(0);
    expect(product.loadState(root).phase).toBe("draft");
    expect(readFileSync(join(root, "docs/loopy/Roadmap.md"), "utf8")).toContain("Living Roadmap");
  });

  it("starts a direct Definition without a prior Product confirmation or Roadmap", async () => {
    const root = workspace();
    const state = await definition.initializeDirect(root, {
      projectName: "Billing Service",
      participantResponsibilities: ["product", "engineering"],
      title: "Reliable invoice retry",
      outcome: "Customers can recover a failed invoice payment without duplicate charges.",
      priority: "High",
      rationale: "The Humans asked to define this outcome directly from brownfield evidence.",
      nextShapingStep: "Reconcile retry behavior and define observable acceptance",
      actor: { name: "Avery", responsibility: "product" },
    });
    expect(product.loadState(root).phase).toBe("draft");
    expect(roadmap.loadState(root).candidates[0].state).toBe("Selected for definition");
    expect(state.definitions[0].phase).toBe("draft");
    expect(state.definitions[0].content.outcome).toContain("without duplicate charges");
    expect(existsSync(join(root, state.definitions[0].artifactPath))).toBe(true);
  });

  it("rejects an invalid direct start before creating project state", async () => {
    const root = workspace();
    await expect(definition.initializeDirect(root, {
      projectName: "Billing Service",
      participantResponsibilities: ["product"],
      title: "Retry",
      outcome: "Retry invoices",
      priority: "Highest",
      rationale: "Requested",
      nextShapingStep: "Define it",
      actor: { name: "Loopy", responsibility: "loopy" },
    })).rejects.toThrow("basis in explicit Product intent");
    expect(existsSync(join(root, ".loopy"))).toBe(false);
  });

  it("blocks a material unresolved evidence conflict and preserves its sources", async () => {
    const root = workspace();
    let state = await definition.initializeDirect(root, {
      projectName: "Billing Service",
      participantResponsibilities: ["product", "engineering"],
      title: "Reliable invoice retry",
      outcome: "Customers can safely retry failed invoices.",
      priority: "Highest",
      rationale: "A material discrepancy must be reconciled.",
      nextShapingStep: "Resolve retry ownership",
      actor: { name: "Avery", responsibility: "product" },
    });
    const id = state.definitions[0].id;
    state = definition.applyUpdate(root, {
      type: "update",
      definitionId: id,
      actor: { name: "Morgan", perspectives: ["product", "engineering"] },
      content: {
        requirements: ["A failed invoice has one understandable recovery path."],
        currentBehavior: ["Code performs one automatic retry."],
        intendedBehavior: ["Product currently expects a manual retry."],
        evidence: [
          { source: "src/retry.ts", kind: "code", finding: "One automatic retry is implemented." },
          { source: "PM discussion", kind: "product-intent", finding: "Recovery should be manual." },
        ],
        reconciliations: [{
          disagreement: "Automatic versus manual retry",
          sources: ["src/retry.ts", "PM discussion"],
          status: "unresolved",
          resolution: "",
          material: true,
        }],
        acceptance: ["A failed payment exposes the agreed recovery path without creating a duplicate charge."],
      },
      coherence: { status: "coherent", basis: "All other Definition meaning is coherent." },
      requiredPerspectives: ["product", "engineering"],
    });
    expect(state.definitions[0].phase).toBe("blocked");
    expect(() => definition.review(root, [id])).toThrow("material unresolved evidence conflict");

    state = definition.applyUpdate(root, {
      type: "update",
      definitionId: id,
      actor: { name: "Avery and Morgan", perspectives: ["product", "engineering"] },
      content: { reconciliations: [{
        disagreement: "Automatic versus manual retry",
        sources: ["src/retry.ts", "PM discussion"],
        status: "resolved",
        resolution: "Keep one automatic retry; offer manual recovery only after it fails.",
        material: true,
      }] },
      coherence: { status: "coherent", basis: "The Humans reconciled current and intended retry behavior." },
    });
    expect(state.definitions[0].phase).toBe("draft");
    definition.renderCurrent(root);
    const view = readFileSync(join(root, state.definitions[0].artifactPath), "utf8");
    expect(view).toContain("Code performs one automatic retry");
    expect(view).toContain("Resolved");
    expect(view).toContain("Keep one automatic retry");
  });

  it("keeps every existing entry route visible while removing chronology as a discovery gate", () => {
    const skill = readFileSync(join(sourceRoot, "skills/loopy/SKILL.md"), "utf8");
    for (const route of ["Product-Start.md", "Engineering-Foundation.md", "Living-Roadmap.md", "Milestone-Definition.md", "Change-Management.md", "Milestone-Planning.md", "Milestone-Build-and-Prove.md", "Milestone-Demonstrate-and-Accept.md"]) {
      expect(skill).toContain(route);
    }
    expect(skill).toContain("actual starting material");
    expect(skill).toContain("their absence alone is not a reason to force");
    expect(skill).toContain("never use a job title to restrict");
    expect(skill).toContain("Material disagreement requires reconciliation");
    expect(skill).toContain("Group requirements into independently valuable and demonstrable outcomes");
    expect(skill).toContain("Inspection informs the interview; it never replaces it");
    expect(skill).toContain("grill further wherever material meaning remains uncertain");
    expect(existsSync(join(sourceRoot, "Requirements.md"))).toBe(false);
    const scenario = readFileSync(join(sourceRoot, "evaluation/scenarios/brownfield-discovery/collaborative/Scenario.md"), "utf8");
    for (const phrase of [
      "inspects before asking repository-answerable questions",
      "still grills Humans because evidence is fallible",
      "without job-title rigidity",
      "current-versus-intended behavior",
      "One bounded outcome does not cause unnecessary Milestone explosion",
      "Final Human Product priority",
      "without `Requirements.md`",
      "stopping when current-target understanding is sufficient",
    ]) expect(scenario).toContain(phrase);
  });
});
