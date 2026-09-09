# Brownfield Outcome Discovery — development evidence

## Scope

This correction adds flexible requirements discovery, evidence-versus-intent reconciliation, outcome grouping, dependency and priority reasoning, and direct Milestone Definition while preserving existing Loopy routes and governance.

## Interview reference

Matt Pocock's public [`grilling` skill](https://github.com/mattpocock/skills/blob/main/skills/productivity/grilling/SKILL.md) was inspected as design inspiration. Loopy already had a dependency-aware question frontier, after-response move selection, repository inspection, and recommendation guidance. This correction retains those mechanisms and sharpens three behaviors:

- inspect available facts instead of asking Humans to retrieve them;
- follow material answers deeper and recompute prerequisites rather than advancing a questionnaire; and
- stop at sufficient shared understanding for the current target.

Loopy intentionally does not copy the reference's exhaustive or relentless posture. It asks only when a material gap, ambiguity, contradiction, risk, consequence, or current decision justifies another conversational move. There is no runtime dependency, extra skill, command, or mode.

## Deterministic additions

- Living Roadmap may anchor to the current Product draft as well as a confirmed Product foundation.
- Product draft-version anchors prevent silent drift while Roadmap or Definition work is active.
- Direct Definition initialization creates the minimum missing Product and Roadmap drafts and selects one explicitly intended candidate without confirming Product or committing the Milestone.
- Definition state can preserve current behavior, intended behavior, typed attributed evidence, and material reconciliation records.
- A material unresolved reconciliation blocks Definition review and commitment.
- Existing state without the new optional evidence fields remains readable.

## Claim boundary

Automated tests establish formal transitions, non-mutation, anchors, conflict blocking, rendering, and route preservation. Only a fresh independent Host-AI walkthrough can judge question quality, non-redundancy, appropriate depth, reconciliation quality, Milestone boundaries, and stopping behavior.
