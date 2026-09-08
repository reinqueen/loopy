# Milestone Build and Prove Engine Operations

Use the repository Engine through its `build-*` operations. Keep commands internal; human artifacts show readable names, not Engine identities.

- `build-init --input <activation.json>` starts the first explicitly named ready Plan with its exact Work Unit-scoped execution grant and activated Plan evaluation budget.
- `build-activate --input <activation.json>` starts another ready Milestone or replaces the active session grant after prerequisites, anchors, and scope are rechecked.
- `build-assign --input <assignment.json>` records the actual responsibility, role, scope, checkpoint, available host/model, settings/profile, qualification, and recommendation basis immediately before task assignment. It runs only in the exact active Build session, rejects redundant active Work Unit assignments, and records a fresh task/context identity plus separate clean disposable workspace for an evaluator.
- `build-work --input <work.json>` records an inertly reported implementation/check result, exact before/after source and workspace fingerprints, used authority, evidence, coordination check, and any partial/uncertain effect. Eligible work follows stable Plan order unless an explicit safe parallel group permits otherwise, and an active owner cannot be silently replaced. The Engine does not execute the product mutation.
- `build-freeze --input <candidate.json>` freezes an exact focused or integrated candidate and correction lineage. A correction must change the exact source or workspace snapshot from its failed parent.
- `build-evaluate --input <evaluation.json>` records one independent exact-candidate charter, neutral-unproven verdict, evidence, coverage, findings, limitations, skips, and unproven behavior. Supported coverage rejects failed raw evidence; final PASS coverage accepts only passing evidence produced under the recorded final-evaluator assignment for the exact candidate.
- `build-adjust-budget --input <adjustment.json>` may lower unused limits; increasing an activated limit requires explicit Human judgment. Boundaries themselves return to Planning.
- `build-revalidate --input <revalidation.json>` records explicit Host review of exact changed anchors. Definition changes route through Change Management; Plan changes require a new execution grant.
- `build-render`, `build-status`, `build-interrupt`, `build-resume`, and `build-stale` preserve the canonical-state/published-view boundary.

Validation precedes state or view writes. Rejected operations do not mutate. Published status, pause/block, evaluation, and Demonstration-readiness boundaries atomically synchronize `Proof.md`, `LOOPY.md`, and `Roadmap.md`; ordinary work may persist canonical state without republishing. Resume checks views, source, workspace, anchors, and unchanged grant scope first.

The allowed Build source-control set is `edit`, `check`, `branch`, `worktree`, and `commit`; each must be explicit. Push, PR, merge, tag, deployment, publication, and Release are never Build-grant values. External systems must be named, but this Engine records authorization and outcomes rather than operating them.
