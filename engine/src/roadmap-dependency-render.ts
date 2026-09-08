import { ROADMAP_PRIORITIES, type LivingRoadmapState } from "./living-roadmap-types.js";
import type { MilestoneDefinitionState } from "./milestone-definition-types.js";

function label(value: string): string {
  return value.replaceAll("`", "'").replaceAll("\n", " ").trim();
}

interface RoadmapRelationship {
  source: string;
  target: string;
  kind: "required-before" | "helpful-non-blocking" | "independent-potentially-parallel";
  boundary: "definition" | "implementation";
  note: string;
  origin: "Roadmap" | "Definition";
}

function semanticPart(value: string): string {
  return label(value).normalize("NFKC").replace(/\s+/gu, " ").toLowerCase();
}

function semanticKey(relationship: RoadmapRelationship, includeNote: boolean): string {
  return [relationship.source, relationship.target, relationship.kind, relationship.boundary,
    ...(includeNote ? [relationship.note] : [])].map(semanticPart).join("\u0000");
}

function roadmapRelationships(state?: LivingRoadmapState): RoadmapRelationship[] {
  if (!state) return [];
  const candidates = [...state.candidates].sort((left, right) =>
    ROADMAP_PRIORITIES.indexOf(left.priority) - ROADMAP_PRIORITIES.indexOf(right.priority) ||
    left.order - right.order || left.id.localeCompare(right.id));
  return candidates
    .filter((candidate) => ["Open", "Selected for definition"].includes(candidate.state))
    .flatMap((candidate) => candidate.dependencies.map((dependency) => {
      const candidateName = label(candidate.title);
      const dependencyName = label(dependency.candidateId
        ? state.candidates.find((item) => item.id === dependency.candidateId)?.title ?? "Unknown candidate"
        : dependency.external!);
      return {
        source: dependency.kind === "independent-potentially-parallel" ? candidateName : dependencyName,
        target: dependency.kind === "independent-potentially-parallel" ? dependencyName : candidateName,
        kind: dependency.kind,
        boundary: dependency.boundary,
        note: label(dependency.note),
        origin: "Roadmap" as const,
      };
    }));
}

function definitionRelationships(state?: MilestoneDefinitionState): RoadmapRelationship[] {
  if (!state) return [];
  return [...state.definitions]
    .sort((left, right) => left.order - right.order || left.id.localeCompare(right.id))
    .flatMap((definition) => definition.content.dependencies.map((dependency) => ({
      source: dependency.kind === "independent-potentially-parallel" ? label(definition.sourceCandidateTitle) : label(dependency.name),
      target: dependency.kind === "independent-potentially-parallel" ? label(dependency.name) : label(definition.sourceCandidateTitle),
      kind: dependency.kind,
      boundary: dependency.consequence,
      note: label(dependency.note),
      origin: "Definition" as const,
    })));
}

function uniqueRelationships(relationships: RoadmapRelationship[]): RoadmapRelationship[] {
  return relationships.filter((relationship, index, all) =>
    all.findIndex((candidate) => semanticKey(candidate, true) === semanticKey(relationship, true)) === index);
}

function roadmapSummary(relationships: RoadmapRelationship[], state?: LivingRoadmapState): string[][] {
  const unique = uniqueRelationships(relationships);
  const sections: string[][] = [];
  const required = unique.filter((relationship) => relationship.kind === "required-before");
  const requiredCore = required.filter((relationship, index, all) =>
    all.findIndex((candidate) => semanticKey(candidate, false) === semanticKey(relationship, false)) === index);
  const sources = [...new Set(requiredCore.map((relationship) => relationship.source))];
  if (sources.length) sections.push(["Must happen in order", ...sources.flatMap((source, sourceIndex) => {
    const targets = requiredCore.filter((relationship) => relationship.source === source);
    return [
      ...(sourceIndex ? [""] : []), source,
      ...targets.map((relationship, index) => `${index === targets.length - 1 ? "└─>" : "├─>"} ${relationship.target} (${relationship.boundary})`),
    ];
  })]);
  const independent = unique.filter((relationship) => relationship.kind === "independent-potentially-parallel")
    .filter((relationship, index, all) => all.findIndex((candidate) => semanticKey(candidate, false) === semanticKey(relationship, false)) === index)
    .map((relationship) => `${relationship.source} + ${relationship.target} (${relationship.boundary})`);
  if (independent.length) sections.push(["Potentially parallel", ...independent]);

  const coreGroups = new Map<string, RoadmapRelationship[]>();
  const endpointGroups = new Map<string, RoadmapRelationship[]>();
  for (const relationship of unique) {
    const core = semanticKey(relationship, false);
    coreGroups.set(core, [...(coreGroups.get(core) ?? []), relationship]);
    const endpoints = [semanticPart(relationship.source), semanticPart(relationship.target)].sort().join("\u0000");
    const endpointBoundary = `${endpoints}\u0000${relationship.boundary}`;
    endpointGroups.set(endpointBoundary, [...(endpointGroups.get(endpointBoundary) ?? []), relationship]);
  }
  const coordination: string[] = [];
  for (const group of coreGroups.values()) if (group.length > 1) {
    coordination.push(`${group[0].source} + ${group[0].target} (${group[0].boundary}) — differing recorded meaning: ${group.map((item) => `${item.origin}: ${item.note}`).join("; ")}`);
  }
  for (const group of endpointGroups.values()) {
    const kinds = [...new Set(group.map((relationship) => relationship.kind))];
    if (kinds.length > 1) coordination.push(`${group[0].source} + ${group[0].target} (${group[0].boundary}) — conflicting relationship kinds: ${kinds.map((kind) => kind.replaceAll("-", " ")).join("; ")}`);
  }
  for (const candidate of state?.candidates.filter((item) => ["Open", "Selected for definition"].includes(item.state)) ?? []) {
    for (const note of candidate.unresolvedDependencyNotes) coordination.push(`${label(candidate.title)} — ${label(note)}`);
  }
  if (coordination.length) sections.push(["Needs coordination", ...[...new Set(coordination)]]);
  return sections;
}

export function renderRoadmapDependencyMap(
  roadmap: string,
  livingRoadmap?: LivingRoadmapState,
  milestoneDefinition?: MilestoneDefinitionState,
): string {
  const withoutGeneratedMap = roadmap
    .replace(/\n?## Dependency map\n\n```text\n[\s\S]*?\n```\n*/g, "\n")
    .replace(/\n?## Delivery relationships\n\n```text\n[\s\S]*?\n```\n*/g, "\n");
  const relationships = [
    ...roadmapRelationships(livingRoadmap),
    ...definitionRelationships(milestoneDefinition),
  ];
  const sections = roadmapSummary(relationships, livingRoadmap);
  if (!sections.length) return withoutGeneratedMap;
  const lines = sections.flatMap((section, index) => [...(index ? [""] : []), ...section]);
  const section = `## Delivery relationships\n\n\`\`\`text\n${lines.join("\n")}\n\`\`\`\n\n`;
  return withoutGeneratedMap.replace("## Selected for Milestone Definition", `${section}## Selected for Milestone Definition`);
}
