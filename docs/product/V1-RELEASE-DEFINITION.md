# Loopy v1 Release Definition

> Accepted as the Loopy v1 product baseline on 2026-09-05. Publication requires separate authorization.

**Audience:** Loopy builders and evaluators. Humans do not need to read this document to use Loopy.

## Loopy and Humans

- **Loopy** is the software-delivery product being built, evaluated, packaged, and released.
- **A Human** is a person using Loopy to work on their own software project.

This document separates what the Loopy product must ship from what a Human must be able to accomplish with it.

## Purpose and scope

This document defines what Loopy v1 must contain, prove, and publish. It is the release boundary for the first version of the product.

[PRODUCT-LIFECYCLE.md](./PRODUCT-LIFECYCLE.md) defines the detailed experience Loopy must provide to Humans, including entry routes, responsibilities, artifacts, transitions, interviews, approvals, and deterministic guarantees. This document does not repeat those rules.

Implementation details belong in stage contracts, Engine code, and automated tests. Capability maturity belongs in the capability registry. Host AI verification and support claims belong in Release evidence and documentation.

## Release outcome

### Loopy product outcome

Loopy v1 ships as one human-facing skill, with the Engine, documentation, packages, and evidence required by this definition.

Loopy v1 is built for both Codex and Claude Code from the same source version. Host packaging may differ, but it must not create different Loopy products. Producing a package for a Host AI does not by itself claim support; Release documentation states only what the preserved evidence proves.

### Human outcome

A Human and their Host AI can use Loopy to understand a software project, maintain its Roadmap, deliver and demonstrate a meaningful Milestone, manage change, and publish and verify an exact Release.

## What a Human can do

| Human activity | What Loopy produces | Human decision |
|---|---|---|
| **Start or adopt a project** | `LOOPY.md`, `Project-Definition.md`, and `Roadmap.md` | Confirm the Product foundation |
| **Establish project guides** | `Engineering-Guide.md`; conditional Architecture, Demo, and Release guidance | Each responsibility owner confirms only their area |
| **Manage the Roadmap** | Current candidates, priorities, dependencies, active work, blockers, completed work, and release readiness | No approval for candidates or routine state changes |
| **Define and deliver a Milestone** | Milestone `Definition.md`, `Plan.md`, `Proof.md`, and `Demo.md` | Commit the Definition, then accept, reject, or request correction of the demonstrated outcome |
| **Manage change** | The affected current document; a readable Change Review only for a material change | Approve only a material change to something already accepted |
| **Demonstrate the result** | Human-guided and AI-operated recorded Demos with inspectable evidence | Accept, reject, or request correction |
| **Release and publish** | `Release-Plan.md`, `Release-Review.md`, and `Release-Notes.md` for an exact version | Authorize the Release and any explicitly named publication destination and visibility |

A Human participating in the Product responsibility may shape and prioritize Roadmap candidates before technical setup is complete. Product also defines the business outcome and requirements for selected Milestones. A Human participating in Engineering reviews feasibility and defines delivery implications before commitment. One person may hold both responsibilities when they explicitly say so.

## Product contents

The first Release contains:

- one canonical Loopy skill with focused reference instructions;
- the deterministic Engine and CLI behavior required by the skill;
- human product documentation and Human guidance;
- a Loopy product architecture document;
- a host-neutral, machine-readable capability registry and readable generated view;
- thin Codex and Claude Code installation packages produced from the same source version;
- automated tests and preserved real Host AI scenario evidence;
- known limitations, installation guidance, and uninstall or rollback guidance; and
- an exact version, Git commit, package hashes, and Release Notes.

The capability registry describes Loopy capabilities and implementation maturity. It does not contain Host AI compatibility or support claims.

## Proof required

The Loopy v1 candidate must be evaluated by using it in fresh or disposable Human-project workspaces representing:

- a new project;
- an existing well-documented project;
- an existing poorly documented project;
- a project whose documents and implementation conflict;
- multiple applicable product types, such as a website, API, CLI, or library;
- a Milestone changed after commitment; and
- a Milestone requiring a clear, inspectable Demo.

Functional proof establishes whether an exact capability worked. Product evaluation then uses six lenses to decide whether the resulting experience is good enough to release:

| Evaluation lens | Release-readiness question | Good enough for v1 |
|---|---|---|
| **Human understanding** | Can a Human quickly understand project state, documents, decisions, and the next action? | Human reviewers can explain them without learning Engine commands or internal IDs |
| **Interview and decision experience** | Does Loopy gather enough information without irrelevant questions or approval fatigue? | Required decisions are not silently assumed; questions stay responsibility-aware; Humans can correct, defer, pause, and resume |
| **Lifecycle integrity** | Does Loopy preserve commitments and move work through valid states? | No silent scope expansion, lost Milestones, invalid transitions, or stale human views; material changes reopen only affected decisions |
| **Proof and Demo trust** | Can a human understand what worked, what failed, and what was observed? | Claims trace to exact evidence, limitations remain visible, and human-guided and AI-operated recorded Demos work |
| **Team continuity** | Can another Human safely pick up work or run independent Milestones concurrently? | Context, responsibility, dependencies, workspace, and next action are clear; unsafe parallel work is blocked |
| **Release integrity** | Is the published Release exact, reproducible, authorized, and honestly described? | Source, packages, hashes, contents, destination, visibility, installation, rollback, and publication verification agree |

Each lens is release-blocking when it applies to a capability or support claim included in v1.

The release gate requires automated tests, real packaged-product runs in Codex and Claude Code, independent evaluation of exact candidates, and human review of preserved evidence. Independent evaluation runs in a fresh task or session and a separate clean workspace. The evaluator receives the approved product requirements, evaluation scenarios and lenses, and exact candidate—but no inherited code-generation conversation or builder conclusions.

Evaluation results must distinguish a build target from a verified support claim. Unproven Claude Code behavior prevents a Claude Code support claim but does not by itself block the Loopy Release; the Claude Code package remains an unverified build target until proven.

After a frozen Loopy v1 candidate exists, it must guide one contained future-Loopy change in a separate candidate workspace. The Loopy candidate may not alter the rules or canonical project state governing its own delivery. This bounded evaluation does not claim unrestricted self-hosting.

## Explicit exclusions

The first Release does not include:

- a Control Center or web dashboard;
- autonomous deployment;
- advanced organization administration;
- large multi-agent orchestration;
- support claims not backed by preserved evidence;
- automatic video production;
- unrestricted self-hosting;
- a capability registry maintained by Humans;
- Loopy' historical project artifacts; or
- a human-facing document for every internal Engine record.

## Complete when

The Loopy v1 product is complete only when:

- a Human can follow the promised lifecycle without learning internal artifact IDs or Engine commands;
- every included capability is implemented and its maturity is recorded truthfully;
- every published support claim is backed by preserved evidence;
- approval prompts occur only at the boundaries defined in the Product Lifecycle;
- exact Codex and Claude Code packages are reproducible from one Git commit;
- the human authorizes the exact Release and publication destination; and
- the Release is published and its availability is verified.
