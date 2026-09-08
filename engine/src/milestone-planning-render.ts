import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { MilestoneDefinitionState } from "./milestone-definition-types.js";
import type {
  ConditionalGuide,
  MilestonePlan,
  MilestonePlanningArtifacts,
  MilestonePlanningState,
  ParallelClaim,
  PlanDependency,
} from "./milestone-planning-types.js";

function esc(value: string): string {
  return value.replaceAll("|", "\\|").replaceAll("\n", " ").trim();
}

function mapLabel(value: string): string {
  return value.replaceAll("`", "'").replaceAll("\n", " ").trim();
}

function bullets(values: string[], fallback: string): string {
  return values.length ? values.map((value) => `- ${value}`).join("\n") : fallback;
}

function sentence(value: string): string {
  return `${value.trim().replace(/[.!?]+$/u, "")}.`;
}

function replace(template: string, values: Record<string, string>): string {
  const rendered = template.replace(/{{([A-Za-z][A-Za-z0-9]*)}}/g, (_, key: string) => {
    if (!(key in values)) throw new Error(`Planning template value missing: ${key}.`);
    return values[key];
  });
  if (/{{[^}]+}}/.test(rendered)) throw new Error("Planning template contains unused instructions.");
  return `${rendered.trim()}\n`;
}

function unitOrder(plan: MilestonePlan, key: string): number {
  return plan.content.workUnits.find((unit) => unit.key === key)?.order ?? Number.MAX_SAFE_INTEGER;
}

function orderedDependencies(plan: MilestonePlan): PlanDependency[] {
  return [...plan.content.dependencies].sort((left, right) =>
    unitOrder(plan, left.from) - unitOrder(plan, right.from) ||
    unitOrder(plan, left.to) - unitOrder(plan, right.to) ||
    left.kind.localeCompare(right.kind) || left.note.localeCompare(right.note));
}

function orderedClaims(plan: MilestonePlan): ParallelClaim[] {
  return [...plan.content.parallelClaims].sort((left, right) => {
    const leftOrders = left.workUnits.map((key) => unitOrder(plan, key)).sort((a, b) => a - b);
    const rightOrders = right.workUnits.map((key) => unitOrder(plan, key)).sort((a, b) => a - b);
    for (let index = 0; index < Math.max(leftOrders.length, rightOrders.length); index += 1) {
      const difference = (leftOrders[index] ?? Number.MAX_SAFE_INTEGER) - (rightOrders[index] ?? Number.MAX_SAFE_INTEGER);
      if (difference) return difference;
    }
    return left.disposition.localeCompare(right.disposition) || left.basis.localeCompare(right.basis);
  });
}

function unitTitle(plan: MilestonePlan, key: string): string {
  return plan.content.workUnits.find((unit) => unit.key === key)?.title ?? key;
}

function orderedClaimKeys(plan: MilestonePlan, claim: ParallelClaim): string[] {
  return [...claim.workUnits].sort((left, right) => unitOrder(plan, left) - unitOrder(plan, right) || left.localeCompare(right));
}

function numberedUnit(plan: MilestonePlan, key: string): string {
  return `${unitOrder(plan, key)}. ${mapLabel(unitTitle(plan, key))}`;
}

function requiredFlow(plan: MilestonePlan, dependencies: PlanDependency[]): string[] {
  const required = dependencies.filter((dependency) => dependency.kind === "required-before");
  const sources = [...new Set(required.map((dependency) => dependency.from))]
    .sort((left, right) => unitOrder(plan, left) - unitOrder(plan, right) || left.localeCompare(right));
  return sources.flatMap((source, sourceIndex) => {
    const targets = required.filter((dependency) => dependency.from === source)
      .sort((left, right) => unitOrder(plan, left.to) - unitOrder(plan, right.to) || left.to.localeCompare(right.to));
    return [
      ...(sourceIndex ? [""] : []),
      numberedUnit(plan, source),
      ...targets.map((dependency, index) => `${index === targets.length - 1 ? "└─>" : "├─>"} ${numberedUnit(plan, dependency.to)}`),
    ];
  });
}

function dependencyMap(plan: MilestonePlan, dependencies: PlanDependency[], claims: ParallelClaim[]): string {
  const sections: string[][] = [];
  const required = requiredFlow(plan, dependencies);
  if (required.length) sections.push(["Must happen in order", ...required]);
  const safe = claims.filter((claim) => claim.disposition === "safe").map((claim) =>
    orderedClaimKeys(plan, claim).map((key) => numberedUnit(plan, key)).join(" + "));
  if (safe.length) sections.push(["Can happen in parallel", ...safe]);
  const blocked = claims.filter((claim) => claim.disposition === "blocked").map((claim) => {
    const units = orderedClaimKeys(plan, claim).map((key) => numberedUnit(plan, key)).join(" + ");
    const conflicts = claim.conflicts.length ? ` Conflicts: ${claim.conflicts.join(", ")}.` : "";
    return `${units} — ${sentence(claim.basis)}${conflicts}`;
  });
  if (blocked.length) sections.push(["Needs coordination", ...blocked]);
  if (!sections.length) return "";
  return ["## Delivery safety", "", "```text", ...sections.flatMap((section, index) => [...(index ? [""] : []), ...section]), "```"].join("\n");
}

function evaluationBoundaries(plan: MilestonePlan): string {
  const rows = plan.content.evaluationBoundaries.map((boundary) => {
    const workUnits = boundary.workUnits.length
      ? boundary.workUnits.map((key) => numberedUnit(plan, key)).join(", ")
      : "Plan-level trigger";
    const evaluationType = boundary.evaluationType === "focused-independent"
      ? "Focused independent"
      : "Final integrated independent";
    return `| ${esc(boundary.checkpoint)} | ${evaluationType} | ${esc(`${boundary.trigger} — ${workUnits}`)} | ${esc(boundary.reason)} | ${boundary.correctionCycleLimit} | ${boundary.required ? "Yes" : "No"} |`;
  });
  return [
    ...(rows.length ? [
      "| Boundary / checkpoint | Evaluation type | Trigger / Work Unit boundary | Reason / risk basis | Correction-cycle limit | Required |",
      "|---|---|---|---|---:|---|",
      ...rows,
    ] : ["No Build or evaluation boundary is recorded yet."]),
    "",
    "A **correction-cycle limit** is the maximum number of corrected new candidates allowed after an initial failed evaluation; every corrected candidate requires reevaluation. Zero allows no corrected candidate after that initial failure.",
  ].join("\n");
}

function planArtifact(
  template: string,
  plan: MilestonePlan,
  definition: MilestoneDefinitionState["definitions"][number],
  state: MilestonePlanningState,
): string {
  const orderedUnits = [...plan.content.workUnits].sort((left, right) => left.order - right.order || left.key.localeCompare(right.key));
  const dependencies = orderedDependencies(plan);
  const parallelClaims = orderedClaims(plan);
  const units = orderedUnits.length ? [
    "| Order | Work unit | Outcome contribution | Affected area | Responsibility | Completion observation | Workspace |",
    "|---|---|---|---|---|---|---|",
    ...orderedUnits.map((unit) => `| ${unit.order} | ${esc(unit.title)} | ${esc(unit.contribution)} | ${esc(unit.affectedAreas.join(", ") || "Not yet bounded")} | ${esc(unit.responsibility)} | ${esc(unit.completionObservation)} | ${unit.workspace.replaceAll("-", " ")} |`),
  ].join("\n") : "No work units recorded yet.";
  const dependencyTable = dependencies.length ? [
    "| From | Relationship | To | Meaning |",
    "|---|---|---|---|",
    ...dependencies.map((dependency) => `| ${esc(unitTitle(plan, dependency.from))} | ${dependency.kind.replaceAll("-", " ")} | ${esc(unitTitle(plan, dependency.to))} | ${esc(dependency.note)} |`),
  ].join("\n") : "No ordering dependency recorded; unrelated work is not implicitly serialized.";
  const claims = parallelClaims.map((claim) => `- **${claim.disposition === "safe" ? "Safe together" : "Parallel work blocked"}:** ${orderedClaimKeys(plan, claim).map((key) => unitTitle(plan, key)).join(" + ")} — ${sentence(claim.basis)}${claim.conflicts.length ? ` Conflicts: ${claim.conflicts.map((value) => value.trim().replace(/[.!?]+$/u, "")).join(", ")}.` : ""}`);
  const triggers = plan.guideTriggers.map((trigger) => `- **${trigger.kind.replaceAll("-", " ")}:** ${trigger.mode} — ${sentence(trigger.reason)} Revisit: ${sentence(trigger.revisitWhen)}`);
  const risks = [
    ...plan.content.risks.map((risk) => `- **Risk:** ${risk}`),
    ...plan.content.unknowns.map((unknown) => `- **${unknown.blocking ? "Blocking unknown" : "Unknown"}:** ${sentence(unknown.description)} Revisit: ${sentence(unknown.revisitWhen)}`),
  ];
  return replace(template, {
    title: plan.title,
    status: plan.phase.replaceAll("-", " "),
    planRevision: String(plan.revision),
    publishedRevision: String(state.revision),
    outcome: definition.content.outcome,
    definitionRevision: String(plan.definitionRevision),
    approach: bullets(plan.content.approach, "No delivery approach recorded yet."),
    workUnits: units,
    dependencyMap: dependencyMap(plan, dependencies, parallelClaims),
    dependencies: dependencyTable,
    parallelism: [
      `- **Plan workspace:** ${plan.workspaceDisposition.mode.replaceAll("-", " ")}${plan.workspaceDisposition.location ? ` — ${plan.workspaceDisposition.location}` : ""}. ${plan.workspaceDisposition.basis}`,
      ...plan.content.parallelism.map((value) => `- ${value}`),
      ...claims,
    ].join("\n"),
    checks: bullets(plan.content.checksAndEvidence, "No check or evidence approach recorded yet."),
    evaluationBoundaries: evaluationBoundaries(plan),
    risks: risks.length ? risks.join("\n") : "No risks, unknowns, or blockers recorded.",
    guides: [...triggers, ...plan.content.releaseImpact.map((value) => `- **Release impact:** ${value}`)].join("\n") || "No conditional guide or Release impact is currently recorded.",
    readiness: [
      `- **Host coherence:** ${plan.coherence.status}${plan.coherence.basis ? ` — ${plan.coherence.basis}` : ""}`,
      `- **Current review:** ${plan.reviewedRevision === plan.revision ? "Recorded" : "Needed"}`,
      ...plan.participants.map((participant) => `- **${participant.name}:** represents ${participant.responsibility}`),
    ].join("\n"),
  });
}

function guideArtifact(template: string, guide: ConditionalGuide, state: MilestonePlanningState): string {
  const title = guide.kind === "architecture" ? "Architecture" : guide.kind === "demo-strategy" ? "Demo Strategy" : "Release Strategy";
  const purpose = guide.kind === "architecture" ? "Reusable structural guidance needed across delivery work." : guide.kind === "demo-strategy" ? "Reusable proof and demonstration guidance needed across Milestones." : "Reusable packaging, compatibility, promotion, publication, and rollback guidance.";
  return replace(template, {
    title,
    status: guide.status,
    guideRevision: String(guide.revision),
    publishedRevision: String(state.revision),
    purpose,
    content: bullets(guide.content, "No durable guidance recorded yet."),
    confirmation: guide.receipt ? `Confirmed by ${guide.receipt.participant} representing ${guide.requiredPerspective} on guide revision ${guide.revision}.` : `${guide.requiredPerspective} confirmation is ${guide.status === "not-needed" ? "not currently needed" : "still required"}.`,
  });
}

export function renderMilestonePlanningArtifacts(
  base: Record<string, string>,
  state: MilestonePlanningState,
  definitions: MilestoneDefinitionState,
  templateRoot: string,
): MilestonePlanningArtifacts {
  const artifacts = { ...base };
  const plans = [...state.plans].sort((left, right) => left.order - right.order || left.id.localeCompare(right.id));
  const next = state.nextActions[0];
  const planTemplate = readFileSync(join(templateRoot, "docs/loopy/milestones/Plan.md"), "utf8");
  for (const plan of plans) {
    const definition = definitions.definitions.find((item) => item.id === plan.definitionId)!;
    artifacts[plan.artifactPath] = planArtifact(planTemplate, plan, definition, state);
  }
  const guideTemplate = readFileSync(join(templateRoot, "docs/loopy/Conditional-Guide.md"), "utf8");
  for (const guide of state.guides.filter((item) => item.status !== "not-needed")) artifacts[guide.artifactPath] = guideArtifact(guideTemplate, guide, state);
  const rows = plans.length ? [
    "| Milestone | Planning status | Plan | Workspace |",
    "|---|---|---|---|",
    ...plans.map((plan) => `| ${esc(plan.title)} | ${plan.phase.replaceAll("-", " ")} | [Plan](${plan.artifactPath.replace(/^docs\/loopy\//, "")}) | ${plan.workspaceDisposition.mode.replaceAll("-", " ")} |`),
  ].join("\n") : "No active Milestone Plans.";
  let roadmap = artifacts["docs/loopy/Roadmap.md"];
  roadmap = roadmap.replace(/## Product questions to revisit/, `## Milestone Planning\n\n*Published from Planning state revision ${state.revision}.*\n\n${rows}\n\nPlan readiness does not authorize implementation.\n\n## Product questions to revisit`);
  roadmap = roadmap.replace(/## Next action\n\n[\s\S]*?(?=\n## Selected for Milestone Definition)/, `## Next action\n\n**${next.participant}: ${next.action}**\n\n${next.reason}\n`);
  let home = artifacts["LOOPY.md"].replace("## Current work\n", `## Milestone Planning\n\n${plans.map((plan) => `- [${plan.title}](${plan.artifactPath}) — ${plan.phase.replaceAll("-", " ")}`).join("\n") || "No active Plans."}\n\n## Current work\n`);
  home = home.replace(/## Current work\n\n[\s\S]*?(?=\n## Missing responsibility areas)/, `## Current work\n\n${plans.map((plan) => `**${plan.title}:** ${plan.phase.replaceAll("-", " ")}`).join("\n") || "No Milestone is active."}\n`);
  home = home.replace(/## Next action\n\n[\s\S]*?(?=\n## Blockers)/, `## Next action\n\n**${next.participant}: ${next.action}**\n\n${next.reason}\n`);
  const blockers = plans.filter((plan) => plan.phase === "blocked").map((plan) => `**${plan.title}:** ${plan.coherence.basis || plan.content.unknowns.find((unknown) => unknown.blocking)?.description || "Planning blocker"}`);
  if (blockers.length) home = home.includes("## Blockers\n\nNo current blockers.") ? home.replace("## Blockers\n\nNo current blockers.", `## Blockers\n\n${blockers.join("\n")}`) : home.replace(/## Blockers\n\n/, `## Blockers\n\n${blockers.join("\n")}\n`);
  artifacts["LOOPY.md"] = home;
  artifacts["docs/loopy/Roadmap.md"] = roadmap;
  return artifacts;
}

export function synchronizePlanningLifecycle(artifacts: MilestonePlanningArtifacts, state: MilestonePlanningState, definitions: MilestoneDefinitionState): MilestonePlanningArtifacts {
  const plans = [...state.plans].sort((left, right) => left.order - right.order || left.id.localeCompare(right.id));
  const lifecycle = (plan: MilestonePlan) => plan.phase === "blocked" ? "Blocked" : plan.phase === "paused" ? "Paused" : "Active";
  const milestoneAction = (plan: MilestonePlan) => plan.phase === "ready-for-implementation" ? "Establish implementation workspace and authority" : plan.phase === "blocked" ? `Resolve the blocker for ${plan.title}` : plan.phase === "paused" ? `Resume planning ${plan.title}` : `Continue planning ${plan.title}`;
  const planned = definitions.definitions.filter((definition) => definition.phase === "committed" && !plans.some((plan) => plan.definitionId === definition.id));
  const rows = [
    "| Milestone | State | Intended outcome | Next action |",
    "|---|---|---|---|",
    ...plans.map((plan) => `| ${esc(plan.title)} | ${lifecycle(plan)} | See the committed Definition | ${esc(milestoneAction(plan))} |`),
    ...planned.map((definition) => `| ${esc(definition.sourceCandidateTitle)} | Planned | ${esc(definition.content.outcome)} | Begin Milestone Planning |`),
  ].join("\n");
  artifacts["docs/loopy/Roadmap.md"] = artifacts["docs/loopy/Roadmap.md"]
    .replace(/## Current lifecycle state\n\n[\s\S]*?(?=\n## Living Roadmap|\n## Next product step)/, `## Current lifecycle state\n\n**Milestone Planning active**\n\n${plans.length} committed Milestone${plans.length === 1 ? " is" : "s are"} in Planning${planned.length ? `; ${planned.length} remain${planned.length === 1 ? "s" : ""} Planned` : ""}. Plan readiness does not authorize implementation.\n`)
    .replace(/## Current Milestones\n\n[\s\S]*?(?=\n## Engineering foundation|\n## Milestone Definitions|\n## Product questions to revisit)/, `## Current Milestones\n\n${rows}\n`)
    .replace("### Planned Milestones", "### Committed Definitions")
    .replaceAll("Committed — Planned Milestone", "Committed Definition");
  return artifacts;
}
