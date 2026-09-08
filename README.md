# Loopy

Loopy is one human-facing skill for outcome-focused software delivery.

Humans set the outcome, provide relevant context and constraints, and judge the result. The Host AI can shape, plan, implement, independently evaluate, and demonstrate work within explicit boundaries. Loopy preserves that work through readable Markdown artifacts and deterministic lifecycle state.

## Development preview

This repository currently implements the journey through:

`Start or adopt → Engineering foundation → Roadmap → Define → Change → Plan → Build and prove → Demonstrate and accept`

Release and Publish is not implemented yet. This preview must not be described as a released or Host-qualified Loopy version.

See [Loopy v1: Journey So Far](LOOPY-V1-JOURNEY-SO-FAR.md) for the implemented behavior, tested scenarios, and current limitations.

## One entry point

Ask Loopy what you want to accomplish in ordinary language. Loopy routes the request internally; humans do not need to learn separate lifecycle skills or Engine commands.

Examples:

- “Use Loopy to help me start this project.”
- “Use Loopy to show me what is active and what I should do next.”
- “Use Loopy to help define and deliver this outcome.”

## Host status

- **Codex:** development package; local installed-plugin qualification is required.
- **Claude Code:** development package target; support is unverified until tested in an authenticated Claude Code environment.

See [development-preview installation](docs/INSTALL.md). Installation does not establish a final Release or Host-support claim.
