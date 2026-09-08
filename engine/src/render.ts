import { readFileSync } from "node:fs";
import { join } from "node:path";
import { orderCandidatesByPriority } from "./candidates.js";
import type {
  ContextGrant,
  Deferral,
  ProductStartState,
  RenderedArtifacts,
  RoadmapCandidate,
} from "./types.js";

function text(value: string, fallback = "Not yet provided."): string {
  return value.trim() || fallback;
}

function escapeCell(value: string): string {
  return value.replaceAll("|", "\\|").replaceAll("\n", " ").trim();
}

function bullets(values: string[], fallback: string): string {
  return values.length > 0 ? values.map((value) => `- ${value}`).join("\n") : fallback;
}

function status(state: ProductStartState): string {
  switch (state.phase) {
    case "blocked": return "Blocked by a required Product decision";
    case "ready-for-product-confirmation": return "Ready for Product confirmation";
    case "product-foundation-confirmed": return "Product foundation confirmed";
    default: return "Draft";
  }
}

function contextLabel(grant: ContextGrant): string {
  if (grant.kind === "whole-repository") return "Entire target repository — explicitly authorized";
  const kind = grant.kind === "workspace-path" ? "Project path" :
    grant.kind === "external-resource" ? "External resource" : "Supplied context";
  return `${kind}: ${grant.scope}`;
}

function authorizedContext(state: ProductStartState): string {
  if (state.contextGrants.length === 0) {
    return "No project context has been authorized for inspection. Selecting the project did not authorize repository-wide reading.";
  }
  return bullets(state.contextGrants.map(contextLabel), "No context authorized.");
}

function evidence(state: ProductStartState): string {
  if (state.product.evidence.length === 0) {
    return "No evidence has been recorded from the authorized context.";
  }
  return state.product.evidence.map((item) => {
    const conflict = item.conflictsWithIntent ? " This differs from current Product intent." : "";
    return `- **${item.source}** (${item.contextScope}): ${item.finding}${conflict}`;
  }).join("\n");
}

function deferrals(values: Deferral[]): string {
  if (values.length === 0) return "No Product decisions are currently deferred.";
  return [
    "| Product decision | Why it can wait | Revisit when | Effect now |",
    "|---|---|---|---|",
    ...values.map((item) =>
      `| ${escapeCell(item.question)} | ${escapeCell(item.why)} | ${escapeCell(item.revisitWhen)} | ${item.blocking ? "Blocks Product confirmation" : "Does not block Product confirmation"} |`),
  ].join("\n");
}

function candidates(values: RoadmapCandidate[], nextProductStep: string): string {
  if (values.length === 0) {
    return nextProductStep === "Product input is complete for now."
      ? "No Milestone candidates exist yet. Product input is complete for now."
      : `No Milestone candidates exist yet. The next Product action is ${nextProductStep}`;
  }
  return [
    "| Priority | Candidate outcome | Why it matters now | Dependencies or unknowns | Next shaping action |",
    "|---|---|---|---|---|",
    ...orderCandidatesByPriority(values).map((candidate) =>
      `| ${candidate.priority} | **${escapeCell(candidate.title)}:** ${escapeCell(candidate.outcome)} | ${escapeCell(candidate.rationale)} | ${escapeCell(candidate.dependencies.join("; ") || "None known")} | ${escapeCell(candidate.nextAction)} |`),
  ].join("\n");
}

function milestones(state: ProductStartState): string {
  if (state.roadmap.milestones.length === 0) return "No Milestones have been committed.";
  return [
    "| Milestone | State | Intended outcome | Next action |",
    "|---|---|---|---|",
    ...state.roadmap.milestones.map((milestone) =>
      `| ${escapeCell(milestone.title)} | ${milestone.state} | ${escapeCell(milestone.outcome)} | ${escapeCell(milestone.nextAction)} |`),
  ].join("\n");
}

function replaceTemplate(template: string, values: Record<string, string>): string {
  const rendered = template.replace(/{{([A-Za-z][A-Za-z0-9]*)}}/g, (_, key: string) => {
    if (!(key in values)) throw new Error(`Template value is missing: ${key}.`);
    return values[key];
  });
  const unused = rendered.match(/{{[^}]+}}/);
  if (unused) throw new Error(`Rendered artifact contains an unused template instruction: ${unused[0]}.`);
  return `${rendered.trim()}\n`;
}

export function renderArtifacts(
  state: ProductStartState,
  templateRoot: string,
): RenderedArtifacts {
  if (state.nextActions.length !== 1) throw new Error("Cannot render LOOPY.md without exactly one next action.");
  const next = state.nextActions[0];
  const productStatus = status(state);
  const nextProductStep = state.phase === "product-foundation-confirmed" &&
    next.participant.toLowerCase() !== "product"
    ? "Product input is complete for now."
    : `${next.action}.`;
  const active = state.roadmap.milestones.find((milestone) => milestone.state === "Active");
  const blockedMilestones = state.roadmap.milestones.filter((milestone) => milestone.state === "Blocked");
  const complete = state.roadmap.milestones.filter((milestone) => milestone.state === "Complete");
  const released = state.roadmap.milestones.filter((milestone) => milestone.state === "Released");
  const blockingDeferrals = state.product.deferrals.filter((item) => item.blocking);

  const homeTemplate = readFileSync(join(templateRoot, "LOOPY.md"), "utf8");
  const definitionTemplate = readFileSync(join(templateRoot, "docs/loopy/Project-Definition.md"), "utf8");
  const roadmapTemplate = readFileSync(join(templateRoot, "docs/loopy/Roadmap.md"), "utf8");

  const responsibilityRows = [
    ...(state.phase === "product-foundation-confirmed" ? [] : [
      `| Product | ${productStatus} | ${escapeCell(next.action)} |`,
    ]),
    "| Engineering | Not established | Establish an Engineering guide when delivery needs it |",
    "| Architecture | Not yet known to be needed | Participate only when durable structural guidance is triggered |",
    "| Demo or quality | Not yet needed | Establish reusable proof guidance just in time |",
    "| Release | Not yet needed | Establish reusable release guidance when distribution affects delivery |",
  ].join("\n");

  const blockers = [
    ...blockingDeferrals.map((item) => `**Product — ${item.question}:** ${item.why} Revisit when ${item.revisitWhen}.`),
    ...blockedMilestones.map((item) => `**${item.title}:** ${item.nextAction}`),
  ];

  const home = replaceTemplate(homeTemplate, {
    projectName: text(state.product.projectName, "Untitled project"),
    homeSummary: text(state.product.summary, "The Product foundation is being established."),
    productStatus,
    roadmapStatus: state.roadmap.candidates.length === 0
      ? "No candidates yet"
      : `${state.roadmap.candidates.length} uncommitted candidate${state.roadmap.candidates.length === 1 ? "" : "s"}`,
    contextStatus: state.contextGrants.length === 0
      ? "None authorized yet"
      : `${state.contextGrants.length} authorized scope${state.contextGrants.length === 1 ? "" : "s"}`,
    currentWork: active ? `**${active.title}:** ${active.outcome} (${active.state})` : "No Milestone is active.",
    responsibilityRows,
    nextParticipant: next.participant,
    nextAction: next.action,
    nextReason: next.reason,
    blockers: blockers.length === 0 ? "No current blockers." : blockers.join("\n"),
    completeUnreleased: complete.length === 0 ? "None" : complete.map((item) => item.title).join(", "),
    latestRelease: released.length === 0 ? "None yet" : released.at(-1)?.title ?? "None yet",
  });

  const definition = replaceTemplate(definitionTemplate, {
    projectName: text(state.product.projectName, "Untitled project"),
    productStatus,
    definitionSummary: text(state.product.summary),
    purpose: text(state.product.purpose),
    primaryPeople: text(state.product.primaryPeople),
    need: text(state.product.need),
    currentAlternative: text(state.product.currentAlternative, "Not yet known."),
    secondaryPeople: text(state.product.secondaryPeople, "None identified."),
    outcome: text(state.product.outcome),
    authorizedContext: authorizedContext(state),
    evidence: evidence(state),
    remainsTrue: bullets(state.product.remainsTrue, "Nothing from prior context has been retained yet."),
    shouldChange: bullets(state.product.shouldChange, "No intended changes have been stated yet."),
    uncertain: bullets(state.product.uncertain, "Nothing is currently marked uncertain."),
    inScope: bullets(state.product.inScope, "No in-scope Product boundary has been recorded yet."),
    nonGoals: bullets(state.product.nonGoals, "No explicit non-goals have been recorded yet."),
    constraints: bullets(state.product.constraints, "No Product constraints have been recorded yet."),
    successSignals: bullets(state.product.successSignals, "No success signals have been recorded yet."),
    uncertainty: [
      bullets(state.product.assumptions, "- **Assumptions:** None recorded."),
      bullets(state.product.unknowns, "- **Unknowns:** None recorded."),
    ].join("\n"),
    deferrals: deferrals(state.product.deferrals),
    confirmationStatement: state.phase === "product-foundation-confirmed"
      ? "Product confirms the current Product Definition and Roadmap. This does not confirm Engineering, Architecture, Demo or quality, Release, publication, deployment, or rollback decisions."
      : state.phase === "blocked"
        ? "Product confirmation is blocked by a required deferred decision shown above."
        : "The Product foundation has not yet been confirmed.",
  });

  const roadmap = replaceTemplate(roadmapTemplate, {
    projectName: text(state.product.projectName, "Untitled project"),
    productStatus,
    roadmapSummary: text(state.roadmap.summary),
    lifecycleState: text(state.roadmap.lifecycleState),
    lifecycleExplanation: text(state.roadmap.lifecycleExplanation),
    nextProductStep,
    candidateSection: candidates(state.roadmap.candidates, nextProductStep),
    milestoneSection: milestones(state),
    roadmapDeferrals: deferrals(state.product.deferrals),
    productNotes: text(state.roadmap.productNotes, "No additional Product notes."),
  });

  validateRenderedHome(home);
  return {
    "LOOPY.md": home,
    "docs/loopy/Project-Definition.md": definition,
    "docs/loopy/Roadmap.md": roadmap,
  };
}

export function validateRenderedHome(markdown: string): void {
  const headings = markdown.match(/^## Next action$/gm) ?? [];
  const section = markdown.match(/^## Next action\n\n([\s\S]*?)(?=\n## |$)/m)?.[1] ?? "";
  const actionLines = section.match(/^\*\*.+:.+\*\*$/gm) ?? [];
  if (headings.length !== 1 || actionLines.length !== 1) {
    throw new Error("LOOPY.md must render exactly one next action.");
  }
}
