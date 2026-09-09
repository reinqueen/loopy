#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parseCliArguments } from "./cli-arguments.js";
import { EngineeringFoundationEngine } from "./engineering-engine.js";
import type { EngineeringFoundationUpdate } from "./engineering-types.js";
import { ProductStartEngine } from "./engine.js";
import type { ProductStartUpdate } from "./types.js";
import { LivingRoadmapEngine } from "./living-roadmap-engine.js";
import type { RoadmapOperation } from "./living-roadmap-types.js";
import { MilestoneDefinitionEngine } from "./milestone-definition-engine.js";
import type { DefinitionCommitRequest, DefinitionDraftRevalidation, DefinitionUpdate, DirectDefinitionStart } from "./milestone-definition-types.js";
import { ChangeManagementEngine } from "./change-management-engine.js";
import type { ChangeDecision, CreateMaterialChange, RoutineChangeRequest, UpdateMaterialChange } from "./change-management-types.js";
import { MilestonePlanningEngine } from "./milestone-planning-engine.js";
import type { GuideConfirmation, PlanningRevalidation, PlanningReview, PlanningUpdate } from "./milestone-planning-types.js";
import { MilestoneBuildEngine } from "./milestone-build-engine.js";
import type { BudgetAdjustment, BuildActivation, BuildRevalidation, BuildWorkUpdate, EvaluationInput, FreezeCandidateInput, TaskAssignmentInput } from "./milestone-build-types.js";
import { MilestoneDemoEngine } from "./milestone-demo-engine.js";
import type { DemoActivation, DemoAuthorization, DemoBlock, DemoDecision, DemoObservation, DemoResume } from "./milestone-demo-types.js";

async function main(): Promise<void> {
  const { command, options } = parseCliArguments(process.argv.slice(2));
  const sourceRoot = resolve(options["--source-root"] ?? process.cwd());
  const workspace = resolve(options["--workspace"]);
  if (command.startsWith("demo-")) {
    const engine = await MilestoneDemoEngine.create(sourceRoot);
    const input = async <T>() => JSON.parse(await readFile(resolve(options["--input"]), "utf8")) as T;
    switch (command) {
      case "demo-init": console.log(JSON.stringify(await engine.initialize(workspace, await input<DemoActivation>()), null, 2)); return;
      case "demo-activate": console.log(JSON.stringify(await engine.activate(workspace, await input<DemoActivation>()), null, 2)); return;
      case "demo-authorize": console.log(JSON.stringify(engine.authorize(workspace, await input<DemoAuthorization>()), null, 2)); return;
      case "demo-observe": console.log(JSON.stringify(engine.observe(workspace, await input<DemoObservation>()), null, 2)); return;
      case "demo-decide": console.log(JSON.stringify(engine.decide(workspace, await input<DemoDecision>()), null, 2)); return;
      case "demo-block": console.log(JSON.stringify(engine.block(workspace, await input<DemoBlock>()), null, 2)); return;
      case "demo-render": console.log(JSON.stringify(engine.renderCurrent(workspace), null, 2)); return;
      case "demo-interrupt": console.log(JSON.stringify(engine.interrupt(workspace, options["--demo-id"], options["--resume-action"]), null, 2)); return;
      case "demo-resume": console.log(JSON.stringify(await engine.resume(workspace, await input<DemoResume>()), null, 2)); return;
      case "demo-stale": console.log(JSON.stringify({ stale: await engine.detectStaleViews(workspace) }, null, 2)); return;
      case "demo-status": console.log(JSON.stringify(engine.status(workspace), null, 2)); return;
    }
  }
  if (command.startsWith("build-")) {
    const engine = await MilestoneBuildEngine.create(sourceRoot);
    const input = async <T>() => JSON.parse(await readFile(resolve(options["--input"]), "utf8")) as T;
    switch (command) {
      case "build-init": console.log(JSON.stringify(engine.initialize(workspace, await input<BuildActivation>()), null, 2)); return;
      case "build-activate": console.log(JSON.stringify(engine.activate(workspace, await input<BuildActivation>()), null, 2)); return;
      case "build-assign": console.log(JSON.stringify(engine.assignTask(workspace, await input<TaskAssignmentInput>()), null, 2)); return;
      case "build-work": console.log(JSON.stringify(engine.recordWork(workspace, await input<BuildWorkUpdate>()), null, 2)); return;
      case "build-freeze": console.log(JSON.stringify(engine.freezeCandidate(workspace, await input<FreezeCandidateInput>()), null, 2)); return;
      case "build-evaluate": console.log(JSON.stringify(engine.recordEvaluation(workspace, await input<EvaluationInput>()), null, 2)); return;
      case "build-adjust-budget": console.log(JSON.stringify(engine.adjustBudget(workspace, await input<BudgetAdjustment>()), null, 2)); return;
      case "build-revalidate": console.log(JSON.stringify(engine.revalidate(workspace, await input<BuildRevalidation>()), null, 2)); return;
      case "build-render": console.log(JSON.stringify(engine.renderCurrent(workspace), null, 2)); return;
      case "build-interrupt": console.log(JSON.stringify(engine.interrupt(workspace, options["--build-id"], options["--resume-action"]), null, 2)); return;
      case "build-resume": console.log(JSON.stringify(await engine.resume(workspace, await input<{ sourceFingerprint: string; workspaceFingerprint: string }>()), null, 2)); return;
      case "build-stale": console.log(JSON.stringify({ stale: await engine.detectStaleViews(workspace) }, null, 2)); return;
      case "build-status": console.log(JSON.stringify(engine.status(workspace), null, 2)); return;
    }
  }
  if (command.startsWith("planning-")) {
    const engine = await MilestonePlanningEngine.create(sourceRoot);
    switch (command) {
      case "planning-init": console.log(JSON.stringify(engine.initialize(workspace, JSON.parse(await readFile(resolve(options["--input"]), "utf8")) as string[]), null, 2)); return;
      case "planning-apply": console.log(JSON.stringify(engine.applyUpdate(workspace, JSON.parse(await readFile(resolve(options["--input"]), "utf8")) as PlanningUpdate), null, 2)); return;
      case "planning-review": console.log(JSON.stringify(engine.review(workspace, JSON.parse(await readFile(resolve(options["--input"]), "utf8")) as PlanningReview), null, 2)); return;
      case "planning-confirm-guides": console.log(JSON.stringify(engine.confirmGuides(workspace, JSON.parse(await readFile(resolve(options["--input"]), "utf8")) as GuideConfirmation[]), null, 2)); return;
      case "planning-revalidate": console.log(JSON.stringify(engine.revalidateFoundations(workspace, JSON.parse(await readFile(resolve(options["--input"]), "utf8")) as PlanningRevalidation), null, 2)); return;
      case "planning-render": console.log(JSON.stringify(engine.renderCurrent(workspace), null, 2)); return;
      case "planning-interrupt": console.log(JSON.stringify(engine.interrupt(workspace, options["--plan-id"], options["--resume-action"]), null, 2)); return;
      case "planning-resume": console.log(JSON.stringify(await engine.resume(workspace), null, 2)); return;
      case "planning-stale": console.log(JSON.stringify({ stale: await engine.detectStaleViews(workspace) }, null, 2)); return;
      case "planning-status": console.log(JSON.stringify(engine.status(workspace), null, 2)); return;
    }
  }
  if (command.startsWith("change-")) {
    const engine = await ChangeManagementEngine.create(sourceRoot);
    switch (command) {
      case "change-init": console.log(JSON.stringify(engine.initialize(workspace), null, 2)); return;
      case "change-propose": console.log(JSON.stringify(engine.propose(workspace, JSON.parse(await readFile(resolve(options["--input"]), "utf8")) as CreateMaterialChange), null, 2)); return;
      case "change-update": console.log(JSON.stringify(engine.update(workspace, JSON.parse(await readFile(resolve(options["--input"]), "utf8")) as UpdateMaterialChange), null, 2)); return;
      case "change-review": console.log(JSON.stringify(engine.review(workspace, options["--change-id"]), null, 2)); return;
      case "change-decide": console.log(JSON.stringify(engine.decide(workspace, JSON.parse(await readFile(resolve(options["--input"]), "utf8")) as ChangeDecision), null, 2)); return;
      case "change-routine": console.log(JSON.stringify(engine.applyRoutine(workspace, JSON.parse(await readFile(resolve(options["--input"]), "utf8")) as RoutineChangeRequest), null, 2)); return;
      case "change-render": console.log(JSON.stringify(engine.renderCurrent(workspace), null, 2)); return;
      case "change-interrupt": console.log(JSON.stringify(engine.interrupt(workspace, options["--change-id"], options["--resume-action"]), null, 2)); return;
      case "change-resume": console.log(JSON.stringify(await engine.resume(workspace), null, 2)); return;
      case "change-stale": console.log(JSON.stringify({ stale: await engine.detectStaleViews(workspace) }, null, 2)); return;
      case "change-status": console.log(JSON.stringify(engine.status(workspace), null, 2)); return;
    }
  }
  if (command.startsWith("definition-")) {
    const engine = await MilestoneDefinitionEngine.create(sourceRoot);
    switch (command) {
      case "definition-init": {
        const state = options["--input"]
          ? await engine.initializeDirect(workspace, JSON.parse(await readFile(resolve(options["--input"]), "utf8")) as DirectDefinitionStart)
          : engine.initialize(workspace);
        console.log(JSON.stringify(state, null, 2)); return;
      }
      case "definition-apply": {
        const update = JSON.parse(await readFile(resolve(options["--input"]), "utf8")) as DefinitionUpdate;
        console.log(JSON.stringify(engine.applyUpdate(workspace, update), null, 2)); return;
      }
      case "definition-revalidate": {
        const request = JSON.parse(await readFile(resolve(options["--input"]), "utf8")) as DefinitionDraftRevalidation;
        console.log(JSON.stringify(engine.revalidateDraft(workspace, request), null, 2)); return;
      }
      case "definition-review": {
        const ids = JSON.parse(await readFile(resolve(options["--input"]), "utf8")) as string[];
        console.log(JSON.stringify(engine.review(workspace, ids), null, 2)); return;
      }
      case "definition-confirm": {
        const requests = JSON.parse(await readFile(resolve(options["--input"]), "utf8")) as DefinitionCommitRequest[];
        console.log(JSON.stringify(engine.confirm(workspace, requests), null, 2)); return;
      }
      case "definition-render": console.log(JSON.stringify(engine.renderCurrent(workspace), null, 2)); return;
      case "definition-interrupt": console.log(JSON.stringify(engine.interrupt(workspace, options["--resume-action"]), null, 2)); return;
      case "definition-resume": console.log(JSON.stringify(await engine.resume(workspace), null, 2)); return;
      case "definition-stale": console.log(JSON.stringify({ stale: await engine.detectStaleViews(workspace) }, null, 2)); return;
      case "definition-status": console.log(JSON.stringify(engine.status(workspace), null, 2)); return;
    }
  }
  if (command.startsWith("roadmap-")) {
    const engine = await LivingRoadmapEngine.create(sourceRoot);
    switch (command) {
      case "roadmap-init": console.log(JSON.stringify(engine.initialize(workspace), null, 2)); return;
      case "roadmap-apply": {
        const operation = JSON.parse(await readFile(resolve(options["--input"]), "utf8")) as RoadmapOperation;
        console.log(JSON.stringify(engine.applyOperation(workspace, operation), null, 2)); return;
      }
      case "roadmap-render": console.log(JSON.stringify(engine.renderCurrent(workspace), null, 2)); return;
      case "roadmap-interrupt": console.log(JSON.stringify(engine.interrupt(workspace, options["--resume-action"]), null, 2)); return;
      case "roadmap-resume": console.log(JSON.stringify(await engine.resume(workspace), null, 2)); return;
      case "roadmap-stale": console.log(JSON.stringify({ stale: await engine.detectStaleViews(workspace) }, null, 2)); return;
      case "roadmap-status": console.log(JSON.stringify(engine.loadState(workspace), null, 2)); return;
    }
  }
  if (command.startsWith("engineering-")) {
    const engine = await EngineeringFoundationEngine.create(sourceRoot);
    switch (command) {
      case "engineering-init": {
        const responsibilities = (options["--responsibilities"] ?? "").split(",").filter(Boolean);
        console.log(JSON.stringify(engine.initialize(workspace, { participantResponsibilities: responsibilities }), null, 2));
        return;
      }
      case "engineering-apply": {
        const update = JSON.parse(await readFile(resolve(options["--input"]), "utf8")) as EngineeringFoundationUpdate;
        console.log(JSON.stringify(engine.applyUpdate(workspace, update), null, 2));
        return;
      }
      case "engineering-review":
        console.log(JSON.stringify(engine.recordReview(workspace), null, 2));
        return;
      case "engineering-confirm": {
        const responsibilities = (options["--responsibilities"] ?? "engineering").split(",");
        console.log(JSON.stringify(engine.confirm(workspace, responsibilities), null, 2));
        return;
      }
      case "engineering-render":
        console.log(JSON.stringify(engine.renderCurrent(workspace), null, 2));
        return;
      case "engineering-interrupt":
        console.log(JSON.stringify(engine.interrupt(workspace), null, 2));
        return;
      case "engineering-resume":
        console.log(JSON.stringify(engine.resume(workspace), null, 2));
        return;
      case "engineering-stale":
        console.log(JSON.stringify({ stale: await engine.detectStaleViews(workspace) }, null, 2));
        return;
      case "engineering-status":
        console.log(JSON.stringify(engine.loadState(workspace), null, 2));
        return;
    }
  }

  const engine = await ProductStartEngine.create(sourceRoot);

  switch (command) {
    case "init": {
      const responsibilities = (options["--responsibilities"] ?? "")
        .split(",")
        .filter(Boolean);
      const state = await engine.initialize(
        workspace,
        options["--project-name"],
        { participantResponsibilities: responsibilities },
      );
      console.log(JSON.stringify(state, null, 2));
      return;
    }
    case "apply": {
      const input = options["--input"];
      const update = JSON.parse(await readFile(resolve(input), "utf8")) as ProductStartUpdate;
      console.log(JSON.stringify(engine.applyUpdate(workspace, update), null, 2));
      return;
    }
    case "confirm": {
      const responsibilities = (options["--responsibilities"] ?? "product").split(",");
      console.log(JSON.stringify(await engine.confirmProduct(workspace, responsibilities), null, 2));
      return;
    }
    case "review":
      console.log(JSON.stringify(await engine.recordProductReview(workspace), null, 2));
      return;
    case "render":
      console.log(JSON.stringify(await engine.renderCurrent(workspace), null, 2));
      return;
    case "interrupt":
      console.log(JSON.stringify(await engine.interrupt(workspace), null, 2));
      return;
    case "resume":
      console.log(JSON.stringify(await engine.resume(workspace), null, 2));
      return;
    case "stale":
      console.log(JSON.stringify({ stale: await engine.detectStaleViews(workspace) }, null, 2));
      return;
    case "status":
      console.log(JSON.stringify(engine.loadState(workspace), null, 2));
      return;
    default:
      throw new Error(
        "Use an internal Engine operation: init, apply, review, confirm, render, interrupt, resume, stale, or status.",
      );
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
