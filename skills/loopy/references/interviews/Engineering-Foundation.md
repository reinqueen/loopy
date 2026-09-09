# Establish Engineering Foundation

Use this internal route only after the Product foundation is confirmed. Any Human may contribute to Engineering discovery; the participant must state Engineering responsibility only before confirming the Engineering Guide. Do not silently reopen Product meaning or treat Engineering Guide confirmation as Product priority, Demo acceptance, Release authorization, deployment, or publication.

## Context and interview

Loopy may read its own canonical state and generated artifacts to resume. Before reading project source, docs, manifests, or automation, obtain an explicit Engineering grant for selected paths or the whole repository. Product-stage grants do not carry over. Attribute every finding and distinguish commands as observed, proposed/unverified, or confirmed with exact execution evidence.

Keep a declaration of Engineering responsibility separate from any context grant. Ask and record each distinctly; a reply such as “yes” does not grant both unless it unambiguously addresses both decisions. If the target workspace is already known to be blank, reuse that fact. Say what is known and ask whether external architecture, code, documentation, systems, or newly supplied technical context should be considered instead of requesting the same inspection again.

Authorized evidence seeds the conversation; it does not replace active Human participation. Inspect it first, separate what it shows from what remains open, and ask only about relevant gaps, conflicts, risks, or consequences. When evidence does not answer something, first ask what the participants know or intend. Recommend deferral only when they cannot or do not want to decide now.

After each participant response, apply the skill's canonical move-selection loop before changing coverage. In greenfield work, participant intent and supplied context normally provide most of the available basis; keep intent distinct from attributed evidence. In brownfield work, after explicit authorization, inspect source, documentation, manifests, and automation for discoverable facts before asking the person. Ask Humans mainly for intent, judgment, correction, choices, and knowledge unavailable from authorized context.

Apply the skill's canonical question-frontier mechanics to Engineering coverage. For a greenfield system with no technical evidence, relevant Engineering intent and constraints are prerequisites for solution hypotheses that depend on them. Start with the earliest prerequisite—often intended use surface and collaboration context—then recompute. Ask about integrations only when that answer makes them relevant. Later, ask only the smallest newly relevant set of organizational defaults, scale, security, hosting, storage, operational, or delivery constraints. Never enumerate all possible constraint categories in one round; these are internal coverage possibilities, not a questionnaire. Elicit applicable Engineering intent and constraints before proposing solution hypotheses.

Meaningfully shape the applicable Engineering picture with the participant:

- technical and component boundaries, their purposes, and paths;
- project-wide technology and tooling defaults, with component exceptions;
- build, run, test, lint, typecheck, packaging, and deployment commands when applicable;
- required coding and quality practices;
- environments, compatibility, security, operational, and delivery constraints;
- component dependencies, shared dependencies, sequencing, uncertainty, and deferrals; and
- possible later Architecture, Demo or quality, and Release follow-up.

Use project defaults with component exceptions; do not duplicate defaults, interrogate field by field, or demand irrelevant details. Apply the canonical per-round decision count to every nested prompt. Label each recommendation as a **hypothesis**, state the known evidence or participant intent supporting it, and give a short reason. Never invent scale, interface form, technology constraints, or other evidence. If the basis is insufficient, ask or defer instead of recommending a stack, database, or import mechanism. A hypothesis is not a bundled decision: invite the participant to accept, change, reject, or defer each meaningful recommendation.

After each answer, reflect important meaning plainly and invite correction, then reassess coverage. Drill deeper only when consequences, exceptions, ambiguity, risk, conflict, or cross-component effects remain; otherwise move on. Do not declare readiness merely because every field has a value. The Human may correct, defer, narrow context, interrupt, or resume.

Ask in plain language: “Should the Engineering Guide record follow-up work for Architecture, Demo/Quality, or Release?” Explain that a yes records a future handoff; it does not perform or approve that work. Record why a follow-up is needed and route it to the appropriate responsibility instead of inventing its decisions.

If the participant says “use all recommendations,” restate the concrete decisions you would apply and ask them to correct anything before applying them, especially when any recommendation was conditional.

## Review and confirmation

Before declaring readiness, give a compact recap under **What you decided**, **What came from evidence**, and **What remains deferred**, then ask whether anything important is missing. This is the concise review, not another approval. Include host-appropriate references to the Engineering Guide and Roadmap, plus component/default coverage, command confidence, dependencies, constraints, follow-up handoffs, exclusions, and the one next action. Only Engineering confirms `Engineering-Guide.md`.

After confirmation, provide host-appropriate references to `LOOPY.md`, `Roadmap.md`, and `Engineering-Guide.md`. State that Product meaning and later lifecycle approvals were not included.

The Engine owns the one next action after Engineering confirmation. It routes triggered guides in Architecture, Demo or quality, then Release order; otherwise it points to the next bounded Roadmap handoff. Do not supply or reinterpret a post-confirmation next action. If Product meaning is reconfirmed at a new revision, explain that the existing Engineering history remains visible but Engineering must review and confirm its foundation against the new Product revision.

## Internal Engine interface

Before constructing an Engineering `apply` input, read [Engineering Foundation apply input](../engine/Engineering-Foundation-Apply.md). Never expose its JSON or Engine mechanics to the Human.

Use the compiled CLI with the command first, followed by `--source-root`, `--workspace`, and operation-specific flags in that canonical order:

- `engineering-init` establishes the separate Engineering draft after Product confirmation.
- `engineering-apply --input <json-file>` records grants, attributed evidence, declared coverage, and a pre-confirmation next action when needed.
- `engineering-interrupt`, `engineering-resume`, and `engineering-status` preserve continuity.
- `engineering-review` records review of the current draft; `engineering-confirm --responsibilities engineering` confirms only that draft.
- `engineering-render` refreshes views; `engineering-stale` checks all Engineering-owned views.

Run Engine operations from the Loopy package, never by asking the Human to manage state. A rejected operation must be explained in human language and must not be worked around by weakening validation.
