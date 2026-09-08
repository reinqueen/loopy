# Greenfield Product and Engineering Walkthrough

**Scenario version:** 1

**Purpose:** Observe whether one Loopy experience helps a person actively shape Product and Engineering foundations, including a complex or unfamiliar Product domain, when no repository evidence or prewritten answers exist.

This is reusable evaluation material, not production project state.

## Starting point

- Create a fresh, empty, disposable target workspace and record the exact Loopy candidate.
- Do not add a fixture README, manifests, source files, Product answers, Engineering answers, or generated Loopy state.
- Start with a participant holding Product responsibility. After Product confirmation, continue only when a participant explicitly takes Engineering responsibility; never infer that responsibility from Product participation.

Suggested opening: “Use Loopy to help me start a new software project in this empty workspace.” Continue later in ordinary language, for example: “Continue Loopy. I can take Engineering responsibility and want to establish our Engineering Guide.” The participant supplies their own project meaning and technical choices during the walkthrough.

During Product Start, the participant should introduce a domain with meaningful scale or complexity, unfamiliar concepts, uncertain dependencies or evidence, and more than one possible horizon or decision. A large legacy-workload migration with consolidation, retirement, prioritization, and ongoing transition tracking is one suitable example; another comparably rich domain is equally valid. The scenario supplies no preferred interpretation, candidate titles, or candidate count.

## Expected participation and observations

- Product Start establishes Product direction before Engineering begins, through the same single Loopy entry point.
- Loopy distinguishes the enduring Product direction recorded in Project Definition from possible outcome steps in the Roadmap; it creates no separate Vision artifact.
- Loopy elicits only the domain knowledge needed to understand relevant terms, workflow and decisions, evidence reliability, dependencies and edge cases, and consequences of being wrong.
- When distinct value, horizons, dependencies, or decisions emerge, Loopy proposes and explains a small candidate grouping rather than one accidental umbrella. The participant can combine, split, rename, reorder, or defer candidates.
- Loopy neither maps candidates mechanically to components or statements nor forces multiple candidates. Before readiness it checks that the Roadmap represents the distinct outcomes discussed and that the participant agrees with the grouping.
- With no repository evidence, Loopy asks what the participant knows or intends instead of treating absence as a reason to defer.
- The Engineering participant meaningfully shapes applicable component boundaries, defaults, exceptions, tools and commands, quality practices, environments and constraints, dependencies, uncertainties, and later follow-up needs.
- Recommendations are labeled hypotheses with reasons. The participant can accept, change, reject, or defer them individually.
- Loopy reassesses answers and explores consequences, ambiguity, exceptions, or cross-component effects without mechanically asking every possible field.
- Loopy asks whether the guide should record future Architecture, Demo/Quality, or Release follow-up and explains that this neither performs nor approves that work.
- Before readiness, Loopy recaps what the participant decided, what came from evidence, and what remains deferred, then asks whether anything important is missing.
- Product and Engineering confirmations remain responsibility-bounded, artifacts remain readable and accessible, and `LOOPY.md` presents exactly one truthful next action.

Reasoned variation is expected. The scenario prescribes neither project answers, exact wording, a minimum question count, candidate titles or count, nor which conditional follow-ups must be needed.

## Non-goals

- Seed a preferred architecture, stack, component model, tool, command, or follow-up trigger.
- Build an application, commit a Milestone, or perform Architecture, Demo, Release, deployment, or publication work.
- Preserve the disposable workspace as a fixture or commit its generated `.loopy` state.
