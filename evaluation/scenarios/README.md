# Loopy v1 Evaluation Scenarios

These materials give Loopy builders and evaluators controlled, reusable starting points.

## Model

| Term | Meaning |
|---|---|
| **Fixture** | A reusable controlled starting project with no generated Loopy state |
| **Scenario setup** | Versioned decisions and steps that establish prerequisites using the exact candidate under evaluation |
| **Evaluation workspace** | A fresh disposable copy of a fixture where the candidate creates new artifacts and internal state |
| **Evaluation scenario** | The interaction and behavior being observed in that workspace |
| **Expected observations** | Outcomes and boundaries that allow reasoned variation, not scripted conversation or exact wording |

For every fixture-backed run, record the exact candidate, copy the fixture into a new disposable workspace, apply the scenario setup there, and preserve the resulting evidence separately. A greenfield scenario instead creates a fresh empty disposable workspace. Never reuse an evaluation workspace or store generated `.loopy` state in a base fixture or this source repository.

## Structural checks and behavioral evaluation

Structural tests may verify that guidance, contracts, scenarios, and hard state invariants exist and remain internally consistent. They do not prove that a Host AI understood an answer, selected the highest-value conversational move, asked a well-paced follow-up, grounded a recommendation, or stopped at the right semantic boundary.

Interview-quality claims require an actual independent multi-turn conversation evaluation. Preserve the complete transcript and resulting human artifacts together with:

- the exact Loopy candidate and Host AI used;
- the fresh workspace or fixture identity and starting contents;
- supplied context and every recorded context grant;
- per-turn observations about understanding, decision coverage, frontier changes, and move selection; and
- the evaluator's reasoned judgment against outcome-based scenario expectations, including failures, prompting or steering, and limitations.

Do not call a run blind or independent if the evaluator revealed expected questions, prompted the desired move, or repaired the conversation. Structural source review and unit tests remain supporting evidence, not behavioral conversation proof.

## Scenario families

Loopy v1 uses three families:

1. **Simple Product Start** — focused context and a small Product decision surface.
2. **Large mixed project** — multiple components, uneven documentation, several outcomes, and dependencies.
3. **End-to-end delivery** — Product Start through delivery and Release; added incrementally as later slices exist.

The first two families provide the reusable fixtures. The end-to-end family now reaches bounded Build and Proof through staged golden paths; Demonstration, human Milestone Acceptance, completion, and Release remain absent. The verification matrix's S1–S7 scenarios are coverage dimensions that these families may combine; they do not require seven separate projects.

The [greenfield Product and Engineering walkthrough](engineering-foundation/greenfield-human-walkthrough/Scenario.md) reuses the simple-start family and continues through the implemented Engineering Foundation. Its focused [migration-planner interview-quality regression](interview-quality/migration-planner/Scenario.md) preserves the ambiguity, blank-workspace reuse, authorization, and unsupported-recommendation cases from a human walkthrough without prescribing answers. The [cross-domain interview behavior suite](interview-quality/cross-domain/Scenario.md) requires separate independent runs for the shared after-response mechanics. The [Harbor Living Roadmap scenario](living-roadmap/large-mixed-project/Scenario.md) reuses the large mixed-project fixture with versioned prerequisite setup. The [Milestone Definition golden path](milestone-definition/golden-path/Scenario.md) carries Harbor through bounded commitment, while the [Slice 4 behavioral suite](milestone-definition/interview-quality/Scenario.md) remains reserved for independent multi-turn evaluation. The [Build and Prove golden path](milestone-build-and-prove/golden-path/Scenario.md) extends that controlled lineage through inert implementation records and exact-candidate evaluation; its [independent behavioral scenario](milestone-build-and-prove/interview-quality/Scenario.md) evaluates Host authority, coordination, model recommendation, and Proof judgment without builder coaching. The Slice 8 [UI-style](milestone-demonstrate-and-accept/ui-style/Scenario.md) and [non-UI](milestone-demonstrate-and-accept/non-ui/Scenario.md) scenarios then evaluate exact-candidate Demonstration and genuine human judgment without treating structural tests as behavioral proof.
