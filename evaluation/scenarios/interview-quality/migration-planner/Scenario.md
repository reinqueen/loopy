# Migration Planner Interview-Quality Regression

**Scenario version:** 1

**Purpose:** Reproduce the Product and Engineering interview failure observed in the 2026-09-06 greenfield human walkthrough without prescribing a product answer or technical solution.

This is a known-regression rubric. Run it without exposing the expected observations to the Host AI, and evaluate the preserved multi-turn conversation rather than matching exact wording.

## Starting point

- Use the exact Loopy candidate under evaluation in a fresh, empty, disposable target workspace.
- Product begins with “migration planner,” then clarifies only “moving or restructuring data and databases.”
- Supply no source or destination, migration unit, transformation boundary, product surface, scale, hosting, security, integration, organizational technology preference, or implementation stack.

## Expected Product behavior

- Loopy counts each answerable decision, including a nested subquestion, alternative, bullet, or clause. A round contains no more than three such decisions, regardless of paragraph or question-mark count, and preferably fewer when an early answer controls later relevance.
- The Product path unfolds over multiple adaptive rounds: responsibility and context authorization are settled separately from unrelated framing; then Loopy tests whether this is one specific migration program or a reusable multi-migration product; only after recomputing does it ask the applicable origin, destination, migration-unit, or transformation questions.
- Loopy places material migration framing before Roadmap finalization in the decision tree. It does not propose final candidate outcomes or declare the grouping ready first.
- It asks only applicable small questions about origin and destination, what moves, what may transform, and material consequences; explicit unknowns and deferrals remain available. Examples clarify the current decision and do not silently add questions.
- After each answer it recomputes the frontier, asking downstream scope, success, or candidate-grouping questions only when their prerequisite meaning is sufficiently settled.
- After a vague or partial answer, Loopy identifies what became understood and what remains materially unclear, then probes or reflects that meaning instead of treating the response as permission to advance coverage.
- It reflects important meaning and invites correction. It does not declare Product readiness while a material migration interpretation remains unresolved, even if other Product fields and candidate drafts are populated.
- A deliberately recorded nonblocking deferral may permit readiness only when Product has made clear that the deferred detail does not prevent coherent current meaning.

## Expected Engineering behavior

- Loopy reuses the known blank-workspace fact and asks whether external or newly supplied technical context exists; it does not request another whole-workspace inspection.
- Engineering responsibility and context access are separate decisions. An ambiguous “yes” is clarified rather than treated as both grants.
- The greenfield Engineering path also unfolds over multiple adaptive rounds. With no technical evidence, Loopy first asks the earliest prerequisite, such as intended use surface and collaboration context. It recomputes before asking only relevant integrations, then recomputes again before asking a small applicable subset of organizational or operational constraints.
- Loopy never presents language, cloud, hosting, storage, security, scale, operations, and delivery constraints as one questionnaire wall. Applicable context and Engineering intent still precede stack hypotheses.
- Loopy does not assume a web interface, TypeScript, React, Node, PostgreSQL, a scale premise, or CSV/manual import. Any later recommendation is labeled, states its basis, and remains open to correction.

## Evidence boundary

The Engine can enforce declared conditional-decision disposition, readiness blocking, distinct responsibility and grant fields, explicit whole-repository authorization, and rejected-operation non-mutation. Whether the Host AI built and recomputed the right prerequisite-aware frontier, an answer was semantically ambiguous, or a recommendation was genuinely grounded remains Host-AI behavior requiring conversation evaluation.

Preserve the exact candidate, Host AI, fresh workspace, starting contents, supplied context and grants, complete transcript, generated artifacts, per-turn frontier and move observations, evaluator judgment, and any steering. A Product run that probes framing before Roadmap shaping and an Engineering run prompted to ask before recommending are different evidence strengths and must be labeled honestly.

## Non-goals

- Require a migration checklist, preferred Product interpretation, stack, database, interface, or import method.
- Reopen an accepted lifecycle boundary, accept a slice, build the target product, or perform a later lifecycle stage.
