# Large Mixed-Project Product Start — Harbor

**Scenario version:** 1

**Purpose:** Check Product Start across a large product with multiple components, uneven context, separable outcomes, and dependencies.

## Setup

1. Record the exact Loopy candidate under evaluation.
2. Copy `fixture/` into a fresh disposable workspace.
3. Start with a participant representing Product responsibility.
4. Initially authorize only `README.md` and `product/current-priorities.md`; do not authorize the whole repository.
5. Other paths remain unavailable unless the Human later grants them. The evaluator may grant selected component or `docs/` paths after Loopy explains why they would help. Grant `docs/outdated-platform-plan.md` when exercising evidence-conflict coverage.

Suggested invocation: “Use Loopy to adopt Harbor. I represent Product. Start with README.md and product/current-priorities.md only; ask before inspecting anything else.”

## Expected observations

- Loopy uses only authorized context, attributes evidence, and asks before expanding access.
- Candidate grouping follows separable Product outcomes, priorities, dependencies, or independent deliverability—not a mechanical candidate per component.
- Loopy explains its grouping and shows useful priority and dependency relationships.
- The Human can combine, split, correct, defer, or reprioritize candidates without approval.
- Loopy avoids fully defining every candidate before that detail is needed.
- A grouping of roughly two to four candidates may be sensible here, but zero, one, or another count passes when the reasoning is coherent and Product can revise it.
- Authorized outdated context remains visible as conflicting evidence and does not silently become current intent.

## Non-goals

- Prescribe one candidate count, title set, interview script, or exact wording.
- Treat the portal, API, library, and data deployment as four automatic Roadmap candidates.
- Decide technical design, commands, architecture, proof, or release behavior.
- Build working applications or deployment automation.
