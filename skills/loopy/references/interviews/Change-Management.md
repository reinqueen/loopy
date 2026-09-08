# Change Management

Use this internal reference when someone asks Loopy to correct, clarify, or change confirmed or committed lifecycle meaning. Never expose this route as a separate skill or command.

## Classify before changing

Begin from the ordinary-language request and current authorized state. Use the shared Socratic after-response loop to identify the earliest ambiguity that determines whether agreed meaning changes. A typo, grammar or formatting repair, broken link, clearer equivalent wording, or synchronization to an already-confirmed decision is routine only when outcome, requirement, scope, acceptance, priority, responsibility, constraint, promise, and authority remain the same. Routine corrections need no approval and no `Change.md`, but receive concise provenance.

A proposal is material when it could change what is planned, built, demonstrated, or accepted. Do not use size, effort, feasibility, dependency, or delivery chronology as a substitute for Product priority or meaning. The Host AI owns this semantic classification; the Engine validates the declared class and formal guardrails.

Do not declare a correction routine while its meaning is uncertain. Small wording changes can still expand actors, quantities, eligibility, conditions, automation, obligations, or observable acceptance. Resolve that uncertainty with the Human or keep the proposal material; never infer equivalence from a routine category or a small textual diff.

## Trace and review material impact

For a material proposal, establish the reason; exact current and proposed meaning; exact target decisions, artifact paths, and base revisions; downstream consequences; explicitly unaffected work; participants and represented responsibilities; essential and safe-to-wait unknowns; required authority; and earliest affected lifecycle stage. Inspect authorized evidence for discoverable facts. Ask humans mainly for intent, judgment, corrections, choices, and unavailable knowledge.

An essential unknown blocks acceptance. A safe-to-wait unknown records its consequence and observable revisit condition. Product decides changed Product meaning and priority. Engineering decides changed technical meaning, dependencies, feasibility, and constraints. Request Architecture, Demo/Quality, or Release judgment only when its absence prevents a safe bounded change.

Keep proposed and accepted meaning visibly separate. Publish one concise `Change.md` at review readiness, explicit request, useful pause or block, status, and disposition. Ordinary proposal updates persist canonical `.loopy` state without repeatedly publishing or presenting the artifact.

## Authority and disposition

Required perspectives agree to the same current proposal revision. A clear natural-language final response can accept; do not require magic wording. The final required response may both supply the last receipt and accept the complete proposal. That one authority moment atomically reconciles affected canonical artifacts—never request a second generic reconciliation approval.

Record each real participant and the responsibility they explicitly represent. Preserve each valid same-revision receipt while another required perspective responds. Do not invent a combined participant identity to join separate answers. One real participant may cover multiple required perspectives only when that participant explicitly represents each one under the established responsibility rules.

Slice 5 does not partially accept one proposal. When separable portions should proceed differently, offer to split them into independent changes before review. Non-overlapping proposals may proceed independently. Overlapping proposals are ordered against declared base revisions and become stale after an overlapping acceptance.

Reject and withdraw without changing accepted meaning; preserve concise history and remove them from active views. Defer with a revisit condition. Pause and resume the preserved frontier. Reopen or update only affected decisions and route to the earliest affected lifecycle stage while leaving unaffected work and safe parallel Milestones intact.

Acceptance changes lifecycle meaning only. It never implements the underlying product change or grants Planning, Build, Proof, Demonstration, Release, deployment, publication, workspace, or external-system authority.

## Internal Engine interface

Read [Change Management input](../engine/Change-Management-Apply.md) before constructing Engine input. Use `change-init`, `change-propose`, `change-update`, `change-review`, `change-decide`, `change-routine`, `change-interrupt`, `change-resume`, `change-render`, `change-stale`, and `change-status` only as internal operations. Keep identities, JSON, hashes, and commands out of normal human views.

Canonical state and public rendering follow the Milestone Definition boundary. Persist meaningful interview updates immediately. Publish at explicit request, useful pause or block, review readiness, decision, or status. Detect and explicitly repair stale views before resume. Final status provides portable artifact paths and exactly one project-level next action.
