# Loopy v1 Change Management

> Human-accepted as the Slice 5 design boundary on 2026-09-07. Implementation and later evidence remain separate; this acceptance grants no planning, implementation, release, publication, deployment, or push authority.

This definition specializes Change Management in the accepted [Product Lifecycle](PRODUCT-LIFECYCLE.md) without redesigning Slices 1–4.

## Outcome and boundary

A Human can request a correction or change to confirmed or committed Product, Engineering, Roadmap, or Milestone Definition meaning in ordinary language. Loopy distinguishes meaning-preserving maintenance from material change, shows the exact impact, gathers only necessary decisions, preserves prior versions and unaffected work, and updates affected canonical artifacts only after acceptance.

Slice 5 starts with the requested change and ends when it is accepted and reconciled, rejected, withdrawn, deferred, paused, or blocked, with exactly one project-level next action. It does not implement the underlying product change or perform Planning, Build, Proof, Demonstration, Release, deployment, or publication.

## Classification and interview

A **routine correction** changes no agreed meaning. Examples include typo or grammar repair, formatting, broken links, clearer equivalent wording, and synchronization to an already-confirmed decision. Loopy may apply it without approval, records concise provenance, and does not create a material change artifact.

A **material change** could change what is planned, built, demonstrated, or accepted, including outcome, requirements, scope, acceptance, priority, responsibility, constraints, or promises. Size, cost, effort, or risk alone does not make a change material when agreed meaning is unchanged. When classification is unclear, Loopy uses the shared Socratic move-selection loop to resolve the earliest material ambiguity and inspects authorized evidence before asking for discoverable facts.

Essential unknowns block acceptance. A safe-to-wait unknown records its consequence and an observable revisit condition. Product confirms changed Product meaning or priority; Engineering confirms changed technical meaning, dependency, feasibility, or constraint. A specialist participates only when missing specialist judgment prevents a safe bounded change. Required perspectives agree to the same current proposal revision, and one person may represent several only after explicitly representing each.

## Material change experience

Every material proposal receives one concise readable artifact:

```text
docs/loopy/changes/<collision-safe-readable-title>/Change.md
```

It shows status and base revision, reason, current versus proposed meaning, affected decisions and artifacts, downstream consequences, explicitly unaffected work, participants and represented responsibilities, unknowns and deferrals, authority requested, disposition, earliest-stage route, and one next action. `LOOPY.md` links active changes and the most important blocker or next action. `Roadmap.md` and affected artifacts carry compact change or supersession references only when relevant. Internal identities and hashes do not appear in normal views.

Proposed meaning never becomes canonical intent before acceptance. Clear natural-language intent can accept; no magic phrase or redundant reconciliation approval is required. One acceptance both approves the proposal and atomically reconciles affected canonical artifacts. Slice 5 has no partial acceptance within one proposal; Loopy offers to split separable parts into independent changes first.

Rejected and withdrawn changes retain concise history but disappear from active views. Deferred, paused, and blocked proposals preserve their frontier and one next action for resume.

## Deterministic boundary

- Every material proposal names an exact base revision and exact affected targets. Typed replacements describe the approved canonical updates; the Host AI owns semantic classification, coherence, and impact completeness.
- Only affected decisions reopen or change. Accepted reconciliation preserves prior versions, updates only affected canonical artifacts, leaves unaffected work and safely independent Milestones intact, and routes to the earliest affected lifecycle stage.
- Non-overlapping proposals may proceed independently. Overlapping proposals are ordered against their declared base revisions; a proposal whose target base is no longer current becomes stale and must be reassessed before acceptance.
- Acceptance is all-or-nothing. Validation precedes workspace-contained writes of state, current artifacts, links, history, and the single next action; any failure rolls the entire operation back.
- Reject, withdraw, defer, pause, stale/conflict rejection, invalid routine classification, and every rejected operation leave accepted meaning unchanged.
- Prior versions and append-only hash-linked provenance are preserved. Superseded meaning remains historical while current, proposed, and historical views remain visibly distinct.
- Canonical persistence and public rendering follow the Slice 4 boundary. Meaningful proposal updates persist in structured `.loopy` state; ordinary interview turns may leave a truthful published prior snapshot. Explicit view, useful pause/block, review readiness, acceptance, and status boundaries publish current human views with revision metadata. Resume detects stale views before advancing.
- Stable readable paths use deterministic collision handling. Containment applies to every target and artifact. No later-stage artifact or authority is created.

## Controlled evaluation

Automated scenarios cover routine corrections; Product-only material change; cross-Product/Engineering Definition impact; essential versus safe-to-wait unknowns; rejection, withdrawal, deferral, pause, and resume; natural-language acceptance without redundant approval; no partial acceptance; independent and overlapping changes; stale bases; atomic multi-artifact rollback; prior-version preservation; affected-only reconciliation; state/render cadence; containment; deterministic paths and ordering; one next action; and absence of later-stage artifacts. The full suite preserves Slices 1–4.

Builder-run scenarios establish deterministic mechanics only. Independent multi-turn evaluation must preserve the exact candidate, authorized context and grants, transcript, artifacts, observations, and evaluator judgment. It must assess classification, Socratic restraint, impact tracing, responsibility routing, acceptance intent, and the absence of unintended implementation without treating structural tests as proof of Host judgment.

## Explicit exclusions

Slice 5 does not partially accept one proposal, retroactively rewrite history, implement the requested product change, create or approve a Plan, build or modify the target product, execute Proof, perform or accept a Demonstration, release, publish, deploy, create implementation workspaces, or grant later-stage authority.
