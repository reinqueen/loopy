# Harbor Living Roadmap — controlled scenario

## Purpose

Evaluate Slice 3 against several outcome candidates, mixed dependencies, Product priority, and Engineering recommendations without entering Milestone Definition or implementation.

## Run

1. Use the [versioned setup](setup/v1/README.md) in a fresh disposable Harbor workspace.
2. Ask Loopy to show and explain the portfolio, then rename one candidate.
3. Combine two overlapping outcome candidates and verify new identity with visible superseded lineage; separately split one broad candidate into independently understandable outcomes.
4. Record required-before, helpful/non-blocking, and independent/potentially-parallel relationships. Include one required-before Definition blocker and one required-before implementation constraint.
5. Have Engineering recommend a dependency without changing Product priority.
6. Record participants and represented responsibilities.
7. Attempt to select an eligible candidate together with the Definition-blocked candidate; verify that neither is selected. Retry with two independently understandable eligible candidates.
8. Pause and resume one Roadmap operation. Make one human view stale and repair it from canonical state.
9. Attempt malformed, out-of-workspace, and accepted-commitment-changing operations and compare canonical state and views before and after rejection.

## Expected observations

- Candidate grouping remains outcome-first rather than component-shaped.
- Rename preserves identity; combine and split preserve readable lineage without silently removing sources.
- Definition eligibility remains distinct from implementation readiness, and no relationship is invented for unrelated candidates.
- Multi-selection is atomic and successful selection creates no Milestone folder, Definition, commitment, Plan, worktree, or implementation authority.
- `LOOPY.md` and `Roadmap.md` remain compact, synchronized, and free of internal identities, with exactly one project-level next action.
- When relevant typed relationships exist, `Roadmap.md` includes one portable fenced **Delivery relationships** summary: required-before paths under **Must happen in order**, canonical independent relationships under **Potentially parallel**, and unresolved or conflicting meaning under **Needs coordination**. Helpful relationships remain in detailed candidate data, and no relevant relationship means no summary section.
- History is append-only and hash-linked; rejected operations do not mutate state or views.
