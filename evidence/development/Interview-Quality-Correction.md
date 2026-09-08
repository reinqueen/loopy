# Socratic Interview-Quality Correction

**Observed:** 2026-09-06 human walkthrough

**Correction baseline:** `7f9dfb35d9cc450053b00236e8499b393e97be58`

## Observed conversation

The known domain-specific failure is preserved only in the controlled [interview-quality regression scenario](../../evaluation/scenarios/interview-quality/migration-planner/Scenario.md). In summary, Loopy converted materially ambiguous Product language into Roadmap outcomes too early, later repeated a known blank-workspace inspection request, bundled responsibility with access, and proposed unsupported technical choices.

The resulting generated artifacts and update inputs are preserved outside this repository in the human's walkthrough workspace. They are development evidence, not acceptance evidence.

## Correction rationale and boundary

The single Loopy skill now makes a Socratic decision-coverage interview the default across stages. Its Loopy-native decision tree exposes only questions whose prerequisite meaning is sufficiently settled, selects a small useful frontier subset, and recomputes that frontier after every answer. It stops at the current lifecycle boundary rather than exhausting future branches. Product guidance uses a domain-neutral ambiguity rule before Roadmap finalization. Engineering guidance puts missing context and intent before dependent stack hypotheses, reuses known context, separates responsibility from access, and requires every hypothesis to state a known basis.

The decision-tree, frontier, prerequisite-ordering, recomputation, and agent-owned fact-finding principles were checked against the upstream [grilling skill](https://github.com/mattpocock/skills/blob/main/skills/productivity/grilling/SKILL.md). Loopy intentionally does not copy its wording, whole-frontier rounds, relentless style, or exhaustive stopping rule.

Formal regressions cover what the Engine can know: unresolved triggered transition coverage prevents readiness; an explicit nonblocking disposition can permit it; responsibility and context grants remain separate; whole-repository access still requires explicit authorization. Progressive questioning, semantic ambiguity, and whether a recommendation is sufficiently grounded remain Host-AI guidance evaluated from preserved conversations.

This correction does not re-accept any prior slice or grant Milestone, implementation, merge, Release, publication, or deployment authority. Independent reevaluation and later human confirmation remain required.

## Follow-up Host-AI observation

A live check of the prerequisite-aware candidate showed domain framing before Roadmap shaping and avoided unsupported Engineering stack proposals, but its question rounds still bundled too many answerable decisions. The correction therefore defines the limit by actual decisions—including nested prompts—and requires Product and greenfield Engineering discovery to unfold over multiple recomputed rounds. The Product blind run supports the sequencing result. The Engineering run was prompted by the evaluator to ask first, so it is not independent behavioral proof; a fresh blind Engineering run remains required.

A subsequent anti-overfitting review found that production Product guidance encoded the known regression's exact domain and expected questions. Those details now remain only in the controlled scenario. Production guidance states the general ambiguity and prerequisite rule, while structural tests prevent the held-out label and scripted prompt fragments from returning.
