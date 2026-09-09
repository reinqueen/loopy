# Collaborative Brownfield Discovery Scenario

## Purpose

Evaluate whether the single Loopy skill can help two Humans discover and reconcile requirements, identify outcome-based Milestones and dependencies, prioritize them, update the Roadmap, and sufficiently define a selected Milestone without forcing unrelated earlier lifecycle ceremonies.

This is a behavioral Host-AI evaluation. Structural tests prove only Engine invariants.

## Controlled start

Copy the adjacent `fixture/` into a fresh disposable workspace. Do not include generated `.loopy` state. Record the exact Loopy candidate, Host AI, starting-tree fingerprint, supplied context, context grants, transcript, artifacts, and evaluator identity.

One Human opens with an ordinary request such as:

> Here is the repository and what we think we need. Help us figure out the requirements, Milestones, and priorities.

The Humans may identify themselves as PM and Technical Lead, use different titles, represent several responsibilities, or omit titles. Do not expose this rubric, expected questions, or fixture contradictions to the operating Host AI.

## Imperfect evidence

The fixture deliberately disagrees:

- the documentation claims three automatic retries;
- code performs one automatic retry;
- tests expect one automatic retry;
- configuration enables automatic retry;
- Product notes ask for manual recovery after a failure.

None of those sources is automatically authoritative. The Humans should introduce at least one vague or incomplete requirement and disagree about at least one material interpretation during the conversation.

## Required scenario matrix

Judge these behaviors across this walkthrough and focused companion runs. Reuse controlled fixtures and reset generated state between runs:

1. Existing PRD plus repository evidence leads to a targeted grill, candidate requirements, outcome-based Milestones, and a Roadmap.
2. Messy PM/TL notes lead to adaptive discovery and clarified requirements.
3. Disagreeing code, documentation, tests, and configuration are surfaced and reconciled.
4. Potentially legacy or wrong code is not treated as intended behavior.
5. Stale documentation is not treated as authoritative.
6. Conflicting Human interpretations are surfaced without being framed as role violations.
7. Inspected evidence prevents redundant repository-answerable questions.
8. Material uncertainty blocks consequential progression when it makes the decision unreliable.
9. Safe uncertainty can be deferred with its consequence and revisit condition.
10. Multiple independently valuable requirements produce sensible outcome-based Milestones.
11. One bounded outcome does not cause unnecessary Milestone explosion.
12. Required, enabling/helpful, recommended-sequence, and independent relationships are identified only when supported.
13. Loopy recommends priority with a stated rationale.
14. Final Human Product priority can override the recommendation.
15. A Human may decline Roadmap organization without creating an artificial blocker.
16. Direct Milestone Definition works without Product Foundation confirmation.
17. Direct Milestone Definition works without a pre-existing Roadmap when enough context exists.
18. Existing Definition content and settled discovery are reused.
19. Vague acceptance language triggers a deeper targeted grill.
20. An oversized Definition produces a split recommendation.
21. The Definition remains outcome-based rather than becoming an implementation-task list.
22. Drafting or refining a Definition does not commit the Milestone.
23. Roadmap candidate to Definition reuses prior discovery.
24. Direct Definition reconciles back to the Roadmap.
25. Every existing Loopy entry route remains available.
26. Starting from nothing still supports the existing full lifecycle path.

Across those runs, also judge context reuse, non-redundancy, follow-up depth, contradiction detection, current-versus-intended behavior, collaborative participation without job-title rigidity, correct target scope, avoidance of unnecessary upstream interviews, outcome quality, Milestone boundaries, dependency and priority reasoning, preserved Human authority, and stopping when current-target understanding is sufficient.

The primary brownfield walkthrough must additionally show that Loopy asks for bounded context authorization, inspects before asking repository-answerable questions, still grills Humans because evidence is fallible, presents a concise correctable shared-understanding synthesis, creates or updates `Roadmap.md` without `Requirements.md`, produces one selected `Definition.md`, records attributed evidence and reconciliation, and leaves exactly one understandable next action.

## Independent judgment

The evaluator receives the authoritative scenario and resulting evidence, but no builder coaching or expected conversational wording. Judge each observation as pass, fail, blocked, or uncertain with short reproducible evidence. A passing run must produce a usable `Roadmap.md` and one selected `Definition.md` while leaving publication, implementation, model routing, context packets, and release redesign untouched.
