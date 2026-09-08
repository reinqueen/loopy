# Loopy v1 Verification Matrix

> Compact proof plan for Loopy builders and evaluators. It fixes what each v1 promise must prove without creating an evaluation platform.

> **Fork qualification note:** The Slice records below preserve implementation and evaluation lineage from before the Loopy rename. They identify risks and prior decisions, but they do not qualify the exact renamed Loopy source or its Host packages. Current Loopy evidence begins with the port's 184-test regression pass, package validation, and packaged-runtime smoke test; installed-Host evaluation and human acceptance remain separate.

## How to use this matrix

- **During a slice:** run its automated checks and only the development-host scenarios needed for useful feedback.
- **After a slice:** record what is implemented, accepted, and still unverified.
- **For a release candidate:** freeze one exact commit and package set, then run every applicable scenario, independent evaluation, and human claim review.
- A failed candidate is never repaired in place. Fix it, create a new candidate, and rerun the affected checks.

## Reusable scenarios

Controlled fixture families and run rules are defined in the [v1 evaluation scenario guide](../../evaluation/scenarios/README.md). One family or run may cover several S1–S7 dimensions; the dimensions do not each require a separate project.

| Scenario | Starting situation | Main purpose |
|---|---|---|
| **S1 — New project** | Little or no existing project context | Prove Loopy can establish direction without inventing intent |
| **S2 — Well-documented project** | Current, useful project documentation exists | Prove Loopy can reuse authorized evidence without repeating answered questions |
| **S3 — Poorly documented project** | Context is incomplete or ambiguous | Prove adaptive questioning, unknowns, deferrals, and clear next actions |
| **S4 — Evidence conflict** | Documents, code, or supplied statements disagree | Prove evidence stays distinct from current intent and conflicts remain visible |
| **S5 — Different product or component types** | Website, API, CLI, library, data package, or mixed project | Prove guidance adapts without creating different Loopy products |
| **S6 — Change after Milestone commitment** | A committed outcome or boundary needs to change | Prove affected decisions reopen without losing history or adding unrelated approvals |
| **S7 — Inspectable Demo** | A delivered Milestone needs a clear demonstration | Prove human-guided and AI-operated recorded Demo evidence is understandable |

These scenarios may be reused across capabilities. A slice does not run scenarios for capabilities it has not implemented.

The large mixed-project Product Start family also checks outcome-based candidate grouping. It accepts reasoned variation in candidate count and rejects mechanical component-by-component fragmentation.

## Capability proof map

| V1 promise | Required scenarios | Automated proof | Applicable evaluation lenses | Release-candidate host evidence |
|---|---|---|---|---|
| **Start or adopt a project** | S1–S4; relevant S5 examples | Context grants, evidence attribution, decision states, responsibility boundary, confirmation, history, rendering, containment | Human understanding; Interview and decision experience; Lifecycle integrity; Team continuity | Preserved Product-start conversations and resulting three human artifacts |
| **Establish project guides** | S2–S5 | Component and command coverage, conditional triggers, responsibility confirmations, inheritance and exceptions | Human understanding; Interview and decision experience; Lifecycle integrity; Team continuity | Generated Engineering Guide and any triggered Architecture, Demo, or Release guidance |
| **Manage the Living Roadmap** | S1–S6 | Candidate ordering, portfolio states, dependencies, history, next action, release queue, stale-view detection | Human understanding; Lifecycle integrity; Team continuity | Before/after Roadmap and project-home views from ordinary prioritization and state changes |
| **Define and deliver a Milestone** | S3–S7 | Definition boundary, Plan containment, work state, exact candidate evidence, acceptance transitions | Human understanding; Interview and decision experience; Lifecycle integrity; Proof and Demo trust; Team continuity | Definition, Plan, Proof, execution trace, and accepted or rejected Demo result |
| **Manage change** | S4 and S6 | Change classification, affected-boundary reopening, approval count, preserved revisions | Interview and decision experience; Lifecycle integrity; Team continuity | Conversation, artifact diff, state history, and the single applicable human decision |
| **Demonstrate outcomes** | S5 and S7 | Evidence identity, observed result, failure/limitation preservation, Demo completeness | Human understanding; Proof and Demo trust | Human-guided Demo record and AI-operated recorded Demo with commands, outputs, logs, and applicable screenshots |
| **Release and publish** | Completed outcomes from S5–S7 | Exact commit, package hashes, included Milestones, compatibility, authorization, destination, rollback, availability | Human understanding; Lifecycle integrity; Proof and Demo trust; Release integrity | Release Plan, Review, Notes, package evidence, publication authorization, and availability check |
| **One product across Host AIs** | Same applicable scenario subset on each claimed host | Reproducible packages from one commit; identical contracts, templates, and Engine behavior | Human understanding; Interview and decision experience; Release integrity | Separate installed-package runs for Codex and Claude Code, each checking host-appropriate artifact access in its actual interface; claims limited to hosts actually proven |

## Evidence levels

| Level | What it establishes | What it does not establish |
|---|---|---|
| **Automated source proof** | Deterministic Engine, CLI, rendering, state, history, and containment behavior | Semantic correctness, interview quality, comprehension, or Host AI support |
| **Development-host walkthrough** | Early evidence that the current skill guidance works through one Host AI | Release-candidate identity, package reproducibility, or cross-host support |
| **Release-candidate evaluation** | Behavior of one frozen commit and exact packages in clean workspaces | Human acceptance or publication authority |
| **Human claim review** | Whether preserved evidence supports the wording of each proposed release claim | Permission to publish unless the decision explicitly includes destination and visibility |

## Slice 1 fixed boundary

Slice 1 covers **Start or adopt a project** only.

- **Source proof:** the accepted candidate `61cf9b1` passed 32 automated tests, TypeScript validation, production build, and independent source-level evaluation.
- **Development-host evidence:** `61cf9b1` remains the source-accepted boundary. Corrected candidate `df4461c` passed the authorized-context Codex walkthrough in [Slice 1 Codex Development Walkthrough](../../evidence/development/Slice-1-Codex-Walkthrough.md); corrected large-project candidate `d71903f` passed the Harbor evaluation recorded in [Slice 1 Large-Project Development Evaluation](../../evidence/development/Slice-1-Large-Project-Evaluation.md), with limitations confined to later evidence categories.
- **Greenfield correction and proof:** a later human walkthrough was not accepted because domain elicitation was insufficient and distinct migration outcomes were compressed into one candidate. Product Start correction `3ababb1` passed independent evaluator task `01a0740f-c597-7a50-8b47-b5c6ca2622b8` with 66 tests, build, skill validation, and a fresh migration-context simulation. AI-operated recorded simulation task `01a0743c-ac82-7f11-a06b-ffdae9468e61` is supporting evidence rather than human judgment.
- **Human acceptance:** on 2026-09-05 the human explicitly accepted the corrected Slice 1 development boundary, as recorded in [Slice 1 Human Acceptance](../../evidence/development/Slice-1-Human-Acceptance.md).
- **Explicit limitations:** the corrected experience has not been proven in a real-team walkthrough; packaged Codex behavior and packaged Claude Code behavior remain unverified. Acceptance grants no release or publication authority.
- **Capability status:** `implemented-unverified` until the required later evidence supports a stronger claim.

## Slice 2 fixed boundary

Slice 2 covers the component-aware **Engineering Foundation** portion of **Establish project guides** only.

- **Accepted development definition and scenarios:** [Engineering Foundation Experience](../design/stages/ENGINEERING-FOUNDATION-EXPERIENCE.md) is exercised with the controlled [Harbor Engineering Foundation scenario](../../evaluation/scenarios/engineering-foundation/large-mixed-project/Scenario.md), versioned Product prerequisite setup, and the [greenfield human walkthrough](../../evaluation/scenarios/engineering-foundation/greenfield-human-walkthrough/Scenario.md).
- **Candidate history:** `c46a83a` failed on shared-view synchronization and caller-controlled confirmed routing. `3a077c8` corrected those defects but failed on reopened-guide history wording. Exact candidate `6e111e3f912da601a4186103b895de66ac5a67bf` passed the focused independent reevaluation recorded in [Slice 2 Engineering Foundation Evaluation](../../evidence/development/Slice-2-Engineering-Foundation-Evaluation.md).
- **Source and evaluator proof:** frozen installation, 64 automated tests, production build, controlled Harbor transitions, rejection integrity, append-only reconfirmation, readable prior/current revision context, and synchronized stale checks passed.
- **Interview correction and evaluation:** the initial human walkthrough was not accepted because participation was shallow and future-responsibility wording was unclear. Correction `e203bc9` deepened participation and passed focused evaluator task `01a073f3-a6dd-7f33-bb02-8c009cd2fec9` with 65 tests, build, skill validation, and greenfield simulation passing.
- **Human acceptance:** on 2026-09-05 the human explicitly accepted the Slice 2 development boundary, as recorded in [Slice 2 Human Acceptance](../../evidence/development/Slice-2-Human-Acceptance.md). Later Product-only correction `3ababb1` does not alter the accepted Engine or Engineering boundary.
- **Explicit limitations:** the corrected interview was simulated rather than rerun with a real team; packaged Codex behavior and packaged Claude Code behavior remain unverified. Acceptance grants no release or publication authority.
- **Capability status:** `implemented-unverified`; no packaged-host support claim is made.

## Slice 3 fixed boundary

Slice 3 covers **Living Roadmap Management** only.

- **Accepted definition:** [Living Roadmap Experience](../design/stages/LIVING-ROADMAP-EXPERIENCE.md), human-accepted on 2026-09-06 against exact definition commit `fe7c246`.
- **Controlled scenario:** the versioned [Harbor Living Roadmap scenario](../../evaluation/scenarios/living-roadmap/large-mixed-project/Scenario.md) covers outcome-first portfolio operations, typed dependencies, responsibility boundaries, Definition eligibility, atomic selection, continuity, readable views, and rejection integrity.
- **Explicit limitations:** selection alone creates no Definition or commitment; the separately implemented Slice 4 route must be entered. Real-team walkthroughs and packaged Codex and Claude Code behavior remain unverified. No implementation, Release, or publication authority follows from definition acceptance.
- **Capability status:** `implemented-unverified` until later evidence supports a stronger claim.

## Slice 4 fixed boundary

Slice 4 covers **Milestone Definition** only.

- **Accepted design:** [Milestone Definition Experience](../design/stages/MILESTONE-DEFINITION-EXPERIENCE.md), human-approved on 2026-09-06; the separate [Definition acceptance record](../../evidence/development/Slice-4-Definition-Acceptance.md) grants bounded implementation authority only.
- **Controlled scenarios:** the [golden Definition path](../../evaluation/scenarios/milestone-definition/golden-path/Scenario.md) covers deterministic Product-to-Definition mechanics, and the [behavioral suite](../../evaluation/scenarios/milestone-definition/interview-quality/Scenario.md) defines the independent multi-turn evaluation still required.
- **Explicit limitations:** builder-run automated checks do not prove semantic interview quality. No independent evaluator pass, human implementation acceptance, Planning, implementation, Proof, Demonstration, Release, publication, deployment, or push follows from the design acceptance.
- **Capability status:** `implemented-unverified` until independent evidence and later human acceptance support a stronger claim.

## Slice 5 fixed boundary

Slice 5 covers **Change Management** only.

- **Accepted design:** [Change Management Experience](../design/stages/CHANGE-MANAGEMENT-EXPERIENCE.md), human-approved on 2026-09-07; the separate [Definition acceptance record](../../evidence/development/Slice-5-Definition-Acceptance.md) authorizes bounded implementation only.
- **Controlled scenarios:** the [Change Management scenario suite](../../evaluation/scenarios/change-management/Scenario.md) separates deterministic mechanics from the independent multi-turn evaluation required for classification, questioning, impact tracing, responsibility routing, and authority interpretation.
- **Human implementation acceptance:** on 2026-09-07 the human explicitly accepted the evaluated Slice 5 implementation at exact commit `63f2439ee88422341c6af702657eeb93d605a156`, as recorded in [Slice 5 Human Acceptance](../../evidence/development/Slice-5-Human-Acceptance.md).
- **Explicit limitations:** Slice 5 changes lifecycle meaning and routes to the earliest affected stage; it does not implement the underlying product change or grant Planning, Build, Proof, Demonstration, Release, deployment, publication, merge, or push authority. Slice 4 implementation remains independently proven but not human-accepted.
- **Capability status:** `implemented-unverified`; human development acceptance is distinct from release-candidate qualification and packaged-host support.

## Slice 6 fixed boundary

Slice 6 covers **Milestone Planning and Conditional Guides** only.

- **Accepted design:** [Milestone Planning and Conditional Guides](../design/stages/MILESTONE-PLANNING-EXPERIENCE.md), human-approved on 2026-09-07 against exact definition commit `5a80ca6` and recorded in [Slice 6 Definition Acceptance](../../evidence/development/Slice-6-Definition-Acceptance.md).
- **Controlled scenarios:** the Planning scenarios cover a golden committed-Definition handoff, independent and blocked Plans, bounded work units, dependency/parallel safety, risk-based focused and mandatory final integrated evaluation boundaries with bounded correction cycles, conditional-guide timing and confirmation, state/render cadence, and stopping before implementation.
- **Explicit limitations:** Plan readiness grants no implementation or tool authority. Slice 6 creates no worktree, Build, Proof execution, Demonstration, Release execution, publication, or deployment behavior. Builder evidence does not prove Host planning judgment.
- **Capability status:** `implemented-unverified` until independent evaluation and later human implementation acceptance support a stronger claim.

## Slice 7 fixed boundary

Slice 7 covers **Milestone Build and Prove** only.

- **Accepted design:** [Milestone Build and Prove](../design/stages/MILESTONE-BUILD-AND-PROVE-EXPERIENCE.md), human-approved on 2026-09-07 against exact definition baseline `463ee0a` and recorded in [Slice 7 Definition Acceptance](../../evidence/development/Slice-7-Definition-Acceptance.md).
- **Controlled scenarios:** the Build scenarios carry a ready Plan through exact execution grants, sequential and explicit-safe-parallel Work Units, provider-neutral task assignments, frozen candidates, bounded correction cycles, independent evaluation, complete Proof coverage, stale/drift handling, and ready-for-Demonstration routing.
- **Independent evaluation:** fresh independent reevaluation returned **PASS** for exact candidate `e55cec14a70e182e11145bc22a5aebe6b716902d`, including the bounded adversarial groups, valid exact-candidate path, full automated gates, and clean/disposable evaluator provenance.
- **Human implementation acceptance:** on 2026-09-07 the human explicitly accepted that evaluated implementation after receiving the assessment and limitations from a proxy human-perspective review of the preserved customer-recovery walkthrough that the human had delegated to the orchestrating Host AI, as recorded in [Slice 7 Human Acceptance](../../evidence/development/Slice-7-Human-Acceptance.md). The human did not personally review or perform the walkthrough.
- **Explicit limitations:** the Engine records authorized results and evidence but does not execute open-ended product work or external mutations. Ready for Demonstration is not Demo, Confirmation, Milestone outcome Acceptance, completion, Release, publication, deployment, merge, or push authority. The ordinary conversational experience of gathering execution permissions gradually remains a non-blocking deferred UX walkthrough because the AI-operated scenario supplied most authority in its opening request. Slice 6 remains independently passing but not human-accepted.
- **Capability status:** `implemented-unverified`; human development acceptance is distinct from release-candidate qualification and packaged-host support.

## Slice 8 fixed boundary

Slice 8 covers **Milestone Demonstrate and Accept** only.

- **Accepted design:** [Milestone Demonstrate and Accept](../design/stages/MILESTONE-DEMONSTRATE-AND-ACCEPT-EXPERIENCE.md), human-approved on 2026-09-07 from exact source baseline `88cb8e7` and recorded in [Slice 8 Definition Acceptance](../../evidence/development/Slice-8-Definition-Acceptance.md).
- **Controlled scenarios:** the [UI-style Demo scenario](../../evaluation/scenarios/milestone-demonstrate-and-accept/ui-style/Scenario.md) and [non-UI Demo scenario](../../evaluation/scenarios/milestone-demonstrate-and-accept/non-ui/Scenario.md) separate deterministic exact-candidate mechanics from the later fresh behavioral evaluation of Demo clarity, tool fit, evidence access, human perspective, and acceptance fatigue.
- **Independent correction status:** exact candidate `ff297d5` failed independent evaluation on operated-target attribution, durable evidence resolution, simulated-input provenance, and normal-skill CLI completeness. [Slice 8 Correction Cycle 1](../../evidence/development/Slice-8-Correction-Cycle-1.md) records the bounded correction. Fresh independent reevaluation of exact candidate `b05939377115c4f7ed204bbf6955eab064c69dce` returned **PASS**, closing all four material findings with 184/184 tests and fresh UI-style and non-UI Host runs through the normal frozen skill route.
- **Low presentation findings:** the passing reevaluation found that one UI blocker-evidence reference was readable and durable but plain text rather than clickable Markdown, and that one blocked UI summary said no limitations were recorded while its status, unobserved criteria, empty coverage, and repair-only next action still prevented a false success claim. These remain presentation refinements rather than material provenance, authority, or truthfulness failures.
- **Explicit limitations:** builder tests establish formal state, provenance, rendering, routing, atomicity, and authority guards; they do not prove Host Demo design, semantic sufficiency, real human comprehension, or tool appropriateness. Complete means accepted but unreleased. No Release, merge, push, tag, deployment, publication, or distribution authority follows.
- **Capability status:** `implemented-unverified`; independent exact-candidate evaluation passes, but explicit human implementation acceptance and later release qualification remain absent. Slice 6 remains independently passing but not human-accepted.

## V1 claim rule

Before publication, every release statement must identify the exact preserved evidence supporting it. If the evidence is weaker than the wording, narrow the claim instead of promoting the capability.
