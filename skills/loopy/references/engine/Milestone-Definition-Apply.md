# Milestone Definition Engine input

This is internal Host-AI guidance. Never show Definition identities, JSON, or Engine commands as the Human experience.

Use `definition-status` to map human-readable Milestone names to stable internal identities.

- `definition-apply` accepts one closed `update` object naming a Definition, an actor with explicitly represented perspectives, and any changed `content`, Host `coherence` declaration, `requiredPerspectives`, or `specialistInputs`. It always persists canonical state. Ordinary incomplete updates do not publish Markdown; reaching review readiness or a blocking state does.
- `definition-review` accepts a JSON array of distinct Definition identities. Review is rejected unless the Host has declared coherence and the formal outcome, requirement, and acceptance boundary exist.
- `definition-confirm` accepts an array of explicitly named requests with `definitionId`, `participant`, `perspectives`, and `commit`. Use `commit: true` when the response clearly confirms and commits. Each ready Definition commits independently; an unready named Definition remains unchanged and does not block another ready named Definition.

Dependencies preserve the typed `kind` (`required-before`, `helpful-non-blocking`, or `independent-potentially-parallel`) and the `consequence` boundary inherited from the Roadmap. Never translate a helpful or independent relationship into a required constraint. Use `consequence: definition` only for an effect on bounded Definition; use `implementation` for later delivery consequences. Specialist inputs use `blocking` only when missing input prevents a safe bounded Definition; otherwise use `just-in-time`.

Do not infer semantic completeness from populated fields. Do not edit a committed Definition through these operations. On rejection, do not manually edit canonical state or human views.

`definition-render` explicitly publishes the current synchronized human views. `definition-interrupt`, `definition-review`, `definition-confirm`, and `definition-status` are also publication boundaries. `definition-resume` requires the paused publication to remain unstale and regenerates the resumed view. View metadata records the published state revision; a lower revision is a known prior snapshot rather than evidence that canonical state was lost.
