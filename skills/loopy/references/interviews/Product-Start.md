# Start or Adopt — Product Foundation

Use this internal reference when the single Loopy skill recognizes a request to start or understand a project. Never expose this route as a separate skill or command.

## Begin with permission and responsibility

Identify the target project, the Human's goal, and the responsibilities they explicitly represent. Selecting a project does not authorize reading its repository.

Ask whether Loopy may inspect the whole repository or only supplied or selected context. Explain why additional context would help before requesting it. Treat each authorized file, directory, repository, link, attachment, issue, design, or connected resource as a bounded grant; a link does not authorize its surrounding system.

Responsibility and context authorization each count as an answerable decision. Normally settle them in a short opening round before unrelated domain framing; if their inclusion would overload that round, ask fewer questions and continue after recomputing the frontier.

Starting is sufficient to initialize readable drafts. If Product is not represented, use only authorized evidence, do not infer Product intent, and make Product participation the next action.

## Product boundary

Ask Product only about purpose, people and need, outcome, evidence versus current intent, boundaries, success, Roadmap state, and uncertainty. Do not ask Product to decide Engineering, Architecture, Demo or quality, Release, publication, deployment, or rollback matters.

Keep Product direction and the Roadmap distinct. **Product direction or vision** is the enduring destination or change and belongs in `Project-Definition.md`. **Roadmap candidates** are distinct possible outcome steps toward that direction and belong in `Roadmap.md`. Never use these ideas as synonyms, and do not create a separate Vision artifact.

## Learn enough of the domain

Apply the skill's canonical question-frontier mechanics to Product decision coverage. Domain meaning needed to understand the requested outcome is a prerequisite for downstream boundaries, success, and Roadmap finalization. When a request contains materially ambiguous nouns, verbs, transformations, actors, boundaries, or operating context, identify the earliest ambiguity that could change downstream Product meaning. Keep dependent decisions off the frontier, ask one small prerequisite question, reflect the answer, and recompute before continuing. Allow an explicit unknown or deferral, but do not finalize Roadmap outcomes or declare readiness while unresolved ambiguity prevents coherent Product meaning.

When supplied or authorized context reveals a complex or unfamiliar domain, adaptively ask Product to explain the relevant concepts and terms, current workflow and decisions, evidence sources and their reliability, dependencies and edge cases, and the consequences of being wrong. Ask only enough to understand Product meaning and shape possible outcomes. Do not turn Product Start into exhaustive requirements gathering or Engineering discovery.

Treat domain statements as the participant's current knowledge or intent unless independently attributed as evidence. Reflect unfamiliar language back plainly and invite correction before relying on it.

After each Product response, apply the skill's canonical move-selection loop before changing coverage. In a greenfield project, current human intent and supplied context normally provide most of the available basis; keep intent distinct from attributed evidence. In a brownfield project, after explicit authorization, inspect discoverable facts before asking the person to supply them. Ask Product mainly for intent, judgment, correction, choices, and knowledge unavailable from authorized context.

Evidence about dependency, feasibility, technical independence, or delivery chronology does not by itself establish Product priority or serial Roadmap order. Keep Product priority distinct from prerequisite-driven delivery order. When priority or ordering is material but neither authorized evidence nor explicit Product intent establishes it, reflect what the evidence does establish and ask Product, or leave the priority visibly unresolved. Do not turn “can proceed independently” or an Engineering sequencing fact into an inferred priority label or “after” relationship.

## Shape a complete-enough Roadmap

When the conversation suggests independently valuable outcomes, different horizons, dependencies, or separable decisions, propose a small understandable grouping of candidates instead of compressing everything into one umbrella candidate. Explain why each grouping boundary is useful. Let Product combine, split, rename, reorder, or defer candidates without approval.

Do not mechanically create one candidate per component, activity, or sentence, and do not force several candidates when one coherent outcome is appropriate. A single candidate must be an explicit, reviewable grouping rather than accidental compression. No fixed candidate count applies, and candidates need not all be fully defined.

Before readiness, compare the Roadmap with the distinct outcomes implied by the conversation. Ask whether anything valuable, later-horizon, dependency-enabling, or independently decidable has been hidden inside another candidate, and whether Product agrees with the proposed grouping.

## Apply Product decision coverage

Build the Product tree from purpose, people and need, outcome, evidence versus intent, boundaries, success, Roadmap state, uncertainty, and only the triggered conditional decisions. Use authorized evidence to settle facts where it can; ask Product for meaning and judgment. Recompute the frontier after every answer, including whether a newly understood consequence triggers conflict, multiple-audience, external-promise, high-consequence, or replacement-and-migration coverage.

Roadmap grouping becomes answerable only after the Product meaning it groups is coherent. Before readiness, reflect the resulting direction and grouping for correction. Stop when Product coverage is resolved or explicitly deferred under Product blocking rules, even though later Engineering and delivery questions remain unopened.

Ask conditional questions only for conflicting context, multiple audiences, external promises, high-consequence use, or a material replacement or transition. Do not repeat settled meaning unless new evidence changes it.

For a correction, revise only affected meaning. For a deferral, record the decision, why it can wait, when it returns, and whether it blocks Product confirmation. On interruption, preserve grants and draft state. On resumption, recap briefly and continue from the next unresolved or blocking decision.

## Review and confirm

Before confirmation, present a concise Product review: enduring direction, people and need, outcome, evidence versus intent, boundaries, success, Roadmap candidates and their grouping, deferred matters, exclusions, and one next action. Explicitly ask whether the Roadmap represents the distinct outcomes Product intends. Whenever asking for review or confirmation, provide host-appropriate references to the target project's `docs/loopy/Project-Definition.md` and `docs/loopy/Roadmap.md`: clickable links when the Host AI and interface support them, otherwise clear, exact paths the Human can open or copy. Prepare each candidate's next shaping action for what follows confirmation; do not leave a candidate merely saying to review or confirm the Product foundation. Record that the current draft was reviewed, then ask Product to confirm only those two artifacts.

A non-blocking deferred uncertainty may remain. An essential deferred decision blocks confirmation and must appear in `LOOPY.md`. Missing participation outside Product does not block Product confirmation.

## Internal Engine interface

Resolve the Loopy package root containing `skills/loopy/`, `engine/`, and `templates`. Follow the skill's Host-specific Node.js resolution rule before the first Engine invocation. Invoke the compiled CLI with the operation command first, followed by the shared paths and operation-specific flags:

`<node-executable> <package-root>/runtime/dist/engine/src/cli.js <command> --source-root <package-root> --workspace <target-project> [operation-specific flags]`

Before constructing an `apply` input, read [Product Start apply input](../engine/Product-Start-Apply.md). This is internal Host-AI operating guidance; do not expose its JSON or Engine mechanics to the Human.

- `init --project-name <name> [--responsibilities product]` creates internal state and all three drafts without authorizing repository inspection.
- `apply --input <json-file>` records explicitly granted context, attributed evidence, Host-interpreted decisions, Roadmap updates, and the one next action.
- `interrupt` and `resume` preserve continuity.
- `review` records that the concise current draft was shown.
- `confirm --responsibilities product` validates and renders the confirmed foundation.
- `render`, `stale`, and `status` refresh or inspect formal state.

Keep Engine mechanics invisible to the Human. Validation establishes formal consistency, not semantic truth or permission. In the final confirmation or status response, provide host-appropriate references to all three target-project artifacts: `LOOPY.md`, `docs/loopy/Project-Definition.md`, and `docs/loopy/Roadmap.md`. Use clickable links when supported; otherwise give clear, exact paths the Human can open or copy.
The Engine owns the complete confirmed lifecycle statement and replaces only recognized generic Product-review placeholders. The Host AI remains responsible for meaningful, candidate-specific next actions.
