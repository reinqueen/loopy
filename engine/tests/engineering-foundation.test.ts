import {
  cpSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { parse } from "yaml";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { parseCliArguments } from "../src/cli-arguments.js";
import { ENGINEERING_STATE_PATH, EngineeringFoundationEngine } from "../src/engineering-engine.js";
import type { EngineeringFoundationUpdate } from "../src/engineering-types.js";
import { ProductStartEngine } from "../src/engine.js";
import type { ProductStartUpdate } from "../src/types.js";

const sourceRoot = resolve(import.meta.dirname, "../..");
const fixture = join(sourceRoot, "evaluation/scenarios/product-start/large-mixed-project/fixture");
const productSetup = join(sourceRoot, "evaluation/scenarios/product-start/large-mixed-project/setup/v1/product-update.json");
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

function workspace(prefix = "loopy-engineering-"): string {
  const path = mkdtempSync(join(tmpdir(), prefix));
  workspaces.push(path);
  return path;
}

async function harborProduct(): Promise<string> {
  const root = workspace();
  cpSync(fixture, root, { recursive: true });
  await productEngine.initialize(root, "Harbor", { participantResponsibilities: ["product"] });
  const update = JSON.parse(readFileSync(productSetup, "utf8")) as ProductStartUpdate;
  expect(productEngine.applyUpdate(root, update).phase).toBe("ready-for-product-confirmation");
  await productEngine.recordProductReview(root);
  await productEngine.confirmProduct(root);
  return root;
}

function documentedUpdates(): EngineeringFoundationUpdate[] {
  const reference = readFileSync(join(sourceRoot, "skills/loopy/references/engine/Engineering-Foundation-Apply.md"), "utf8");
  return [...reference.matchAll(/<!-- engineering-apply-example -->\n```json\n([\s\S]*?)\n```/g)]
    .map((match) => JSON.parse(match[1]) as EngineeringFoundationUpdate);
}

async function readyEngineering(): Promise<string> {
  const root = await harborProduct();
  engineeringEngine.initialize(root, { participantResponsibilities: ["engineering"] });
  for (const update of documentedUpdates()) engineeringEngine.applyUpdate(root, update);
  expect(engineeringEngine.loadState(root).phase).toBe("ready-for-engineering-confirmation");
  return root;
}

async function confirmedEngineering(): Promise<string> {
  const root = await readyEngineering();
  engineeringEngine.recordReview(root);
  engineeringEngine.confirm(root);
  return root;
}

function trackedFiles(root: string): Record<string, string> {
  const paths = [
    ".loopy/start-or-adopt/state.json", ENGINEERING_STATE_PATH, "LOOPY.md",
    "docs/loopy/Project-Definition.md", "docs/loopy/Roadmap.md", "docs/loopy/Engineering-Guide.md",
  ];
  return Object.fromEntries(paths.map((path) => [path, readFileSync(join(root, path), "utf8")]));
}

describe("Establish project guide — Engineering foundation", () => {
  it("keeps the versioned Harbor Product setup and internal Engineering examples executable", async () => {
    const root = await harborProduct();
    expect(productEngine.loadState(root).phase).toBe("product-foundation-confirmed");
    expect(productEngine.loadState(root).roadmap.candidates.map((item) => item.title)).toEqual([
      "Customer recovery", "Partner status", "Operational risk",
    ]);
    expect(documentedUpdates()).toHaveLength(2);

    engineeringEngine.initialize(root, { participantResponsibilities: ["engineering"] });
    let state = engineeringEngine.loadState(root);
    for (const update of documentedUpdates()) state = engineeringEngine.applyUpdate(root, update);
    expect(state.phase).toBe("ready-for-engineering-confirmation");
    expect(state.contextGrants.map((item) => item.scope)).toEqual([
      "components/customer-portal", "components/rest-api", "docs/dependencies.md",
    ]);
    expect(state.engineering.commands[0].confidence).toBe("proposed-unverified");
  });

  it("requires confirmed Product state and refuses reinitialization without mutation", async () => {
    const unconfirmed = workspace();
    await productEngine.initialize(unconfirmed, "Draft", { participantResponsibilities: ["product"] });
    expect(() => engineeringEngine.initialize(unconfirmed, { participantResponsibilities: ["engineering"] }))
      .toThrow("confirmed Product foundation is required");
    expect(existsSync(join(unconfirmed, ENGINEERING_STATE_PATH))).toBe(false);

    const root = await harborProduct();
    engineeringEngine.initialize(root, { participantResponsibilities: ["engineering"] });
    const before = trackedFiles(root);
    expect(() => engineeringEngine.initialize(root, { participantResponsibilities: ["engineering"] }))
      .toThrow("already exists");
    expect(trackedFiles(root)).toEqual(before);
  });

  it("strictly validates initialization and update input before mutation", async () => {
    const root = await harborProduct();
    expect(() => engineeringEngine.initialize(root, { unknown: true } as never)).toThrow("unknown properties");
    expect(existsSync(join(root, ENGINEERING_STATE_PATH))).toBe(false);
    engineeringEngine.initialize(root, { participantResponsibilities: ["engineering"] });
    const before = trackedFiles(root);
    expect(() => engineeringEngine.applyUpdate(root, { invented: true } as never)).toThrow("unknown properties");
    expect(() => engineeringEngine.applyUpdate(root, { engineering: { mystery: [] } } as never)).toThrow("unknown properties");
    expect(trackedFiles(root)).toEqual(before);
  });

  it("preserves confirmed Product meaning and gives Engineering its own grants and views", async () => {
    const root = await harborProduct();
    const productState = productEngine.loadState(root);
    const definition = readFileSync(join(root, "docs/loopy/Project-Definition.md"), "utf8");
    const state = engineeringEngine.initialize(root, { participantResponsibilities: ["engineering"] });

    expect(state.contextGrants).toEqual([]);
    expect(productEngine.loadState(root)).toEqual(expect.objectContaining({
      revision: productState.revision,
      draftVersion: productState.draftVersion,
      product: productState.product,
      roadmap: productState.roadmap,
      confirmedHistory: productState.confirmedHistory,
    }));
    expect(readFileSync(join(root, "docs/loopy/Project-Definition.md"), "utf8")).toBe(definition);
    expect(readFileSync(join(root, "LOOPY.md"), "utf8")).toContain("| Engineering | Draft — [Engineering Guide](docs/loopy/Engineering-Guide.md) |");
    expect(readFileSync(join(root, "docs/loopy/Roadmap.md"), "utf8")).toContain("## Engineering foundation");
    expect(readFileSync(join(root, "docs/loopy/Engineering-Guide.md"), "utf8")).toContain("No project context has been authorized for Engineering inspection.");
  });

  it("enforces Engineering grants, canonical scopes, and evidence attribution", async () => {
    const root = await harborProduct();
    engineeringEngine.initialize(root, { participantResponsibilities: ["engineering"] });
    const before = trackedFiles(root);
    expect(() => engineeringEngine.applyUpdate(root, {
      contextGrants: [{ scope: "../outside", kind: "workspace-path", basis: "selected" }],
    })).toThrow("escapes the target workspace");
    expect(trackedFiles(root)).toEqual(before);

    expect(() => engineeringEngine.applyUpdate(root, {
      engineering: { evidence: [{ source: "API", finding: "A claim", contextScope: "components/rest-api" }] },
    })).toThrow("outside the authorized Engineering context");

    expect(() => engineeringEngine.applyUpdate(root, {
      contextGrants: [
        { scope: "components/rest-api", kind: "workspace-path", basis: "selected" },
        { scope: "components/rest-api/.", kind: "workspace-path", basis: "selected" },
      ],
    })).toThrow("same canonical scope");
  });

  it("protects against repository-equivalent and escaping symlink grants", async () => {
    const root = await harborProduct();
    engineeringEngine.initialize(root, { participantResponsibilities: ["engineering"] });
    symlinkSync(".", join(root, "self"));
    expect(() => engineeringEngine.applyUpdate(root, {
      contextGrants: [{ scope: "self", kind: "workspace-path", basis: "selected" }],
    })).toThrow("whole-repository grant");
    const outside = workspace("loopy-engineering-outside-");
    symlinkSync(outside, join(root, "outside-link"));
    expect(() => engineeringEngine.applyUpdate(root, {
      contextGrants: [{ scope: "outside-link", kind: "workspace-path", basis: "selected" }],
    })).toThrow("outside the target workspace");
  });

  it("renders defaults once and component-specific exceptions", async () => {
    const root = await readyEngineering();
    const guide = readFileSync(join(root, "docs/loopy/Engineering-Guide.md"), "utf8");
    expect(guide).toContain("Components inherit these defaults unless an exception is shown below.");
    expect(guide).toContain("**REST API**");
    expect(guide).toContain("Partner compatibility remains undefined.");
    expect(guide.match(/## Project-wide defaults/g)).toHaveLength(1);
    expect(guide).not.toContain("{{");
    expect(engineeringEngine.loadState(root).generatedViews["docs/loopy/Engineering-Guide.md"].sha256)
      .toBe("e0c7a885e5186872d1e2290d56da8996688dfbb7ece7b33c79490fe0c8cdd6fb");
  });

  it("prevents command confidence from implying unobserved execution", async () => {
    const root = await readyEngineering();
    const before = trackedFiles(root);
    expect(() => engineeringEngine.applyUpdate(root, {
      engineering: { commands: [{ purpose: "test" as never, command: "pnpm test", scope: "Project", confidence: "observed" }] },
    })).toThrow("purpose must be one of");
    expect(() => engineeringEngine.applyUpdate(root, {
      engineering: { commands: [{ purpose: "unit-test", command: "pnpm test", scope: "Project", confidence: "observed" }] },
    })).toThrow("requires an attributed source");
    expect(() => engineeringEngine.applyUpdate(root, {
      engineering: { commands: [{ purpose: "build", command: "pnpm build", scope: "Project", confidence: "confirmed" }] },
    })).toThrow("executionEvidence must be an object");
    expect(() => engineeringEngine.applyUpdate(root, {
      engineering: { commands: [{
        purpose: "build", command: "pnpm build", scope: "Project", confidence: "confirmed",
        executionEvidence: { exactCommand: "npm build", observedResult: "exit 0", environment: "local" },
      }] },
    })).toThrow("must match its exact execution evidence");
    expect(trackedFiles(root)).toEqual(before);

    const confirmed = engineeringEngine.applyUpdate(root, {
      engineering: { commands: [{
        purpose: "build", command: "pnpm build", scope: "Project", confidence: "confirmed",
        executionEvidence: { exactCommand: "pnpm build", observedResult: "exit 0", environment: "disposable workspace" },
      }] },
    });
    expect(confirmed.engineering.commands[0].confidence).toBe("confirmed");
    expect(readFileSync(join(root, "docs/loopy/Engineering-Guide.md"), "utf8")).toContain("Executed in disposable workspace: exit 0");
  });

  it("records conditional guide triggers without granting their authority", async () => {
    const root = await readyEngineering();
    const invalidTriggers = structuredClone(engineeringEngine.loadState(root).engineering.triggers);
    invalidTriggers[0].nextResponsibility = "Product";
    expect(() => engineeringEngine.applyUpdate(root, { engineering: { triggers: invalidTriggers } }))
      .toThrow("must route to Architecture responsibility");
    engineeringEngine.recordReview(root);
    const confirmed = engineeringEngine.confirm(root);
    expect(confirmed.nextActions[0].participant).toBe("Architecture");
    expect(confirmed.responsibilityConfirmations).toEqual(["engineering"]);
    const guide = readFileSync(join(root, "docs/loopy/Engineering-Guide.md"), "utf8");
    expect(guide).toContain("| architecture | Triggered |");
    expect(guide).toContain("| release-strategy | Triggered |");
    expect(guide).toContain("Product meaning, Architecture, Demo acceptance, Release authorization");
    const home = readFileSync(join(root, "LOOPY.md"), "utf8");
    expect(home).toContain("| Architecture | Triggered | Architecture: Shared status interfaces need durable explanation. |");
    expect(home).toContain("| Release | Triggered | Release: API compatibility rules will affect independent delivery. |");
    expect(existsSync(join(root, "docs/loopy/Architecture.md"))).toBe(false);
    expect(existsSync(join(root, "docs/loopy/Demo-Strategy.md"))).toBe(false);
    expect(existsSync(join(root, "docs/loopy/Release-Strategy.md"))).toBe(false);
    expect(await productEngine.detectStaleViews(root)).toEqual([]);
  });

  it("keeps composite Engineering views synchronized after a Product no-op", async () => {
    const root = await confirmedEngineering();
    const beforeGuide = readFileSync(join(root, "docs/loopy/Engineering-Guide.md"), "utf8");

    productEngine.applyUpdate(root, {});

    expect(readFileSync(join(root, "LOOPY.md"), "utf8")).toContain(
      "| Engineering | Engineering foundation confirmed — [Engineering Guide](docs/loopy/Engineering-Guide.md) |",
    );
    expect(readFileSync(join(root, "docs/loopy/Roadmap.md"), "utf8")).toContain("## Engineering foundation");
    expect(readFileSync(join(root, "docs/loopy/Engineering-Guide.md"), "utf8")).toBe(beforeGuide);
    expect(await productEngine.detectStaleViews(root)).toEqual([]);
    expect(await engineeringEngine.detectStaleViews(root)).toEqual([]);
  });

  it("renders never-confirmed, current, and reopened Engineering history truthfully", async () => {
    const engineeringChangeRoot = await harborProduct();
    engineeringEngine.initialize(engineeringChangeRoot, { participantResponsibilities: ["engineering"] });
    let guide = readFileSync(join(engineeringChangeRoot, "docs/loopy/Engineering-Guide.md"), "utf8");
    expect(guide).toContain("The Engineering foundation has not yet been confirmed.");
    expect(guide).not.toContain("was previously confirmed");

    for (const update of documentedUpdates()) engineeringEngine.applyUpdate(engineeringChangeRoot, update);
    engineeringEngine.recordReview(engineeringChangeRoot);
    engineeringEngine.confirm(engineeringChangeRoot);
    guide = readFileSync(join(engineeringChangeRoot, "docs/loopy/Engineering-Guide.md"), "utf8");
    expect(guide).toContain("Engineering foundation revision 1 is confirmed against Product revision 1.");

    engineeringEngine.applyUpdate(engineeringChangeRoot, {
      engineering: { summary: "Harbor Engineering meaning changed after its first confirmation." },
    });
    guide = readFileSync(join(engineeringChangeRoot, "docs/loopy/Engineering-Guide.md"), "utf8");
    expect(guide).toContain("Engineering foundation revision 1 was previously confirmed against Product revision 1.");
    expect(guide).toContain("Engineering guidance has since changed");
    expect(guide).not.toContain("has not yet been confirmed");
    expect(await productEngine.detectStaleViews(engineeringChangeRoot)).toEqual([]);
    expect(await engineeringEngine.detectStaleViews(engineeringChangeRoot)).toEqual([]);

    const productChangeRoot = await confirmedEngineering();
    productEngine.applyUpdate(productChangeRoot, {
      product: { summary: "Harbor Product meaning changed after Engineering confirmation." },
      nextActions: [{ participant: "Product", action: "Review the changed Product foundation", reason: "Product meaning changed." }],
    });
    await productEngine.recordProductReview(productChangeRoot);
    await productEngine.confirmProduct(productChangeRoot);
    guide = readFileSync(join(productChangeRoot, "docs/loopy/Engineering-Guide.md"), "utf8");
    expect(guide).toContain(
      "Engineering foundation revision 1 was confirmed against Product revision 1. Product is now revision 2, so Engineering review and confirmation are required before this guidance is current.",
    );
    expect(guide).not.toContain("has not yet been confirmed");
    expect(await productEngine.detectStaleViews(productChangeRoot)).toEqual([]);
    expect(await engineeringEngine.detectStaleViews(productChangeRoot)).toEqual([]);
  });

  it("keeps composite views synchronized for routine and material Product changes", async () => {
    const root = await confirmedEngineering();
    const product = productEngine.loadState(root);
    const candidates = structuredClone(product.roadmap.candidates);
    candidates[0].priority = "Later";
    candidates[1].priority = "Highest";

    const routine = productEngine.applyUpdate(root, { roadmap: { candidates } });
    expect(routine.phase).toBe("product-foundation-confirmed");
    expect(engineeringEngine.loadState(root).phase).toBe("engineering-foundation-confirmed");
    expect(readFileSync(join(root, "LOOPY.md"), "utf8")).toContain("Engineering foundation confirmed");
    expect(await productEngine.detectStaleViews(root)).toEqual([]);
    expect(await engineeringEngine.detectStaleViews(root)).toEqual([]);

    const reopenedProduct = productEngine.applyUpdate(root, {
      product: { summary: "Harbor now centers customer recovery and a revised partner promise." },
      nextActions: [{ participant: "Product", action: "Review the changed Product foundation", reason: "Product meaning changed." }],
    });
    expect(reopenedProduct.phase).toBe("ready-for-product-confirmation");
    expect(engineeringEngine.loadState(root)).toEqual(expect.objectContaining({
      phase: "engineering-foundation-confirmed",
      productRevision: 1,
    }));
    const reopenedHome = readFileSync(join(root, "LOOPY.md"), "utf8");
    expect(reopenedHome).toContain("Product confirmation needs review");
    expect(reopenedHome).toContain("**Product: Review the changed Product foundation**");
    expect(reopenedHome).toContain("[Engineering Guide](docs/loopy/Engineering-Guide.md)");
    expect(readFileSync(join(root, "docs/loopy/Engineering-Guide.md"), "utf8")).toContain(
      "remains confirmed against Product revision 1",
    );
    expect(await productEngine.detectStaleViews(root)).toEqual([]);
    expect(await engineeringEngine.detectStaleViews(root)).toEqual([]);

    await productEngine.recordProductReview(root);
    expect(await productEngine.detectStaleViews(root)).toEqual([]);
    expect(await engineeringEngine.detectStaleViews(root)).toEqual([]);
    await productEngine.confirmProduct(root);
    const engineeringRevisit = engineeringEngine.loadState(root);
    expect(engineeringRevisit).toEqual(expect.objectContaining({
      phase: "ready-for-engineering-confirmation",
      productRevision: 2,
      reviewedDraftVersion: null,
      responsibilityConfirmations: [],
    }));
    expect(engineeringRevisit.confirmedHistory).toHaveLength(1);
    expect(engineeringRevisit.nextActions[0].action).toBe("Review the Engineering foundation");
    expect(readFileSync(join(root, "LOOPY.md"), "utf8")).toContain("**Engineering: Review the Engineering foundation**");
    expect(await productEngine.detectStaleViews(root)).toEqual([]);
    expect(await engineeringEngine.detectStaleViews(root)).toEqual([]);

    engineeringEngine.recordReview(root);
    expect(await productEngine.detectStaleViews(root)).toEqual([]);
    expect(await engineeringEngine.detectStaleViews(root)).toEqual([]);
    const reconfirmed = engineeringEngine.confirm(root);
    expect(reconfirmed.confirmedHistory).toHaveLength(2);
    expect(reconfirmed.confirmedHistory[1].productRevision).toBe(2);
    expect(reconfirmed.nextActions[0].participant).toBe("Architecture");
    expect(await productEngine.detectStaleViews(root)).toEqual([]);
    expect(await engineeringEngine.detectStaleViews(root)).toEqual([]);
  });

  it("rejects caller-owned routing after Engineering confirmation without mutation", async () => {
    const root = await confirmedEngineering();
    const before = trackedFiles(root);

    expect(() => engineeringEngine.applyUpdate(root, {
      nextActions: [{
        participant: "Engineering",
        action: "Publish Harbor publicly",
        reason: "A caller tried to replace the triggered Architecture route.",
      }],
    })).toThrow("confirmed Engineering route is Engine-owned");

    expect(trackedFiles(root)).toEqual(before);
  });

  it("uses deterministic trigger precedence and a bounded no-trigger handoff", async () => {
    const triggeredRoot = await readyEngineering();
    const triggers = structuredClone(engineeringEngine.loadState(triggeredRoot).engineering.triggers);
    triggers[0] = { kind: "architecture", triggered: false, reason: "", nextResponsibility: "" };
    triggers[1] = { kind: "demo-strategy", triggered: true, reason: "Reusable browser proof is needed.", nextResponsibility: "Demo or quality" };
    engineeringEngine.applyUpdate(triggeredRoot, { engineering: { triggers } });
    engineeringEngine.recordReview(triggeredRoot);
    expect(engineeringEngine.confirm(triggeredRoot).nextActions[0]).toEqual({
      participant: "Demo or quality",
      action: "Establish the Demo or quality guide",
      reason: "Reusable browser proof is needed.",
    });

    const noTriggerRoot = await readyEngineering();
    const noTriggers = structuredClone(engineeringEngine.loadState(noTriggerRoot).engineering.triggers)
      .map((item) => ({ ...item, triggered: false, reason: "", nextResponsibility: "" }));
    engineeringEngine.applyUpdate(noTriggerRoot, { engineering: { triggers: noTriggers } });
    engineeringEngine.recordReview(noTriggerRoot);
    expect(engineeringEngine.confirm(noTriggerRoot).nextActions[0]).toEqual({
      participant: "Engineering",
      action: "Review the highest-priority candidate for feasibility",
      reason: "The Engineering foundation is confirmed; no Milestone has been committed.",
    });
    productEngine.applyUpdate(noTriggerRoot, {
      roadmap: { candidates: [] },
      decisions: { roadmap_state: { status: "explicitly_none" } },
    });
    expect(engineeringEngine.loadState(noTriggerRoot).nextActions[0]).toEqual({
      participant: "Product",
      action: "Add or select a Roadmap candidate when an outcome is ready",
      reason: "The Engineering foundation is confirmed, but no possible delivery outcome is recorded.",
    });
    expect(await productEngine.detectStaleViews(noTriggerRoot)).toEqual([]);
    expect(await engineeringEngine.detectStaleViews(noTriggerRoot)).toEqual([]);
  });

  it("requires Engineering-only responsibility and a current review", async () => {
    const root = await readyEngineering();
    expect(() => engineeringEngine.confirm(root)).toThrow("must be reviewed");
    engineeringEngine.recordReview(root);
    expect(() => engineeringEngine.confirm(root, ["product"])).toThrow("Only Engineering may confirm");
    expect(engineeringEngine.loadState(root).phase).toBe("ready-for-engineering-confirmation");
    expect(engineeringEngine.confirm(root, ["engineering"]).phase).toBe("engineering-foundation-confirmed");
  });

  it("blocks Engineering confirmation when the current Product foundation is no longer confirmed", async () => {
    const root = await readyEngineering();
    engineeringEngine.recordReview(root);
    productEngine.applyUpdate(root, {
      product: { summary: "Harbor Product meaning changed and needs fresh Product review." },
      nextActions: [{ participant: "Product", action: "Review the changed Product foundation", reason: "Product meaning changed." }],
    });
    expect(productEngine.loadState(root).phase).toBe("ready-for-product-confirmation");
    expect(() => engineeringEngine.confirm(root)).toThrow("Current Product confirmation is required");
    expect(engineeringEngine.loadState(root).phase).toBe("ready-for-engineering-confirmation");
  });

  it("keeps blocking deferrals blocked and accepts matching nonblocking deferrals", async () => {
    const root = await readyEngineering();
    const existingDeferrals = engineeringEngine.loadState(root).engineering.deferrals;
    const before = trackedFiles(root);
    expect(() => engineeringEngine.applyUpdate(root, {
      engineering: { deferrals: [{ topic: "relationships", question: "Which interface is stable?", consequence: "Sequencing is unsafe.", revisitWhen: "Owners meet.", blocking: true }] },
    })).toThrow("must match deferred_blocking");
    expect(trackedFiles(root)).toEqual(before);

    const blocked = engineeringEngine.applyUpdate(root, {
      engineering: { deferrals: [...existingDeferrals, { topic: "relationships", question: "Which interface is stable?", consequence: "Sequencing is unsafe.", revisitWhen: "Owners meet.", blocking: true }] },
      decisions: { relationships: { status: "deferred_blocking", note: "Interface owner is required." } },
      nextActions: [{ participant: "Engineering", action: "Resolve the shared interface", reason: "Delivery sequencing is blocked." }],
    });
    expect(blocked.phase).toBe("blocked");
    expect(() => engineeringEngine.recordReview(root)).toThrow("must be ready");
    expect(readFileSync(join(root, "LOOPY.md"), "utf8")).toContain("Engineering — Which interface is stable?");
  });

  it("preserves confirmation for evidence refresh and reopens only Engineering for material change", async () => {
    const root = await confirmedEngineering();
    const productBefore = productEngine.loadState(root);
    const confirmed = engineeringEngine.loadState(root);
    const refreshed = engineeringEngine.applyUpdate(root, {
      contextGrants: [...confirmed.contextGrants, { scope: "components/client-library", kind: "workspace-path", basis: "explicitly-authorized" }],
      engineering: { evidence: [...confirmed.engineering.evidence, { source: "Client README", finding: "The client follows API versions.", contextScope: "components/client-library" }] },
    });
    expect(refreshed.phase).toBe("engineering-foundation-confirmed");
    expect(refreshed.changeHistory.at(-1)?.kind).toBe("evidence-refresh");
    expect(refreshed.confirmedHistory).toHaveLength(1);

    const reopened = engineeringEngine.applyUpdate(root, {
      engineering: { summary: "Harbor Engineering now includes an explicit client compatibility boundary." },
    });
    expect(reopened.phase).toBe("ready-for-engineering-confirmation");
    expect(reopened.reviewedDraftVersion).toBeNull();
    expect(reopened.responsibilityConfirmations).toEqual([]);
    expect(productEngine.loadState(root).phase).toBe("product-foundation-confirmed");
    expect(productEngine.loadState(root)).toEqual(expect.objectContaining({
      revision: productBefore.revision,
      draftVersion: productBefore.draftVersion,
      product: productBefore.product,
      roadmap: productBefore.roadmap,
      confirmedHistory: productBefore.confirmedHistory,
    }));
    expect(() => engineeringEngine.confirm(root)).toThrow("must be reviewed");

    engineeringEngine.recordReview(root);
    const reconfirmed = engineeringEngine.confirm(root);
    expect(reconfirmed.confirmedHistory).toHaveLength(2);
    expect(reconfirmed.confirmedHistory[1].previousHash).toBe(reconfirmed.confirmedHistory[0].contentHash);
  });

  it("detects tampering in append-only confirmation and change history", async () => {
    const root = await confirmedEngineering();
    const path = join(root, ENGINEERING_STATE_PATH);
    const confirmationTamper = engineeringEngine.loadState(root);
    confirmationTamper.confirmedHistory[0].engineering.summary = "Rewritten";
    writeFileSync(path, `${JSON.stringify(confirmationTamper, null, 2)}\n`);
    expect(() => engineeringEngine.loadState(root)).toThrow("confirmation history integrity failed");

    const second = await confirmedEngineering();
    const secondPath = join(second, ENGINEERING_STATE_PATH);
    const changeTamper = engineeringEngine.loadState(second);
    changeTamper.changeHistory[0].snapshotHash = "0".repeat(64);
    writeFileSync(secondPath, `${JSON.stringify(changeTamper, null, 2)}\n`);
    expect(() => engineeringEngine.loadState(second)).toThrow("change history integrity failed");
  });

  it("rejects malformed persisted phases, resume topics, and erased confirmation receipts", async () => {
    const phaseRoot = await readyEngineering();
    const phasePath = join(phaseRoot, ENGINEERING_STATE_PATH);
    const badPhase = engineeringEngine.loadState(phaseRoot) as unknown as Record<string, unknown>;
    badPhase.phase = "approved";
    writeFileSync(phasePath, `${JSON.stringify(badPhase, null, 2)}\n`);
    expect(() => engineeringEngine.loadState(phaseRoot)).toThrow("phase must be one of");

    const resumeRoot = await readyEngineering();
    const resumePath = join(resumeRoot, ENGINEERING_STATE_PATH);
    const badResume = engineeringEngine.loadState(resumeRoot) as unknown as { session: { resumeTopic: string } };
    badResume.session.resumeTopic = "release";
    writeFileSync(resumePath, `${JSON.stringify(badResume, null, 2)}\n`);
    expect(() => engineeringEngine.loadState(resumeRoot)).toThrow("session.resumeTopic must be one of");

    const receiptRoot = await confirmedEngineering();
    const receiptPath = join(receiptRoot, ENGINEERING_STATE_PATH);
    const erased = engineeringEngine.loadState(receiptRoot);
    erased.responsibilityConfirmations = [];
    writeFileSync(receiptPath, `${JSON.stringify(erased, null, 2)}\n`);
    expect(() => engineeringEngine.loadState(receiptRoot)).toThrow("append-only receipt");
  });

  it("supports interruption and resumption from the next Engineering gap", async () => {
    const root = await harborProduct();
    engineeringEngine.initialize(root, { participantResponsibilities: ["engineering"] });
    const interrupted = engineeringEngine.interrupt(root);
    expect(interrupted.session).toEqual({ status: "interrupted", resumeTopic: "project_defaults" });
    const resumed = engineeringEngine.resume(root);
    expect(resumed.nextTopic).toBe("project_defaults");
    expect(resumed.state.session.status).toBe("active");
  });

  it("rejects invalid next actions without changing canonical or human files", async () => {
    const root = await readyEngineering();
    const before = trackedFiles(root);
    expect(() => engineeringEngine.applyUpdate(root, { nextActions: [] })).toThrow("exactly one next action");
    expect(() => engineeringEngine.applyUpdate(root, {
      nextActions: [{ participant: "---", action: "!!!", reason: "..." }],
    })).toThrow("letters or numbers");
    expect(() => engineeringEngine.applyUpdate(root, {
      nextActions: [{ participant: "Product", action: "Approve it", reason: "Wrong boundary" }],
    })).toThrow("must belong to Engineering");
    expect(trackedFiles(root)).toEqual(before);
  });

  it("detects stale deterministic views and restores them", async () => {
    const root = await confirmedEngineering();
    expect(await engineeringEngine.detectStaleViews(root)).toEqual([]);
    const guide = join(root, "docs/loopy/Engineering-Guide.md");
    writeFileSync(guide, "stale\n");
    expect(await engineeringEngine.detectStaleViews(root)).toEqual(["docs/loopy/Engineering-Guide.md"]);
    engineeringEngine.renderCurrent(root);
    expect(await engineeringEngine.detectStaleViews(root)).toEqual([]);
  });

  it("rolls back the whole Engineering file set when staging fails", async () => {
    const root = await readyEngineering();
    const before = trackedFiles(root);
    const failing = await EngineeringFoundationEngine.create(sourceRoot, {
      beforeStage: (path) => {
        if (path === ENGINEERING_STATE_PATH) throw new Error("forced Engineering state-stage failure");
      },
    });
    expect(() => failing.applyUpdate(root, {
      engineering: { summary: "This must not become visible." },
    })).toThrow("forced Engineering state-stage failure");
    expect(trackedFiles(root)).toEqual(before);
  });

  it("does not follow a generated-view symlink outside the workspace", async () => {
    const root = await readyEngineering();
    const outside = workspace("loopy-engineering-view-outside-");
    const outsideFile = join(outside, "outside.md");
    writeFileSync(outsideFile, "protected\n");
    const guide = join(root, "docs/loopy/Engineering-Guide.md");
    rmSync(guide);
    symlinkSync(outsideFile, guide);
    expect(() => engineeringEngine.renderCurrent(root)).toThrow("outside the target workspace");
    expect(readFileSync(outsideFile, "utf8")).toBe("protected\n");
  });

  it("parses every strict Engineering CLI operation with command-first ordering", () => {
    for (const command of ["engineering-review", "engineering-confirm", "engineering-render", "engineering-interrupt", "engineering-resume", "engineering-stale", "engineering-status"]) {
      expect(parseCliArguments([command, "--source-root", sourceRoot, "--workspace", "/tmp/project"]).command).toBe(command);
    }
    expect(parseCliArguments(["engineering-init", "--source-root", sourceRoot, "--workspace", "/tmp/project", "--responsibilities", "engineering"]).command).toBe("engineering-init");
    expect(parseCliArguments(["engineering-apply", "--source-root", sourceRoot, "--workspace", "/tmp/project", "--input", "/tmp/update.json"]).command).toBe("engineering-apply");
    expect(() => parseCliArguments(["--workspace", "/tmp/project", "engineering-status"])).toThrow("Unknown or missing command");
    expect(() => parseCliArguments(["engineering-status", "--workspace", "/tmp/project", "--input", "x"])).toThrow("Unknown option");
  });

  it("keeps the Engineering interview guidance active and the greenfield walkthrough answer-free", () => {
    const guidance = readFileSync(join(sourceRoot, "skills/loopy/references/interviews/Engineering-Foundation.md"), "utf8");
    expect(guidance).toContain("Authorized evidence seeds the conversation; it does not replace active Engineering participation.");
    expect(guidance).toContain("first ask what the Engineering participant knows or intends");
    expect(guidance).toContain("Label each recommendation as a **hypothesis**");
    expect(guidance).toContain("accept, change, reject, or defer each meaningful recommendation");
    expect(guidance).toContain("Should the Engineering Guide record follow-up work for Architecture, Demo/Quality, or Release?");
    expect(guidance).toContain("If the participant says “use all recommendations,” restate the concrete decisions");
    for (const heading of ["What you decided", "What came from evidence", "What remains deferred"]) {
      expect(guidance).toContain(`**${heading}**`);
    }

    const scenario = readFileSync(join(
      sourceRoot,
      "evaluation/scenarios/engineering-foundation/greenfield-human-walkthrough/Scenario.md",
    ), "utf8");
    expect(scenario).toContain("fresh, empty, disposable target workspace");
    expect(scenario).toContain("same single Loopy entry point");
    expect(scenario).toContain("supplies their own project meaning and technical choices");
    expect(scenario).toContain("prescribes neither project answers, exact wording, a minimum question count");
    expect(scenario).toContain("never infer that responsibility from Product participation");
  });

  it("registers Engineering Foundation as implemented-unverified", () => {
    const registry = parse(readFileSync(join(sourceRoot, "capabilities/registry.yaml"), "utf8")) as {
      capabilities: Array<{ id: string; status: string }>;
    };
    expect(registry.capabilities.find((item) => item.id === "engineering-foundation"))
      .toEqual(expect.objectContaining({ status: "implemented-unverified" }));
  });
});
