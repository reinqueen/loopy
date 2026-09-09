import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { MilestoneDefinition, MilestoneDefinitionArtifacts, MilestoneDefinitionState } from "./milestone-definition-types.js";

function escape(value: string): string { return value.replaceAll("|", "\\|").replaceAll("\n", " ").trim(); }
function bullets(values: string[], fallback: string): string { return values.length ? values.map((value) => `- ${value}`).join("\n") : fallback; }
function replace(template: string, values: Record<string, string>): string {
  const rendered = template.replace(/{{([A-Za-z][A-Za-z0-9]*)}}/g, (_, key: string) => {
    if (!(key in values)) throw new Error(`Definition template value is missing: ${key}.`);
    return values[key];
  });
  if (/{{[^}]+}}/.test(rendered)) throw new Error("Definition template contains an unused instruction.");
  return `${rendered.trim()}\n`;
}
function status(definition: MilestoneDefinition): string {
  if (definition.phase === "committed") return "Committed — Planned Milestone";
  if (definition.phase === "blocked") return "Blocked draft";
  if (definition.phase === "ready-for-commitment") return "Ready for commitment";
  return "Draft";
}
function blocker(definition: MilestoneDefinition): string {
  if (definition.coherence.status === "blocked") return definition.coherence.basis;
  const unknown = definition.content.unknowns.find((item) => item.blocking);
  if (unknown) return unknown.description;
  const specialist = definition.specialistInputs.find((item) => item.mode === "blocking" && item.status === "needed");
  return specialist ? `${specialist.perspective} input is required: ${specialist.reason}` : "A required Definition decision remains unresolved.";
}
function dependencyKind(kind: MilestoneDefinition["content"]["dependencies"][number]["kind"]): string {
  if (kind === "required-before") return "Required before";
  if (kind === "helpful-non-blocking") return "Helpful, non-blocking";
  return "Independent, potentially parallel";
}
function currentDefinitionAction(definition: MilestoneDefinition): string {
  if (definition.phase === "committed") return "Begin Milestone Planning";
  if (definition.phase === "blocked") return "Resolve the Definition blocker";
  if (definition.reviewedRevision !== definition.revision) return definition.coherence.status === "coherent"
    ? "Review the current Definition"
    : "Continue Milestone Definition";
  return "Confirm or correct the current Definition";
}
function definitionArtifact(template: string, definition: MilestoneDefinition, publishedRevision: number): string {
  const dependencies = definition.content.dependencies.length ? [
    "| Dependency | Relationship | Consequence | Meaning |",
    "|---|---|---|---|",
    ...definition.content.dependencies.map((item) => `| ${escape(item.name)} | ${dependencyKind(item.kind)} | ${item.consequence === "definition" ? "Definition" : "Implementation"} | ${escape(item.note)} |`),
  ].join("\n") : "None recorded.";
  const unresolved = [
    ...definition.content.risks.map((value) => `- **Risk:** ${value}`),
    ...definition.content.assumptions.map((value) => `- **Assumption:** ${value}`),
    ...definition.content.unknowns.map((item) => `- **${item.blocking ? "Blocking unknown" : "Unknown"}:** ${item.description} Revisit when ${item.revisitWhen}.`),
  ];
  const receipt = (perspective: string) => definition.receipts.find((item) => item.perspective === perspective);
  const currentBehavior = definition.content.currentBehavior ?? [];
  const intendedBehavior = definition.content.intendedBehavior ?? [];
  const evidence = definition.content.evidence ?? [];
  const reconciliations = definition.content.reconciliations ?? [];
  const behavior = [
    ...(currentBehavior.length ? currentBehavior.map((value) => `- **Observed now:** ${value}`) : ["- **Observed now:** Not yet established."]),
    ...(intendedBehavior.length ? intendedBehavior.map((value) => `- **Intended:** ${value}`) : ["- **Intended:** Captured by the outcome and requirements unless a current-versus-intended difference is discovered."]),
  ].join("\n");
  const evidenceAndReconciliation = [
    ...evidence.map((item) => `- **${item.kind.replaceAll("-", " ")} — ${item.source}:** ${item.finding}`),
    ...reconciliations.map((item) => `- **${item.status === "resolved" ? "Resolved" : item.material ? "Material unresolved conflict" : "Unresolved conflict"}:** ${item.disagreement} Sources: ${item.sources.join(", ")}. ${item.resolution || "No resolution recorded yet."}`),
  ];
  const readiness = [
    `- **Host coherence:** ${definition.coherence.status}${definition.coherence.basis ? ` — ${definition.coherence.basis}` : ""}`,
    `- **Current review:** ${definition.reviewedRevision === definition.revision ? "Recorded" : "Needed"}`,
    ...definition.requiredPerspectives.map((perspective) => `- **${perspective}:** ${receipt(perspective) ? `Confirmed by ${receipt(perspective)!.participant}` : "Confirmation needed"}`),
    ...definition.specialistInputs.map((item) => `- **${item.perspective}:** ${item.status === "satisfied" ? "Input satisfied" : item.mode === "blocking" ? "Input required before commitment" : "Route just in time"} — ${item.reason}`),
  ];
  return replace(template, {
    title: definition.sourceCandidateTitle,
    status: status(definition),
    definitionRevision: String(definition.revision),
    publishedRevision: String(publishedRevision),
    outcome: definition.content.outcome.trim() || "Not yet defined.",
    requirements: bullets(definition.content.requirements, "No requirements recorded yet."),
    behavior,
    evidenceAndReconciliation: evidenceAndReconciliation.length ? evidenceAndReconciliation.join("\n") : "No material evidence conflict recorded.",
    inScope: bullets(definition.content.inScope, "No in-scope boundary recorded yet."),
    nonGoals: bullets(definition.content.nonGoals, "No non-goals recorded yet."),
    acceptance: bullets(definition.content.acceptance, "No observable acceptance boundary recorded yet."),
    dependencies,
    risksAndUnknowns: unresolved.length ? unresolved.join("\n") : "No risks, assumptions, or unknowns recorded.",
    responsibilityAndReadiness: readiness.join("\n"),
    boundary: definition.phase === "committed"
      ? "A committed Definition is the authoritative delivery boundary and cannot be silently changed. Change Management may explicitly reopen only the affected committed decisions."
      : "This draft grants no Planning or implementation authority.",
  });
}

export function renderMilestoneDefinitionArtifacts(
  base: { "LOOPY.md": string; "docs/loopy/Roadmap.md": string },
  state: MilestoneDefinitionState,
  templateRoot: string,
): MilestoneDefinitionArtifacts {
  const definitions = [...state.definitions].sort((left, right) => left.order - right.order || left.id.localeCompare(right.id));
  const committed = definitions.filter((item) => item.phase === "committed");
  const drafts = definitions.filter((item) => item.phase !== "committed");
  const next = state.nextActions[0];
  const rows = (items: MilestoneDefinition[]) => items.length ? [
    "| Milestone | Status | Outcome | Source | Definition |",
    "|---|---|---|---|---|",
    ...items.map((item) => `| ${escape(item.sourceCandidateTitle)} | ${status(item)} | ${escape(item.content.outcome || "Not yet defined")} | Roadmap candidate: ${escape(item.sourceCandidateTitle)} | [Definition](${item.artifactPath.replace(/^docs\/loopy\//, "")}) |`),
  ].join("\n") : "None.";
  let roadmap = base["docs/loopy/Roadmap.md"];
  const section = [
    "## Milestone Definitions",
    "",
    `*Published from Milestone Definition state revision ${state.revision}. Loopy status can check whether canonical work has advanced.*`,
    "",
    "### Draft Definitions",
    "",
    rows(drafts),
    "",
    "### Planned Milestones",
    "",
    rows(committed),
    "",
    "Committed Milestones retain source-candidate provenance in canonical history. Commitment routes to Planning only and grants no implementation authority.",
    "",
  ].join("\n");
  if (committed.length) {
    const commitmentSummary = committed.length === 1
      ? "One Milestone has a committed Definition and is Planned."
      : `${committed.length} Milestones have committed Definitions and are Planned.`;
    const draftSummary = drafts.length
      ? ` ${drafts.length} Definition draft${drafts.length === 1 ? " remains" : "s remain"} uncommitted.`
      : "";
    roadmap = roadmap.replace(/## Current lifecycle state\n\n[\s\S]*?(?=\n## Living Roadmap|\n## Next product step)/,
      `## Current lifecycle state\n\n**Milestone Definition commitment recorded**\n\nThe Product foundation remains confirmed. ${commitmentSummary}${draftSummary}\n`);
    roadmap = roadmap.replace(/## Current Milestones\n\n[\s\S]*?(?=\n## Engineering foundation|\n## Product questions to revisit)/,
      `## Current Milestones\n\n${rows(committed)}\n`);
  }
  roadmap = roadmap.replace(/## Product questions to revisit/, `${section}\n## Product questions to revisit`);
  roadmap = roadmap.replace(/## Next action\n\n[\s\S]*?(?=\n## Selected for Milestone Definition)/,
    `## Next action\n\n**${next.participant}: ${next.action}**\n\n${next.reason}\n`);
  for (const definition of definitions) {
    const marker = `**${escape(definition.sourceCandidateTitle)}:**`;
    roadmap = roadmap.split("\n").map((line) => line.includes(marker) && line.includes("| Selected; Definition not committed. |")
      ? line.replace(/\| [^|]* \|$/, `| ${currentDefinitionAction(definition)} |`)
      : line).join("\n");
  }
  let home = base["LOOPY.md"].replace("## Current work\n", [
    "## Milestone Definitions",
    "",
    `*Published from Milestone Definition state revision ${state.revision}. Loopy status can check whether canonical work has advanced.*`,
    "",
    drafts.length ? `**In Definition:** ${drafts.map((item) => `[${item.sourceCandidateTitle}](${item.artifactPath})`).join(", ")}` : "No draft Definitions.",
    "",
    committed.length ? `**Planned:** ${committed.map((item) => `[${item.sourceCandidateTitle}](${item.artifactPath})`).join(", ")}` : "No committed Planned Milestones.",
    "",
    "## Current work\n",
  ].join("\n"));
  home = home.replace(/## Next action\n\n[\s\S]*?(?=\n## Blockers)/,
    `## Next action\n\n**${next.participant}: ${next.action}**\n\n${next.reason}\n`);
  home = home.replace(/^\| Product \| ([^|]+) \| [^|]* \|$/m,
    "| Product | $1 | Product foundation remains unconfirmed; current Milestone Definition work is shown below |");
  const definitionBlockers = drafts.filter((item) => item.phase === "blocked").map((item) => `**${item.sourceCandidateTitle}:** ${blocker(item)}`);
  if (definitionBlockers.length) {
    if (home.includes("## Blockers\n\nNo current blockers.")) home = home.replace("## Blockers\n\nNo current blockers.", `## Blockers\n\n${definitionBlockers.join("\n")}`);
    else home = home.replace(/## Blockers\n\n/, `## Blockers\n\n${definitionBlockers.join("\n")}\n`);
  }
  const artifacts: MilestoneDefinitionArtifacts = { "LOOPY.md": home, "docs/loopy/Roadmap.md": roadmap };
  const template = readFileSync(join(templateRoot, "docs/loopy/milestones/Definition.md"), "utf8");
  for (const definition of definitions) artifacts[definition.artifactPath] = definitionArtifact(template, definition, state.revision);
  return artifacts;
}
