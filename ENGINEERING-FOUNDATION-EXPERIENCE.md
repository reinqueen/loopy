# Loopy v1 Establish Project Guide — Engineering Foundation

> Human-accepted as the Slice 2 development boundary on 2026-09-05 after correction `e203bc9` and focused evaluation. The capability remains `implemented-unverified`; later Product-only correction `3ababb1` does not alter this Engine or Engineering boundary.

## Outcome

Starting from a confirmed Product foundation, a Human with Engineering responsibility can establish and confirm a component-aware `docs/loopy/Engineering-Guide.md`. Engineering confirmation does not reopen or confirm Product meaning.

Slice 2 starts after Product confirmation. It ends with the Engineering foundation confirmed, or with its draft safely resumable and one blocker or next responsibility visible. If Engineering is absent, `LOOPY.md` shows exactly one Engineering next action.

## Context boundary

Loopy may read its canonical project state and generated Loopy artifacts to resume. Reading project source, docs, manifests, or automation still requires an explicit grant for selected paths or the whole repository; the Human may decline or narrow access. Findings remain attributed evidence. Commands and tooling are **observed**, **proposed/unverified**, or **confirmed**, never invented as known working.

## Engineering decision coverage

Use project-wide defaults with component exceptions. Do not repeat defaults for every component or require irrelevant fields.

| Coverage | Engineering establishes when applicable |
|---|---|
| Project defaults | Shared conventions, tooling, and ordinary ways of working |
| Components | Name, purpose, path, and delivery relevance |
| Technology | Languages, runtimes, frameworks, and package or dependency tools |
| Commands | Build, run, unit, integration or end-to-end test, lint, typecheck, package, and deploy |
| Relationships | Component dependencies, shared dependencies, interfaces, and delivery sequencing |
| Practices | Coding and quality practices and required checks |
| Operating context | Environments, delivery constraints, compatibility, security, and operational concerns |
| Open matters | Assumptions, unknowns, exceptions, and deferred decisions with consequences and revisit conditions |

## Adaptive interview

Loopy inspects authorized evidence first, finds missing or conflicting Engineering decisions, and asks up to three related questions with labeled recommendations. It reassesses after each answer and asks only what closes coverage or exposes consequences.

The Human may correct, defer with consequences and revisit conditions, limit context, pause, or resume from the next recorded gap. Loopy does not ask Engineering to decide Product outcomes or priority, Demo acceptance, Release authorization, or publication. Another responsibility applies only when the person states it explicitly.

## Conditional guide triggers

| Trigger | Response in Slice 2 |
|---|---|
| Durable relationships, interfaces, data flows, integrations, trust or security boundaries, or deployment structure need shared explanation | Record why Architecture guidance is needed and route its responsibility to `Architecture.md`; do not invent meaning |
| A proof method or profile will be reused across Milestones | Record and explain the `Demo-Strategy.md` trigger and next responsibility |
| Reusable packaging, compatibility, promotion, publication, deployment, or rollback rules affect delivery | Record and explain the `Release-Strategy.md` trigger and next responsibility |

Slice 2 makes applicable triggers visible but does not implement the full Architecture, Demo, or Release lifecycle. A triggered guide may be the one next action when it is the earliest delivery dependency.

## Review, confirmation, and change

Allowed states are **draft**, **blocked**, **ready for Engineering confirmation**, and **Engineering foundation confirmed**. Missing Product confirmation blocks Engineering foundation confirmation. A nonblocking Engineering unknown may remain; a blocking decision keeps Engineering draft or blocked.

Before confirmation, Loopy shows a concise review of defaults, components, exceptions, command confidence, dependencies, risks, triggers, deferrals, and exclusions. Engineering confirms only `Engineering-Guide.md`. Confirmation does not commit a Milestone or approve Architecture, Demo, Release, deployment, or publication.

A material change to confirmed Engineering meaning reopens only Engineering confirmation. Routine evidence refresh updates history without another confirmation when meaning is unchanged.

## Artifacts and deterministic boundary

| View | Slice 2 effect |
|---|---|
| `LOOPY.md` | Engineering state, blocker or trigger, and exactly one next participant or action |
| `docs/loopy/Engineering-Guide.md` | Summary-first Engineering defaults, component exceptions, attributed evidence, confidence, and open matters |
| `docs/loopy/Roadmap.md` | Updated only when needed to keep project state, dependencies, or the next step accurate |

Loopy provides host-appropriate artifact references. Canonical Engineering state, evidence ledger, append-only history, and confirmation receipts stay under `.loopy/`; Humans never need to open them.

The Host AI interprets technical meaning and reports coverage. The Engine validates responsibility, grants, evidence attribution, dispositions, blocking deferrals, current-guide review, transitions, append-only history, synchronized readable views, workspace-contained writes, deterministic rendering and stale detection, and exactly one next action. It cannot prove that a command works or technical meaning is true.

## Controlled evaluation

Copy the Harbor fixture into a fresh disposable workspace. A versioned scenario setup uses the exact candidate under evaluation to generate and confirm its Product foundation before Slice 2; generated state never enters the base fixture.

Evaluate component coverage, command and tooling truthfulness, defaults with inheritance and exceptions, responsibility boundaries, conditional triggers, artifact readability and access, and lifecycle integrity. Accept reasoned technical variation when it remains evidence-based and satisfies the contract.
