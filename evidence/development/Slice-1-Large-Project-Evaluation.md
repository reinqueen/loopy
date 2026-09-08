# Slice 1 — Large-Project Development Evaluation

## Run boundary

- **Scenario:** [Harbor large mixed project](../../evaluation/scenarios/product-start/large-mixed-project/Scenario.md)
- **Initial candidate:** `03eec9c`
- **Initial evaluator task:** `01a07390-8937-7060-9a28-e2084c3078c5` — **PASS WITH LIMITATIONS**
- **Observed limitations:** multi-item Product direction was rendered as semicolon-heavy text, and the evaluator needed repeated probes to discover the `apply` schema.
- **Correction candidate:** `d71903f`
- **Correction evaluator task:** `01a0739f-f968-7820-8098-7d5dee05bd30`
- **Disposable workspace:** `/private/tmp/loopy-s1-d71903f-harbor.5ctMeW`

## Outcome

Loopy produced three outcome-based, uncommitted candidates: customer recovery, partner status, and operational risk. The grouping followed Product outcomes and dependencies; it was explicitly not one candidate per technical component. Product alone confirmed revision 1, no Milestone was committed, the Engine reported no stale views, all 37 automated tests passed, and the TypeScript build passed.

## Scenario checks

| Check | Result |
|---|---|
| Authorized-context boundary | PASS |
| Adaptive Product interview | PASS |
| Outcome-based candidate grouping | PASS |
| Required Product coverage | PASS |
| Priority and dependencies | PASS |
| Artifact readability and access | PASS |
| Lifecycle and generated-view integrity | PASS |

## Corrections verified

Candidate `d71903f` rendered multi-item Product direction as real Markdown lists. The routed internal Engine reference also enabled valid `apply` inputs on the first attempt without exposing Engine mechanics to the Human.

## Disposition and limits

**Development-host large-project evaluation: PASS WITH LIMITATIONS**, limited to later evidence categories. Real-human comprehension and usability, packaged Codex behavior, and packaged Claude Code behavior remain unverified. A minor CLI ordering ambiguity was internal and did not breach Product Start. This evaluation creates no new capability or Host AI support claim.
