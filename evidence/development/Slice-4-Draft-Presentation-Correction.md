# Slice 4 Draft Presentation Correction

## Walkthrough finding

The completed AI-operated Slice 4 walkthrough in task `01a077b0-5bdd-7f11-9d72-9d1fe5bae826` found that Loopy persisted the evolving Definition appropriately but then offered a clickable `Definition.md` link after nearly every participant answer. Repeated presentation interrupted the Socratic interview and added noise.

## Initial correction and remaining gap

The shared Loopy guidance already required summary-first artifacts and did not require per-turn links. The Slice 4 interview reference contained the overly broad instruction to show refreshed artifacts after every successful operation, so initial correction `bf9e18d` remained local to Milestone Definition. It stopped instructing the Host to offer each draft, but the Engine still coupled every `definition-apply` to a complete Markdown rewrite.

## State and render separation

Loopy now persists every meaningful interview change immediately to canonical `.loopy` state while ordinary incomplete updates leave the public Markdown snapshot untouched. Review readiness, blocking, explicit render, pause, review, commitment, and status/reporting publish current synchronized views. Resume relies on canonical state; pause first publishes it, and stale detection still prevents advancing from externally changed views.

Each published Slice 4 view identifies the Milestone Definition state revision it represents. When canonical state advances privately, stored view metadata retains the earlier revision and stale detection reports the known prior snapshot. This avoids representing old Markdown as the current draft without introducing another state machine. Clickable links remain optional; an exact openable or copyable path is sufficient for terminal-oriented hosts.

The change preserves the passed lifecycle-summary correction baseline `7252ca6`; it does not alter the committed-boundary rendering fixed there.

## Evidence boundary

Engine regressions verify that multiple ordinary updates persist and advance history without changing published files; metadata and stale detection identify the prior snapshot; explicit render and status publish current views; review readiness, pause, review, and commitment publish synchronized views; and interruption/resume remains safe. Structural checks verify the Host guidance and terminal portability. These checks cannot prove that a Host follows the conversational cadence naturally, so a fresh independent multi-turn behavioral recheck remains required. This correction changes no Definition meaning, responsibility, commitment, or later-stage authority and does not constitute Slice 4 acceptance.
