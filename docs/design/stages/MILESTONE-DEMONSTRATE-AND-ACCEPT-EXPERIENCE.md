# Loopy v1 Milestone Demonstrate and Accept

> Human-approved as the Slice 8 design boundary on 2026-09-07 from exact source baseline `88cb8e76b7239cc5fb47393e6234c8a66dc77efa`. Implementation and later evidence remain separate.

This definition specializes **Demonstrate and Accept** from the accepted [Product Lifecycle](../../product/PRODUCT-LIFECYCLE.md). It preserves the exact Build-and-Prove result and stops before Release.

## Outcome and boundary

A Human can ask Loopy in ordinary language to show an outcome, guide or record a Demo, review what was observed, or help decide whether a Milestone is acceptable. Loopy helps the human understand and judge the observable Milestone outcome rather than inspect implementation activity.

Entry requires one exact Slice 7 Milestone Build Candidate marked **ready for Demonstration**, with current and mutually consistent `Definition.md`, `Plan.md`, and `Proof.md` anchors. The stage ends independently per Milestone when an authorized human accepts the exact demonstrated outcome, requests correction, defers judgment, or pauses or blocks with one next action. Acceptance makes the Milestone **Complete but unreleased**. It grants no Release, merge, push, deployment, publication, distribution, or continuing external-system authority.

## Human journey

1. Loopy loads synchronized Milestone and project state and presents a short pickup summary: requested outcome, acceptance boundary, exact Build Candidate, important Proof limitations, proposed Demo method, and one next action.
2. Loopy reuses applicable confirmed project or component Demo guidance, then chooses or refines the method just in time for this Milestone's observable surface and available environment. Different components may use different methods. It asks only for missing preferences, accessibility needs, or consequential permissions.
3. Loopy establishes or reuses exact Demo authority for the candidate, environment, expected operated target, tools, actions, scope, external effects, and participant. Unchanged authority may be reused. Loopy asks again only when one of those anchors or another consequential permission changes.
4. Loopy supports a **human-guided live Demo**, where the Human operates or directly observes while Loopy guides; an **AI-operated recorded Demo**, where Loopy acts within authority and preserves exact observations and evidence; or both when each adds useful understanding.
5. Loopy presents one concise judgment summary against the committed acceptance boundary, including failures, limitations, skips, inaccessible behavior, partial effects, and anything unproven.
6. One clear natural-language human response accepts the exact demonstrated candidate, requests correction, or defers. No magic phrase or redundant approval is required.

## Demo method and authority

The method follows the outcome and available environment: browser or UI interaction and relevant screenshots for visual products; request and response traces for APIs; terminal transcripts for CLIs; executable examples for libraries; controlled inputs and outputs for data workflows; or another method that exposes the committed outcome more directly. Loopy does not hard-code tool brands or claim unavailable or unsupported tools.

Demonstration is not implementation and does not substitute for Slice 7 independent evaluation. Product or source mutation invalidates the current Demo. Any candidate, Definition, Plan, Proof, source, workspace, environment, or material authority drift stops the Demo and routes it appropriately rather than silently refreshing an anchor.

Before attributing an observation to the candidate, Loopy verifies that the operated endpoint, process, file, service, or other target represents that exact candidate in the expected Demo environment and preserves inspectable verification evidence. A target collision is a Demo environment/target failure: retry, reauthorize, or block rather than infer a Build defect without candidate-bound product evidence.

Unsafe, irreversible, privacy-sensitive, security-sensitive, or externally mutating Demo actions require explicit consequential authority. Loopy recommends a controlled substitute when possible. Missing tooling may be replaced only by an observably equivalent method; otherwise the Demo blocks. Partial or uncertain effects remain visible and cannot be presented as success.

Loopy or the Host AI may prepare and operate a recorded Demo only within recorded authority. Milestone Acceptance always requires genuine explicit human judgment. Loopy records the accepting human and the perspective and context they brought; it does not mechanically require a predefined title, Product or Engineering label, or acceptance role stored in the Definition. When a materially relevant perspective appears absent, the Host AI explains the concern and asks for judgment or recommends additional participation. Simulated participant input and proxy AI assessment remain truthfully labeled advisory provenance outside Human judgment; neither can be recorded as a human's personal review or acceptance.

## Human artifact

Each demonstrated Milestone receives one required artifact:

```text
docs/loopy/milestones/<milestone>/Demo.md
```

`Demo.md` is exceptionally digestible. Its opening summary immediately shows:

- the requested outcome;
- what was demonstrated;
- the observed result;
- important limitations or unproven behavior; and
- the human decision or single next action.

Later concise sections cover what to observe, demonstrated scenarios, mode and environment, evidence and media links, accessibility, failures or partial effects, exact candidate provenance, advisory input, and the final human judgment. Commands, logs, screenshots, recordings, hashes, and technical detail remain in linked inspectable evidence or later detail rather than interrupting the primary reading path. Workspace evidence links resolve from the nested artifact; ephemeral session references are visibly inaccessible and cannot prove demonstrated coverage. Human views use readable names and avoid internal IDs.

No separate `Acceptance.md` is needed. **Evidence** is the exact attributed observation or record. **Proof** maps the committed claims and checks to that evidence. **Demo** makes the exact proven result understandable through an observable walkthrough. **Milestone Acceptance** is the human judgment that the demonstrated exact candidate satisfies the committed outcome and acceptance boundary. Acceptance is neither Proof nor Release.

Meaningful Demo progress persists in canonical `.loopy` state. `Demo.md` publishes when needed to guide a live Demo, at explicit request, useful pause or block, readiness for judgment, or final disposition—not after every conversational turn. Raw or large evidence remains linked rather than copied into the document.

## Correction, deferral, and resume

A correction preserves the failed Demo and candidate history and routes to the earliest affected stage:

- unchanged committed meaning with an implementation defect returns to **Build and Prove**;
- an unchanged Definition requiring a different delivery or evaluation approach returns to **Planning**; and
- changed accepted Product, Engineering, Roadmap, or Definition meaning goes through **Change Management**.

The corrected result becomes a new exact Build Candidate and requires a new candidate-bound Demo. A human who clearly rejects the current result has not accepted it; when the desired disposition is unclear, Loopy asks only whether to correct or defer.

Deferral records the reason, consequence, and observable revisit condition. Pause or interruption preserves current state and evidence. Resume first checks candidate identity, all anchors, published-view freshness, environment, and authority. A non-replayable interrupted scenario restarts only that scenario when safe.

## Canonical state and deterministic boundary

- Canonical Demo state records a stable Milestone and Demo identity, exact candidate and Definition/Plan/Proof revisions, mode, method, environment and target identity, authority scope, scenarios, observations, durable or explicitly inaccessible evidence references, advisory provenance, limitations, participant context, human decision receipt, disposition, published-view hashes, session state, one project next action, and append-only hash-linked history.
- The Host AI owns Demo design, tool appropriateness, semantic observation, accessibility judgment, evidence interpretation, whether the Demo is sufficient for human judgment, correction classification, and interpretation of the human's intent and perspective.
- The Engine validates formal entry gates, exact identities and revisions, authority declarations, operated-target verification claims, allowed transitions, contained evidence files and durable-reference declarations, declared criterion disposition, human/advisory provenance shape, containment, deterministic routing, history, view freshness, and atomic writes. Filled fields never let it infer semantic success or adequate human perspective.
- Every applicable acceptance criterion must have a declared demonstrated, failed, deferred, inaccessible, or unproven disposition before the Host presents an acceptance-ready summary. A human cannot silently accept a different boundary; changing it routes through Change Management.
- Acceptance atomically records the exact human judgment, freezes the accepted Demo result, marks the Milestone Complete, and synchronizes `Demo.md`, `LOOPY.md`, and `Roadmap.md`. Any validation or write failure rolls back the entire transition.
- Stale, invalid, unauthorized, conflicting, or rejected operations do not mutate Demo state, history, evidence, Milestone state, or published views. All writes remain inside the authorized project workspace.
- Complete-unreleased Milestones remain visible. Every current state exposes exactly one project-level next action.

## Evaluation strategy

Automated scenarios should cover: exact ready-for-Demonstration entry; Definition/Plan/Proof and candidate binding; all three mode choices; exact-scope authority reuse and changed-scope reauthorization; surface-appropriate methods without branded assumptions; failed, partial, inaccessible, and unproven observations; unsafe or unavailable tooling; candidate and anchor drift; correction routing; defer, pause, resume, and stale-view repair; genuine human receipt requirements and proxy-AI rejection; natural-language acceptance without repeated approval; atomic Complete transition and rollback; readable `Demo.md`; containment; one next action; and absence of Release, source-control, deployment, or publication authority. Slices 1–7 remain regression-covered.

Fresh behavioral evaluation must use exact candidates in separate controlled workspaces and preserve the transcript, grants, actions, observations, media, artifacts, limitations, and evaluator judgment. At minimum, one UI-style outcome should assess direct observation, screenshots or recording, accessibility, and comprehension; one held-out non-UI outcome should assess whether an API, CLI, library, data, or similar method makes the outcome understandable. Across them, evaluate Demo clarity, tool fit, evidence access, exact-candidate truth, authority handling, missing-perspective judgment, acceptance fatigue, artifact readability, and whether another human can explain what was accepted and what remains unproven. Structural tests do not prove these Host or human qualities.

## Explicit exclusions

Slice 8 does not implement or correct the target product, replace independent Build evaluation, silently change a Definition or Plan, create Release artifacts, mark anything Released, push, merge, tag, deploy, publish, distribute, grant continuing external authority, automatically produce polished video, treat AI review as human acceptance, or perform completion semantics beyond marking an accepted Milestone **Complete but unreleased**.

Slice 6 remains independently passing but not human-accepted. This proposed definition does not reopen it or claim Slice 8 approval or implementation.
