# Loopy v1: Journey So Far

> Loopy development-preview status on 2026-09-08. The implementation was ported from an earlier product identity, so earlier exact-candidate evidence is design lineage—not qualification of the renamed Loopy package.

## One Loopy journey

The Human enters through the single **Loopy** skill and speaks in ordinary language. Loopy reads only authorized context, determines the current lifecycle stage, asks the smallest useful questions, persists canonical state, and keeps the human-facing project views synchronized.

`Start or adopt → establish Engineering context → manage Roadmap → define → plan → build and prove → demonstrate and accept → release and publish`

The [Product Lifecycle](PRODUCT-LIFECYCLE.md) is authoritative for the journey. The [v1 Release Definition](V1-RELEASE-DEFINITION.md), [Release Requirements](RELEASE-REQUIREMENTS.md), and [verification matrix](V1-VERIFICATION-MATRIX.md) govern stronger Release and Host-support claims.

## Implemented journey: Slices 1–8

| Slice | Human goal and key interaction | Main human-facing artifacts | Implemented stopping boundary | Current status |
|---|---|---|---|---|
| **1 — Start or adopt** | Explain the intended outcome; resolve Product meaning, people, need, boundaries, and priority through a calm Socratic interview. | `LOOPY.md`, `docs/loopy/Project-Definition.md`, `docs/loopy/Roadmap.md` | Confirmed Product foundation and one next action; no Engineering or implementation authority. | **Ported and source-tested.** Installed Loopy behavior is not yet independently qualified. |
| **2 — Engineering Foundation** | Establish how the project works technically from authorized evidence and Engineering intent, without reopening Product meaning. | `LOOPY.md`, `Roadmap.md`, `Engineering-Guide.md` | Confirmed Engineering foundation; no Architecture, Planning, Build, or Release execution. | **Ported and source-tested.** Installed Loopy behavior is not yet independently qualified. |
| **3 — Living Roadmap** | Organize outcome-first candidates; change priority and lineage; make dependencies, blockers, eligibility, and one next action visible; select eligible candidates atomically for Definition. | `LOOPY.md`, `Roadmap.md` | Selected candidates are routed forward; no Milestone Definition or commitment is created. | **Ported and source-tested.** Installed Loopy behavior is not yet independently qualified. |
| **4 — Milestone Definition** | Turn selected candidates into separate, coherent delivery boundaries; confirm outcome, requirements, scope, observable acceptance, dependencies, risks, and required perspectives. | One `docs/loopy/milestones/<milestone>/Definition.md` per candidate, plus synchronized project views | Explicitly named ready Definitions become Planned Milestones; no Plan or implementation authority. | **Ported and source-tested.** Human acceptance of the exact Loopy package is absent. |
| **5 — Change Management** | Propose a correction to confirmed or committed meaning, see exact impact, and accept, reject, withdraw, defer, pause, or split it without rewriting history. | One `docs/loopy/changes/<change>/Change.md` for each material proposal, plus affected artifacts and project views | Accepted meaning is reconciled atomically and routed to the earliest affected stage; the product change itself is not implemented. | **Ported and source-tested.** Installed Loopy behavior is not yet independently qualified. |
| **6 — Milestone Planning** | Decompose a committed Definition into bounded Work Units; expose required order, explicit safe parallel work, risks, guides, and a risk-based independent-evaluation budget. | `Plan.md`; conditional `Architecture.md`, `Demo-Strategy.md`, and `Release-Strategy.md`; synchronized project views | A coherent Plan is ready, with exactly one mandatory final integrated evaluation boundary; no Build activation or implementation authority. | **Ported and source-tested.** Human acceptance of the exact Loopy package is absent. |
| **7 — Build and Prove** | Grant an exact session authority for named Work Units, workspace, tools, model/cost and source-control scope; execute safely; freeze candidates; gather evidence; and run bounded independent evaluation. | `Proof.md`, with inspectable evidence and candidate/evaluator provenance; synchronized project views | Exact integrated candidate is **ready for Demonstration** only after mandatory independent PASS and complete evidence coverage; no Demo, human Acceptance, or Release authority. | **Ported and source-tested.** Installed Loopy behavior is not yet independently qualified. |
| **8 — Demonstrate and Accept** | Observe the exact proven outcome through a human-guided, AI-operated recorded, or combined Demo; make one explicit human judgment to accept, correct, or defer. | Digestible `Demo.md`, durable linked evidence/media, and synchronized project views | Acceptance makes the Milestone **Complete but unreleased**; correction routes backward; no Release or external publication authority. | **Ported and source-tested.** Human acceptance of the exact Loopy package is absent. |

Every capability remains `implemented-unverified` in the [capability registry](capabilities/registry.yaml). Human development acceptance and an independent slice evaluation do not establish packaged-host support or make Loopy Released.

## What has been tested

| Evidence kind | Inventory at this commit | What it does not prove |
|---|---|---|
| **Current Loopy source proof** | **184 tests across 9 test files** pass after the complete product, artifact, state-path, contract, template, and test rename. Typecheck, production build, skill validation, plugin validation, brand validation, and a packaged-runtime CLI smoke test also pass. | Host judgment, interview quality, human comprehension, or installed-package support. |
| **Earlier independent evaluation** | The implementation lineage contains focused evaluations and corrections across Slices 1–8. Because product identity, paths, packaging, and runtime layout changed, those records guide risk coverage but do not qualify the exact Loopy package. | Exact Loopy candidate behavior or Host support. |
| **Current installed-package evaluation** | Not yet run. The next controlled step is a fresh Codex task using the installed Loopy plugin. | No Codex or Claude Code support claim exists yet. |
| **Current human acceptance** | The human authorized creation of the Loopy fork. | This is not acceptance of the exact implementation, its Host behavior, or a Release. |

The [verification matrix](V1-VERIFICATION-MATRIX.md) remains the compact proof plan; the [scenario guide](../../evaluation/scenarios/README.md) explains how transcripts, artifacts, grants, observations, and evaluator judgments must be preserved.

## Known limitations and unproven behavior

- The exact renamed and packaged Loopy candidate has not received human implementation acceptance.
- Slice 8's UI run correctly blocked on an untrustworthy operated target, so it made no positive claim about the candidate UI, keyboard accessibility, responsive behavior, or screenshot quality. Its passing evaluation also noted two low presentation issues: one blocker-evidence reference was readable but not clickable, and one blocked summary understated the extent of unobserved behavior.
- The shared Socratic interview behavior has targeted and cross-domain evidence, but not every defined cross-domain case has run independently or with a real team.
- The ordinary conversational experience of gathering Build permissions gradually remains deferred; the preserved Slice 7 AI-operated run supplied most authority at the outset.
- Multi-person coordination, long-running projects, irreversible or partially successful external actions, and recovery under real organizational conditions have limited behavioral evidence.
- The development preview contains a self-contained runtime, but clean Host installation, update, uninstall/rollback, and representative installed-plugin runs are still pending. No Codex or Claude Code support claim is established by the current registry.
- Loopy v1 has not been released, published, deployed, or distributed.

## What comes next

- **Slice 9 — Release and Publish:** next; define and implement the bounded project lifecycle from Complete Milestones to an exact authorized and availability-verified Release.
- **Slice 10 — Package and Qualify v1:** underway as a development preview. Final qualification still requires the later Slice 9 source, exact-package regeneration, Host evaluation, and human review.
