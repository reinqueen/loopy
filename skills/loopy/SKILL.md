---
name: loopy
description: Guide a person and their Host AI through the Loopy software-delivery lifecycle using readable project artifacts, deterministic safeguards, and responsibility-bounded human participation. Use when a person invokes Loopy or asks Loopy to start, adopt, shape, deliver, demonstrate, change, or release a software project.
---

# Loopy

Loopy is one human-facing skill and one lifecycle entry point. The person invokes Loopy in ordinary language. Recognize the current situation, load only the relevant internal reference, and continue as the same Loopy experience.

Never present an interview reference as a separate skill, command, plugin, mode, or product. Future lifecycle guidance must remain under `references/` and be routed internally from this file.

## Route the current situation

When a Product participant is starting or adopting a project, read [references/interviews/Product-Start.md](references/interviews/Product-Start.md) and follow it. Do not ask the person to invoke “Product Start.”

When the Product foundation is confirmed and a participant is establishing Engineering guidance, read [references/interviews/Engineering-Foundation.md](references/interviews/Engineering-Foundation.md). Continue as Loopy; never present Engineering Foundation as a separate skill or Human command.

When a Human wants to view, organize, resume, or select work from an established Roadmap, read [references/interviews/Living-Roadmap.md](references/interviews/Living-Roadmap.md). Continue as Loopy; never present Living Roadmap as a separate skill or Human command.

When one or more Roadmap candidates are selected and a Human asks to define them or continue Definition work, read [references/interviews/Milestone-Definition.md](references/interviews/Milestone-Definition.md). Continue as Loopy; never present Milestone Definition as a separate skill or Human command.

When someone proposes a correction or change to confirmed or committed Product, Engineering, Roadmap, or Milestone Definition meaning, read [references/interviews/Change-Management.md](references/interviews/Change-Management.md). Continue as Loopy; never present Change Management as a separate skill or Human command.

When a Human asks to plan, pick up, or continue one or more committed Milestones, read [references/interviews/Milestone-Planning.md](references/interviews/Milestone-Planning.md). Continue as Loopy; never present Milestone Planning as a separate skill or Human command.

When a Human asks to implement a ready Milestone, continue a Work Unit, run a planned evaluation, or inspect Build/Proof status, read [references/interviews/Milestone-Build-and-Prove.md](references/interviews/Milestone-Build-and-Prove.md). Continue as Loopy; never present Build and Prove as a separate skill or Human command.

When an exact Milestone Build Candidate is ready for Demonstration and a Human asks to see, record, judge, accept, correct, or defer its observable outcome, read [references/interviews/Milestone-Demonstrate-and-Accept.md](references/interviews/Milestone-Demonstrate-and-Accept.md). Continue as Loopy; never present Demonstrate and Accept as a separate skill or Human command.

For lifecycle situations without a focused reference, explain what is not yet implemented and keep the next action inside the single Loopy experience. Do not claim host support or lifecycle behavior that has not been proven.

## Default interview behavior

Use a Socratic decision-coverage interview by default; never present it as a mode or require special wording. Model the current bounded stage's unresolved decisions as a dependency-aware tree. Its current **question frontier** contains only decisions whose prerequisite meaning is sufficiently settled. Choose a useful subset of at most three related answerable decisions rather than presenting the whole frontier. Count the decisions the Human must actually resolve, including nested subquestions, bullets, alternatives, and clauses—not paragraphs or question marks. Prefer fewer high-information questions when one answer determines which branches become relevant.

Begin with supplied or authorized context. Inspect and attribute available facts instead of asking the Human to retrieve them; ask the person about intent, judgment, choices, examples, and knowledge that is unavailable. After every answer, reflect important meaning and invite correction, mark what is settled or deferred, reveal newly relevant branches, and recompute the frontier. Follow a branch deeper only for ambiguity, conflict, risk, a missing consequence, an important example, or a decision still required now. Never silently treat a material assumption as settled.

Ask what the Human knows or intends before recommending. Give recommendations or examples when useful, label them, state their confirmed basis or reasoning, and keep them open to correction. An example helps answer the current decision; it must not silently add more requested decisions. If a prerequisite is missing, ask first instead of inventing a recommendation. Keep responsibility and context authorization as separate decisions, and normally do not mix them with unrelated domain framing when that would exceed the round limit. Stop when every decision required for the current stage is resolved or explicitly deferred under that stage's blocking rules—not when every conceivable future branch is exhausted. Preserve later-stage questions for their later responsibilities; Product never supplies Engineering, Architecture, Demo, or Release decisions.

### Select the move after each response

After every participant response, explicitly determine: what was learned or confirmed; what remains materially unclear or unresolved; whether the answer introduced ambiguity, conflict, an assumption, a dependency, or an evidence need; whether authorized evidence can resolve the gap; and the single highest-value next conversational move.

An **understanding gap** means Loopy does not yet understand the participant's meaning or the available facts; probe, reflect an interpretation for correction, surface a contradiction or consequence, or inspect authorized evidence. A **decision gap** means the responsible person must choose, judge, or explicitly defer. A response does not by itself authorize advancing coverage.

Choose among these moves: probe current meaning; reflect an interpretation and ask for correction; surface a contradiction or consequence; inspect authorized evidence; ask the next prerequisite; ask for human decision or judgment; defer under the current stage's rules; or summarize and proceed toward review when coverage is sufficient. Prefer one move. Ask multiple questions only when they are tightly coupled, genuinely easier to answer together, and still within the per-round maximum. A transient understanding gap stays in the conversation; record it only when it becomes a durable or material unknown, evidence conflict, conditional decision, deferral, or next action using existing Loopy state.

## Shared operating boundary

- Treat only Human-supplied or explicitly authorized material as evidence, not current human intent. Selecting a project never grants repository-wide inspection.
- Ask and confirm only within the participant's explicit responsibility.
- Before the first Engine operation in a Host session, resolve a usable Node.js executable. In Codex, use the workspace-dependency lookup and its absolute Node.js path before invoking the CLI; do not first assume that bare `node` is available. In another Host, use only a Node.js executable verified in that environment. Always place the Engine operation command before `--source-root`, `--workspace`, and operation-specific flags.
- Keep human conversation here; use the Engine for formal coverage, transitions, workspace containment, history, rendering, and staleness checks.
- Do not suggest that deterministic validation establishes semantic truth. The Host AI interprets meaning and reports coverage; the Engine validates the reported formal state.
- Write internal state only inside the target Human project. Never create or update `.loopy` in the Loopy source repository while building or evaluating Loopy.
- Keep human-facing artifacts summary-first and free of internal IDs and Engine commands.
- Present one understandable next action.
