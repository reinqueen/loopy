import type { ProductStartContract, RoadmapContent } from "./types.js";

function comparableText(value: string): string {
  return value.trim().replace(/[.!?]+$/u, "").replace(/\s+/gu, " ").toLocaleLowerCase("en");
}

export function isStandardProductReviewAction(
  action: string,
  contract: ProductStartContract,
): boolean {
  const comparable = comparableText(action);
  return contract.roadmap_rules.standard_product_review_actions
    .some((standard) => comparableText(standard) === comparable);
}

export function normalizeRoadmapForConfirmation(
  roadmap: RoadmapContent,
  contract: ProductStartContract,
): RoadmapContent {
  return {
    ...structuredClone(roadmap),
    lifecycleState: contract.roadmap_rules.confirmed_lifecycle_state,
    lifecycleExplanation: contract.roadmap_rules.confirmed_lifecycle_explanation,
    candidates: roadmap.candidates.map((candidate) => ({
      ...structuredClone(candidate),
      nextAction: isStandardProductReviewAction(candidate.nextAction, contract)
        ? contract.roadmap_rules.standard_post_confirmation_action
        : candidate.nextAction,
    })),
  };
}

export function confirmedRoadmapContradiction(
  roadmap: RoadmapContent,
  contract: ProductStartContract,
): string | null {
  if (roadmap.lifecycleState !== contract.roadmap_rules.confirmed_lifecycle_state) {
    return `Confirmed Roadmap lifecycle state must be "${contract.roadmap_rules.confirmed_lifecycle_state}".`;
  }
  if (roadmap.lifecycleExplanation !== contract.roadmap_rules.confirmed_lifecycle_explanation) {
    return "Confirmed Roadmap lifecycle explanation must match the formal confirmed lifecycle statement.";
  }
  if (roadmap.candidates.some((candidate) => isStandardProductReviewAction(candidate.nextAction, contract))) {
    return "A confirmed Roadmap candidate cannot still ask to review or confirm the Product foundation.";
  }
  return null;
}
