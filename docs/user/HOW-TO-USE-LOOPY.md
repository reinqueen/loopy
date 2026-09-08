# How to Use Loopy

> Loopy is currently a development preview. It supports the journey through demonstrating and accepting a Milestone. Release and publication are not implemented yet.

## What Loopy does

Loopy is one human-facing skill that helps a human and an AI coding Host move software work from an idea to a demonstrated outcome.

It can:

- clarify the outcome, people, needs, boundaries, and success through conversation;
- create a readable Project Definition and living Roadmap;
- establish shared Engineering guidance;
- organize possible outcomes and help select what to work on;
- define and plan bounded Milestones;
- help the Host AI implement authorized work;
- preserve inspectable evidence and coordinate independent evaluation;
- demonstrate the result so a human can judge it;
- manage material changes without silently rewriting accepted history; and
- pause, resume, or show what needs attention next.

Loopy keeps the human in control of direction and judgment without asking them to manage every implementation step.

For detailed behavior, human participation, documents, and stopping boundaries at every stage, see [What Loopy Can Do](WHAT-LOOPY-CAN-DO.md).

## What Loopy does not do

Loopy does not:

- read a whole project or external source without permission;
- treat existing files as the human's current intent automatically;
- make Product, Engineering, Demo, or acceptance decisions on a human's behalf;
- treat generated code or passing tests as sufficient proof of completion;
- automatically authorize unrelated work, Git pushes, merges, deployments, or publication;
- require humans to learn its internal Engine commands or browse machine state; or
- currently release or publish completed work.

## Common language

| Term | Meaning in Loopy |
|---|---|
| **Human** | A person using Loopy and exercising responsibility and judgment |
| **Host AI** | The AI coding environment in which Loopy runs |
| **Outcome** | The meaningful result the human wants—not merely an activity or implementation task |
| **Candidate** | A possible Roadmap outcome that has not been committed for delivery |
| **Milestone** | A bounded outcome that is defined, planned, built, proven, demonstrated, and judged |
| **Work Unit** | A bounded piece of delivery work inside a Milestone |
| **Acceptance criterion** | An observable condition used to judge whether the Milestone achieved its intended outcome |
| **Evidence** | An individual inspectable observation, such as a test result, command output, log, screenshot, recording, or human observation |
| **Proof** | The organized case showing how evidence supports—or fails to support—the committed Milestone outcome and acceptance criteria |
| **Demo** | A human-understandable walkthrough of the working result and relevant proof so a human can make a judgment |
| **Complete** | A demonstrated Milestone whose outcome a human accepted; it has not necessarily been released |

### Proof and Demo are different

**Proof answers:** What was checked and observed? Which acceptance criteria does the evidence support? What failed, was skipped, remains limited, or is still unproven?

**Demo answers:** What does the result do? Can the human see or experience the intended outcome clearly enough to judge whether it is acceptable?

Proof is assembled during **Build and Prove** and recorded in `Proof.md`. A separate evaluator examines the exact candidate and its evidence without relying on the builder's confidence.

The Demo happens afterward. It may be human-guided, AI-operated and recorded, or a combination. `Demo.md` gives the human a digestible path through the outcome and relevant evidence; it does not replace `Proof.md` or copy every raw result into the main reading path.

A Milestone can have strong automated proof but still need a clear Demo. It can also look convincing in a Demo while lacking sufficient proof. Loopy requires both before asking for human acceptance.

## General lifecycle

```text
Start or Adopt
      ↓
Establish Product and Engineering foundations
      ↓
Manage the living Roadmap
      ↓
Define → Plan → Build and Prove → Demonstrate and Accept
  ↑                                      |
  └──────────── correction ──────────────┘
      ↓
Complete but unreleased
```

| Stage | What happens |
|---|---|
| **Start or Adopt** | Loopy learns the goal, responsibility, and authorized context. It drafts the project direction and Roadmap. |
| **Engineering Foundation** | Engineering establishes the technical practices, tools, constraints, and guidance currently needed. |
| **Living Roadmap** | Humans view, add, group, prioritize, defer, or select possible outcomes. |
| **Define** | Product and Engineering shape a selected outcome, its boundaries, requirements, and observable acceptance. |
| **Plan** | Loopy divides the committed Milestone into bounded Work Units and makes sequencing, safe parallel work, evaluation, and risks visible. |
| **Build and Prove** | The Host AI implements only authorized work, records evidence, and uses independent evaluation on the exact candidate. |
| **Demonstrate and Accept** | The outcome is shown in a human-understandable way. A human accepts it, requests correction, or defers judgment. |

Roadmap management, change intake, status, pause, and resume remain available throughout the lifecycle. Several Milestones may progress independently when their dependencies and workspaces permit it.

## Start Loopy

Open the project in a Host where Loopy is available and start a fresh conversation. State your goal in ordinary language:

```text
Use Loopy to help me start this project.
```

You can be more specific:

```text
Use Loopy to help me create a migration planner for teams moving data between systems.
```

### Claude Code development preview

```bash
git clone https://github.com/reinqueen/loopy.git
cd /path/to/your/project
claude --plugin-dir /absolute/path/to/loopy
```

Then say:

```text
/loopy:loopy Help me start this project.
```

Claude Code support has not yet been verified through an authenticated walkthrough.

## What using Loopy feels like

Loopy starts with what you tell it. Before inspecting more, it asks what project context it may read and why that context would help.

It normally asks no more than three related questions at a time. It should probe important ambiguity, explain recommendations, and avoid behaving like a fixed questionnaire. You can correct it, say something is unknown, defer a non-blocking decision, pause, or resume later.

You can speak naturally. For example:

- “What is active, blocked, or ready next?”
- “Add this possible outcome to the Roadmap.”
- “Help me define the two highest-priority candidates.”
- “Plan this Milestone and show what can happen in parallel.”
- “Implement the ready Work Units and run the planned evaluation.”
- “Demonstrate the result so I can judge it.”
- “This requirement changed. What does it affect?”

You do not need to remember internal IDs or separate lifecycle commands.

## Documents humans use

Start with `LOOPY.md`. It is the project home and shows what is happening now and the next action.

```text
LOOPY.md                              # Start here
└── docs/loopy/
    ├── Project-Definition.md         # Project direction
    ├── Roadmap.md                    # Complete outcome portfolio
    ├── Engineering-Guide.md          # Shared technical guidance
    ├── Architecture.md               # Created when lasting structural guidance is needed
    ├── Demo-Strategy.md              # Created when a reusable Demo approach is needed
    ├── Release-Strategy.md           # Created when distribution affects delivery
    ├── milestones/<milestone>/
    │   ├── Definition.md             # Outcome and acceptance boundary
    │   ├── Plan.md                   # Delivery and evaluation approach
    │   ├── Proof.md                  # Evidence mapped to the commitment
    │   └── Demo.md                   # Walkthrough and human judgment
    └── changes/<change>/Change.md    # Material changes only
```

| Document | Purpose |
|---|---|
| `Project-Definition.md` | Project direction, people, need, boundaries, and success |
| `Roadmap.md` | Possible, planned, active, blocked, completed, and dependent outcomes |
| `Engineering-Guide.md` | Shared technical practices, tools, and constraints |
| `Definition.md` | One Milestone's exact outcome and acceptance boundary |
| `Plan.md` | Delivery approach, Work Units, sequencing, and evaluation |
| `Proof.md` | What was built, checked, observed, limited, or not proven |
| `Demo.md` | The observable walkthrough and human judgment |
| `Change.md` | A material proposed change and its impact |

Loopy creates conditional documents such as `Architecture.md`, `Demo-Strategy.md`, or `Release-Strategy.md` only when lasting project-wide guidance is genuinely needed.

### What `.loopy/` is for

The readable documents above are the normal human experience. Separately, Loopy maintains a hidden `.loopy/` directory inside the project:

```text
.loopy/
├── state and lifecycle history
├── decision and authorization receipts
├── exact candidate and evaluation records
└── detailed or raw evidence
```

Loopy uses this internal layer to preserve continuity, enforce lifecycle rules, detect stale documents, and support trustworthy history. Humans normally do not need to browse or edit it. Loopy should surface anything requiring human attention through `LOOPY.md` or the appropriate readable document.

## When human judgment is required

Loopy handles routine drafting, planning, implementation, checks, and status updates without repeatedly requesting approval. Human judgment returns to:

1. Confirm a responsibility-owned project foundation or guide.
2. Commit a Milestone's outcome and acceptance boundary.
3. Approve a material change to meaning that was already accepted.
4. Judge a demonstrated outcome.

Before asking, Loopy should summarize what the decision includes, what it does not include, and what remains unknown or deferred.

## Current limitations

- Release and Publish is not implemented.
- Claude Code packaging exists, but Claude Code behavior has not been verified.
- Source tests, package validation, and one local installed-plugin smoke walkthrough have passed; broader independent Host qualification remains incomplete.
- The exact Loopy package has not completed representative human walkthroughs across every implemented lifecycle stage.
- Multi-person coordination, long-running projects, irreversible external actions, and recovery under real organizational conditions have limited behavioral evidence.
- Installation or passing tests must not be described as a final Loopy v1 Release.

For the detailed implementation and evidence status, see [Loopy v1: Journey So Far](../product/LOOPY-V1-JOURNEY-SO-FAR.md).
