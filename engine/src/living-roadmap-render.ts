import { definitionEligibility } from "./living-roadmap-contract.js";
import { ROADMAP_PRIORITIES, type LivingRoadmapCandidate, type LivingRoadmapRenderedArtifacts, type LivingRoadmapState } from "./living-roadmap-types.js";
import { renderRoadmapDependencyMap } from "./roadmap-dependency-render.js";

function escapeCell(value: string): string {
  return value.replaceAll("|", "\\|").replaceAll("\n", " ").trim();
}

function ordered(state: LivingRoadmapState): LivingRoadmapCandidate[] {
  return [...state.candidates].sort((left, right) =>
    ROADMAP_PRIORITIES.indexOf(left.priority) - ROADMAP_PRIORITIES.indexOf(right.priority) ||
    left.order - right.order || left.id.localeCompare(right.id));
}

function names(state: LivingRoadmapState, ids: string[]): string {
  return ids.map((id) => state.candidates.find((candidate) => candidate.id === id)?.title ?? "Unknown candidate").join(", ");
}

function dependencyText(state: LivingRoadmapState, candidate: LivingRoadmapCandidate): string {
  if (!candidate.dependencies.length && !candidate.unresolvedDependencyNotes.length) return "None recorded";
  return [...candidate.dependencies.map((item) => {
    const target = item.candidateId ? names(state, [item.candidateId]) : item.external!;
    const kind = item.kind === "required-before" ? `Required before ${item.boundary}` :
      item.kind === "helpful-non-blocking" ? "Helpful, non-blocking" : "Independent, potentially parallel";
    return `${kind}: ${target} — ${item.note}`;
  }), ...candidate.unresolvedDependencyNotes.map((note) => `Unclassified (Product or Engineering classification needed): ${note}`)].join("; ");
}

function blockerTexts(state: LivingRoadmapState, candidate: LivingRoadmapCandidate): string[] {
  const unresolved = candidate.unresolvedDependencyNotes.map((note) =>
    `Definition eligibility — unresolved dependency: ${note}`);
  const definitionDependencies = candidate.dependencies
    .filter((item) => item.kind === "required-before" && item.boundary === "definition")
    .map((item) => `Definition eligibility — ${item.candidateId ? names(state, [item.candidateId]) : item.external!} is required before Definition: ${item.note}`);
  const explicit = candidate.blockers.map((item) =>
    `${item.blocksDefinition ? "Definition eligibility" : "Implementation readiness"} — ${item.responsibility}: ${item.reason}`);
  return [...unresolved, ...definitionDependencies, ...explicit];
}

function participantText(candidate: LivingRoadmapCandidate): string {
  return candidate.participants.length
    ? candidate.participants.map((item) => `${item.name} (${item.responsibility})`).join(", ")
    : "None recorded";
}

function lineageText(state: LivingRoadmapState, candidate: LivingRoadmapCandidate): string {
  if (!candidate.lineage.length) return "None";
  return candidate.lineage.map((item) => `${item.relation.replaceAll("-", " ")}: ${names(state, item.candidateIds)}`).join("; ");
}

function currentTable(state: LivingRoadmapState, candidates: LivingRoadmapCandidate[]): string {
  if (!candidates.length) return "None.";
  return [
    "| Priority | Candidate outcome | Definition eligibility | Dependencies | Blockers | Participation | Lineage | Next shaping step |",
    "|---|---|---|---|---|---|---|---|",
    ...candidates.map((candidate) => {
      const eligibility = candidate.state === "Selected for definition"
        ? { reason: "Selected; Definition not committed." }
        : definitionEligibility(candidate);
      return `| ${candidate.priority} | **${escapeCell(candidate.title)}:** ${escapeCell(candidate.outcome)} | ${escapeCell(eligibility.reason)} | ${escapeCell(dependencyText(state, candidate))} | ${escapeCell(blockerTexts(state, candidate).join("; ") || "None recorded")} | ${escapeCell(participantText(candidate))} | ${escapeCell(lineageText(state, candidate))} | ${escapeCell(candidate.nextShapingStep)} |`;
    }),
  ].join("\n");
}

function endedTable(state: LivingRoadmapState, candidates: LivingRoadmapCandidate[]): string {
  if (!candidates.length) return "None.";
  return [
    "| Candidate | State | Reason | Reconsideration or lineage |",
    "|---|---|---|---|",
    ...candidates.map((candidate) => `| ${escapeCell(candidate.title)} | ${candidate.state} | ${escapeCell(candidate.dispositionReason)} | ${escapeCell(candidate.reconsiderWhen || lineageText(state, candidate))} |`),
  ].join("\n");
}

export function renderLivingRoadmapArtifacts(
  base: { "LOOPY.md": string; "docs/loopy/Roadmap.md": string },
  state: LivingRoadmapState,
  committedCandidateIds: ReadonlySet<string> = new Set(),
): LivingRoadmapRenderedArtifacts {
  const candidates = ordered(state);
  const selected = candidates.filter((item) => item.state === "Selected for definition" && !committedCandidateIds.has(item.id));
  const open = candidates.filter((item) => item.state === "Open");
  const ended = candidates.filter((item) => ["Deferred", "Cancelled", "Superseded"].includes(item.state));
  const next = state.nextActions[0];
  const summary = state.candidates.length === 0
    ? "No Roadmap candidates exist yet."
    : `The portfolio has ${open.length} open candidate${open.length === 1 ? "" : "s"}, ${selected.length} selected for Definition, and ${ended.length} deferred or ended.`;
  const roadmapPortfolio = [
    "## Living Roadmap",
    "",
    `${open.length} open, ${selected.length} selected for Definition, ${ended.length} deferred or ended. Candidates remain uncommitted.`,
    "",
    "## Next action",
    "",
    `**${next.participant}: ${next.action}**`,
    "",
    next.reason,
    "",
    "## Selected for Milestone Definition",
    "",
    currentTable(state, selected),
    "",
    "Selection routes candidates to Milestone Definition. It creates no Definition, commitment, Plan, or implementation authority.",
    "",
    "## Open candidates",
    "",
    currentTable(state, open),
    "",
    "## Deferred, cancelled, or superseded candidates",
    "",
    endedTable(state, ended),
    "",
    "",
  ].join("\n");
  const roadmap = renderRoadmapDependencyMap(base["docs/loopy/Roadmap.md"].replace(
    /## Summary\n\n[\s\S]*?(?=\n## Current lifecycle state)/,
    `## Summary\n\n${summary}\n`,
  ).replace(
    /## Next product step[\s\S]*?(?=## Current Milestones)/,
    roadmapPortfolio,
  ).replace(/^- \*\*Next action:\*\*.*$/gm, ""), state);
  let home = base["LOOPY.md"].replace(
    /^- \*\*Roadmap:\*\*.*$/m,
    `- **Roadmap:** ${open.length} open; ${selected.length} selected for Definition — [Roadmap](docs/loopy/Roadmap.md)`,
  );
  const homePortfolio = [
    "## Living Roadmap",
    "",
    selected.length ? `**Selected for Definition:** ${selected.map((item) => item.title).join(", ")}` : "No candidates are selected for Definition.",
    "",
    open.length ? `**Highest eligible focus:** ${open.find((item) => definitionEligibility(item).eligible)?.title ?? "Resolve a Definition blocker"}` : "No open candidates.",
    "",
    "",
  ].join("\n");
  home = home.replace("## Current work\n", `${homePortfolio}## Current work\n`);
  home = home.replace(/## Next action\n\n[\s\S]*?(?=\n## Blockers)/,
    `## Next action\n\n**${next.participant}: ${next.action}**\n\n${next.reason}\n`);
  const candidateBlockers = candidates.filter((candidate) => ["Open", "Selected for definition"].includes(candidate.state))
    .flatMap((candidate) => blockerTexts(state, candidate)
    .map((blocker) => `**${candidate.title}:** ${blocker}`));
  const baseBlockers = base["LOOPY.md"].match(/## Blockers\n\n([\s\S]*?)(?=\n## Release view)/)?.[1]?.trim();
  const blockers = [
    ...candidateBlockers,
    ...(baseBlockers && baseBlockers !== "No current blockers." ? [baseBlockers] : []),
  ];
  home = home.replace(/## Blockers\n\n[\s\S]*?(?=\n## Release view)/,
    `## Blockers\n\n${blockers.length ? blockers.join("\n") : "No current blockers."}\n`);
  return { "LOOPY.md": home, "docs/loopy/Roadmap.md": roadmap };
}
