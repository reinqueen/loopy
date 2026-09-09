# Milestone Definition

Use this internal reference when the single Loopy skill recognizes “define this candidate,” “define these selected outcomes,” or “continue the Definition.” Never expose this route as a separate skill or command.

## Establish the bounded Definition

Start from the Human's actual material: a selected Roadmap candidate, rough outcome, feature request, PRD, notes, repository evidence, or an existing Definition. A selected Roadmap candidate is preferred when one exists, but Product Foundation and Roadmap completion are not prerequisites to useful Definition discovery.

For a direct Definition, inspect authorized evidence, assess coverage and conflicts, conduct only the targeted grill needed for a coherent outcome, and create the minimum Product and Roadmap drafts just in time. Add or reconcile the resulting candidate with the Roadmap without treating that organization as Product confirmation or Milestone commitment. Reuse existing Definition content and prior discovery; do not restart settled questions.

Before writing a Definition candidate, distinguish requirements, observed current behavior, intended behavior, constraints, assumptions, uncertainty, and contradictions. Inspecting those sources does not make them trusted: use them to conduct a targeted Human grill about intent, accuracy, exceptions, and consequences. Material conflicts must identify their sources and reconciliation decision. Use the shared Socratic after-response move-selection loop only for gaps, conflicts, or new Definition decisions.

For each candidate establish the outcome; necessary requirements; in-scope boundary and non-goals; observable acceptance criteria that distinguish acceptance from rejection; dependencies, their existing typed relationship meaning, and whether they affect Definition or later implementation; feasibility and constraints; risks, assumptions, unknowns, and deferrals; and the responsibility perspectives needed for commitment. Preserve inherited required, helpful, and independent meanings unless a responsible participant explicitly changes them; never turn non-blocking or independent context into a required constraint. Do not accept “works correctly” or similarly circular acceptance language.

Keep the Definition outcome-based. Implementation files and tasks may be cited as evidence or feasibility context, but they do not replace a Human-meaningful outcome. Recommend splitting when one Definition contains multiple independently valuable or independently demonstrable outcomes; let the Human accept, rename, split, combine, defer, reject, or return to discovery.

The Host AI explicitly declares whether a Definition is coherent enough to review. Filled fields never allow the Engine to infer semantic completeness; it checks only the declaration and formal invariants.

## Responsibilities and specialist input

Let every Human collaborate naturally across the Definition. Anyone may contribute and help define context, current or desired behavior, requirements, constraints, risks, scope, dependencies, challenges, and corrections. Do not infer decision authority from job title. At commitment, require agreement from the responsibilities materially affected by the Definition: Product for Product meaning or acceptance consequences, Engineering for technical feasibility or delivery-risk commitments, and other perspectives only when genuinely necessary. One Human may explicitly represent several responsibilities. Permit genuinely single-perspective Definitions.

Architecture, Demo/Quality, or Release input blocks commitment only when its absence prevents a safe, coherent, bounded Definition. Otherwise record the trigger and route it forward just in time. Do not perform those stages here.

## Multiple Definitions and commitment

Ask a question once only when its answer applies identically to every named Definition, and attribute it to each. Split the path as soon as meaning, consequences, requirements, boundaries, dependencies, risks, acceptance, or required perspectives diverge.

Review, receipts, history, readiness, and commitment are per Definition. Required perspectives explicitly agree to the same current revision. A final required response may also commit when that effect is clear; do not ask for redundant generic approval. One person covers multiple perspectives only after explicitly representing each.

A Human may commit several explicitly named ready Definitions in one response. Record a distinct commitment and history entry for each. Leave an unready named Definition draft or blocked without preventing other ready named Definitions from committing. Never include an unnamed Definition.

A commitment creates a Planned Milestone and routes to Planning only. Before commitment, show the exact outcome, scope, exclusions, acceptance boundary, dependencies, material constraints and risks, and unresolved or deferred matters. It grants no planning approval, implementation, Proof, Demonstration, Release, publication, deployment, workspace, or external-system authority. A committed Definition is authoritative and cannot be silently changed; later material revision belongs to Change Management.

## Internal Engine interface

Read [Milestone Definition input](../engine/Milestone-Definition-Apply.md) before constructing Engine input. Use `definition-init`, `definition-apply`, `definition-review`, `definition-confirm`, `definition-interrupt`, `definition-resume`, `definition-render`, `definition-stale`, and `definition-status` only as internal operations. Keep identities, JSON, and commands out of normal human views.

Persist the evolving Definition's canonical structured state after every meaningful change so interruption and resume remain truthful. An ordinary `definition-apply` may advance canonical state without publishing Markdown; do not create, rewrite, present, or offer the human-facing draft merely because an interview answer was persisted. Continue with the reflection or next conversational move.

Publish the current synchronized `Definition.md`, `LOOPY.md`, and `Roadmap.md` when the Definition reaches review readiness, when the Human asks to see it, when work is paused or blocked and the draft helps review or resumption, at commitment, or for status/reporting. Published views identify the exact state revision they represent. Treat a lower published revision as a truthful prior snapshot, not the current canonical draft; use stale detection and explicit rendering to regenerate it. Final commitment and status responses provide the relevant Definition references and exactly one project-level next action. Use clickable links when the host supports them; otherwise provide clear, exact paths that can be opened or copied in a terminal-oriented host.

After an unrecorded interruption or Host restart, load canonical Definition status before continuing; that status boundary regenerates current human views when the last publication is older. Do not reconstruct current meaning from an older Markdown snapshot.
