# Loopy v1 Milestone Planning and Conditional Guides

> Human-approved as the Slice 6 design boundary on 2026-09-07 against definition commit `5a80ca6`. Implementation and later evidence remain separate; this acceptance grants no implementation, external-system, release, publication, deployment, or push authority.

This definition specializes Milestone Planning and just-in-time project guides in the accepted [Product Lifecycle](PRODUCT-LIFECYCLE.md) without redesigning Slices 1–5.

## Outcome and boundary

A Human can ask Loopy in ordinary language to plan a committed Milestone, pick up a Planned Milestone, or continue interrupted planning. Loopy turns the authoritative `Definition.md` into a concise, executable delivery approach with bounded work units, visible dependencies and safe-parallel boundaries, intended checks and evidence, responsible participants, and one next action. It creates or completes Architecture, Demo, or Release guidance only when reusable guidance is genuinely needed now.

Slice 6 starts from one or more explicitly named committed Definitions. Beginning planning moves that Milestone from **Planned** to **Active** as a routine Roadmap transition. It ends independently per Milestone with a current Plan that is ready for implementation, or a truthfully blocked or paused Plan with one next action. Readiness means the delivery approach is coherent enough to execute; it does not authorize implementation, tools, an external system, deployment, publication, or Release.

## Human journey

1. Loopy loads synchronized Product, Engineering, Roadmap, Definition, and Change state and presents a short pickup summary. It checks the exact committed Definition revision, participants, dependencies, current work location when known, blockers, and one next action.
2. Loopy inherits settled meaning and authorized evidence. Using the shared Socratic move-selection loop, it asks only about unresolved planning decisions: delivery approach, bounded work units, sequencing, implementation choices, checks and evidence, risks, workspace coordination, and applicable release consequences.
3. Loopy drafts and incrementally persists one independent Plan per Milestone. Several Milestones may be planned together, but questions are shared only when the answer applies identically; their paths split as soon as approach, dependency, risk, workspace, or proof needs differ.
4. Loopy surfaces a concise review when the Plan is coherent, explicitly requested, or useful for pause or blocking. Review and correction are routine. No Plan approval is added. A material change to committed meaning routes through Change Management before planning continues.
5. Loopy records ready, blocked, or paused status and exactly one project-level next action. A ready Plan routes to implementation without starting it.

## Plan and work units

Each committed Milestone receives one stable human artifact beside its Definition:

```text
docs/loopy/milestones/<milestone>/Plan.md
```

`Plan.md` remains summary-first: **Outcome and Definition**, **Delivery approach**, **Work units and checkpoints**, **Dependencies and sequencing**, **Parallel and workspace boundaries**, **Checks and evidence**, **Risks, unknowns, and blockers**, **Conditional guides and release impact**, and **Responsibility and readiness**. Its compact portable **Delivery safety** summary derives from canonical relationships: an ordered tree-like adjacency flow for required-before work, **Can happen in parallel** only for explicit safe claims, and **Needs coordination** for blocked claims with their reason. The numbered flow supports branches, convergence, multiple roots, and disconnected chains without pretending the DAG is one tree. Helpful and merely independent relationships remain in detailed sections. Empty subsections and an entirely empty summary are omitted.

A work unit is the smallest reviewable delivery step that makes a coherent contribution to the Milestone outcome. It records its contribution, bounded affected area, prerequisite relationships, responsible participation, completion observation, intended checks/evidence, and workspace or coordination boundary. Loopy groups work outcome-first; it does not mechanically create one unit per file, layer, component, or participant.

Dependencies distinguish **required before**, **helpful but non-blocking**, and **independent or potentially parallel**. Loopy never invents an order for unrelated work. Parallel eligibility requires declared prerequisites to be satisfied and no unresolved shared-foundation, ownership, file/schema/interface, environment, or workspace conflict. Semantic safety remains a Host-AI judgment based on Engineering input; the Engine validates only declared formal relationships.

As an explicitly human-requested cross-stage refinement, each Plan also records its proposed **Build and evaluation boundaries**. Engineering and the Host recommend focused independent checkpoints only when Work Unit, dependency, shared-interface, parallel-integration, risk, or external-effect meaning justifies them; low-risk work may have none. Every Plan must contain exactly one required final integrated independent evaluation boundary, ordered last. Each boundary records its readable checkpoint, type, trigger or applicable Work Units, reason/risk basis, whether required, and a nonnegative correction-cycle limit. That limit is the maximum number of corrected new candidates permitted after an initial failed evaluation, each requiring reevaluation; zero is valid. A coherent, structurally valid evaluation budget is required for Plan readiness, while its review and correction remain routine and add no approval or Build activation.

The Plan's existing Work Units, risks, dependencies, external effects, and evaluation-boundary strength provide provider-neutral inputs for later model choice. Planning does not claim to record context scale or speed-versus-quality or cost preference unless the Human has already expressed that meaning in an existing Plan field, and it does not choose or store a provider or model name. Build resolves genuinely missing preferences and selects from what is actually available when a task is about to be assigned.

The Plan records same-directory or separate-workspace intent. A separate Git worktree is optional and recommended only when it makes genuinely independent work safer. Workspace policy is an Engineering or implementation concern, not a Product decision. Planning does not create a worktree or mutate an implementation workspace; that occurs only when implementation begins with the required context and tool authority.

## Responsibilities and low-fatigue decisions

Engineering owns delivery approach, implementation choices, technical sequence, safe parallelism, workspace recommendations, checks, and proof approach. Product participates only when planning exposes ambiguity or consequence that could change committed Product meaning, priority, scope, requirements, promises, or acceptance. Such a material change uses Slice 5; it is not silently resolved in the Plan.

Architecture, Demo/Quality, and Release participants decide only their specialized durable guidance when triggered. Anyone may contribute facts, but responsibility is explicit and job titles do not imply authority. One person may cover several perspectives only after explicitly representing each.

Planning, decomposition, review, correction, and within-boundary sequencing require no Loopy approval. A new or materially revised project guide is confirmed by its responsible perspective against one current revision because it becomes durable project-wide guidance. The final relevant response may both resolve its last gap and confirm it; do not request redundant generic approval. Several explicitly named ready guides may be confirmed in one response when the participant legitimately represents each required perspective.

## Conditional guides

One-time Milestone decisions stay in `Plan.md`. Create or update a project guide only when the guidance will be reused or must remain durable across work:

- `docs/loopy/Architecture.md` records necessary shared structure, interfaces, data flows, trust boundaries, deployment shape, and consequential rationale.
- `docs/loopy/Demo-Strategy.md` records reusable demonstration or proof profiles, environments, evidence forms, and quality constraints without executing Proof or Demo.
- `docs/loopy/Release-Strategy.md` records reusable packaging, compatibility, promotion, publication, and rollback constraints without creating a Release Plan or granting Release authority.

A missing guide or specialist decision blocks Plan readiness only when implementation cannot safely begin without it. Otherwise Loopy records the trigger, consequence, responsible perspective, and just-in-time revisit condition and allows the Plan to proceed. Slice 6 must not become a large project-setup gate.

## Canonical state and deterministic boundary

- Canonical Planning state records stable Plan identities and paths, exact Definition and foundation revisions, work units and typed relationships, participants and responsibilities, workspace dispositions, conditional-guide triggers and current revisions, risks and unknowns, Host-declared coherence, status, session, generated-view hashes, one project next action, and append-only hash-linked history. It reuses existing lifecycle state and rendering machinery rather than creating a second interview system.
- The Host AI decides whether a Plan is semantically coherent, whether a work unit is meaningfully bounded, and whether parallel delivery or a conditional guide is safe. Filled fields never let the Engine infer semantic quality.
- The Engine validates committed-source identity, exact revisions, allowed transitions, unique stable order, required-before acyclicity, declared conflict rules, guide receipts, containment, history, stale views, and exactly one next action.
- Before any Planning update, review, confirmation, resume, publication, status, or implementation handoff, all captured Product, Engineering, Roadmap, and Definition-state revisions must still match canonical state. A mismatch stops without mutation and exposes the changed anchors. Only an explicit Host semantic revalidation against the exact current anchors may update them; it appends history and invalidates prior Plan review readiness rather than silently refreshing provenance.
- A Plan may refine how the committed outcome is delivered or evidenced but may not silently change its outcome, requirements, scope, or acceptance boundary. Any such change is rejected and routed to Change Management.
- Meaningful interview updates persist canonical `.loopy` state. Ordinary turns need not republish or present `Plan.md`. Explicit request, useful pause/block, review readiness, status, and ready-for-implementation boundaries publish synchronized `Plan.md`, applicable guides, `LOOPY.md`, and `Roadmap.md` with revision metadata. Resume checks stale views before advancing and can regenerate current views from canonical state.
- Multiple Plans remain independently versioned and routable. Starting or blocking one does not silently change another. Stable Roadmap priority/order and readable Milestone name determine deterministic project routing when several actions are possible.
- Validation precedes atomic workspace-contained writes. Invalid input, stale source revisions, unsafe parallel claims, failed writes, and rejected operations do not mutate Plan, guide, lifecycle state, history, or views. Readable paths use deterministic collision handling; internal IDs and hashes stay out of normal views.

## Proof strategy

Automated scenarios should carry the existing golden committed Definition into one ready Plan and cover bounded outcome-first units; exact Definition provenance; required, helpful, and independent relationships; cycle and conflict rejection; same-directory and recorded separate-workspace choices; safe and unsafe parallel Milestones; Product-boundary escalation; blocking versus just-in-time guide triggers; one-time detail staying in the Plan; guide confirmation without redundant approval; independent multi-Plan progress; pause/resume and stale publication; deterministic ordering and collisions; atomic rollback; containment; one next action; and absence of Build, Proof, Demo, Release, deployment, publication, or worktree side effects. The complete suite preserves Slices 1–5.

Independent multi-turn evaluation must use fresh workspaces and preserve the exact candidate, grants, transcript, artifacts, observations, and evaluator judgment. It should assess whether Loopy inherits known context, decomposes by outcome rather than component, asks Engineering before recommending, exposes dependency and shared-foundation risk, avoids Product questions about technical choices, triggers guides only when justified, avoids approval fatigue, and stops before implementation. Structural tests do not prove these Host behaviors.

## Explicit exclusions

Slice 6 does not change a committed Definition, implement or modify the target product, create implementation worktrees, execute checks or Proof, perform or accept a Demonstration, create Release artifacts, authorize Release or publication, deploy, operate external systems, implement full delivery coordination, or orchestrate a large multi-agent workforce.

## Accepted boundary decisions

1. **Implementation handoff:** Recommend that ready-for-implementation is a formal Plan state but not an authority grant. The next turn must establish or reuse the implementation workspace and applicable tool authority before changing product files. Example: a Plan can recommend a separate worktree while Slice 6 creates none.
2. **Conditional-guide confirmation:** Recommend retaining the existing project-guide confirmation boundary only for newly durable or materially revised guide meaning. Allow the last substantive specialist response to confirm it, including several explicitly named guide revisions when responsibility is clear; do not approve the Plan separately.
3. **Multi-Milestone planning:** Recommend independent per-Milestone state rather than atomic all-or-none planning. An explicitly named blocked Plan should not prevent another safe Plan from becoming ready, and unnamed Milestones must never be included.
