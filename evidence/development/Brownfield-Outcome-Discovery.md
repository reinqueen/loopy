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

## Final evaluation

- Host walkthrough: task `01a08486-5710-71a2-8330-a7b578fe0609`.
- Independent evaluation: task `01a08491-77d4-76b1-b6c8-c1aa80741a23`.
- Exact evaluated behavior commit: `4be4c5211aa5753a1493d60c79f0759ad998963a`.
- Verdict: **PASS**. This is independent evaluation, not Human acceptance.

The two-turn walkthrough inspected authorized evidence before interviewing, reconciled the three-retry documentation against source, tests, and Human intent, separated recovery from non-blocking support visibility, asked one high-value unresolved question, and preserved the same Roadmap candidates and Definition through a late clarification. The final human-facing views consistently routed to Definition review without confirming Product or committing a Milestone.

The independent evaluator verified unchanged candidate and Definition identities, append-only histories, clean active Roadmap and Definition staleness checks, a clean source worktree, seven focused brownfield tests, and the full 191-test suite. One minor display issue remains: non-blocking unknown sentences can render with doubled periods. The older Product-only staleness command can also report downstream-composed shared views as changed; the active Roadmap and Definition checks remain authoritative and clean.

This one walkthrough exercises the primary collaborative brownfield path. It does not prove every item in the broader 26-scenario behavioral matrix.
