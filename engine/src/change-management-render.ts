import { readFileSync } from "node:fs";
import { join, posix } from "node:path";
import type { ChangeManagementArtifacts, ChangeManagementState, MaterialChange } from "./change-management-types.js";

const terminal = new Set(["accepted", "rejected", "withdrawn"]);
function escape(value: string): string { return value.replaceAll("|", "\\|").replaceAll("\n", " ").trim(); }
function bullets(values: string[], fallback: string): string { return values.length ? values.map((value) => `- ${value}`).join("\n") : fallback; }
function replace(template: string, values: Record<string, string>): string { const result = template.replace(/{{([A-Za-z][A-Za-z0-9]*)}}/g, (_, key: string) => { if (!(key in values)) throw new Error(`Change template value is missing: ${key}.`); return values[key]; }); if (/{{[^}]+}}/.test(result)) throw new Error("Change template contains an unused instruction."); return `${result.trim()}\n`; }
function changeArtifact(template: string, change: MaterialChange, publishedRevision: number): string {
  const meaning = change.targets.map((target, index) => [
    `### Affected meaning ${index + 1}`,
    "",
    `- **Current:** ${target.currentMeaning}`,
    `- **Proposed:** ${target.proposedMeaning}`,
  ].join("\n")).join("\n\n");
  const affected = change.targets.map((target) => `- **${target.kind.replaceAll("-", " ")}:** ${target.field.replaceAll(".", " ")} in **${target.artifactPath}** at base revision ${target.baseRevision}`).join("\n");
  const participants = [
    ...change.participants.map((item) => `- **${item.name}:** represents ${item.perspective}`),
    ...change.requiredPerspectives.map((perspective) => { const receipt = change.receipts.find((item) => item.perspective === perspective); return `- **${perspective} decision:** ${receipt ? `Agreed by ${receipt.participant} on proposal revision ${receipt.revision}` : "Needed"}`; }),
  ];
  const unknowns = [...change.unknowns.map((item) => `- **${item.blocking ? "Essential unknown" : "Safe-to-wait unknown"}:** ${item.description} Consequence: ${item.consequence} Revisit when: ${item.revisitWhen}.`), ...change.deferrals.map((item) => `- **Deferral:** ${item}`)];
  const base = change.targets.map((item) => `${item.artifactPath} at revision ${item.baseRevision}`).join(", ");
  return replace(template, {
    title: change.title, status: change.status, base, publishedRevision: String(publishedRevision), reason: change.reason,
    meaning, affected, consequences: bullets(change.downstreamConsequences, "No downstream consequence recorded."),
    unaffected: bullets(change.unaffectedWork, "No unaffected work recorded."), participants: participants.join("\n"),
    unknowns: unknowns.length ? unknowns.join("\n") : "No unknowns or deferrals recorded.",
    authority: [`- **Requested:** ${change.authorityRequested}`, `- **Disposition:** ${change.dispositionReason || "Pending"}`, `- **Earliest route:** ${change.earliestStage}`].join("\n"),
    nextAction: `**${change.nextAction.participant}: ${change.nextAction.action}**\n\n${change.nextAction.reason}`,
  });
}

export function renderChangeManagementArtifacts(base: Record<string, string>, state: ChangeManagementState, templateRoot: string): ChangeManagementArtifacts {
  const artifacts: ChangeManagementArtifacts = { ...base };
  const changes = [...state.changes].sort((left, right) => left.id.localeCompare(right.id));
  const active = changes.filter((item) => !terminal.has(item.status));
  const recent = changes.filter((item) => terminal.has(item.status));
  const next = state.nextActions[0];
  let home = artifacts["LOOPY.md"];
  const activeLines = active.length ? active.map((item) => `- [${item.title}](${item.artifactPath}) — ${item.status}`).join("\n") : "No active material changes.";
  const recentLines = recent.length ? recent.slice(-5).map((item) => `- [${item.title}](${item.artifactPath}) — ${item.status}`).join("\n") : "No completed material changes.";
  const section = ["## Change Management", "", `*Published from Change Management state revision ${state.revision}. Loopy status can check whether canonical work has advanced.*`, "", "### Active changes", "", activeLines, "", "### Recent dispositions", "", recentLines, ""].join("\n");
  home = home.includes("## Current work\n") ? home.replace("## Current work\n", `${section}\n## Current work\n`) : `${home.trim()}\n\n${section}`;
  home = home.replace(/## Next action\n\n[\s\S]*?(?=\n## Blockers)/, `## Next action\n\n**${next.participant}: ${next.action}**\n\n${next.reason}\n`);
  artifacts["LOOPY.md"] = home;
  let roadmap = artifacts["docs/loopy/Roadmap.md"];
  const roadmapChanges = changes.filter((change) => change.targets.some((target) => target.kind === "roadmap-candidate" || target.kind === "milestone-definition"));
  if (roadmapChanges.length) roadmap = roadmap.replace(/## Product questions to revisit/, `## Changes affecting the Roadmap\n\n${roadmapChanges.map((item) => `- [${item.title}](${item.artifactPath.replace(/^docs\/loopy\//, "")}) — ${item.status}`).join("\n")}\n\n## Product questions to revisit`);
  artifacts["docs/loopy/Roadmap.md"] = roadmap;
  const template = readFileSync(join(templateRoot, "docs/loopy/changes/Change.md"), "utf8");
  for (const change of changes) {
    artifacts[change.artifactPath] = changeArtifact(template, change, state.revision);
    for (const artifactPath of new Set(change.targets.map((target) => target.artifactPath))) {
      if (!artifacts[artifactPath] || artifactPath === "LOOPY.md" || artifactPath === "docs/loopy/Roadmap.md") continue;
      const label = terminal.has(change.status) ? "Change history" : "Proposed change";
      const relative = posix.relative(posix.dirname(artifactPath), change.artifactPath);
      artifacts[artifactPath] = `${artifacts[artifactPath].trim()}\n\n## ${label}\n\n- [${escape(change.title)}](${relative}) — ${change.status}\n`;
    }
  }
  return artifacts;
}
