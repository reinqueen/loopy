import { readFileSync } from "node:fs";
import { join } from "node:path";
import type {
  EngineeringCommand,
  EngineeringContent,
  EngineeringFoundationState,
  EngineeringRenderedArtifacts,
} from "./engineering-types.js";
import { COMMAND_PURPOSES } from "./engineering-types.js";
import { projectAction } from "./engineering-routing.js";
import { renderArtifacts, validateRenderedHome } from "./render.js";
import type { ContextGrant, ProductStartState } from "./types.js";

function escapeCell(value: string): string {
  return value.replaceAll("|", "\\|").replaceAll("\n", " ");
}

function bullets(values: string[], fallback: string): string {
  return values.length ? values.map((value) => `- ${value}`).join("\n") : fallback;
}

function replaceTemplate(template: string, values: Record<string, string>): string {
  const rendered = template.replace(/{{([A-Za-z][A-Za-z0-9]*)}}/g, (_, key: string) => {
    if (!(key in values)) throw new Error(`Engineering template value is missing: ${key}.`);
    return values[key];
  });
  const unused = rendered.match(/{{[^}]+}}/);
  if (unused) throw new Error(`Engineering artifact contains an unused template instruction: ${unused[0]}.`);
  return `${rendered.trim()}\n`;
}

function status(state: EngineeringFoundationState): string {
  switch (state.phase) {
    case "blocked": return "Blocked by an Engineering decision";
    case "ready-for-engineering-confirmation": return "Ready for Engineering confirmation";
    case "engineering-foundation-confirmed": return "Engineering foundation confirmed";
    default: return "Draft";
  }
}

function statusWithProduct(state: EngineeringFoundationState, product: ProductStartState): string {
  if (product.phase !== "product-foundation-confirmed") {
    return `${status(state)}; Product confirmation needs review`;
  }
  if (state.productRevision !== product.revision) {
    return `${status(state)}; Engineering revisit required for Product revision ${product.revision}`;
  }
  const latest = state.confirmedHistory.at(-1);
  if (state.phase !== "engineering-foundation-confirmed" && latest) {
    return `${status(state)}; Engineering revision ${latest.revision} was previously confirmed`;
  }
  return status(state);
}

function confirmationBoundary(state: EngineeringFoundationState, product: ProductStartState): string {
  const latest = state.confirmedHistory.at(-1);
  if (state.phase === "engineering-foundation-confirmed") {
    if (product.phase !== "product-foundation-confirmed") {
      return `Engineering foundation revision ${state.revision} remains confirmed against Product revision ${state.productRevision}, but current Product meaning needs fresh Product confirmation before Engineering can be relied on for delivery.`;
    }
    return `Engineering foundation revision ${state.revision} is confirmed against Product revision ${state.productRevision}. Engineering confirms only this Engineering Guide. Product meaning, Architecture, Demo acceptance, Release authorization, deployment, and publication remain outside this confirmation.`;
  }
  if (!latest) {
    return state.phase === "blocked"
      ? "The Engineering foundation has never been confirmed and is blocked by a deferred decision shown above."
      : "The Engineering foundation has not yet been confirmed.";
  }
  if (product.revision > latest.productRevision) {
    return `Engineering foundation revision ${latest.revision} was confirmed against Product revision ${latest.productRevision}. Product is now revision ${product.revision}, so Engineering review and confirmation are required before this guidance is current.`;
  }
  const blocker = state.phase === "blocked" ? " A blocking Engineering decision must also be resolved." : "";
  return `Engineering foundation revision ${latest.revision} was previously confirmed against Product revision ${latest.productRevision}. Engineering guidance has since changed, so Engineering review and confirmation are required before this guidance is current.${blocker}`;
}

function engineeringParticipationNeed(
  state: EngineeringFoundationState,
  product: ProductStartState,
  nextAction: string,
): string {
  if (product.phase !== "product-foundation-confirmed") return "Wait for Product reconfirmation, then revisit Engineering";
  if (state.productRevision !== product.revision) return "Revisit Engineering against the current Product confirmation";
  return state.phase === "engineering-foundation-confirmed"
    ? "Use the confirmed guide and follow the project next action"
    : nextAction;
}

function contextLabel(grant: ContextGrant): string {
  if (grant.kind === "whole-repository") return "Entire target repository — explicitly authorized for Engineering";
  const kind = grant.kind === "workspace-path" ? "Project path" : grant.kind === "external-resource" ? "External resource" : "Supplied context";
  return `${kind}: ${grant.scope}`;
}

function renderEvidence(content: EngineeringContent): string {
  if (!content.evidence.length) return "No Engineering evidence has been recorded from project context.";
  return content.evidence.map((item) => `- **${item.source}** (${item.contextScope}): ${item.finding}`).join("\n");
}

function renderDefaults(content: EngineeringContent): string {
  const defaults = content.projectDefaults;
  const rows: Array<[string, string[]]> = [
    ["Languages", defaults.languages], ["Runtimes", defaults.runtimes], ["Frameworks", defaults.frameworks],
    ["Package and dependency tools", defaults.dependencyTools],
  ];
  return ["| Default | Current guidance |", "|---|---|", ...rows.map(([label, values]) =>
    `| ${label} | ${escapeCell(values.join("; ") || "None established")} |`)].join("\n");
}

function renderComponents(content: EngineeringContent): string {
  if (!content.components.length) return "No components have been established yet.";
  return [
    "| Component | Purpose and path | Technology exceptions | Other exceptions |",
    "|---|---|---|---|",
    ...content.components.map((item) => {
      const technology = [
        item.languages.length ? `Languages: ${item.languages.join(", ")}` : "",
        item.runtimes.length ? `Runtimes: ${item.runtimes.join(", ")}` : "",
        item.frameworks.length ? `Frameworks: ${item.frameworks.join(", ")}` : "",
        item.dependencyTools.length ? `Dependency tools: ${item.dependencyTools.join(", ")}` : "",
      ].filter(Boolean).join("; ") || "Inherits project defaults";
      return `| **${escapeCell(item.name)}** | ${escapeCell(item.purpose)} — \`${escapeCell(item.path)}\` | ${escapeCell(technology)} | ${escapeCell(item.exceptions.join("; ") || "None")} |`;
    }),
  ].join("\n");
}

function commandSource(item: EngineeringCommand): string {
  if (item.confidence === "confirmed" && item.executionEvidence) {
    return `Executed in ${item.executionEvidence.environment}: ${item.executionEvidence.observedResult}`;
  }
  if (item.source && item.contextScope) return `${item.source} (${item.contextScope})`;
  return "Engineering proposal; no execution evidence";
}

function renderCommands(content: EngineeringContent): string {
  if (!content.commands.length) return "No applicable commands have been established yet.";
  const ordered = content.commands
    .map((item, index) => ({ item, index }))
    .sort((left, right) => COMMAND_PURPOSES.indexOf(left.item.purpose) - COMMAND_PURPOSES.indexOf(right.item.purpose) || left.index - right.index)
    .map(({ item }) => item);
  return [
    "| Purpose | Scope | Command | Confidence | Source or exact evidence |",
    "|---|---|---|---|---|",
    ...ordered.map((item) =>
      `| ${item.purpose} | ${escapeCell(item.scope)} | \`${escapeCell(item.command)}\` | ${item.confidence} | ${escapeCell(commandSource(item))} |`),
  ].join("\n");
}

function renderRelationships(content: EngineeringContent): string {
  if (!content.relationships.length) return "No delivery-relevant component relationships are established.";
  return [
    "| From | To | Relationship | Delivery consequence |", "|---|---|---|---|",
    ...content.relationships.map((item) =>
      `| ${escapeCell(item.from)} | ${escapeCell(item.to)} | ${escapeCell(item.description)} | ${escapeCell(item.deliveryConsequence)} |`),
  ].join("\n");
}

function renderTriggers(content: EngineeringContent): string {
  return [
    "| Guide | State | Why or next responsibility |", "|---|---|---|",
    ...content.triggers.map((item) => `| ${item.kind} | ${item.triggered ? "Triggered" : "Not triggered"} | ${escapeCell(item.triggered ? `${item.reason} Next: ${item.nextResponsibility}.` : "No reusable need established.")} |`),
  ].join("\n");
}

function renderDeferrals(content: EngineeringContent): string {
  if (!content.deferrals.length) return "No Engineering decisions are deferred.";
  return [
    "| Decision | Consequence | Revisit when | Effect now |", "|---|---|---|---|",
    ...content.deferrals.map((item) => `| ${escapeCell(item.question)} | ${escapeCell(item.consequence)} | ${escapeCell(item.revisitWhen)} | ${item.blocking ? "Blocks Engineering confirmation" : "Does not block confirmation"} |`),
  ].join("\n");
}

function appendBefore(markdown: string, heading: string, addition: string): string {
  const marker = `\n${heading}\n`;
  if (!markdown.includes(marker)) throw new Error(`Cannot place Engineering view before ${heading}.`);
  return markdown.replace(marker, `\n${addition}\n${heading}\n`);
}

export function renderEngineeringArtifacts(
  product: ProductStartState,
  state: EngineeringFoundationState,
  templateRoot: string,
): EngineeringRenderedArtifacts {
  const presentation = structuredClone(product);
  const next = projectAction(product, state);
  presentation.nextActions = [structuredClone(next)];
  const base = renderArtifacts(presentation, templateRoot);
  const engineeringStatus = statusWithProduct(state, product);
  const engineeringRow = `| Engineering | ${engineeringStatus} — [Engineering Guide](docs/loopy/Engineering-Guide.md) | ${escapeCell(engineeringParticipationNeed(state, product, next.action))} |`;
  let home = base["LOOPY.md"].replace(
    "| Engineering | Not established | Establish an Engineering guide when delivery needs it |",
    engineeringRow,
  );
  const responsibilityRows = {
    architecture: "| Architecture | Not yet known to be needed | Participate only when durable structural guidance is triggered |",
    "demo-strategy": "| Demo or quality | Not yet needed | Establish reusable proof guidance just in time |",
    "release-strategy": "| Release | Not yet needed | Establish reusable release guidance when distribution affects delivery |",
  } as const;
  const responsibilityLabels = { architecture: "Architecture", "demo-strategy": "Demo or quality", "release-strategy": "Release" } as const;
  for (const trigger of state.engineering.triggers.filter((item) => item.triggered)) {
    home = home.replace(
      responsibilityRows[trigger.kind],
      `| ${responsibilityLabels[trigger.kind]} | Triggered | ${escapeCell(trigger.nextResponsibility)}: ${escapeCell(trigger.reason)} |`,
    );
  }
  const blockers = state.engineering.deferrals.filter((item) => item.blocking)
    .map((item) => `**Engineering — ${item.question}:** ${item.consequence} Revisit when ${item.revisitWhen}.`);
  if (blockers.length) home = home.replace("No current blockers.", blockers.join("\n"));
  validateRenderedHome(home);

  const triggered = state.engineering.triggers.filter((item) => item.triggered);
  const engineeringRoadmap = `## Engineering foundation\n\n- **Status:** ${engineeringStatus}\n- **Guide:** [Engineering Guide](Engineering-Guide.md)\n- **Conditional guides:** ${triggered.length ? triggered.map((item) => `${item.kind} — ${item.reason}`).join("; ") : "None triggered"}\n- **Next action:** ${next.participant}: ${next.action} — ${next.reason}\n`;
  const roadmap = appendBefore(base["docs/loopy/Roadmap.md"], "## Product questions to revisit", engineeringRoadmap);

  const defaults = state.engineering.projectDefaults;
  const guideTemplate = readFileSync(join(templateRoot, "docs/loopy/Engineering-Guide.md"), "utf8");
  const guide = replaceTemplate(guideTemplate, {
    projectName: product.product.projectName,
    engineeringStatus,
    summary: state.engineering.summary || "The Engineering foundation is being established.",
    authorizedContext: bullets(state.contextGrants.map(contextLabel), "No project context has been authorized for Engineering inspection."),
    evidence: renderEvidence(state.engineering),
    projectDefaults: renderDefaults(state.engineering),
    components: renderComponents(state.engineering),
    commands: renderCommands(state.engineering),
    relationships: renderRelationships(state.engineering),
    practices: ["### Practices", bullets(defaults.practices, "No shared coding practices established."), "", "### Required checks", bullets(defaults.requiredChecks, "No required checks established.")].join("\n"),
    operatingContext: [
      ["Environments", defaults.environments], ["Delivery constraints", defaults.deliveryConstraints],
      ["Compatibility", defaults.compatibility], ["Security", defaults.security], ["Operations", defaults.operations],
    ].map(([label, values]) => `### ${label}\n\n${bullets(values as string[], `No ${String(label).toLowerCase()} guidance established.`)}`).join("\n\n"),
    triggers: renderTriggers(state.engineering),
    openMatters: ["### Assumptions", bullets(state.engineering.assumptions, "None recorded."), "", "### Unknowns", bullets(state.engineering.unknowns, "None recorded.")].join("\n"),
    deferrals: renderDeferrals(state.engineering),
    confirmationBoundary: confirmationBoundary(state, product),
  });
  return { "LOOPY.md": home, "docs/loopy/Roadmap.md": roadmap, "docs/loopy/Engineering-Guide.md": guide };
}
