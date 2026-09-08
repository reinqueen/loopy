import type { EngineeringCoverage, EngineeringFoundationState } from "./engineering-types.js";
import { ENGINEERING_COVERAGE, GUIDE_TRIGGER_KINDS } from "./engineering-types.js";
import type { NextAction, ProductStartState } from "./types.js";

export function firstEngineeringGap(state: EngineeringFoundationState): EngineeringCoverage | null {
  return ENGINEERING_COVERAGE.find((topic) =>
    ["unresolved", "deferred_blocking"].includes(state.decisions[topic].status)) ?? null;
}

export function engineeringReviewAction(state: EngineeringFoundationState): NextAction {
  const gap = firstEngineeringGap(state);
  return gap ? {
    participant: "Engineering",
    action: `Continue with ${gap.replaceAll("_", " ")}`,
    reason: "This is the next unresolved or blocking Engineering decision.",
  } : {
    participant: "Engineering",
    action: "Review the Engineering foundation",
    reason: "The current Engineering Guide must be reviewed before confirmation.",
  };
}

export function confirmedEngineeringAction(
  state: EngineeringFoundationState,
  product: ProductStartState,
): NextAction {
  for (const kind of GUIDE_TRIGGER_KINDS) {
    const trigger = state.engineering.triggers.find((item) => item.kind === kind && item.triggered);
    if (!trigger) continue;
    const label = {
      architecture: "Architecture",
      "demo-strategy": "Demo or quality",
      "release-strategy": "Release",
    }[kind];
    return {
      participant: trigger.nextResponsibility,
      action: `Establish the ${label} guide`,
      reason: trigger.reason,
    };
  }
  if (product.roadmap.candidates.length === 0) {
    return {
      participant: "Product",
      action: "Add or select a Roadmap candidate when an outcome is ready",
      reason: "The Engineering foundation is confirmed, but no possible delivery outcome is recorded.",
    };
  }
  return {
    participant: "Engineering",
    action: "Review the highest-priority candidate for feasibility",
    reason: "The Engineering foundation is confirmed; no Milestone has been committed.",
  };
}

export function projectAction(product: ProductStartState, engineering: EngineeringFoundationState): NextAction {
  if (product.phase !== "product-foundation-confirmed") return structuredClone(product.nextActions[0]);
  if (engineering.productRevision !== product.revision) {
    return {
      participant: "Engineering",
      action: "Revisit the Engineering foundation against the changed Product direction",
      reason: "The current Engineering foundation is anchored to an earlier Product confirmation.",
    };
  }
  return structuredClone(engineering.nextActions[0]);
}
