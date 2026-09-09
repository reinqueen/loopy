# What Loopy Can Do

> A stage-by-stage guide to the current Loopy development preview. Release and Publish is not implemented yet.

## At a glance

| Stage | What Loopy helps you accomplish | Main documents |
|---|---|---|
| **Start or Adopt** | Establish the project's direction and possible outcomes from supplied or authorized evidence | `Project-Definition.md`, `Roadmap.md` |
| **Engineering Foundation** | Establish the shared technical guidance currently needed | `Engineering-Guide.md` |
| **Living Roadmap** | Organize, prioritize, and select possible outcomes | `Roadmap.md` |
| **Define** | Turn a selected or directly supplied outcome into a bounded Milestone | `Definition.md` |
| **Plan** | Divide the Milestone into understandable, ordered Work Units | `Plan.md` |
| **Build and Prove** | Implement authorized work and independently evaluate the exact result | `Proof.md` |
| **Demonstrate and Accept** | Show the outcome clearly so a human can judge it | `Demo.md` |

`LOOPY.md` remains the project home throughout the journey. It shows current work, blockers, and one next action.

## Start or Adopt

### When to use it

Use this when starting a new project, bringing Loopy into an existing project, or clarifying a project whose direction is uncertain.

### What Loopy does

- Starts with the information you provide.
- Asks which decisions you are responsible for.
- Asks what additional context it may inspect.
- Uses a focused interview to understand the people, need, outcome, boundaries, success, and uncertainty.
- Separates current human intent from information found in existing sources.
- Suggests one or several Roadmap candidates when the intended outcomes can be meaningfully separated.

### What the human contributes

Humans supply or correct Product direction, choose the authorized context, and decide whether the Product foundation is accurate enough to confirm. Anyone may contribute; Loopy checks decision authority only at the confirmation boundary.

### Documents produced

- `LOOPY.md`
- `docs/loopy/Project-Definition.md`
- `docs/loopy/Roadmap.md`

### Stopping boundary

Product confirmation does not authorize Engineering decisions, implementation, deployment, or release. A Roadmap candidate remains a possibility, not committed delivery work.

### Example request

```text
Use Loopy to help me shape this project and its Roadmap.
```

## Engineering Foundation

### When to use it

Use this after the Product direction is sufficiently clear and the project needs shared technical guidance.

### What Loopy does

- Examines only authorized technical context.
- Distinguishes existing technical facts from new Engineering choices.
- Helps establish languages, frameworks, repository practices, quality checks, testing tools, constraints, and important dependencies.
- Identifies whether lasting Architecture, Demo, or Release guidance is needed now or can wait.
- Avoids reopening confirmed Product meaning unless a real conflict appears.

### What the human contributes

Someone representing Engineering supplies technical intent, corrects Loopy's interpretation, and confirms the Engineering guidance.

### Documents produced

- `docs/loopy/Engineering-Guide.md`
- Updated `LOOPY.md` and `Roadmap.md`
- Conditional project guides only when genuinely needed

### Stopping boundary

Engineering confirmation does not commit a Milestone or authorize implementation, deployment, or release.

### Example request

```text
Use Loopy to help us establish the Engineering guidance for this project.
```

## Living Roadmap

### When to use it

Use this to understand current work, add an idea, reorganize possible outcomes, change Product priority, or select work for Definition.

### What Loopy does

- Shows candidates, committed Milestones, dependencies, blockers, and current state.
- Adds, renames, combines, splits, prioritizes, defers, cancels, or supersedes candidates without silently losing history.
- Keeps Product priority separate from Engineering delivery order.
- Checks whether selected candidates are eligible to move forward.
- Supports selecting several candidates together when appropriate.

### What the human contributes

The human explains the desired Roadmap change and supplies Product priority or judgment when evidence cannot determine it.

### Documents produced

- Updated `docs/loopy/Roadmap.md`
- Updated `LOOPY.md`

### Stopping boundary

Selecting a candidate routes it toward Definition. It does not create a committed Milestone, Plan, workspace, or implementation authority.

### Example request

```text
What is active, blocked, or ready next on the Roadmap?
```

## Define a Milestone

### When to use it

Use this when one or more selected Roadmap candidates—or a directly supplied outcome—need a clear delivery commitment. A completed Product Foundation or existing Roadmap is not required before useful Definition discovery.

### What Loopy does

- Clarifies the intended outcome and business requirements.
- Defines scope, non-goals, observable acceptance criteria, dependencies, risks, and unresolved matters.
- Brings in the Product and Engineering perspectives actually needed.
- Reuses shared questions when several Milestones are being shaped together while preserving a separate Definition for each.
- Presents the exact boundary for review before commitment.

### What the human contributes

The responsible people clarify meaning, correct the draft, and decide whether to commit the exact Milestone outcome and acceptance boundary.

### Documents produced

- `docs/loopy/milestones/<milestone>/Definition.md`
- Updated `LOOPY.md` and `Roadmap.md`

### Stopping boundary

Committing a Definition makes the Milestone planned delivery work. It does not approve a future Plan, authorize implementation, or accept the result.

### Example request

```text
Help me define the two highest-priority Roadmap candidates.
```

## Plan a Milestone

### When to use it

Use this when a committed Milestone needs an implementation and evaluation approach.

### What Loopy does

- Divides the Milestone into bounded Work Units.
- Shows required sequence and explicitly safe parallel work.
- Maps planned checks and evidence to the acceptance boundary.
- Makes risks, dependencies, stopping conditions, and the independent-evaluation approach visible.
- Creates conditional Architecture, Demo, or Release guidance when the current work requires it.

### What the human contributes

The human supplies missing Engineering judgment and resolves material choices. Routine decomposition within the committed Definition does not require another approval.

### Documents produced

- `docs/loopy/milestones/<milestone>/Plan.md`
- Conditional `Architecture.md`, `Demo-Strategy.md`, or `Release-Strategy.md`
- Updated `LOOPY.md` and `Roadmap.md`

### Stopping boundary

A completed Plan does not authorize Build execution, source-control distribution, deployment, or release.

### Example request

```text
Plan this Milestone and show what must be sequential and what can safely happen in parallel.
```

## Build and Prove

### When to use it

Use this when a Milestone has a coherent Plan and the human is ready to authorize specific implementation work.

### What Loopy does

- Establishes the exact Work Units, workspace, tools, model or cost guidance, and source-control actions authorized for the session.
- Helps the Host AI implement only that bounded work.
- Runs planned checks and preserves inspectable evidence.
- Freezes exact candidates so the evaluated result cannot silently change.
- Coordinates independent evaluation in a fresh context separated from the builder's assumptions.
- Makes failures, limitations, skipped checks, and unproven behavior visible.

### What the human contributes

The human grants bounded execution authority and supplies judgment when a material choice cannot safely be assumed.

### Documents produced

- `docs/loopy/milestones/<milestone>/Proof.md`
- Detailed evidence under `.loopy/`
- Updated `LOOPY.md` and `Roadmap.md`

### Stopping boundary

An independently passing candidate becomes **ready for Demonstration**. It is not yet accepted, Complete, deployed, or released.

### Example request

```text
Implement Work Units 1 and 2 in this workspace and run the planned local checks.
```

## Demonstrate and Accept

### When to use it

Use this when the exact proven candidate is ready to be shown and judged.

### What Loopy does

- Prepares a concise, outcome-first demonstration.
- Supports a human-guided Demo, an AI-operated recorded Demo, or both.
- Preserves commands, outputs, logs, screenshots, recordings, or other relevant evidence.
- Connects the demonstrated behavior to the committed outcome and proof.
- Makes limitations and unobserved behavior visible.
- Records the human's decision to accept, correct, or defer.

### What the human contributes

The human observes the result and decides whether it is good enough. The responsibility label may vary; what matters is that the person has authority to judge the outcome.

### Documents produced

- `docs/loopy/milestones/<milestone>/Demo.md`
- Durable linked evidence
- Updated `LOOPY.md` and `Roadmap.md`

### Stopping boundary

Acceptance makes the Milestone **Outcome Accepted — not yet released or deployed**. Loopy records this internally as `Complete`; it does not authorize deployment, publication, or a Release.

### Example request

```text
Demonstrate the result and show me the evidence so I can judge it.
```

## Capabilities available throughout

### Change management

Tell Loopy when a requirement, decision, defect, constraint, or need changes. Loopy determines whether it is a clarification, in-scope correction, material change to accepted meaning, or future Roadmap candidate. Material changes receive a readable `Change.md`; accepted history is not silently rewritten.

### Context control

You decide what Loopy may inspect. You can authorize a whole project, a selected directory or file, a link, an attachment, or information supplied directly in conversation. Permission for one source does not authorize surrounding systems.

### Pause and resume

Loopy preserves settled direction, unresolved matters, and one next action so work can continue later without restarting the whole interview.

### Status and pickup

Ask Loopy what is active, blocked, deferred, Complete, or ready next. You may identify work by its human-readable name rather than an internal ID.

## Not currently available

**Release and Publish** is not implemented in this preview. Loopy can make accepted Milestones Complete, but it cannot yet create and authorize an exact Release, publish it, verify availability, or mark included Milestones Released.

See [How to Use Loopy](HOW-TO-USE-LOOPY.md) for installation, common language, human-facing documents, and current limitations.
