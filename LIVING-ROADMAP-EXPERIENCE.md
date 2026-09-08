# Loopy v1 Living Roadmap Management

> Human-accepted as the Slice 3 development boundary on 2026-09-06 against exact definition commit `fe7c246`. Implementation and later evidence remain separate; this acceptance grants no release or publication authority.

This definition specializes the Living Roadmap behavior in the accepted [Product Lifecycle](PRODUCT-LIFECYCLE.md) without redefining other lifecycle stages.

## Outcome

A Human uses the single Loopy skill in ordinary language to understand and routinely organize the complete Milestone portfolio, then select one or more eligible candidates for Milestone Definition without committing them.

Slice 3 starts with an existing Loopy Roadmap, including a valid Roadmap with no candidates. It ends with synchronized `LOOPY.md` and `docs/loopy/Roadmap.md`, durable portfolio history, and exactly one project-level next action. A successful selection routes the eligible candidates to the next Slice.

## Roadmap experience

Loopy recognizes requests to view, add, rename, combine, split, prioritize, defer, cancel, supersede, select, pause, or resume Roadmap work. It gives a short state recap, asks only about ambiguity or consequences, offers recommendations, and continues from the recorded unresolved operation after interruption.

`Roadmap.md` remains the complete readable portfolio. `LOOPY.md` remains the concise operational home. Roadmap management is always part of the same Loopy experience, not a separate skill or mode.

## Portfolio model and actions

Each candidate has a stable internal identity and readable outcome, Product priority, dependencies, eligibility, blockers, current state, and next shaping step. When participation is known, Loopy records the participant and responsibility represented. For existing later-lifecycle work, it may preserve an already-known work location.

Candidate states are **Open**, **Selected for definition**, **Deferred**, **Cancelled**, and **Superseded**. They remain uncommitted portfolio states, distinct from committed Milestone states.

- **Add:** create an uncommitted outcome candidate.
- **Rename:** preserve identity and history.
- **Combine:** create a new candidate and preserve every source as superseded with visible lineage.
- **Split:** create new candidates and preserve the source as superseded with visible lineage.
- **Prioritize:** apply Product priority with stable ordering among equal priorities.
- **Defer:** record the reason and reconsideration condition.
- **Cancel:** record the reason without deleting history.
- **Supersede:** name the replacement and preserve lineage in both directions.
- **Select:** route one or more eligible candidates to Milestone Definition without creating or committing a Definition.

Candidates are grouped by coherent Product outcome, not mechanically by component, repository, service, screen, or technical task. Several candidates may enter Milestone Definition together when each can still be meaningfully understood independently.

## Bounded autonomy and responsibility

Routine candidate management requires no approval. Loopy may propose and perform portfolio organization that faithfully reflects supplied intent, including wording normalization, status refreshes, dependency recording, and clear requested operations.

Product retains outcome meaning and priority. Loopy stops for Product direction when an operation would choose between competing outcomes or materially change confirmed Product meaning. Engineering may recommend feasibility dependencies and sequencing without silently changing Product meaning or priority.

Loopy must stop before changing an accepted Product, Engineering, Milestone, acceptance, or Release commitment. Candidate selection is not Milestone commitment and grants no planning or implementation authority.

## Dependencies and eligibility

Roadmap relationships use three meanings:

| Relationship | Meaning |
|---|---|
| **Required before** | One outcome must precede another at the stated lifecycle boundary. It blocks Definition only when the dependency prevents the later candidate from being meaningfully defined; otherwise it remains a visible future delivery constraint. |
| **Helpful, non-blocking** | Earlier knowledge or delivery would reduce risk or rework but does not prevent Definition. |
| **Independent, potentially parallel** | No ordering dependency is currently known; this records possibility, not authority to begin parallel implementation. |

Not every candidate pair needs a relationship or order. Unknown or disputed dependencies remain visible with the responsibility needed to resolve them.

A candidate is eligible for Milestone Definition when it is Open, has a distinguishable outcome, and has no unresolved dependency, Product-priority conflict, or responsibility gap that prevents meaningful Definition. Eligibility for Definition is separate from readiness for implementation. A definable candidate may retain a required-before dependency that will block later implementation.

Multi-candidate selection is atomic. If any requested candidate is ineligible, Loopy selects none, explains the deterministically chosen blocker, and allows retry with an eligible set. Dependencies remain visible after selection.

## Human views and deterministic boundary

`Roadmap.md` shows current focus, selected and open candidates, Product priority, typed dependencies, eligibility, blockers, participation, deferred or ended candidates with reasons and lineage, existing Milestones, and release readiness when present. Its compact deterministic plain-text relationship summary shows only required order, explicitly independent work as **Potentially parallel**, and unresolved or conflicting meaning as **Needs coordination**; helpful relationships remain in the detailed data. It does not authorize parallel implementation and is omitted when empty. `LOOPY.md` shows the concise current state, important blocker, selected candidates awaiting Definition, current later-lifecycle work, Complete-unreleased work, latest Release, artifact links, and exactly one project-level next action.

The Engine validates stable identities, state transitions, typed dependency references, selection eligibility, atomic multi-selection, deterministic priority and routing, append-only hash-linked history, synchronized rendering, stale views, and workspace-contained writes. Validation happens before writes. A rejected operation changes no canonical state, history head, or human view.

Rename preserves identity. Combine and split create new identities and retain superseded sources. Deferred, cancelled, superseded, or already-selected candidates are ineligible for selection. Pause preserves the incomplete operation and next unresolved decision; resume checks canonical state and stale views before continuing. Routine Roadmap changes do not reopen confirmed foundations unless their accepted meaning materially changes.

The Host AI interprets outcome and dependency meaning. Deterministic validation does not prove semantic truth, infer responsibility, or grant permission.

## Controlled evaluation

Use the existing small-project and Harbor fixture families with versioned setup in fresh disposable workspaces. Evaluate:

- ordinary-language entry, no-candidates handling, pause, and resume;
- outcome-first add, rename, combine, split, prioritize, defer, cancel, and supersede behavior;
- all three dependency meanings and the separation of Definition eligibility from implementation readiness;
- independent multi-candidate Definition routing and atomic rejection of an ineligible set;
- participation, responsibility boundaries, accepted-commitment protection, history, stale-view repair, containment, and rejected-operation non-mutation; and
- readable, synchronized views with exactly one project-level next action.

Automated proof covers deterministic mechanics. A focused development-host walkthrough checks whether a Human can understand portfolio state, dependency meaning, selection versus commitment, and the next action. Packaged-host and real-team proof remain later Release evidence.

## Explicit exclusions

Slice 3 does not create a Milestone artifact folder or `Definition.md`; commit a Milestone; plan, build, prove, demonstrate, accept, release, publish, or implement full change management. It does not decide implementation readiness, choose or create an implementation workspace, assign a Git worktree, define parallel implementation policy, or treat independent candidates as authorized parallel work. Those decisions belong to Milestone Planning or implementation.
