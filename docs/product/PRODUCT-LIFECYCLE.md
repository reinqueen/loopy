# Loopy Product Lifecycle

> Accepted as the Loopy v1 product baseline on 2026-09-05. Publication requires separate authorization.

**Audience:** Loopy builders and evaluators. This document defines the lifecycle experience Loopy must provide; Humans do not need to read it to use Loopy.

## Purpose and scope

This document defines the end-to-end software-delivery experience Loopy must provide to Humans. It covers entry and routing, responsibilities, human-facing artifacts, lifecycle transitions, interview behavior, approval boundaries, and deterministic guarantees.

It does not define the contents or release gate for a Loopy version, detailed stage contracts, Engine implementation, automated tests, or capability claims. Those belong in the [v1 Release Definition](./V1-RELEASE-DEFINITION.md), [Release Requirements](./RELEASE-REQUIREMENTS.md), stage contracts, code, tests, and Release evidence.

## Product promise

Loopy is one human-facing skill that helps a person and their Host AI move software work from intent to a published, verified Release. It maintains readable shared context, applies deterministic guarantees, and asks for human approval only at consequential boundaries.

## Common language

| Term | Meaning in Loopy |
|---|---|
| **Loopy** | The single human-facing delivery skill |
| **Human** | A person using Loopy |
| **Host AI** | The AI environment running Loopy, such as Codex or Claude Code |
| **Responsibility** | The decision area a participant explicitly represents, regardless of job title |
| **Project foundation** | Confirmed Product direction and the minimum shared context needed to begin |
| **Project guide** | Durable project-wide guidance for Engineering, Architecture, Demo, or Release work |
| **Just in time** | Ask for a decision or create guidance when the current work depends on it, before its absence becomes a blocker; do not require everything upfront |
| **Candidate** | A possible Roadmap outcome with no delivery commitment |
| **Milestone** | A bounded outcome that moves through Definition, delivery, proof, and acceptance |
| **Milestone commitment** | Human acceptance of a Milestone Definition; it is not a Git commit |
| **Proof** | Inspectable evidence of what was run and observed |
| **Demo** | A human-understandable walkthrough of the result and its evidence |
| **Complete** | An accepted Milestone that has not yet been released |
| **Release** | An exact version and its contents, source, packages, destination, and authorization |
| **Released** | Published to the authorized destination and verified available |

## The experience at a glance

The lifecycle has five layers. They are not five mandatory interviews or a rigid sequence.

| Layer | What it provides | Main human view |
|---|---|---|
| **1. Entry and routing** | One place to start, resume, change, review, or release work | `LOOPY.md` |
| **2. Project foundation** | Product direction and the project guides currently needed | Project guides |
| **3. Living Roadmap** | Priorities, Milestones, dependencies, ownership, and current state | `Roadmap.md` |
| **4. Milestone delivery** | A repeatable Define → Plan → Build and Prove → Accept loop | Milestone folder |
| **5. Release and evolution** | Exact publication, verification, and routing of what comes next | Release folder and updated Roadmap |

```text
One Loopy skill
      ↓
Start or Adopt → Establish only the project guides currently needed
      ↓
Living Roadmap → Select one or more eligible Milestones
      ↓
Define → Plan → Build and Prove → Demonstrate and Accept
  ↑                                      |
  └──────── correction or change ────────┘
      ↓
Complete Milestone(s) → Release and Publish → Evolve
```

Roadmap management and change intake remain available throughout the project. Each Milestone repeats the delivery loop independently, and several loops may run concurrently when dependencies and workspaces permit it.

## One skill, several entry routes

A Human describes what they need in ordinary language. They do not select separate Product, Engineering, Milestone, Change, Demo, or Release skills. Loopy reads the authorized project state and routes the request.

| What the Human wants | Where Loopy routes them |
|---|---|
| Start something new or understand existing work | Start or Adopt |
| View, add, group, or prioritize possible work | Living Roadmap |
| Shape one or several candidates | Define a Milestone |
| Pick up or continue existing work | The selected Milestone's current stage |
| Report a correction, changed need, defect, or new idea | Change classification, then the affected stage |
| Review evidence or decide whether work is acceptable | Demonstrate and Accept |
| Prepare or publish a version | Release and Publish |

Resume is an entry route, not a lifecycle stage. Change is also an entry route available at any time. Loopy classifies it as a clarification, in-scope work, a material change to an accepted commitment, or a future candidate, then updates the affected Roadmap, Definition, Plan, Proof, or Release.

## Responsibility-aware participation

Loopy never restricts participation by job title. Any Human may contribute or help define work at any stage. Responsibility matters only when a consequential decision is finalized, and one Human may explicitly represent several responsibilities.

| Responsibility | Decides |
|---|---|
| **Product** | What and why: direction, business outcomes, Product boundaries, priority, and business meaning |
| **Engineering** | Whether and how: feasibility, technical dependencies, practices, implementation, and proof approach |
| **Architecture, Demo or quality, Release** | Their specialized decisions only when the work needs them |

- **One responsibility present:** Continue useful discovery and show any authority still needed before a consequential decision.
- **One person holds several:** Make each responsibility explicit, avoid repeated questions, and allow combined confirmation.
- **Several people participate:** Anyone may contribute anywhere; Loopy identifies decision authority only when finalizing a governed boundary.
- **A document is supplied:** Check its coverage and ask only about gaps or conflicts; do not force an interview.

Humans shape only the requirements needed for the current outcomes, not every Roadmap candidate upfront. Product and Engineering perspectives contribute where useful; neither job title restricts the conversation. Before Milestone commitment, the Humans explicitly represent whichever responsibilities are materially affected by the Definition.

## Lifecycle layers

### 1. Project foundation

#### Start or Adopt

Loopy begins with the Human's goal and only the context they supply or authorize. It distinguishes existing evidence from current intent and creates:

- `LOOPY.md` as the project home;
- a draft `Project-Definition.md`; and
- `Roadmap.md`, even when no candidates exist yet.

Starting is enough to create drafts. Loopy asks before expanding the context boundary.

#### Establish project guides

Project guides grow just in time; they are not one large setup gate.

- Product confirms `Project-Definition.md` and `Roadmap.md`.
- Engineering establishes `Engineering-Guide.md` before delivery depends on it.
- `Architecture.md` appears only when durable structural explanation is needed.
- `Demo-Strategy.md` appears when reusable proof profiles would help.
- `Release-Strategy.md` appears when distribution affects delivery.

Each responsibility owner confirms only their area. One person may combine confirmations when they explicitly hold several responsibilities.

### 2. Living Roadmap

`Roadmap.md` is the complete Milestone portfolio. It keeps candidates, priorities, dependencies, active work, participants, workspaces, blockers, completed work, and release readiness visible.

Roadmap work may begin directly from a requirement, PRD, notes, repository evidence, or existing candidate. A confirmed Product foundation is useful context but not a gate to useful discovery or Roadmap organization. Project-wide meaning is added to `Project-Definition.md` just in time when it is materially relevant.

`LOOPY.md` is the concise operational view. It shows current work, blockers, Complete-unreleased Milestones, the latest Release, and one next human action.

Candidate creation, grouping, prioritization, selection, and routine pickup need no approval. Product owns outcome priority. Engineering may recommend technical dependencies, enabling work, and delivery sequence without silently changing Product meaning.

### 3. Milestone delivery loop

#### Define

Loopy can begin directly from an outcome, feature request, PRD, repository evidence, Roadmap candidate, or existing Definition. It inspects authorized evidence, then interviews the Humans because every source may be stale, wrong, incomplete, or misunderstood. The Humans establish the outcome, requirements, current and intended behavior, boundaries, non-goals, acceptance, risks, and feasibility. When several candidates are shaped together, shared questions are asked once but each receives its own `Definition.md`.

Review and correction need no approval. One bounded commitment decision accepts the exact Milestone outcome and acceptance boundary after the necessary perspectives agree.

#### Plan

Loopy creates `Plan.md` with checkpoints, sequencing, implementation choices, evaluation, the exact proof or Demo approach, and release impact. The Plan cannot expand the committed Definition. No separate plan approval is required unless a new material decision appears.

#### Build and Prove

Loopy and the Host AI implement within the authorized workspace, run authorized tools, evaluate exact candidates, record evidence, and keep `LOOPY.md` and the developing `Proof.md` current. Routine implementation and testing need no Loopy approval; Host permissions remain separate.

#### Demonstrate and Accept

Loopy supports both a human-guided Demo and an AI-operated recorded Demo. `Proof.md` explains what was built, what was observed, failures, limitations, and where exact commands, outputs, logs, screenshots, or other evidence can be inspected.

`Demo.md` gives the human a concise outcome-first account of what was demonstrated and records the exact human judgment. Raw evidence remains linked rather than copied into its primary reading path.

One human decision accepts, rejects, or requests correction. Acceptance makes the Milestone **Complete**, not Released.

### 4. Release and evolution

#### Release and Publish

Loopy selects one or more Complete Milestones and binds an exact version, Git commit, packages, hashes, compatibility, limitations, installation, rollback, destination, and visibility. It produces:

- `Release-Plan.md` before execution;
- `Release-Review.md` for the exact candidate; and
- `Release-Notes.md` with publication and verification results.

Release approval does not imply publication. One explicit decision may authorize both only when it names the destination and visibility. After authorization, Loopy publishes, verifies availability, records the result, and marks included Milestones **Released**.

#### Evolve

After delivery or Release, Loopy routes feedback, defects, ideas, and changing priorities back to the Roadmap or affected lifecycle stage. A human-facing Change Review is created only for a material change.

## Milestone transitions

| State | Meaning | How it moves forward |
|---|---|---|
| **Candidate** | Possible work; no delivery commitment exists | Shape and commit its Definition |
| **Planned** | Its Definition is committed and it is queued | Pick it up when dependencies permit |
| **Active** | Planning, building, proof, or correction is underway | Demonstrate the outcome and obtain acceptance |
| **Complete** | The demonstrated outcome is accepted but unreleased | Include it in an exact authorized Release |
| **Released** | Its published Release has been verified | Monitor feedback and evolve |

A Milestone may instead be **Paused**, **Blocked**, **Deferred**, or **Cancelled or superseded**, with the reason and restart or reconsideration condition visible. Every current Milestone has exactly one state and never silently disappears.

## Human decisions

Loopy requests human authority only to:

1. Confirm a bounded part of the project foundation or a project guide with its responsibility owner.
2. Commit a Milestone's exact outcome and acceptance boundary.
3. Approve a material change to something already accepted.
4. Accept, reject, or request correction of a demonstrated Milestone.
5. Authorize an exact Release and, when explicitly named, its publication destination and visibility.

One decision applies the complete bounded choice. Drafting, review corrections, candidate management, planning within scope, implementation, testing, evidence recording, routine reconciliation, status refreshes, and in-scope corrections require no additional Loopy approval.

## Human document map

```text
LOOPY.md                              # Start here
└── docs/loopy/
    ├── Project-Definition.md         # Product direction
    ├── Roadmap.md                    # Complete Milestone portfolio
    ├── Engineering-Guide.md          # How the project is built
    ├── Architecture.md               # When durable structure is needed
    ├── Demo-Strategy.md              # When reusable proof profiles help
    ├── Release-Strategy.md           # When distribution affects delivery
    ├── decisions/                    # Consequential durable rationale only
    ├── milestones/<milestone>/
    │   ├── Definition.md             # Committed outcome and boundary
    │   ├── Plan.md                   # Delivery approach
    │   ├── Proof.md                  # Evidence mapped to the committed boundary
    │   └── Demo.md                   # Observable walkthrough and human judgment
    ├── changes/                      # Material changes only
    └── releases/<version>/
        ├── Release-Plan.md
        ├── Release-Review.md
        └── Release-Notes.md
```

Loopy makes every human-facing artifact easy to access in the current Host AI. It provides host-appropriate artifact references: clickable links when the Host AI and interface support them; otherwise clear, exact paths the Human can open or copy. Easy access is required, but one interface format is not.

Normal participation never requires browsing `.loopy/`. Exact machine state, history, approval receipts, and raw evidence remain there.

## Context boundary

The Human controls the context boundary. They may provide information directly or authorize specific files, directories, repositories, links, attachments, issues, designs, or connected systems. A supplied link authorizes that resource, not the surrounding system. Loopy explains why more context would help before asking permission to inspect it. Inspection improves the interview; it never makes a source authoritative or removes the need for Human clarification. Discovered information remains attributed evidence until the Humans reconcile its current and intended meaning.

## Pickup and parallel delivery

A Human may identify a Milestone by its human-readable name or select it from `LOOPY.md` or `Roadmap.md`. Loopy presents a short pickup summary:

- outcome and current stage;
- satisfied and unresolved dependencies;
- current participants and responsibilities;
- active workspace or branch when applicable;
- links to Definition, Plan, Proof, and Demo when present; and
- one next action.

Loopy checks synchronized canonical state and records the participant, responsibility, and workspace before resuming. Multiple Milestones may be Active when dependencies are satisfied and there is no unresolved ownership, workspace, or shared-foundation conflict. If parallel work is unsafe, Loopy explains why and recommends coordination or sequencing.

This is basic team workstream coordination, not autonomous workforce or large multi-agent orchestration. Separate Host AI sessions never imply shared unrecorded local state.

## Interview behavior

Loopy defaults to the calm, Socratic decision-coverage interview defined canonically in the single Loopy skill. It treats current-stage decisions as a dependency-aware tree, asks at most five related questions from the currently answerable frontier, and recomputes that frontier after every answer. It inspects authorized facts itself, exposes material assumptions, grounds recommendations, and stops at sufficient current-stage coverage rather than exhaustively exploring future work.

This is ordinary Loopy behavior, not a mode the Human must request. Stage-specific decision coverage and deferral rules determine which branches belong now. Any Human may contribute at any stage; responsibility is checked only when a governed decision requires authority.

The human can correct Loopy's understanding, defer decisions within their responsibility, pause the interview, and resume from recorded state. A required deferred decision becomes a visible blocker with one next action.

Loopy researches facts available within the authorized context, distinguishes evidence from intent, and asks before expanding that context. Before asking for approval, Loopy shows a short summary of what the Human is approving, what is not included, and what remains unknown or deferred. Confirmed meaning is recorded in the appropriate artifact; an interview transcript is not created by default.

## Conditional supporting documents

| Document | Create when | Usually noticed during |
|---|---|---|
| `Architecture.md` | The project needs a shared, lasting explanation of how its technical parts fit together—for example, components, interfaces, data flows, integrations, trust boundaries, or deployment | Project Foundation, Milestone Definition, or Planning |
| Decision record | The reasoning for an important, difficult-to-reverse decision will matter later | Any stage where the decision occurs |
| `Demo-Strategy.md` | A demonstration method or component profile will be reused across Milestones | Milestone Definition or Planning |
| `Release-Strategy.md` | Reusable packaging, compatibility, promotion, publication, or rollback rules affect delivery | Project Foundation, Definition, Planning, or—at the latest—Release preparation |

Loopy may notice a trigger at any stage. It creates the document when the information first becomes necessary. One-time details stay in the relevant Milestone or Release documents. Creating a decision record adds no approval boundary.

## Deterministic guarantees

These are product promises that Loopy must enforce consistently in every Host AI. Detailed conditions live in stage contracts and automated tests; Humans do not need to learn those internal rules.

- **Commitments remain clear:** A Roadmap Candidate is only a possibility. It becomes committed only when its Definition is approved.
- **Approved scope is protected:** A Plan or implementation cannot silently add work outside the approved Definition. A material change reopens only the affected decision.
- **Proof remains truthful:** Evidence identifies the exact version, environment, tool, and observed result. Failed, incomplete, or unobserved work cannot be presented as successful proof.
- **Acceptance and Release remain separate:** Accepting a Milestone makes it Complete. Releasing requires an exact version, source commit, packages, hashes, and publication approval. It becomes Released only after publication is verified.
- **Project views remain accurate:** `LOOPY.md` and `Roadmap.md` must match canonical state. Milestones cannot silently disappear, and Complete-unreleased Milestones remain visible as release-ready.
- **Work stays within its workspace:** Loopy writes only inside the authorized workspace.
- **Pickup and parallel work remain safe:** Loopy uses synchronized project state, records the participant and workspace, and checks dependencies and conflicts before work proceeds.

## Artifact rule

Create a human-facing artifact only when it gives the team durable shared understanding or supports a consequential decision. Do not create a document merely because an internal Engine event occurred.
