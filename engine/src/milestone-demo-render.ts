import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { MilestoneBuildState } from "./milestone-build-types.js";
import type { MilestoneDefinitionState } from "./milestone-definition-types.js";
import type { DemoCoverage, MilestoneDemo, MilestoneDemoArtifacts, MilestoneDemoState } from "./milestone-demo-types.js";

function esc(value: string): string { return value.replaceAll("|", "\\|").replaceAll("\n", " ").trim(); }
function sentence(value: string): string { return value.trim() ? `${value.trim().replace(/[.!?]+$/u, "")}.` : ""; }
function replace(template: string, values: Record<string, string>): string {
  const rendered = template.replace(/{{([A-Za-z][A-Za-z0-9]*)}}/g, (_, key: string) => { if (!(key in values)) throw new Error(`Demo template value is missing: ${key}.`); return values[key]; });
  if (/{{[^}]+}}/.test(rendered)) throw new Error("Demo template contains an unused instruction.");
  return `${rendered.trim()}\n`;
}
function phase(value: string): string { return value.replaceAll("-", " "); }
function mode(value: string): string { return value === "human-guided" ? "Human-guided live" : "AI-operated recorded"; }
function coverageTable(rows: DemoCoverage[]): string {
  if (!rows.length) return "No acceptance-boundary observation has been recorded yet.";
  return ["| Acceptance criterion | Observation | Scenario | Evidence | Note |", "|---|---|---|---|---|", ...rows.map((row) => `| ${esc(row.criterion)} | ${phase(row.status)} | ${row.scenarioKeys.length} linked | ${row.evidenceIds.length} linked | ${esc(row.note || "—")} |`)].join("\n");
}
function artifact(template: string, demo: MilestoneDemo, state: MilestoneDemoState, definitions: MilestoneDefinitionState): string {
  const definition = definitions.definitions.find((item) => item.id === demo.definitionId)!;
  const next = state.nextActions[0];
  const summaryLimitations = [...demo.limitations.map((item) => `Limitation: ${item}`), ...demo.unproven.map((item) => `Unproven: ${item}`)].join("; ") || "None currently recorded";
  const decisionOrAction = demo.decision ? `${demo.decision.decision === "accept" ? "Accepted" : demo.decision.decision === "request-correction" ? "Correction requested" : "Deferred"} by ${demo.decision.human}` : `${next.participant}: ${next.action}`;
  const scenarios = ["| Order | Scenario | Mode | What to observe | Status | Result |", "|---:|---|---|---|---|---|", ...[...demo.scenarios].sort((a, b) => a.order - b.order || a.key.localeCompare(b.key)).map((item) => `| ${item.order} | ${esc(item.title)} | ${mode(item.mode)} | ${esc(item.whatToObserve)} | ${phase(item.status)} | ${esc(item.result || "Not yet observed")} |`)].join("\n");
  const evidence = demo.evidence.length ? ["| Evidence | Operator and authorized action | Tool | Result | Inspect |", "|---|---|---|---|---|", ...demo.evidence.map((item) => `| ${esc(item.summary)} | ${item.operator}; ${esc(item.action)} | ${esc(item.tool ?? "Direct observation")} | ${item.result} | ${item.accessibility === "inspectable" ? `[Open evidence](${item.referenceKind === "workspace-file" ? `<${item.reference}>` : item.reference})` : `Unavailable outside the originating session (${esc(item.reference)})`} |`)].join("\n") : "No Demo evidence has been recorded yet.";
  const limitations = [...demo.scenarios.flatMap((item) => [...item.limitations.map((value) => `- **${item.title} limitation:** ${value}`), ...item.partialEffects.map((value) => `- **${item.title} partial effect:** ${value}`)]), ...demo.limitations.map((value) => `- **Limitation:** ${value}`), ...demo.unproven.map((value) => `- **Unproven:** ${value}`)].join("\n") || "No failure, limitation, partial effect, or unproven behavior is currently recorded.";
  const methodAndAuthority = [`- **Modes:** ${demo.modes.map(mode).join(" and ")}`, `- **Observable surface:** ${demo.method.surface}`, `- **Method:** ${demo.method.summary}`, `- **Basis:** ${demo.method.basis}`, `- **Environment:** ${demo.authority.environment.name}`, `- **Expected operated target:** ${demo.authority.target.name}`, `- **Target verification basis:** ${demo.authority.target.verificationBasis}`, `- **Tools:** ${demo.authority.tools.join(", ") || "None; direct human observation only"}`, `- **Actions:** ${demo.authority.actions.join(", ")}`, `- **Scope:** ${demo.authority.scope.join(", ")}`, `- **Accessibility:** ${demo.authority.accessibilityNeeds.join(", ") || "No additional need recorded"}`, `- **External effects:** ${demo.authority.externalEffects.join(", ") || "None"}`].join("\n");
  const provenance = [`- **Build Candidate:** Integrated Milestone Build Candidate ${demo.candidateSequence}`, `- **Source snapshot:** \`${demo.sourceFingerprint}\``, `- **Workspace snapshot:** \`${demo.workspaceFingerprint}\``, `- **Environment snapshot:** \`${demo.authority.environment.fingerprint}\``, `- **Definition revision:** ${demo.definitionRevision}`, `- **Plan revision:** ${demo.planRevision}`, `- **Proof / Build revision:** ${demo.buildRevision}`, ...demo.evidence.map((item) => `- **${item.summary} evidence snapshot:** \`${item.fingerprint}\``)].join("\n");
  const decision = demo.decision ? [`**${demo.decision.human}** brought this perspective and context: ${demo.decision.perspectiveContext}`, "", `Decision: **${demo.decision.decision.replaceAll("-", " ")}** — ${sentence(demo.decision.reason)}`, "", demo.decision.decision === "accept" ? "The exact demonstrated outcome is Complete but unreleased. No Release or publication authority follows." : `Next route: ${demo.decision.correctionRoute ?? "Revisit when " + demo.decision.revisitWhen}.`].join("\n") : `No human decision recorded.\n\n**Next action:** ${next.participant}: ${next.action} — ${next.reason}`;
  const advisoryInputs = demo.advisoryInputs.length ? demo.advisoryInputs.map((input) => `- **${input.actorKind === "proxy-ai" ? "Proxy AI" : "Simulated participant"}: ${input.participant}** — recommended ${input.recommendation.replaceAll("-", " ")}. This is advisory input, not personal human judgment or Milestone Acceptance.`).join("\n") : "No simulated-participant or proxy-AI input recorded.";
  return replace(template, { title: demo.title, status: phase(demo.phase), demoRevision: String(demo.revision), publishedRevision: String(state.revision), outcome: esc(definition.content.outcome), whatDemonstrated: esc(demo.whatDemonstrated || "Demo preparation is recorded; observation is pending"), observedResult: esc(demo.observedResult || "Not yet judged"), summaryLimitations: esc(summaryLimitations), decisionOrAction: esc(decisionOrAction), scenarios, coverage: coverageTable(demo.coverage), evidence, methodAndAuthority, limitations, provenance, advisoryInputs, decision });
}

export function renderMilestoneDemoArtifacts(base: Record<string, string>, state: MilestoneDemoState, definitions: MilestoneDefinitionState, builds: MilestoneBuildState, templateRoot: string): MilestoneDemoArtifacts {
  const artifacts = { ...base };
  const demos = [...state.demos].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
  const template = readFileSync(join(templateRoot, "docs/loopy/milestones/Demo.md"), "utf8");
  for (const demo of demos) artifacts[demo.artifactPath] = artifact(template, demo, state, definitions);
  const next = state.nextActions[0];
  const demoLinks = demos.map((demo) => `- [${demo.title}](${demo.artifactPath}) — ${phase(demo.phase)}`).join("\n");
  let home = artifacts["LOOPY.md"].replace("## Current work\n", `## Demonstrate and Accept\n\n${demoLinks}\n\n## Current work\n`);
  home = home.replace(/## Current work\n\n[\s\S]*?(?=\n## Missing responsibility areas)/, `## Current work\n\n${demos.map((demo) => `**${demo.title}:** ${demo.phase === "accepted" ? "Complete but unreleased" : phase(demo.phase)}`).join("\n")}\n`);
  home = home.replace(/## Next action\n\n[\s\S]*?(?=\n## Blockers)/, `## Next action\n\n**${next.participant}: ${next.action}**\n\n${next.reason}\n`);
  const blockers = demos.filter((demo) => demo.phase === "blocked" || demo.phase === "paused").map((demo) => `**${demo.title}:** ${demo.readiness.basis}`);
  if (blockers.length) home = home.includes("## Blockers\n\nNo current blockers.") ? home.replace("## Blockers\n\nNo current blockers.", `## Blockers\n\n${blockers.join("\n")}`) : home.replace(/## Blockers\n\n/, `## Blockers\n\n${blockers.join("\n")}\n`);
  const complete = demos.filter((demo) => demo.phase === "accepted").map((demo) => `[${demo.title}](${demo.artifactPath})`);
  home = home.replace(/^- \*\*Complete but not released:\*\*.*$/m, `- **Complete but not released:** ${complete.join(", ") || "None"}`);

  const demoByBuild = new Map(demos.map((demo) => [demo.buildId, demo]));
  const rows = ["| Milestone | State | Intended outcome | Demo | Next action |", "|---|---|---|---|---|", ...[...builds.builds].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id)).map((build) => { const demo = demoByBuild.get(build.id); const definition = definitions.definitions.find((item) => item.id === build.definitionId)!; return demo ? `| ${esc(build.title)} | ${demo.phase === "accepted" ? "Complete" : "Active — " + phase(demo.phase)} | ${esc(definition.content.outcome)} | [Demo](${demo.artifactPath.replace(/^docs\/loopy\//, "")}) | ${esc(demo.phase === "accepted" ? "Consider for a separately authorized Release" : state.nextActions[0].action)} |` : `| ${esc(build.title)} | Active — ${phase(build.phase)} | ${esc(definition.content.outcome)} | Not started | Begin Demonstration when selected |`; })].join("\n");
  let roadmap = artifacts["docs/loopy/Roadmap.md"];
  roadmap = roadmap.replace(/## Current lifecycle state\n\n[\s\S]*?(?=\n## Living Roadmap|\n## Next product step)/, `## Current lifecycle state\n\n**Milestone Demonstration and Acceptance**\n\n${demos.filter((demo) => demo.phase === "accepted").length} Complete but unreleased; ${demos.filter((demo) => demo.phase !== "accepted").length} in Demonstration or awaiting judgment.\n`);
  roadmap = roadmap.replace(/## Current Milestones\n\n[\s\S]*?(?=\n## Engineering foundation|\n## Milestone Definitions|\n## Product questions to revisit)/, `## Current Milestones\n\n${rows}\n`);
  roadmap = roadmap.replace(/## Product questions to revisit/, `## Demonstration and Acceptance status\n\n${demos.map((demo) => `- [${demo.title}](${demo.artifactPath.replace(/^docs\/loopy\//, "")}) — ${demo.phase === "accepted" ? "Complete but unreleased" : phase(demo.phase)}`).join("\n")}\n\n## Product questions to revisit`);
  roadmap = roadmap.replace(/## Next action\n\n[\s\S]*?(?=\n## Selected for Milestone Definition)/, `## Next action\n\n**${next.participant}: ${next.action}**\n\n${next.reason}\n`);
  artifacts["LOOPY.md"] = home; artifacts["docs/loopy/Roadmap.md"] = roadmap;
  return artifacts;
}
