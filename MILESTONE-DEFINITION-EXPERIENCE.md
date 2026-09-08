# Loopy v1 Milestone Definition

> Human-accepted as the Slice 4 design boundary on 2026-09-06. Implementation and later evidence remain separate; this acceptance grants no planning, implementation, release, publication, deployment, or push authority.

This definition specializes Milestone Definition in the accepted [Product Lifecycle](PRODUCT-LIFECYCLE.md) without redefining earlier or later stages.

## Outcome and boundary

A Human can ask Loopy in ordinary language to define one or more selected Roadmap candidates or continue interrupted Definition work. Loopy creates one separate, readable `Definition.md` per candidate and guides only the Product, Engineering, and conditionally necessary specialist decisions needed for a bounded Milestone commitment.

Slice 4 starts with candidates atomically selected under Living Roadmap rules. If an ordinary request names open candidates, selection must succeed before any Definition state or folder is created. It ends per Definition as a committed **Planned** Milestone, a safely paused or blocked draft with one next action, or an uncommitted draft awaiting a decision.

## Definition coverage

Each Definition contains only the necessary outcome, requirements, scope and non-goals, observable acceptance boundary, dependencies, feasibility and constraints, risks, assumptions, unknowns, deferrals, and responsibility/readiness status. Inherited dependencies retain their required, helpful/non-blocking, or independent/potentially-parallel meaning and their Definition-versus-implementation consequence unless explicitly revised. Acceptance criteria must describe observable conditions that distinguish acceptance from rejection; vague claims such as “works correctly” are insufficient.

Later Proof and Demonstration are held against the committed acceptance boundary. Planning, implementation, proof, and demonstration may refine how the outcome is delivered or evidenced, but may not silently change its committed outcome, requirements, scope, or acceptance boundary.

**A committed Definition is the authoritative delivery boundary and cannot be silently changed. Change Management may explicitly reopen only the affected committed decisions.** Full Change Management remains outside this Slice.

## Interview and responsibility behavior

Loopy inherits confirmed Product and Engineering meaning and authorized evidence, then uses the shared Socratic move-selection loop only for gaps, conflicts, or new Definition decisions. The Host AI determines whether meaning is coherent enough to commit. Filled fields never allow the Engine to infer semantic completeness.

Product is required for Product meaning, people and need, business requirements, Product boundaries or priority consequences, user behavior, compatibility, external promises, and acceptance meaning. Engineering is required for technical outcomes, feasibility, dependencies, delivery constraints, risks, and whether technical decisions can safely wait. A genuinely Product-only or Engineering-only Milestone is valid when these responsibility rules permit it; a technical Milestone requires Product when its consequences cross a Product boundary.

Architecture, Demo/Quality, or Release input is required before commitment only when its absence genuinely prevents a safe, coherent, bounded Definition. Otherwise Loopy records the trigger and routes it forward just in time without performing that stage or creating a large setup gate.

Required perspectives must explicitly agree to the same current Definition revision. The final required response may also serve as the Milestone commitment when its requested effect is clear; Loopy does not ask for redundant generic approval. One person may represent several perspectives only after explicitly representing each.

## Multiple Definitions

A question may be shared only when its answer applies identically to each named Definition. Loopy attributes that answer separately and splits the interview path as soon as meaning, consequences, requirements, boundaries, dependencies, risks, acceptance, or required perspectives diverge.

Readiness, review, confirmations, history, and commitment remain independent per Definition. A human may commit several explicitly named, ready Definitions in one response; Loopy records a distinct commitment and history entry for each. An unready Definition remains draft or blocked and does not prevent other explicitly named ready Definitions from committing. Unnamed Definitions are never silently included.

## Artifacts and canonical state

Each candidate receives one collision-safe readable path:

```text
docs/loopy/milestones/<stable-readable-name>/Definition.md
```

The human artifact stays concise: **Outcome**, **Requirements**, **In Scope**, **Non-goals**, **Acceptance**, **Dependencies**, **Risks and Unknowns**, and **Responsibility and Readiness**. Internal identities and hashes do not appear in normal views.

`LOOPY.md` shows concise current state, the most important blocker, Definition links, and exactly one project-level next action. `docs/loopy/Roadmap.md` shows drafts and committed Planned Milestones with readable source provenance. Canonical state preserves stable identities and paths, source and foundation revisions, content, typed dependency meaning and consequences, risks and unresolved matters, required perspectives, current-revision receipts, specialist triggers, session state, view hashes, and append-only hash-linked per-Definition history.

Canonical persistence, public rendering, and conversational presentation are separate. Loopy persists meaningful Definition changes immediately in structured `.loopy` state for truthful interruption and resume. Ordinary interview updates leave the last published Markdown snapshot in place rather than creating or rewriting human views. Loopy publishes the current synchronized `Definition.md`, `LOOPY.md`, and `Roadmap.md` at review readiness, on an explicit view request, at a useful pause or block, at commitment, or for status/reporting. Published views identify their exact Milestone Definition state revision, so they remain truthful prior snapshots when canonical state advances; stale detection reports the difference and an explicit render regenerates them. Commitment and status responses include portable artifact references; clickable links are used when supported, while clear exact paths remain sufficient in terminal-oriented hosts.

## Deterministic boundary

- Atomic Slice 3 selection failure creates no Definition state or folder.
- Selected-batch order, Roadmap priority/order, and stable identity determine creation, rendering, and routing.
- Definition readiness is independent from implementation readiness; an implementation blocker blocks commitment only when it also prevents bounded feasibility or credible acceptance.
- Specialist input blocks only under the same safe-coherence rule; otherwise its trigger is routed forward.
- Review and every declared required perspective must refer to the same current Definition revision.
- Each named ready commitment independently creates a Planned Milestone, records source provenance and history, removes the candidate from the active queue, and refreshes views.
- Pause preserves the current frontier and one next action. Resume checks canonical state and stale views before advancing.
- Validation precedes workspace-contained writes. A rejected operation changes no folder, canonical state, history, receipt, or human view.
- The Engine validates structure, declared statuses, revisions, receipts, transitions, ordering, history, staleness, containment, and one next action; it does not judge semantic quality or grant authority.

## Controlled evaluation

Automated scenarios cover the golden Product-to-Engineering/Roadmap-to-Definition path; observable acceptance; formal-versus-semantic completeness; Product-only, Engineering-only, mixed, and Product-triggered technical Definitions; blocking and just-in-time specialist input; Definition-versus-implementation dependencies; shared then divergent multi-candidate interviewing; independent multi-commit behavior; authoritative-boundary protection; pause/resume, staleness, containment, deterministic collisions/routing, rollback, rejected-operation non-mutation, synchronized views, and absence of later-stage artifacts.

Builder-run scenarios establish deterministic mechanics only. Independent multi-turn evaluation must preserve the exact candidate, authorized context and grants, transcript, artifacts, observations, and evaluator judgment, and must assess the shared after-response move-selection loop without treating structural tests as proof of interview quality.

## Explicit exclusions

Slice 4 does not create or approve a Plan, build or modify the target product, execute Proof, demonstrate or accept an outcome, release, publish, deploy, choose or create implementation workspaces, implement full Change Management, or orchestrate a large multi-agent workforce. A Milestone commitment authorizes routing to Planning only; it grants no implementation or external-system authority.
