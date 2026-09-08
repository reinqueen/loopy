# Slice 4 Lifecycle Summary Correction

## Independent finding

Independent evaluation of exact candidate `2a6527d` reproduced the same human-view contradiction in four fresh workspaces: after a Definition commitment, `Roadmap.md` listed the Planned Milestone but retained the earlier Product-stage explanation that no Milestone had been committed. `LOOPY.md` and `Definition.md` already reflected the commitment correctly.

## Root cause and correction

The Slice 4 renderer replaced the current-milestone table and project next action but did not replace the Product-stage lifecycle section. An existing assertion checked a different plural sentence in the current-milestone table and therefore did not cover the reproduced singular lifecycle explanation.

The Slice 4 overlay now renders the shared lifecycle section from committed Definition state. It preserves the confirmed Product foundation, reports the exact number of committed Planned Milestones, and reports any remaining uncommitted Definition drafts. Focused regressions cover a fresh single commitment and an explicitly named multi-Definition commitment, checking synchronized `LOOPY.md`, `Roadmap.md`, and every committed `Definition.md`.

## Boundary

This is a rendering and regression correction only. It changes no canonical schema, transition, responsibility, commitment, or lifecycle authority. It is development evidence, not Slice 4 acceptance.
