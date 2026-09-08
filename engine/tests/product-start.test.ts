import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { parseCliArguments } from "../src/cli-arguments.js";
import { ProductStartEngine } from "../src/engine.js";
import type { ProductStartUpdate, RoadmapCandidate } from "../src/types.js";
import {
  resolveInsideWorkspace,
  writeFileSetInsideWorkspace,
  writeInsideWorkspace,
} from "../src/workspace.js";

const sourceRoot = resolve(import.meta.dirname, "../..");
const workspaces: string[] = [];
let engine: ProductStartEngine;

beforeAll(async () => {
  engine = await ProductStartEngine.create(sourceRoot);
});

afterEach(() => {
  for (const path of workspaces.splice(0)) rmSync(path, { recursive: true, force: true });
});

function workspace(): string {
  const path = mkdtempSync(join(tmpdir(), "loopy-start-adopt-"));
  workspaces.push(path);
  return path;
}

function candidate(
  title: string,
  priority: RoadmapCandidate["priority"],
  outcome = `${title} improves onboarding.`,
): RoadmapCandidate {
  return {
    title,
    outcome,
    priority,
    rationale: `${title} addresses a visible Product need.`,
    dependencies: [],
    nextAction: `Shape ${title}`,
    commitment: "uncommitted",
  };
}

function completeUpdate(candidates: RoadmapCandidate[] = []): ProductStartUpdate {
  return {
    product: {
      summary: "Northstar helps new administrators complete setup without support.",
      purpose: "Reduce avoidable onboarding friction.",
      primaryPeople: "New customer administrators",
      need: "Complete initial setup without contacting support.",
      currentAlternative: "Ask support to walk them through setup.",
      secondaryPeople: "Invited teammates",
      outcome: "Administrators complete setup confidently on their first attempt.",
      inScope: ["The first administrator setup experience"],
      nonGoals: ["A self-service customer portal"],
      constraints: ["Existing customers must keep access during the change."],
      successSignals: ["Fewer new administrators ask support to complete setup."],
    },
    roadmap: {
      summary: "Improve administrator onboarding before expanding self-service.",
      lifecycleState: "Product foundation established",
      lifecycleExplanation: "Product direction is ready; no Milestone has been committed.",
      productNotes: "Keep the self-service portal as a later possibility.",
      candidates,
    },
    decisions: {
      purpose: { status: "established" },
      people_and_need: { status: "established" },
      outcome: { status: "established" },
      evidence_and_intent: { status: "explicitly_none" },
      boundaries: { status: "established" },
      success: { status: "established" },
      roadmap_state: { status: candidates.length === 0 ? "explicitly_none" : "established" },
      uncertainty: { status: "explicitly_none" },
    },
    nextActions: [{
      participant: "Product",
      action: "Review the Product foundation",
      reason: "Every required Product decision has a recorded disposition.",
    }],
  };
}

async function readyWorkspace(update: ProductStartUpdate = completeUpdate()): Promise<string> {
  const root = workspace();
  await engine.initialize(root, "Northstar", { participantResponsibilities: ["product"] });
  engine.applyUpdate(root, update);
  return root;
}

async function confirmedWorkspace(update: ProductStartUpdate = completeUpdate()): Promise<string> {
  const root = await readyWorkspace(update);
  await engine.recordProductReview(root);
  await engine.confirmProduct(root);
  return root;
}

describe("Start or Adopt — Product foundation", () => {
  it("keeps the internal Product Start apply examples executable", async () => {
    const reference = readFileSync(
      join(sourceRoot, "skills/loopy/references/engine/Product-Start-Apply.md"),
      "utf8",
    );
    const examples = [...reference.matchAll(/<!-- apply-example -->\n```json\n([\s\S]*?)\n```/g)]
      .map((match) => JSON.parse(match[1]) as ProductStartUpdate);
    expect(examples).toHaveLength(4);

    const root = workspace();
    writeFileSync(join(root, "README.md"), "Setup currently requires support.\n");
    await engine.initialize(root, "Example", { participantResponsibilities: ["product"] });
    let state = engine.loadState(root);
    for (const update of examples) state = engine.applyUpdate(root, update);

    expect(state.phase).toBe("ready-for-product-confirmation");
    expect(state.contextGrants).toEqual([
      { scope: "README.md", kind: "workspace-path", basis: "explicitly-authorized" },
    ]);
    expect(state.roadmap.candidates).toHaveLength(1);
    expect(state.product.deferrals).toHaveLength(1);
    expect(state.nextActions).toEqual([
      {
        participant: "Product",
        action: "Review the Product foundation",
        reason: "Every required Product decision has a recorded disposition.",
      },
    ]);
  });

  it("creates all three drafts without treating project selection as repository permission", async () => {
    const root = workspace();
    const state = await engine.initialize(root, "Northstar");

    expect(state.contextGrants).toEqual([]);
    expect(state.participantResponsibilities).toEqual([]);
    expect(readFileSync(join(root, "LOOPY.md"), "utf8")).toBe(`# Loopy — Northstar

## Where things stand

The Product foundation is being established.

## Product foundation

- **Product Definition:** Draft — [Project Definition](docs/loopy/Project-Definition.md)
- **Roadmap:** No candidates yet — [Roadmap](docs/loopy/Roadmap.md)
- **Context inspected:** None authorized yet

## Current work

No Milestone is active.

## Missing responsibility areas

| Responsibility area | Current state | Participation needed |
|---|---|---|
| Product | Draft | Invite Product participation |
| Engineering | Not established | Establish an Engineering guide when delivery needs it |
| Architecture | Not yet known to be needed | Participate only when durable structural guidance is triggered |
| Demo or quality | Not yet needed | Establish reusable proof guidance just in time |
| Release | Not yet needed | Establish reusable release guidance when distribution affects delivery |

## Next action

**Product: Invite Product participation**

Drafts can start now, but only Product can confirm Product direction.

## Blockers

No current blockers.

## Release view

- **Complete but not released:** None
- **Latest Release:** None yet
`);
    expect(readFileSync(join(root, "docs/loopy/Project-Definition.md"), "utf8")).toContain(
      "Selecting the project did not authorize repository-wide reading.",
    );
    expect(readFileSync(join(root, "docs/loopy/Roadmap.md"), "utf8")).toContain(
      "No Milestone candidates exist yet.",
    );
  });

  it("refuses repeated initialization without changing existing state or views", async () => {
    const root = await confirmedWorkspace();
    const paths = [
      ".loopy/start-or-adopt/state.json",
      "LOOPY.md",
      "docs/loopy/Project-Definition.md",
      "docs/loopy/Roadmap.md",
    ];
    const before = Object.fromEntries(paths.map((path) => [path, readFileSync(join(root, path), "utf8")]));
    await expect(engine.initialize(root, "Replacement project", {
      participantResponsibilities: ["product"],
    })).rejects.toThrow("already initialized. Use status or resume");
    const after = Object.fromEntries(paths.map((path) => [path, readFileSync(join(root, path), "utf8")]));
    expect(after).toEqual(before);
    expect(engine.loadState(root).phase).toBe("product-foundation-confirmed");
  });

  it("strictly validates initialization options before touching the target workspace", async () => {
    const parent = workspace();
    const target = join(parent, "not-created");

    await expect(engine.initialize(target, "Northstar", { unexpected: true } as never))
      .rejects.toThrow("initialization options contains unknown properties: unexpected");
    expect(existsSync(target)).toBe(false);

    await expect(engine.initialize(target, "Northstar", { participantResponsibilities: "product" } as never))
      .rejects.toThrow("participantResponsibilities must be an array");
    await expect(engine.initialize(target, "Northstar", {
      contextGrants: [{ scope: "docs", kind: "invented", basis: "selected" }],
    } as never)).rejects.toThrow("Unsupported context grant kind: invented");
    await expect(engine.initialize(target, "Northstar", {
      contextGrants: [{ scope: " ", kind: "workspace-path", basis: "selected" }],
    })).rejects.toThrow("contextGrants[0].scope must not be empty");
    await expect(engine.initialize(target, "Northstar", {
      contextGrants: [{ scope: "docs", kind: "workspace-path", basis: "selected", extra: true }],
    } as never)).rejects.toThrow("contextGrants[0] contains unknown properties: extra");
    expect(existsSync(target)).toBe(false);
  });

  it("accepts explicit whole-repository authorization but rejects inferred authorization", async () => {
    const allowed = workspace();
    const state = await engine.initialize(allowed, "Northstar", {
      contextGrants: [{ scope: ".", kind: "whole-repository", basis: "explicitly-authorized" }],
    });
    expect(state.contextGrants).toHaveLength(1);

    const rejected = workspace();
    await expect(engine.initialize(rejected, "Northstar", {
      contextGrants: [{ scope: ".", kind: "whole-repository", basis: "selected" }],
    })).rejects.toThrow("Whole-repository access requires explicit authorization");
  });

  it("rejects repository-equivalent path grants and invented grant bases", async () => {
    const rootGrant = workspace();
    await expect(engine.initialize(rootGrant, "Northstar", {
      contextGrants: [{ scope: ".", kind: "workspace-path", basis: "selected" }],
    })).rejects.toThrow("Repository-wide access requires a whole-repository grant");

    const equivalentGrant = workspace();
    await expect(engine.initialize(equivalentGrant, "Northstar", {
      contextGrants: [{ scope: "docs/..", kind: "workspace-path", basis: "selected" }],
    })).rejects.toThrow("Repository-wide access requires a whole-repository grant");

    const inventedBasis = workspace();
    await expect(engine.initialize(inventedBasis, "Northstar", {
      contextGrants: [{
        scope: "README.md",
        kind: "workspace-path",
        basis: "implicitly-trusted",
      } as never],
    })).rejects.toThrow("Unsupported context grant basis");
  });

  it("rejects a repository-equivalent symlink grant but permits a contained symlink", async () => {
    const selfRoot = workspace();
    symlinkSync(".", join(selfRoot, "self"));
    await expect(engine.initialize(selfRoot, "Northstar", {
      contextGrants: [{ scope: "self", kind: "workspace-path", basis: "selected" }],
    })).rejects.toThrow("Repository-wide access requires a whole-repository grant");

    const containedRoot = workspace();
    mkdirSync(join(containedRoot, "docs"));
    symlinkSync("docs", join(containedRoot, "docs-link"));
    const state = await engine.initialize(containedRoot, "Northstar", {
      contextGrants: [{ scope: "docs-link", kind: "workspace-path", basis: "selected" }],
    });
    expect(state.contextGrants).toEqual([
      { scope: "docs", kind: "workspace-path", basis: "selected" },
    ]);
  });

  it("normalizes canonical grant identity and evidence attribution", async () => {
    const duplicateRoot = workspace();
    mkdirSync(join(duplicateRoot, "docs"));
    await expect(engine.initialize(duplicateRoot, "Northstar", {
      contextGrants: [
        { scope: "docs", kind: "workspace-path", basis: "selected" },
        { scope: "docs/.", kind: "workspace-path", basis: "selected" },
      ],
    })).rejects.toThrow("Context grants resolve to the same canonical scope: docs");
    expect(existsSync(join(duplicateRoot, ".loopy/start-or-adopt/state.json"))).toBe(false);

    const normalizedRoot = workspace();
    mkdirSync(join(normalizedRoot, "docs"));
    const initialized = await engine.initialize(normalizedRoot, "Northstar", {
      participantResponsibilities: ["product"],
      contextGrants: [{ scope: "docs/.", kind: "workspace-path", basis: "selected" }],
    });
    expect(initialized.contextGrants[0].scope).toBe("docs");
    const update = completeUpdate();
    update.product = {
      ...update.product,
      evidence: [{
        source: "Product brief",
        finding: "Administrators need a simpler setup path.",
        contextScope: "docs/.",
      }],
      remainsTrue: ["Administrators remain the primary audience."],
    };
    update.decisions = {
      ...update.decisions,
      evidence_and_intent: { status: "established_from_evidence" },
    };
    const applied = engine.applyUpdate(normalizedRoot, update);
    expect(applied.product.evidence[0].contextScope).toBe("docs");
    expect(readFileSync(join(normalizedRoot, "docs/loopy/Project-Definition.md"), "utf8"))
      .toContain("**Product brief** (docs)");
  });

  it("accepts evidence only from a matching authorized scope", async () => {
    const root = workspace();
    writeFileSync(join(root, "README.md"), "Existing project\n", "utf8");
    await engine.initialize(root, "Northstar", {
      participantResponsibilities: ["product"],
      contextGrants: [{ scope: "README.md", kind: "workspace-path", basis: "selected" }],
    });
    const update = completeUpdate();
    update.product = {
      ...update.product,
      evidence: [{
        source: "README",
        finding: "The existing product serves administrators.",
        contextScope: "README.md",
      }],
      remainsTrue: ["Administrators remain the primary audience."],
    };
    update.decisions = { ...update.decisions, evidence_and_intent: { status: "established_from_evidence" } };
    expect(engine.applyUpdate(root, update).phase).toBe("ready-for-product-confirmation");

    expect(() => engine.applyUpdate(root, {
      product: { evidence: [{ source: "Issue 4", finding: "A claim", contextScope: "Issue 4" }] },
    })).toThrow("Evidence is outside the authorized context");
  });

  it("refreshes every human view on apply and makes failed validation write nothing", async () => {
    const root = workspace();
    await engine.initialize(root, "Northstar", { participantResponsibilities: ["product"] });
    const paths = [
      ".loopy/start-or-adopt/state.json",
      "LOOPY.md",
      "docs/loopy/Project-Definition.md",
      "docs/loopy/Roadmap.md",
    ];
    const before = Object.fromEntries(paths.map((path) => [path, readFileSync(join(root, path), "utf8")]));

    engine.applyUpdate(root, completeUpdate());
    expect(await engine.detectStaleViews(root)).toEqual([]);
    expect(readFileSync(join(root, "docs/loopy/Project-Definition.md"), "utf8")).toContain(
      "Reduce avoidable onboarding friction.",
    );
    expect(readFileSync(join(root, "docs/loopy/Roadmap.md"), "utf8")).toContain(
      "Improve administrator onboarding",
    );
    expect(readFileSync(join(root, "LOOPY.md"), "utf8")).toContain("Ready for Product confirmation");

    const afterSuccess = Object.fromEntries(paths.map((path) => [path, readFileSync(join(root, path), "utf8")]));
    expect(afterSuccess).not.toEqual(before);
    expect(() => engine.applyUpdate(root, { nextActions: [{ participant: "", action: "", reason: "" }] }))
      .toThrow("must not be empty");
    expect(Object.fromEntries(paths.map((path) => [path, readFileSync(join(root, path), "utf8")])))
      .toEqual(afterSuccess);
  });

  it("rejects malformed CLI arguments before dispatch", () => {
    expect(() => parseCliArguments(["status", "--workspace", "/tmp/project", "--unknown", "value"]))
      .toThrow("Unknown option for status: --unknown");
    expect(() => parseCliArguments([
      "status", "--workspace", "/tmp/project", "--workspace", "/tmp/other",
    ])).toThrow("Duplicate option: --workspace");
    expect(() => parseCliArguments(["status", "--workspace"]))
      .toThrow("Missing value for option: --workspace");
    expect(() => parseCliArguments(["status", "--workspace", "/tmp/project", "stray"]))
      .toThrow("Unexpected positional argument: stray");
    expect(() => parseCliArguments(["status", "--workspace", "/tmp/project", "--input", "change.json"]))
      .toThrow("Unknown option for status: --input");
    expect(() => parseCliArguments(["status", "--workspace", "   "]))
      .toThrow("Blank value for option: --workspace");
    expect(() => parseCliArguments([
      "init", "--workspace", "/tmp/project", "--project-name", "\t",
    ])).toThrow("Blank value for option: --project-name");
  });

  it("rejects workspace-path grants that escape the target project", async () => {
    const root = workspace();
    await expect(engine.initialize(root, "Northstar", {
      contextGrants: [{ scope: "../outside", kind: "workspace-path", basis: "selected" }],
    })).rejects.toThrow("escapes the target workspace");
  });

  it("requires Product participation and a current concise review before confirmation", async () => {
    const withoutProduct = workspace();
    await engine.initialize(withoutProduct, "Northstar");
    engine.applyUpdate(withoutProduct, completeUpdate());
    expect(engine.loadState(withoutProduct).phase).toBe("draft");
    await expect(engine.confirmProduct(withoutProduct)).rejects.toThrow("Product participation is required");

    const withProduct = await readyWorkspace();
    await expect(engine.confirmProduct(withProduct)).rejects.toThrow("current Product-foundation draft must be reviewed");
    await engine.recordProductReview(withProduct);
    expect((await engine.confirmProduct(withProduct)).phase).toBe("product-foundation-confirmed");
  });

  it("renders exact confirmed Product Definition and Roadmap for a no-candidates start", async () => {
    const root = await confirmedWorkspace();
    expect(readFileSync(join(root, "docs/loopy/Project-Definition.md"), "utf8")).toBe(`# Project Definition — Northstar

> **Status:** Product foundation confirmed

## Summary

Northstar helps new administrators complete setup without support.

## Purpose

Reduce avoidable onboarding friction.

## People and need

- **Primary people served:** New customer administrators
- **Need or problem:** Complete initial setup without contacting support.
- **Current alternative:** Ask support to walk them through setup.
- **Secondary people or affected groups:** Invited teammates

## Intended product outcome

Administrators complete setup confidently on their first attempt.

## What we found

### Authorized context

No project context has been authorized for inspection. Selecting the project did not authorize repository-wide reading.

### Evidence

No evidence has been recorded from the authorized context.

## Current Product direction

### What remains true

Nothing from prior context has been retained yet.

### What should change

No intended changes have been stated yet.

### What is uncertain

Nothing is currently marked uncertain.

## Scope and boundaries

### In scope

- The first administrator setup experience

### Not in scope now

- A self-service customer portal

### Product constraints

- Existing customers must keep access during the change.

## Success signals

- Fewer new administrators ask support to complete setup.

## Uncertainty

- **Assumptions:** None recorded.
- **Unknowns:** None recorded.

## Deferred Product questions

No Product decisions are currently deferred.

## Product confirmation

Product confirms the current Product Definition and Roadmap. This does not confirm Engineering, Architecture, Demo or quality, Release, publication, deployment, or rollback decisions.
`);
    expect(readFileSync(join(root, "docs/loopy/Roadmap.md"), "utf8")).toBe(`# Roadmap — Northstar

> **Status:** Product foundation confirmed

## Summary

Improve administrator onboarding before expanding self-service.

## Current lifecycle state

**Product foundation confirmed**

The Product foundation is confirmed; no Milestone has been committed.

## Next product step

**Product input is complete for now.**

## Milestone candidates

No Milestone candidates exist yet. Product input is complete for now.

Candidates are possibilities, not commitments. Their presence or priority does not imply technical feasibility or authorize delivery.

## Current Milestones

No Milestones have been committed.

## Product questions to revisit

No Product decisions are currently deferred.

## Product notes

Keep the self-service portal as a later possibility.
`);
  });

  it("renders multi-item Product direction as readable lists", async () => {
    const update = completeUpdate();
    update.product = {
      ...update.product,
      remainsTrue: ["Support remains available.", "Existing accounts keep access."],
      shouldChange: ["Administrators lead setup.", "Routine setup no longer waits for support."],
      uncertain: ["Invitation timing", "Migration timing"],
    };
    update.decisions = {
      ...update.decisions,
      evidence_and_intent: { status: "established" },
    };
    const root = await confirmedWorkspace(update);
    const definition = readFileSync(join(root, "docs/loopy/Project-Definition.md"), "utf8");

    expect(definition).toContain(`### What remains true

- Support remains available.
- Existing accounts keep access.

### What should change

- Administrators lead setup.
- Routine setup no longer waits for support.

### What is uncertain

- Invitation timing
- Migration timing`);
    expect(definition).not.toContain("Support remains available.; Existing accounts keep access.");
  });

  it("normalizes the full Roadmap lifecycle statement and standard review wording when Product confirms", async () => {
    const reviewCandidate = candidate("Guided setup", "Highest");
    reviewCandidate.nextAction = "Review the Product foundation";
    const update = completeUpdate([reviewCandidate]);
    update.roadmap = {
      ...update.roadmap,
      lifecycleState: "Product foundation ready for review",
      lifecycleExplanation: "Product decisions are ready for Product review; no Milestone has been committed.",
    };
    const root = await readyWorkspace(update);
    await engine.recordProductReview(root);
    const confirmed = await engine.confirmProduct(root);
    const roadmap = readFileSync(join(root, "docs/loopy/Roadmap.md"), "utf8");

    expect(confirmed.roadmap.lifecycleState).toBe("Product foundation confirmed");
    expect(confirmed.roadmap.lifecycleExplanation)
      .toBe("The Product foundation is confirmed; no Milestone has been committed.");
    expect(confirmed.roadmap.candidates[0].nextAction).toBe("Shape this candidate before Milestone commitment");
    expect(confirmed.roadmapHistory.at(-1)?.after).toEqual(confirmed.roadmap);
    expect(confirmed.confirmedHistory.at(-1)?.roadmapHistoryHead).toBe(confirmed.roadmapHistoryHead);
    expect(roadmap).toContain("> **Status:** Product foundation confirmed");
    expect(roadmap).toContain("**Product foundation confirmed**");
    expect(roadmap).toContain("The Product foundation is confirmed; no Milestone has been committed.");
    expect(roadmap).toContain("Shape this candidate before Milestone commitment");
    expect(roadmap).not.toContain("Product foundation ready for review");
    expect(roadmap).not.toContain("ready for Product review");
    expect(roadmap).not.toContain("Review the Product foundation");
    expect(await engine.detectStaleViews(root)).toEqual([]);
  });

  it("preserves meaningful candidate-specific actions through Product confirmation", async () => {
    const specificCandidate = candidate("Guided setup", "Highest");
    specificCandidate.nextAction = "Validate invitation needs with customer administrators";
    const root = await confirmedWorkspace(completeUpdate([specificCandidate]));

    expect(engine.loadState(root).roadmap.candidates[0].nextAction)
      .toBe("Validate invitation needs with customer administrators");
  });

  it("rejects reintroducing a standard Product-review action while confirmed", async () => {
    const root = await confirmedWorkspace(completeUpdate([candidate("Guided setup", "Highest")]));
    const before = engine.loadState(root);
    const reviewedAgain = structuredClone(before.roadmap.candidates);
    reviewedAgain[0].nextAction = "Confirm the Product foundation.";

    expect(() => engine.applyUpdate(root, { roadmap: { candidates: reviewedAgain } }))
      .toThrow("A confirmed Roadmap candidate cannot still ask to review or confirm the Product foundation");
    expect(engine.loadState(root)).toEqual(before);
  });

  it("turns an essential deferral into a visible blocker and one Product action", async () => {
    const update = completeUpdate();
    update.product = {
      ...update.product,
      deferrals: [{
        topic: "success",
        question: "How will success be recognized?",
        why: "The baseline is unavailable.",
        revisitWhen: "Support data is available",
        blocking: true,
      }],
    };
    update.decisions = {
      ...update.decisions,
      success: { status: "deferred_blocking", note: "Awaiting a usable success baseline." },
    };
    update.nextActions = [{
      participant: "Product",
      action: "Define how success will be recognized",
      reason: "Success is required before Product can confirm the foundation.",
    }];
    const root = await readyWorkspace(update);
    const state = engine.loadState(root);
    expect(state.phase).toBe("blocked");
    await expect(engine.confirmProduct(root)).rejects.toThrow("Product foundation is not ready");
    await engine.renderCurrent(root);
    const home = readFileSync(join(root, "LOOPY.md"), "utf8");
    expect(home).toContain("Blocked by a required Product decision");
    expect(home).toContain("**Product: Define how success will be recognized**");
    expect(home).toContain("**Product — How will success be recognized?:**");
  });

  it("rejects disguised, mismatched, and duplicate Product deferrals", async () => {
    const blockingRoot = workspace();
    await engine.initialize(blockingRoot, "Northstar", { participantResponsibilities: ["product"] });
    const disguised = completeUpdate();
    disguised.product = {
      ...disguised.product,
      deferrals: [{
        topic: "success",
        question: "How will success be recognized?",
        why: "The baseline is unavailable.",
        revisitWhen: "Support data is available",
        blocking: true,
      }],
    };
    expect(() => engine.applyUpdate(blockingRoot, disguised)).toThrow(
      "success has a blocking deferral and must be deferred_blocking",
    );
    expect(engine.loadState(blockingRoot).phase).toBe("draft");

    const nonBlockingRoot = workspace();
    await engine.initialize(nonBlockingRoot, "Northstar", { participantResponsibilities: ["product"] });
    const mismatched = completeUpdate();
    mismatched.product = {
      ...mismatched.product,
      deferrals: [{
        topic: "uncertainty",
        question: "Which secondary audience should be studied?",
        why: "It does not change current direction.",
        revisitWhen: "The first study completes",
        blocking: false,
      }],
    };
    expect(() => engine.applyUpdate(nonBlockingRoot, mismatched)).toThrow(
      "uncertainty has a non-blocking deferral and must be deferred_non_blocking",
    );

    const duplicateRoot = workspace();
    await engine.initialize(duplicateRoot, "Northstar", { participantResponsibilities: ["product"] });
    const duplicate = completeUpdate();
    duplicate.product = {
      ...duplicate.product,
      deferrals: [
        {
          topic: "success",
          question: "Which success signal should be used?",
          why: "The baseline is unavailable.",
          revisitWhen: "Support data is available",
          blocking: true,
        },
        {
          topic: "success",
          question: "Can success wait?",
          why: "A second disposition conflicts with the first.",
          revisitWhen: "Research completes",
          blocking: false,
        },
      ],
    };
    duplicate.decisions = {
      ...duplicate.decisions,
      success: { status: "deferred_blocking", note: "Waiting for a measure." },
    };
    expect(() => engine.applyUpdate(duplicateRoot, duplicate)).toThrow(
      "Product deferrals must not duplicate or conflict for success",
    );
  });

  it("allows a non-blocking uncertainty deferral", async () => {
    const update = completeUpdate();
    update.product = {
      ...update.product,
      deferrals: [{
        topic: "uncertainty",
        question: "Which secondary audience should be studied next?",
        why: "It does not change the current direction.",
        revisitWhen: "The first onboarding study completes",
        blocking: false,
      }],
    };
    update.decisions = {
      ...update.decisions,
      uncertainty: { status: "deferred_non_blocking", note: "Secondary research can follow." },
    };
    const root = await confirmedWorkspace(update);
    expect(engine.loadState(root).phase).toBe("product-foundation-confirmed");
  });

  it("requires triggered conditional coverage and preserves conflicting evidence as evidence", async () => {
    const root = workspace();
    writeFileSync(join(root, "README.md"), "Legacy direction\n", "utf8");
    await engine.initialize(root, "Northstar", {
      participantResponsibilities: ["product"],
      contextGrants: [{ scope: "README.md", kind: "workspace-path", basis: "selected" }],
    });
    const update = completeUpdate();
    update.product = {
      ...update.product,
      evidence: [{
        source: "README",
        finding: "The repository describes a support-operated setup flow.",
        contextScope: "README.md",
        conflictsWithIntent: true,
      }],
      shouldChange: ["Setup should become self-service."],
    };
    update.decisions = { ...update.decisions, evidence_and_intent: { status: "established" } };
    update.conditionalDecisions = { context_conflict: { triggered: true, status: "unresolved" } };
    engine.applyUpdate(root, update);
    expect(engine.loadState(root).phase).toBe("draft");
    update.conditionalDecisions = { context_conflict: { triggered: true, status: "established" } };
    expect(engine.applyUpdate(root, update).phase).toBe("ready-for-product-confirmation");
    await engine.renderCurrent(root);
    expect(readFileSync(join(root, "docs/loopy/Project-Definition.md"), "utf8")).toContain(
      "This differs from current Product intent.",
    );
  });

  it("preserves interruption and resumes at the next unresolved decision", async () => {
    const root = workspace();
    await engine.initialize(root, "Northstar", { participantResponsibilities: ["product"] });
    engine.applyUpdate(root, {
      product: { purpose: "Reduce onboarding friction." },
      decisions: { purpose: { status: "established" } },
    });
    const interrupted = await engine.interrupt(root);
    expect(interrupted.session).toEqual({ status: "interrupted", resumeTopic: "people_and_need" });
    expect((await engine.resume(root)).nextTopic).toBe("people_and_need");
  });

  it("sorts candidates and records candidate management without reopening Product confirmation", async () => {
    const root = await confirmedWorkspace();
    const candidates = [candidate("Later reporting", "Later"), candidate("Invitation clarity", "High"),
      candidate("Guided setup", "Highest"), candidate("Support handoff", "High")];
    const updated = engine.applyUpdate(root, {
      roadmap: { candidates },
      decisions: { roadmap_state: { status: "established" } },
    });
    expect(updated.phase).toBe("product-foundation-confirmed");
    expect(updated.confirmedHistory).toHaveLength(1);
    expect(updated.roadmapHistory.at(-1)?.change).toBe("candidate-management");
    await engine.renderCurrent(root);
    const roadmap = readFileSync(join(root, "docs/loopy/Roadmap.md"), "utf8");
    expect(roadmap.indexOf("Guided setup")).toBeLessThan(roadmap.indexOf("Invitation clarity"));
    expect(roadmap.indexOf("Invitation clarity")).toBeLessThan(roadmap.indexOf("Support handoff"));
    expect(roadmap.indexOf("Support handoff")).toBeLessThan(roadmap.indexOf("Later reporting"));
  });

  it("reopens only Product confirmation after a material Product meaning change", async () => {
    const root = await confirmedWorkspace();
    const changed = engine.applyUpdate(root, {
      product: { outcome: "Administrators and teammates complete setup confidently." },
      nextActions: [{
        participant: "Product",
        action: "Review the changed Product outcome",
        reason: "Confirmed Product meaning changed.",
      }],
    });
    expect(changed.phase).toBe("ready-for-product-confirmation");
    expect(changed.reviewedDraftVersion).toBeNull();
    await expect(engine.confirmProduct(root)).rejects.toThrow("current Product-foundation draft must be reviewed");
    await engine.recordProductReview(root);
    const reconfirmed = await engine.confirmProduct(root);
    expect(reconfirmed.confirmedHistory).toHaveLength(2);
    expect(reconfirmed.confirmedHistory[0].product.outcome).not.toBe(reconfirmed.product.outcome);
  });

  it("reopens confirmation for changed evidence, uncertainty, Roadmap meaning, and blocking deferrals", async () => {
    const nextActions = [{
      participant: "Product",
      action: "Review the changed Product foundation",
      reason: "Confirmed Product meaning changed.",
    }];

    const evidenceRoot = await confirmedWorkspace();
    const evidenceChange = engine.applyUpdate(evidenceRoot, {
      contextGrants: [{ scope: "README.md", kind: "workspace-path", basis: "selected" }],
      product: {
        evidence: [{ source: "README", finding: "A newly inspected Product claim.", contextScope: "README.md" }],
        remainsTrue: ["The newly inspected claim remains current."],
      },
      decisions: { evidence_and_intent: { status: "established_from_evidence" } },
      nextActions,
    });
    expect(evidenceChange.phase).toBe("ready-for-product-confirmation");
    expect(evidenceChange.reviewedDraftVersion).toBeNull();

    const uncertaintyRoot = await confirmedWorkspace();
    const uncertaintyChange = engine.applyUpdate(uncertaintyRoot, {
      product: { unknowns: ["Whether invited teammates need a separate path."] },
      decisions: { uncertainty: { status: "established" } },
      nextActions,
    });
    expect(uncertaintyChange.phase).toBe("ready-for-product-confirmation");
    expect(uncertaintyChange.reviewedDraftVersion).toBeNull();

    const roadmapRoot = await confirmedWorkspace();
    const roadmapChange = engine.applyUpdate(roadmapRoot, {
      roadmap: { summary: "Prioritize administrator and teammate onboarding together." },
      nextActions,
    });
    expect(roadmapChange.phase).toBe("ready-for-product-confirmation");
    expect(roadmapChange.roadmapHistory.at(-1)?.change).toBe("roadmap-update");

    const deferralRoot = await confirmedWorkspace();
    const blockingChange = engine.applyUpdate(deferralRoot, {
      product: {
        deferrals: [{
          topic: "success",
          question: "How will success be recognized?",
          why: "The agreed measure is no longer usable.",
          revisitWhen: "Product selects a replacement measure",
          blocking: true,
        }],
      },
      decisions: { success: { status: "deferred_blocking", note: "A new measure is required." } },
      nextActions,
    });
    expect(blockingChange.phase).toBe("blocked");
    expect(blockingChange.reviewedDraftVersion).toBeNull();
  });

  it("rejects Product confirmation of another responsibility", async () => {
    const root = await readyWorkspace();
    await engine.recordProductReview(root);
    await expect(engine.confirmProduct(root, ["product", "engineering"])).rejects.toThrow(
      "Product responsibility cannot confirm: engineering",
    );
  });

  it("rejects writes outside the workspace and protects temporary writes", async () => {
    const root = workspace();
    const outside = workspace();
    expect(() => resolveInsideWorkspace(root, "../escape.md")).toThrow("escapes the target workspace");
    symlinkSync(outside, join(root, "outside"));
    expect(() => writeInsideWorkspace(root, "outside/escape.md", "nope")).toThrow("outside the target workspace");
    await expect(engine.initialize(sourceRoot, "Loopy itself")).rejects.toThrow(
      "Loopy source cannot be initialized as its own Human project",
    );

    const victim = join(outside, "victim.md");
    writeFileSync(victim, "keep me\n", "utf8");
    symlinkSync(victim, join(root, "safe.md.loopy-tmp"));
    writeInsideWorkspace(root, "safe.md", "safe\n");
    expect(readFileSync(victim, "utf8")).toBe("keep me\n");
    mkdirSync(join(root, "occupied"));
    expect(() => writeInsideWorkspace(root, "occupied", "nope")).toThrow();
    expect(readdirSync(root).filter((name) => name.startsWith(".occupied.loopy-tmp-"))).toEqual([]);
  });

  it("keeps the prior file generation when canonical-state staging fails", async () => {
    const root = await confirmedWorkspace();
    const paths = [
      "LOOPY.md",
      "docs/loopy/Project-Definition.md",
      "docs/loopy/Roadmap.md",
      ".loopy/start-or-adopt/state.json",
    ];
    const before = Object.fromEntries(paths.map((path) => [path, readFileSync(join(root, path), "utf8")]));
    const replacements = paths.map((path) => [path, `replacement for ${path}\n`] as const);

    expect(() => writeFileSetInsideWorkspace(root, replacements, {
      beforeStage(relativePath) {
        if (relativePath === ".loopy/start-or-adopt/state.json") {
          throw new Error("simulated canonical-state stage failure");
        }
      },
    })).toThrow("simulated canonical-state stage failure");

    const after = Object.fromEntries(paths.map((path) => [path, readFileSync(join(root, path), "utf8")]));
    expect(after).toEqual(before);

    expect(() => writeFileSetInsideWorkspace(root, replacements, {
      beforeCommit(relativePath) {
        if (relativePath === ".loopy/start-or-adopt/state.json") {
          throw new Error("simulated canonical-state commit failure");
        }
      },
    })).toThrow("simulated canonical-state commit failure");
    expect(Object.fromEntries(paths.map((path) => [path, readFileSync(join(root, path), "utf8")])))
      .toEqual(before);

    const leftovers = readdirSync(root, { recursive: true }).map(String)
      .filter((path) => path.includes(".loopy-stage-") || path.includes(".loopy-backup-"));
    expect(leftovers).toEqual([]);
  });

  it("rejects tampering with a confirmed revision", async () => {
    const root = await confirmedWorkspace();
    engine.applyUpdate(root, {
      product: { outcome: "Administrators complete setup confidently with their teammates." },
      nextActions: [{
        participant: "Product",
        action: "Review the changed Product outcome",
        reason: "Confirmed Product meaning changed.",
      }],
    });
    await engine.recordProductReview(root);
    await engine.confirmProduct(root);
    const statePath = join(root, ".loopy/start-or-adopt/state.json");
    const state = JSON.parse(readFileSync(statePath, "utf8"));
    state.confirmedHistory[0].product.purpose = "Tampered history";
    writeFileSync(statePath, `${JSON.stringify(state)}\n`, "utf8");
    expect(() => engine.loadState(root)).toThrow("Product confirmation history content was changed");
  });

  it("rejects a coherent rewrite of current Roadmap and Roadmap history", async () => {
    const root = await confirmedWorkspace();
    engine.applyUpdate(root, {
      roadmap: { candidates: [candidate("Guided setup", "Highest")] },
      decisions: { roadmap_state: { status: "established" } },
    });
    const statePath = join(root, ".loopy/start-or-adopt/state.json");
    const state = JSON.parse(readFileSync(statePath, "utf8"));
    state.roadmap.candidates[0].title = "Rewritten candidate";
    state.roadmapHistory.at(-1).after.candidates[0].title = "Rewritten candidate";
    writeFileSync(statePath, `${JSON.stringify(state)}\n`, "utf8");
    expect(() => engine.loadState(root)).toThrow("Roadmap history content was changed");

    const anchorRoot = await confirmedWorkspace();
    engine.applyUpdate(anchorRoot, {
      roadmap: { candidates: [candidate("Invitation clarity", "High")] },
      decisions: { roadmap_state: { status: "established" } },
    });
    const anchorPath = join(anchorRoot, ".loopy/start-or-adopt/state.json");
    const anchorState = JSON.parse(readFileSync(anchorPath, "utf8"));
    anchorState.roadmapHistoryHead = "0".repeat(64);
    writeFileSync(anchorPath, `${JSON.stringify(anchorState)}\n`, "utf8");
    expect(() => engine.loadState(anchorRoot)).toThrow("Roadmap history head does not match");
  });

  it("keeps the Product responsibility receipt durable after confirmation", async () => {
    const root = await confirmedWorkspace();
    expect(() => engine.applyUpdate(root, { responsibilityConfirmations: [] } as never)).toThrow(
      "update contains unknown properties: responsibilityConfirmations",
    );
    expect(engine.loadState(root).responsibilityConfirmations).toEqual(["product"]);

    const statePath = join(root, ".loopy/start-or-adopt/state.json");
    const state = JSON.parse(readFileSync(statePath, "utf8"));
    state.responsibilityConfirmations = [];
    writeFileSync(statePath, `${JSON.stringify(state)}\n`, "utf8");
    expect(() => engine.loadState(root)).toThrow("Confirmed Product meaning must match its latest revision");
  });

  it("rejects malformed persisted lifecycle enums", async () => {
    const mutate = async (change: (state: Record<string, any>) => void): Promise<string> => {
      const root = workspace();
      await engine.initialize(root, "Northstar", { participantResponsibilities: ["product"] });
      const statePath = join(root, ".loopy/start-or-adopt/state.json");
      const state = JSON.parse(readFileSync(statePath, "utf8"));
      change(state);
      writeFileSync(statePath, `${JSON.stringify(state)}\n`, "utf8");
      return root;
    };

    const invalidPhase = await mutate((state) => { state.phase = "approved-ish"; });
    expect(() => engine.loadState(invalidPhase)).toThrow("phase must be one of");

    const invalidResume = await mutate((state) => { state.session.resumeTopic = "technical_setup"; });
    expect(() => engine.loadState(invalidResume)).toThrow("session.resumeTopic must be one of");

    const invalidMilestone = await mutate((state) => {
      state.roadmap.milestones = [{
        title: "Setup",
        state: "Nearly done",
        outcome: "Setup works",
        nextAction: "Finish",
      }];
    });
    expect(() => engine.loadState(invalidMilestone)).toThrow("roadmap.milestones[0].state must be one of");
  });

  it("detects stale human-facing artifacts and metadata", async () => {
    const root = await confirmedWorkspace();
    expect(await engine.detectStaleViews(root)).toEqual([]);
    writeFileSync(join(root, "LOOPY.md"), "stale\n", "utf8");
    expect(await engine.detectStaleViews(root)).toEqual(["LOOPY.md"]);
  });

  it("requires exactly one next action", async () => {
    const root = workspace();
    await engine.initialize(root, "Northstar", { participantResponsibilities: ["product"] });
    expect(() => engine.applyUpdate(root, { nextActions: [] })).toThrow(
      "LOOPY.md requires exactly one next action",
    );
    expect(() => engine.applyUpdate(root, {
      nextActions: [{ participant: "Product", action: " ", reason: "Required coverage remains." }],
    })).toThrow("nextActions[0].action must not be empty");
    expect(() => engine.applyUpdate(root, { unexpected: "ignored before correction" } as never)).toThrow(
      "update contains unknown properties: unexpected",
    );
  });

  it("rejects punctuation-only next-action fields", async () => {
    const root = workspace();
    await engine.initialize(root, "Northstar", { participantResponsibilities: ["product"] });
    for (const field of ["participant", "action", "reason"] as const) {
      const nextAction = {
        participant: "Product",
        action: "Review direction",
        reason: "Coverage is ready",
        [field]: "...?!",
      };
      expect(() => engine.applyUpdate(root, { nextActions: [nextAction] }))
        .toThrow(`nextActions[0].${field} must contain letters or numbers`);
    }
  });

  it("exposes one canonical Loopy skill and keeps Start or Adopt internal", () => {
    const skills = readdirSync(join(sourceRoot, "skills/loopy"), { recursive: true })
      .filter((path: string | Buffer) => String(path).endsWith("SKILL.md"));
    expect(skills.map(String)).toEqual(["SKILL.md"]);
    const reference = readFileSync(join(sourceRoot, "skills/loopy/references/interviews/Product-Start.md"), "utf8");
    expect(reference).not.toMatch(/^---$/m);
    expect(reference).toContain("Never expose this route as a separate skill or command.");
  });

  it("keeps Product direction, domain learning, and Roadmap decomposition distinct", () => {
    const reference = readFileSync(join(sourceRoot, "skills/loopy/references/interviews/Product-Start.md"), "utf8");
    expect(reference).toContain("Product direction or vision");
    expect(reference).toContain("belongs in `Project-Definition.md`");
    expect(reference).toContain("Roadmap candidates");
    expect(reference).toContain("distinct possible outcome steps toward that direction");
    expect(reference).toContain("do not create a separate Vision artifact");
    expect(reference).toContain("concepts and terms, current workflow and decisions, evidence sources and their reliability");
    expect(reference).toContain("Do not turn Product Start into exhaustive requirements gathering or Engineering discovery");
    expect(reference).toContain("independently valuable outcomes, different horizons, dependencies, or separable decisions");
    expect(reference).toContain("combine, split, rename, reorder, or defer candidates");
    expect(reference).toContain("A single candidate must be an explicit, reviewable grouping rather than accidental compression");
    expect(reference).toContain("No fixed candidate count applies");
    expect(reference).toContain("whether Product agrees with the proposed grouping");

    const scenario = readFileSync(join(
      sourceRoot,
      "evaluation/scenarios/engineering-foundation/greenfield-human-walkthrough/Scenario.md",
    ), "utf8");
    expect(scenario).toContain("complex or unfamiliar Product domain");
    expect(scenario).toContain("scenario supplies no preferred interpretation, candidate titles, or candidate count");
    expect(scenario).toContain("rather than one accidental umbrella");
    expect(scenario).toContain("candidate titles or count");
    expect(scenario).not.toContain("Estate discovery and inventory");
    expect(scenario).not.toContain("Dependency and lineage confidence");
  });
});
