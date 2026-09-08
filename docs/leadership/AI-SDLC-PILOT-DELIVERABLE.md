# AI SDLC Pilot Deliverable

## 1. What Loopy is

Loopy is a single human-facing AI SDLC skill. Humans provide the intended outcome, relevant context, constraints, and important decisions. The Host AI uses Loopy to carry bounded work through the delivery lifecycle while preserving readable documents, state, and evidence.

The pilot will apply Loopy to one real project and capture practical learnings before broader use.

## 2. How work is organized

```text
Project
   |
   v
Roadmap
   |
   +-- Candidate outcomes
   |
   +-- Milestones
          |
          +-- Definition
          +-- Plan
          |     |
          |     +-- Work Units
          +-- Proof
          +-- Demo
```

- **Roadmap:** The complete portfolio of possible and committed project outcomes.
- **Candidate:** A possible outcome that has not been committed.
- **Milestone:** A committed, meaningful delivery outcome.
- **Work Unit:** A bounded piece of work used to deliver a Milestone.

## 3. Lifecycle

```text
+--------------------- AI SDLC PILOT SCOPE ----------------------+
|                                                                |
|  Start / Adopt                                                 |
|       |                                                        |
|       |  LOOPY.md | Project-Definition.md | Roadmap.md         |
|       v                                                        |
|  Product & Engineering Foundations                             |
|       |                                                        |
|       |  Engineering-Guide.md                                  |
|       |  Conditional project guidance when needed              |
|       v                                                        |
|  Living Roadmap                                                |
|       |                                                        |
|       |  Roadmap.md                                            |
|       v                                                        |
|  Define --> Plan --> Build & Prove                             |
|     |         |            |                                   |
| Definition  Plan.md      Proof.md                              |
|    .md       Work Units   Detailed evidence                    |
|                              |                                 |
|                              v                                 |
|                    Ready for Demonstration                     |
|                                                                |
+----------------------------------------------------------------+
                               |
                               v
                       OUTSIDE PILOT SCOPE
                               |
                               v
                Demonstrate & Decide --> Outcome Accepted
                               |
                               v
                     FUTURE LOOPY CAPABILITY
                               |
                               v
                 Release / Deploy / Publish
                               |
                               v
                      Available to Users
```

Roadmap updates, context control, status, pause, and resume are available throughout.

## 4. Stages, artifacts, and decisions

| Stage | What it means | Main artifacts | Human involvement |
|---|---|---|---|
| **Start or Adopt** | Establish the project direction, people, needs, boundaries, and success | `LOOPY.md`, `Project-Definition.md`, `Roadmap.md` | Confirm, correct, defer, or pause |
| **Product and Engineering Foundations** | Establish the shared Product and technical guidance needed to proceed | `Project-Definition.md`, `Engineering-Guide.md` | Confirm or correct responsibility-owned guidance |
| **Living Roadmap** | Organize outcomes, priorities, dependencies, blockers, and progress | `Roadmap.md` | Select, prioritize, defer, or cancel outcomes |
| **Define** | Turn a selected outcome into a bounded Milestone commitment | `Definition.md` | Commit, correct, or defer the Milestone |
| **Plan** | Divide the Milestone into Work Units, sequencing, risks, checks, and evaluation | `Plan.md` | Resolve material choices |
| **Build and Prove** | Implement authorized work and independently evaluate the exact result | `Proof.md` and detailed evidence | Authorize the bounded work |
| **Demonstrate and Decide** | Show the result clearly enough for a human to judge it | `Demo.md` | Outside this pilot |
| **Outcome Accepted** | The Milestone was accepted but has not been released or deployed | Updated `LOOPY.md` and `Roadmap.md` | Outside this pilot |
| **Release, Deploy, or Publish** | Make an exact accepted version available and verify it | Future Release artifacts | Not yet implemented |

### Conditional artifacts

| Artifact | What it is for |
|---|---|
| `Architecture.md` | A lasting explanation of important technical structure |
| `Demo-Strategy.md` | A reusable approach for demonstrating outcomes |
| `Release-Strategy.md` | A reusable approach for packaging, deployment, publication, and rollback |
| Decision record | The reasoning behind an important, difficult-to-reverse decision |
| `Change.md` | A material change, its impact, and its decision history |

These documents are created only when the current work needs them.

## 5. Pilot scope

### Included

- Apply Loopy to one real project.
- Establish enough Product and Engineering foundation to proceed.
- Create or update the project's Roadmap.
- Select one meaningful Milestone.
- Define and plan that Milestone.
- Build its authorized Work Units.
- Run independent evaluation and preserve evidence.
- Capture concise learnings from using Loopy on the project.

### Not included

- Demonstrating the result.
- Recording the human's judgment of the demonstrated outcome.
- Formally evaluating the readability of Loopy's human-facing documents.
- Planned testing of Change Management. If a material change occurs, record it as a pilot learning and make a separate scope decision before using that capability.
- Releasing, deploying, or publishing the result.
- Proving every Loopy capability, project type, or team workflow.

### Pilot stopping point

```text
One exact Milestone candidate reaches:

Ready for Demonstration
```

This means the planned work was built, the exact result was independently evaluated, and the available evidence was recorded. It does not mean the outcome was demonstrated, accepted, released, or deployed.

### Pilot outputs

- The real project's Loopy artifacts through `Proof.md`.
- Inspectable implementation and independent-evaluation evidence.
- A concise summary of pilot learnings, gaps, and recommended next steps.

Progress will be reported by capability status rather than one overall percentage:

- **Built** — implemented and structurally tested.
- **Pilot pending** — ready for real-project use.
- **Pilot observed** — exercised during the pilot with recorded evidence.
- **Needs correction** — the pilot exposed a material issue.
- **Deferred** — intentionally outside this pilot.

## 6. What Loopy creates in the project

```text
their-project/
|
+-- LOOPY.md
|     Current status, blockers, and next action
|
+-- docs/
|   |
|   +-- loopy/
|       |
|       +-- Project-Definition.md
|       +-- Roadmap.md
|       +-- Engineering-Guide.md
|       |
|       +-- Architecture.md                 [when needed]
|       +-- Demo-Strategy.md                [when needed]
|       +-- Release-Strategy.md             [when needed]
|       |
|       +-- decisions/                      [when needed]
|       |     +-- <decision>.md
|       |
|       +-- milestones/
|       |   |
|       |   +-- <milestone>/
|       |         +-- Definition.md
|       |         +-- Plan.md
|       |         |     Contains the Work Units
|       |         +-- Proof.md
|       |         +-- Demo.md               [outside pilot scope]
|       |
|       +-- changes/                        [outside pilot scope]
|       |     +-- <change>.md
|       |
|       +-- releases/                       [future]
|             +-- <version>/
|                   +-- Release-Plan.md
|                   +-- Release-Review.md
|                   +-- Release-Notes.md
|
+-- .loopy/
      Internal state, history, authorization receipts,
      exact candidate records, and detailed evidence
```

`LOOPY.md` and `docs/loopy/` are the normal human-facing reading path. Humans normally do not need to open or edit `.loopy/`.

## 7. Open design questions

### How should Loopy support multiple teams managing different projects in one repository?

**Possible answer:** Treat each project as its own Loopy scope, with its own Roadmap, Milestones, decisions, and team ownership. Add a repository-level coordination view for shared dependencies, cross-project work, and integration boundaries.

**Pilot treatment:** The pilot will use one project and one team. Multi-project coordination remains a future capability to design and validate.
