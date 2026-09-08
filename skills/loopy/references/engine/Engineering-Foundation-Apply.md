# Engineering Foundation `apply` Input

Internal Host-AI reference. Do not show this schema or Engine mechanics to the Human.

Canonical invocation:

```text
node runtime/dist/engine/src/cli.js engineering-apply --source-root <package-root> --workspace <project> --input <json-file>
```

The JSON is one closed `EngineeringFoundationUpdate`; omit unchanged fields. Supplied arrays replace their previous value.

## Complete shape

| Field | Shape |
|---|---|
| `participantResponsibilities` | Non-empty responsibility strings; include `engineering` for readiness |
| `contextGrants` | Full Engineering ledger of `{scope, kind, basis}[]` |
| `engineering` | Any current content fields listed below |
| `decisions` | Any coverage entries `{status, note?}` |
| `nextActions` | Before confirmation only: exactly one `{participant, action, reason}` |

Engineering content fields are `summary`, `evidence`, `projectDefaults`, `components`, `commands`, `relationships`, `triggers`, `assumptions`, `unknowns`, and `deferrals`.

- Evidence: `{source, finding, contextScope}`.
- Defaults: arrays named `languages`, `runtimes`, `frameworks`, `dependencyTools`, `practices`, `requiredChecks`, `environments`, `deliveryConstraints`, `compatibility`, `security`, and `operations`.
- Component: `{name, purpose, path, languages, runtimes, frameworks, dependencyTools, exceptions}`.
- Command: `{purpose, command, scope, confidence, source?, contextScope?, executionEvidence?}`. Purposes are `build`, `run`, `unit-test`, `integration-test`, `e2e-test`, `lint`, `typecheck`, `package`, `deploy`, or `other`. Confidence is `observed`, `proposed-unverified`, or `confirmed`. Execution evidence is `{exactCommand, observedResult, environment}`.
- Relationship: `{from, to, description, deliveryConsequence}`.
- Trigger: `{kind, triggered, reason, nextResponsibility}` for exactly `architecture`, `demo-strategy`, and `release-strategy`.
- Deferral: `{topic, question, consequence, revisitWhen, blocking}`.
- Coverage topics: `project_defaults`, `components`, `technology`, `commands`, `relationships`, `practices_and_checks`, `operating_context`, and `open_matters`.
- Status: `unresolved`, `established`, `established_from_evidence`, `explicitly_none`, `not_applicable`, `deferred_non_blocking`, or `deferred_blocking`.

## Verified Harbor examples

Apply these examples in order after `engineering-init` in a fresh Harbor workspace.

<!-- engineering-apply-example -->
```json
{
  "participantResponsibilities": ["engineering"],
  "contextGrants": [
    {"scope": "components/customer-portal", "kind": "workspace-path", "basis": "explicitly-authorized"},
    {"scope": "components/rest-api", "kind": "workspace-path", "basis": "explicitly-authorized"},
    {"scope": "docs/dependencies.md", "kind": "workspace-path", "basis": "explicitly-authorized"}
  ],
  "engineering": {
    "summary": "Harbor has separately relevant portal and API components; delivery details remain incomplete.",
    "evidence": [
      {"source": "Portal README", "finding": "The portal shows shipment lists and raw exception codes.", "contextScope": "components/customer-portal"},
      {"source": "API README", "finding": "Partner compatibility and test commands are undocumented.", "contextScope": "components/rest-api"},
      {"source": "Dependency note", "finding": "Customer recovery depends on consistent API status meaning.", "contextScope": "docs/dependencies.md"}
    ],
    "projectDefaults": {
      "languages": [], "runtimes": [], "frameworks": [], "dependencyTools": [],
      "practices": [], "requiredChecks": [], "environments": [], "deliveryConstraints": [],
      "compatibility": [], "security": [], "operations": []
    },
    "components": [
      {"name": "Customer portal", "purpose": "Show shipment status and recovery guidance.", "path": "components/customer-portal", "languages": [], "runtimes": [], "frameworks": [], "dependencyTools": [], "exceptions": []},
      {"name": "REST API", "purpose": "Provide shipment status to the portal and partners.", "path": "components/rest-api", "languages": [], "runtimes": [], "frameworks": [], "dependencyTools": [], "exceptions": ["Partner compatibility remains undefined."]}
    ],
    "commands": [],
    "relationships": [
      {"from": "Customer portal", "to": "REST API", "description": "The portal consumes status meaning from the API.", "deliveryConsequence": "Stabilize status meaning before recovery UI work depends on it."}
    ],
    "triggers": [
      {"kind": "architecture", "triggered": true, "reason": "Shared status interfaces need durable explanation.", "nextResponsibility": "Architecture"},
      {"kind": "demo-strategy", "triggered": false, "reason": "", "nextResponsibility": ""},
      {"kind": "release-strategy", "triggered": true, "reason": "API compatibility rules will affect independent delivery.", "nextResponsibility": "Release"}
    ],
    "assumptions": ["Portal and API can be evaluated independently after status meaning stabilizes."],
    "unknowns": ["Languages, runtimes, package tools, commands, environments, and required checks."],
    "deferrals": [
      {"topic": "technology", "question": "Which technology defaults apply?", "consequence": "Planning cannot yet choose exact tool commands.", "revisitWhen": "Relevant manifests are authorized.", "blocking": false},
      {"topic": "commands", "question": "Which commands are reliable?", "consequence": "No command can be treated as working.", "revisitWhen": "Manifests or automation are authorized and commands are run.", "blocking": false},
      {"topic": "operating_context", "question": "Which environments and constraints apply?", "consequence": "Deployment assumptions remain unverified.", "revisitWhen": "Environment documentation is authorized.", "blocking": false}
    ]
  },
  "decisions": {
    "project_defaults": {"status": "explicitly_none"},
    "components": {"status": "established_from_evidence"},
    "technology": {"status": "deferred_non_blocking", "note": "Awaiting authorized manifests."},
    "commands": {"status": "deferred_non_blocking", "note": "No commands observed or run."},
    "relationships": {"status": "established_from_evidence"},
    "practices_and_checks": {"status": "explicitly_none"},
    "operating_context": {"status": "deferred_non_blocking", "note": "Awaiting environment context."},
    "open_matters": {"status": "established"}
  },
  "nextActions": [
    {"participant": "Engineering", "action": "Review the Engineering foundation", "reason": "Every applicable Engineering area has a recorded disposition."}
  ]
}
```

<!-- engineering-apply-example -->
```json
{
  "engineering": {
    "commands": [
      {"purpose": "build", "command": "pnpm build", "scope": "Project", "confidence": "proposed-unverified"}
    ],
    "deferrals": [
      {"topic": "technology", "question": "Which technology defaults apply?", "consequence": "Planning cannot yet choose exact tool commands.", "revisitWhen": "Relevant manifests are authorized.", "blocking": false},
      {"topic": "operating_context", "question": "Which environments and constraints apply?", "consequence": "Deployment assumptions remain unverified.", "revisitWhen": "Environment documentation is authorized.", "blocking": false}
    ]
  },
  "decisions": {
    "commands": {"status": "established", "note": "Proposed for later verification."}
  },
  "nextActions": [
    {"participant": "Engineering", "action": "Review the Engineering foundation", "reason": "The proposed command is visibly unverified and all coverage is resolved."}
  ]
}
```

## Common invariants

- Grants are Engineering-specific, canonical, and unique. Repository-wide reading requires `{scope: ".", kind: "whole-repository", basis: "explicitly-authorized"}`.
- Evidence and observed-command sources must match the grant ledger. Loopy-owned state and generated artifacts need no Engineering grant.
- A confirmed command requires matching exact execution evidence; observed or proposed commands never imply success.
- Established coverage needs readable content. Empty or irrelevant coverage uses `explicitly_none` or `not_applicable`.
- Each deferral is unique by topic and matches its blocking or nonblocking disposition. Blocking deferrals prevent readiness.
- All three trigger records are required. An untriggered guide has no reason or next responsibility.
- Before confirmation, the one next action belongs to Engineering. Run `engineering-review` on the current draft, then `engineering-confirm --responsibilities engineering`.
- After confirmation, omit `nextActions`. The Engine rejects caller-owned routing and deterministically chooses Architecture, Demo or quality, then Release when triggered; with no trigger it uses the bounded Roadmap handoff.
- A newly confirmed Product revision preserves Engineering history but reopens Engineering review against that exact Product revision.
- Arrays replace prior arrays; unknown keys and malformed values are rejected without changing state or views.
