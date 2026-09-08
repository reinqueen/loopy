# Living Roadmap Management

Use this internal reference when the single Loopy skill recognizes a request to view, organize, resume, or select Roadmap work. Never expose this route as a separate skill or command.

## Understand the request

Read canonical Loopy state and synchronized human views. Apply the skill's canonical question-frontier mechanics only to Roadmap decisions: unresolved outcome meaning and prerequisite dependencies precede downstream selection or disposition questions that rely on them. Ask about ambiguous outcome meaning, priority, dependency consequences, disposition, or represented responsibility, and reflect consequential interpretations before acting. A person's job title does not grant a responsibility; record the responsibility they explicitly represent.

Recognize ordinary requests to add, rename, combine, split, prioritize, defer, cancel, supersede, select, pause, or resume candidates. Keep the conversation summary-first and provide host-appropriate links or exact paths to `LOOPY.md` and `docs/loopy/Roadmap.md`.

## Preserve Product and Engineering boundaries

Routine portfolio operations require no approval. Product controls outcome meaning and priority. Engineering may recommend feasibility dependencies and sequencing without changing Product priority. Loopy may perform clear routine organization from supplied Product intent, but must stop when it would choose between competing Product outcomes or alter accepted meaning.

Group candidates by coherent outcome. Never produce one candidate per component, repository, service, screen, or technical task merely because those parts exist.

## Dependencies and selection

Classify each known relationship as **required before**, **helpful and non-blocking**, or **independent and potentially parallel**. State whether a required-before relationship blocks Definition or only later implementation. Do not force a relationship for every pair.

Treat the Roadmap relationship summary as a portfolio view, not execution authority. Its quick view shows required order, explicitly independent work as **Potentially parallel**, and unresolved or conflicting meaning as **Needs coordination**; helpful relationships remain in the detailed candidate data. Never describe Roadmap independence as safe concurrent implementation.

Eligibility for Milestone Definition is separate from readiness for implementation. A candidate can be selected while a visible dependency will later block implementation. Several independently understandable candidates may enter Definition together.

Before selection, verify the entire requested set. Selection is atomic: if any candidate is ineligible, select none, explain the first deterministic blocker, and offer retry with an eligible set. Selection routes to Milestone Definition but creates no folder, Definition, commitment, Plan, workspace, worktree, or implementation authority.

## Candidate continuity

Rename preserves identity. Combine and split create new identities and retain sources as superseded with readable lineage. Defer records a reason and reconsideration condition. Cancel and supersede preserve the candidate and reason; candidates never silently disappear.

Record participant and represented responsibility when applicable. Preserve an already-known work location for existing later-lifecycle items, but do not choose an implementation workspace or recommend Git-worktree policy in this stage.

## Internal Engine interface

Resolve the package root containing `skills/loopy/`, `engine/`, and `templates`. Before constructing an operation input, read [Living Roadmap operation input](../engine/Living-Roadmap-Apply.md). Resolve a usable Node.js executable through the Host; if `node` is unavailable in Codex, use the Host's workspace-dependency lookup. Invoke the compiled CLI with the operation command first:

`<node-executable> <package-root>/runtime/dist/engine/src/cli.js <command> --source-root <package-root> --workspace <target-project> [operation-specific flags]`

- `roadmap-init` imports the confirmed Product Roadmap without committing candidates.
- `roadmap-apply --input <json-file>` performs one validated routine operation.
- `roadmap-interrupt --resume-action <action>` and `roadmap-resume` preserve continuity.
- `roadmap-render`, `roadmap-stale`, and `roadmap-status` refresh or inspect state.

Keep internal identities, JSON, and Engine commands out of normal human views. After every success, show the refreshed artifacts and exactly one project-level next action.
