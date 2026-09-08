# Slice 4 Implementation Evidence

## Scope

This record covers the bounded Milestone Definition implementation against the human-approved Slice 4 design. It is development evidence, not human acceptance of the implementation and not an independent Host-AI evaluation.

The Engine stores independently versioned Definitions sourced from atomically selected Roadmap candidates, renders one readable artifact per Definition, validates formal review and same-revision perspective receipts, supports explicitly named independent commitments, protects committed boundaries, and keeps project views synchronized with one next action. Semantic coherence remains an explicit Host-AI determination; populated fields are not treated as proof.

## Builder findings and corrections

- The Harbor fixture carries intentionally unresolved dependency notes. The golden setup initially attempted selection without classification; Slice 3 correctly rejected it. The setup now records explicit dependency classifications before selection.
- The first Definition overlay targeted a heading absent from the current Roadmap template, so the Planned-Milestone section did not render. The insertion anchor now uses the stable Product-questions heading and a regression asserts the result.
- Review found that the inherited `Current Milestones` section could still say none after a Slice 4 commitment. Rendering now replaces that section from committed Definition state and includes readable Roadmap-candidate provenance.
- Collision handling initially considered only sibling generated Definitions. It now also preserves pre-existing human files by deterministically suffixing the new path.

## Evidence limits

Automated tests prove contract shape, formal transitions, history, staleness, containment, rollback, rendering, and structural guidance. The builder-controlled golden path exercises those same deterministic mechanics. Neither proves that a live Host asks good questions or makes a sound semantic coherence judgment.

The independent multi-turn cases in `evaluation/scenarios/milestone-definition/interview-quality/Scenario.md` remain for a separate evaluator. No independent evaluator pass or human implementation acceptance is claimed here.
