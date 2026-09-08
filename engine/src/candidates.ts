import { isDeepStrictEqual } from "node:util";
import type { RoadmapCandidate, RoadmapContent, RoadmapRevision } from "./types.js";

const PRIORITY_ORDER: Record<RoadmapCandidate["priority"], number> = {
  Highest: 0,
  High: 1,
  Medium: 2,
  Later: 3,
};

function withoutPriority(candidate: RoadmapCandidate): Omit<RoadmapCandidate, "priority"> {
  const { priority: _priority, ...meaning } = candidate;
  return meaning;
}

export function orderCandidatesByPriority(values: RoadmapCandidate[]): RoadmapCandidate[] {
  return values
    .map((candidate, inputOrder) => ({ candidate, inputOrder }))
    .sort(
      (left, right) =>
        PRIORITY_ORDER[left.candidate.priority] - PRIORITY_ORDER[right.candidate.priority] ||
        left.inputOrder - right.inputOrder,
    )
    .map(({ candidate }) => candidate);
}

export function isRoutineCandidateReprioritization(
  before: RoadmapCandidate[],
  after: RoadmapCandidate[],
): boolean {
  if (isDeepStrictEqual(before, after) || before.length !== after.length) return false;
  const unmatched = after.map(withoutPriority);
  for (const candidate of before.map(withoutPriority)) {
    const match = unmatched.findIndex((other) => isDeepStrictEqual(candidate, other));
    if (match === -1) return false;
    unmatched.splice(match, 1);
  }
  return unmatched.length === 0;
}

export function classifyRoadmapChange(
  before: RoadmapContent,
  after: RoadmapContent,
): RoadmapRevision["change"] {
  const sharedBefore = { ...before, candidates: [] };
  const sharedAfter = { ...after, candidates: [] };
  return isDeepStrictEqual(sharedBefore, sharedAfter)
    ? "candidate-management"
    : "roadmap-update";
}
