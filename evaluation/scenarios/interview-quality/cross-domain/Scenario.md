# Cross-Domain After-Response Behavior Suite

**Scenario version:** 1

**Purpose:** Evaluate whether Loopy selects a useful next conversational move across domains without relying on one known regression or scripted wording.

Run each case independently with the exact candidate in a fresh disposable workspace. Vary the domain and surface details, do not show the Host AI the rubric, do not steer it toward the expected move, and preserve the evidence required by the scenario guide. Expected observations describe outcomes, not exact questions.

## Independent cases

1. **Ambiguous answer:** During Product discovery, give an answer with more than one materially plausible meaning. Loopy probes or reflects the important ambiguity for correction instead of marking the decision settled and advancing.
2. **Authorized brownfield facts:** Provide explicit access to a project where relevant technical facts are discoverable, including evidence about an outcome's dependency, feasibility, independence, or delivery chronology. Loopy inspects and attributes those facts before asking a human; human questions focus on intent, judgment, correction, choices, or unavailable knowledge. Technical independence or chronology does not establish Product priority or serial Roadmap order: Loopy reflects the narrower evidence and asks Product when priority is material, or leaves it visibly unresolved.
3. **Understanding gap versus decision gap:** Introduce one unclear statement and, separately, one choice that belongs to the represented responsibility. Loopy seeks understanding for the former and a decision or explicit deferral for the latter; it does not create durable state for every transient misunderstanding.
4. **Contradiction:** Supply an answer or authorized evidence that conflicts with earlier meaning. Loopy surfaces the contradiction and its relevant consequence before proceeding, preserving attributed evidence when material.
5. **Prerequisite ordering:** Create a downstream question whose answer depends on an unsettled earlier decision. Loopy resolves or explicitly defers the prerequisite before asking the dependent question, then recomputes the frontier.
6. **Unsupported recommendation:** Withhold the evidence and participant intent needed to ground a consequential recommendation, including Product priority or ordering. Loopy asks for the missing prerequisite or defers; it does not invent a solution basis, priority label, or serial relationship.
7. **Current-stage sufficiency:** Resolve or validly defer every decision required for the active bounded stage while leaving plausible later-stage branches. Loopy summarizes and proceeds toward current-stage review without interrogating the participant about later responsibilities.

## Common observations

- After each response, Loopy distinguishes what became understood from what still requires a responsible decision.
- Loopy checks whether authorized evidence can resolve a gap and chooses one highest-value move by default.
- Multiple questions are tightly coupled, easier together, and never exceed three actual answerable decisions including nested clauses or examples.
- Material ambiguity, contradiction, assumptions, dependencies, and evidence needs are not silently treated as settled.
- Loopy keeps Product priority distinct from prerequisite-driven delivery order and never promotes Engineering chronology into Product intent.
- Only durable or material gaps enter existing unknown, conflict, conditional-decision, deferral, resume, or next-action state.

## Evidence and claim boundary

For each independent case, preserve the full multi-turn transcript, exact candidate and Host AI, workspace and supplied context, grants, resulting artifacts, per-turn observations, evaluator judgment, steering disclosure, and limitations. Passing structural tests cannot substitute for these runs. Do not claim general Host interview quality from one domain, a prompted run, or source inspection alone.

## Non-goals

- Prescribe exact questions, answers, domains, technologies, or a fixed number of turns.
- Add Engine state for transient conversation understanding.
- Exercise Milestone implementation, acceptance, Release, publication, or unimplemented lifecycle behavior.
