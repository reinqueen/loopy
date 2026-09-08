# Loopy v1 Milestone Build and Prove

> Human-approved as the Slice 7 design boundary on 2026-09-07 against exact definition baseline `463ee0ab90bd797b8f96684660f908fcc3108cb4`. Slice 6 is independently passing but has not received human implementation acceptance.

This definition specializes **Build and Prove** from the accepted [Product Lifecycle](../../product/PRODUCT-LIFECYCLE.md). It preserves the committed Definition as the authoritative delivery boundary and the ready Plan as the implementation approach.

## Outcome and boundary

A Human can say “implement this Milestone,” “continue the next Work Unit,” or “run the planned checks.” Loopy establishes explicit implementation authority, the workspace, and permitted tools or external systems before mutation. It then implements only named or deterministically selected ready Work Units, preserves exact evidence, and builds a readable `Proof.md` that can be taken to Demonstration.

Entry requires an explicitly named Milestone with a current Plan that is ready for implementation. The stage ends independently per Milestone as **ready for Demonstration**, blocked, or paused, with truthful status and exactly one project-level next action. It does not demonstrate or accept the Milestone, make it Complete, release it, publish it, deploy it, or grant authority outside the recorded Build boundary.

## Human journey

1. Loopy loads synchronized Product, Engineering, Roadmap, Definition, Plan, and Change state. It summarizes the outcome, current Work Units, required order, explicit safe-parallel claims, blockers, workspace recommendation, checks, and one next action.
2. Before any mutation, Loopy confirms or adjusts the Plan’s proposed evaluation budget as part of one bounded execution grant for the active session: the named ready Work Units, named implementation workspace, participant and represented responsibility, allowed tool scope, exact focused/final boundaries and correction-cycle limits, and applicable model/cost choice. Activation records that exact budget and grant. A clear implementation request may supply them without a redundant approval prompt. They never expand to unnamed Work Units or external systems. Host permission prompts remain separate and cannot be inferred by the Engine.
3. Loopy executes the next eligible Work Unit sequentially by default. It may run Work Units concurrently only when the current Plan explicitly marks the exact group safe and current ownership, workspace, shared-file, interface, schema, environment, and integration checks reveal no conflict. Missing relationships never imply safety.
4. Builder checks run continuously as useful. Focused independent evaluation occurs only when a meaningful risk or integration boundary justifies it—for example a shared interface, risky component, parallel-work integration, or another recorded checkpoint—not automatically after every Work Unit.
5. A failed focused evaluation returns reproducible findings to bounded correction. The correction produces a new frozen candidate; earlier failed evidence remains immutable. Loopy counts the initial attempt and corrected-candidate cycles against the activated boundary, proceeds without repeated approval while the grant and budget remain current, and stops that boundary early on pass. A focused pass establishes only its bounded result, not Milestone readiness or human Acceptance.
6. After the Work Units compose into one integrated result, the orchestrator freezes the exact **Milestone Build Candidate** for mandatory independent end-to-end evaluation against the full committed acceptance boundary and planned checks. This verifies integration and regressions rather than aggregating builder checks or focused verdicts as automatic Proof.
7. After each meaningful result, Loopy records canonical status and exact evidence. It reports progress compactly rather than publishing artifacts after every turn. `Proof.md` is published at explicit request, useful pause or block, a material failed check, status/reporting, or readiness for Demonstration.
8. Only when that exact Milestone Build Candidate passes final independent integrated evaluation and has inspectable evidence for every applicable acceptance criterion and planned check—with failures, limitations, skips, and unproven behavior visible—does Loopy present `Proof.md` as **ready for Demonstration** and stop for the later stage.

## Orchestrated build and evaluation cycle

The orchestration boundary is the Milestone. The Milestone orchestrator owns scope, exact anchors, grants, task separation, risk-based evaluation checkpoints, frozen-candidate handoff, correction routing, and final synthesis. It may coordinate several explicitly safe Work Unit lanes, but it does not implement the Work Units, evaluate its own implementation, or accept the Milestone.

A builder receives only named authorized Work Units and their current Plan boundary. It may implement, check, correct, and record evidence within that scope. It cannot declare its own result independently proven or broaden authority to another Work Unit, workspace, external system, or source-control operation.

An evaluator is independent of the builder for the candidate it judges. Independence means a fresh task or equivalent clean context and a separate disposable evaluation workspace—not ignorance of the contract. The evaluator receives an **evaluation charter** containing the authoritative scope and criteria: the exact frozen candidate; Definition and Plan revisions; applicable Work Units, acceptance criteria, completion observations, dependencies, checks, known environmental boundaries, and allowed evaluation tools. It receives no builder coaching, expected answers, builder-session context, or presumed verdict. The evaluator treats the candidate as unproven rather than presumed correct or incorrect, seeks supporting and disconfirming evidence, and reports **pass**, **fail**, **blocked**, or **uncertain** from reproducible observations. Builder evidence may be supplied only as attributed, untrusted leads that the evaluator independently reproduces where material.

A **Milestone Build Candidate** is the exact frozen source and workspace snapshot submitted for evaluation; it is distinct from a possible-outcome Roadmap candidate. It may be an exact Git commit when commit authority exists, or a verified content-addressed snapshot when it does not. Freezing one never grants commit, branch, push, publication, or other source-control authority. An evaluation result applies only to that exact candidate. Any correction creates a new candidate; it does not rewrite a failed result or transfer a prior pass automatically.

When risk justifies focused Work Unit evaluation, it checks the bounded completion observation, applicable acceptance criteria, planned checks, dependency contracts, affected interfaces, and regressions proportional to the change. Required-before work must satisfy its relevant planned gate before dependent execution. Explicitly safe Work Units may use parallel builder lanes. The mandatory final Milestone evaluation always judges the integrated exact Milestone Build Candidate, including cross-unit behavior, shared-resource effects, every applicable committed acceptance criterion, planned checks, failures, limitations, skips, and unproven behavior. Only the later Demonstration and human decision may accept the Milestone.

The activated evaluation budget may be lowered or stopped. Increasing an activated correction-cycle limit requires explicit Human judgment; it is not inferred from a desire to keep trying. Exhausting a limit never becomes a pass: Loopy pauses with the latest candidate, evidence, reproducible findings, and exactly one next decision. Material Definition or Plan drift, missing authority, repeated failure with no meaningful progress, or a newly required external or destructive action stops work regardless of remaining budget.

## Just-in-time model selection

Loopy derives a tentative provider-neutral workload assessment from the Plan's existing Work Units, risks, dependencies, external effects, and evaluation-boundary strength. Immediately before Loopy creates or assigns an orchestrator, builder, focused-evaluator, or final-evaluator task, it checks the hosts and models actually available then, recommends one appropriate to that role, and briefly states the basis. It asks only for genuinely missing Human preferences needed for the choice, such as cost versus quality. Exact provider and model selection occurs at task assignment. Loopy does not ask when the Human is already working in a chosen model and it is neither creating another task nor proposing a switch.

The Human confirms model and cost choices once within the execution grant. Loopy reuses an applicable confirmed project-wide Engineering policy or unchanged active-session grant, and asks again only when a stronger or more costly model is needed, availability changes, risk materially changes, or the policy or grant would be exceeded. Build and Proof provenance records the actual host, model identifier, settings or profile, and qualification status for every assigned task.

Loopy distinguishes **available**, **recommended**, **tested**, and **release-qualified**. Availability is not a recommendation; recommendation is not test evidence; testing is not release qualification. An untested model may be recommended only as explicitly unverified and creates no compatibility or support claim. Loopy remains provider-neutral, and durable lifecycle guidance names no current provider or model. Qualifying specific hosts and models for supported Release belongs to Slice 10.

## Bounded implementation behavior

The committed Definition controls **what** may be delivered; the Plan controls the current **how**. Loopy may make routine implementation choices, fix in-scope defects, rerun checks, and refine evidence without another Loopy approval. It must not silently expand the outcome, requirements, scope, acceptance boundary, Product priority, external promise, or durable project guidance.

New information is classified before continuing:

- an in-scope implementation detail may update the Build record;
- a delivery approach or Work Unit adjustment within the Definition returns to Planning for routine revision and explicit Build revalidation;
- a material Definition change routes through Change Management and pauses affected work;
- a failed check remains immutable evidence, creates a visible blocker or correction path, and may be followed by a separately recorded rerun;
- an unrelated opportunity returns to the Roadmap rather than entering the current Milestone.

Unaffected Milestones and explicitly safe Work Units may continue. Loopy does not broaden authority because one Work Unit was authorized, and it does not use a participant’s job title as authority.

Build entry permits only the recorded workspace and operations. Implementation authority covers edits and checks. Read-only Git inspection is routine. Branch or worktree creation and local commits require an explicit request or confirmed standing Engineering guidance. Push, pull-request creation, merge, tag, deployment, publication, Release, and any external-system mutation remain separate authority.

## Proof and human artifacts

Build and Prove adds no `Build.md`. Each Milestone uses the existing readable path:

```text
docs/loopy/milestones/<milestone>/Proof.md
```

`Proof.md` is a concise, current explanation rather than a raw transcript. It contains:

- Outcome and authoritative Definition/Plan revisions
- Build status and exact Milestone Build Candidate
- Work Units completed, active, blocked, or not started
- Acceptance-boundary and planned-check coverage
- Commands or interactions run and observed results
- Failures, limitations, skipped checks, and unproven behavior
- Inspectable evidence references and provenance
- Participants, represented responsibilities, and one next action
- Actual task hosts, model identifiers, settings or profiles, and qualification status

**Evidence** is the exact attributed record of a command, interaction, environment, source candidate, output, observation, or artifact. **Proof** is the human-readable mapping from claims and acceptance criteria to that evidence. A passing command or Work Unit evaluation is evidence, not automatically Proof of the integrated Milestone outcome. The Host AI judges whether evidence supports a claim; the Engine validates identities, references, declared results, and coverage consistency without inferring semantic truth.

Meaningful Build updates persist canonical `.loopy` state. Raw and potentially large evidence remains canonical and inspectable without being copied wholesale into `Proof.md`. Published `Proof.md`, `LOOPY.md`, and `Roadmap.md` carry revision metadata and must never be represented as current after canonical state advances; explicit rendering regenerates them.

## Responsibilities and judgment

Engineering owns implementation choices, technical coordination, check execution, and the proposed interpretation of technical evidence. Product participates only when new information could change committed outcome meaning, requirements, scope, acceptance, priority, or an external promise. Architecture, Demo/Quality, or Release responsibilities contribute only when their already-triggered guidance is needed to implement or capture evidence safely; Build does not perform their later stages. Anyone may supply facts, while authority follows the responsibility they explicitly represent.

Loopy asks for one concise Work Unit-scoped execution grant at entry. It may reuse that grant during the active session, including after resume, only while its exact anchors and scope remain unchanged. Routine implementation, checking, evidence capture, and in-scope correction add no approval. It returns to a human judgment point only for missing authority, a material committed-boundary decision, an unsafe or consequential conflict, or an external action outside the grant.

## Deterministic state and safety

Canonical Build-and-Prove state records stable Milestone and Work Unit identities; exact Product, Engineering, Roadmap, Definition, Plan, and Change anchors; current source/workspace fingerprint; bounded implementation, tool, model, and cost grants; the activated evaluation budget and any explicit adjustment; orchestrator, builder, and evaluator assignments with actual host, model identifier, settings or profile, and qualification status; frozen Work Unit and Milestone candidate identities; per-boundary attempts, correction-cycle counts, verdicts, and correction lineage; participants and represented responsibilities; Work Unit ownership/status; explicit execution groups; checks, evidence records, claim-to-evidence links, failures and limitations; session; one next action; generated-view hashes; and append-only hash-linked history.

The Host AI owns semantic containment, implementation judgment, evidence interpretation, and whether a result is ready for Demonstration. The Engine enforces formal guarantees only:

- no mutation before a valid scoped execution grant;
- exact current foundation, Definition, Plan, workspace, and source anchors before every persisted transition or execution handoff;
- required-before eligibility and explicit safe-parallel membership, with no overlap when ownership or file/interface/schema/environment conflicts are declared;
- one active owner per Work Unit and deterministic ordering of otherwise eligible work;
- evidence append-only provenance and no replacement of failed or older runs;
- an evaluator cannot record an independent verdict for a candidate it built, and a verdict applies only to its exact frozen candidate and charter;
- validation before canonical writes, containment, collision safety, atomic state/view publication, stale-view detection, pause/resume, and rejected-operation non-mutation.

An Engine transaction can roll back Loopy state and views. It cannot promise rollback of an already executed compiler, repository mutation, network call, or external-system side effect. Loopy therefore validates authority and preconditions before execution, records the actual result afterward, and stops truthfully on partial or uncertain effects.

Plan or foundation drift blocks execution and publication without silently refreshing anchors. Explicit Host semantic revalidation may resume when the committed Definition remains intact; otherwise Loopy routes to Planning or Change Management. Parallel sessions use declared ownership and base/source revisions: non-overlapping authorized Work Units may proceed, while overlapping or stale work is rejected or coordinated before mutation.

## Proof and evaluation strategy

Automated scenarios should carry the golden ready Plan into Build and cover: no-mutation before authority; exact Work Unit, active-session, workspace, responsibility, tool, model, and cost scope; unchanged-anchor resume reuse; unnamed-work and external-system rejection; same-directory and explicitly authorized separate-worktree entry; source-control separation; sequential required work; explicit safe parallel work; absent-safety and direct/transitive/conflict rejection; deterministic ownership and routing; stale foundation, Plan, workspace, and source rejection; routine Plan revision and explicit revalidation; material Definition-change routing; tentative workload assessment from existing Plan meaning; genuinely missing preference questions; just-in-time available-model recommendation with stated basis; exact selection at task assignment; policy/grant reuse and bounded re-prompting; available/recommended/tested/release-qualified distinctions; risk-based focused evaluation without a per-Work-Unit mandate; builder/evaluator separation; evaluator charter and neutral posture; pass/fail/blocked/uncertain verdicts; failed evidence preserved through correction; mandatory final integrated evaluation of the exact Milestone Build Candidate; exact candidate, environment, host, model, settings/profile, and qualification provenance; acceptance-criterion traceability; pause/resume; stale published views; atomic Engine rollback; containment; exactly one next action; and no Demo, Acceptance, Release, deployment, publication, push, merge, or external mutation without authority. Slices 1–6 remain regression-covered.

Independent multi-turn evaluation must run exact candidates in fresh tasks and separate disposable Human workspaces, with the authoritative evaluation charter but no builder coaching, expected answers, or builder-session context. Focused evaluation is used only at justified risk or integration checkpoints; final independent evaluation of the integrated exact Milestone Build Candidate is mandatory. Evidence preserves orchestration assignments, charters, grants, frozen candidates, source state, transcript, commands/interactions, raw evidence, `Proof.md`, failures, correction lineage, limitations, and the neutral evaluator’s reproducible verdict. Scenarios include sequential work, an explicitly safe parallel case, a shared-resource conflict, a failed check and correction, changed Plan/Definition information, and interruption/resume. Structural tests prove Engine invariants, not whether the orchestrator scoped work well, the Host chose good implementation steps, or the evidence semantically proves the outcome.

## Explicit exclusions

This stage does not perform Demonstration, request or record human Milestone Acceptance, mark a Milestone Complete, create Release artifacts, authorize or execute Release, push, merge, publish, deploy, operate ungranted external systems, implement full Change Management, or orchestrate an open-ended autonomous workforce. Its bounded Milestone orchestrator may coordinate only the authorized Work Unit build/evaluation lanes defined above.
