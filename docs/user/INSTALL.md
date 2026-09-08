# Install the Loopy development preview

This preview contains the implemented lifecycle through Demonstrate and Accept. Release and Publish is not implemented, and neither Host package is a final v1 Release.

## Requirements

- Node.js 20 or later
- A project workspace where Loopy may create `LOOPY.md`, `docs/loopy/`, and `.loopy/`

## Codex

Install the `loopy` plugin from its configured local marketplace, then start a fresh Codex task in the project where you want to use it.

Invoke it explicitly with `$loopy`, or ask in ordinary language—for example, “Use Loopy to help me start this project.”

The local development installation and its exact source commit must be recorded separately from any future published package.

## Claude Code

From a clone of this repository, run:

```text
claude --plugin-dir /absolute/path/to/loopy
```

Claude Code exposes plugin skills with a namespace, so explicit invocation is `/loopy:loopy`. Ordinary-language automatic routing may also apply when the request matches the skill description.

The Claude package is a build target until it passes a fresh authenticated Claude Code walkthrough. Its presence does not establish a support claim.

## Update

Rebuild or obtain the new exact package, verify its version and source commit, reinstall it through the Host's supported plugin flow, and start a fresh task or reload plugins as required by that Host.

## Uninstall or rollback

Disable or remove the Host plugin. To roll back, reinstall the previously preserved exact package. Project artifacts and `.loopy` state remain in the project unless the human separately decides to remove them.
