# Product Start `apply` Input

Internal Host-AI reference for operating the Product Start Engine. Never present this schema or its mechanics to the Human.

`apply --input <json-file>` accepts one `ProductStartUpdate`. Omit fields that are unchanged.

## Complete shape

| Field | Shape |
|---|---|
| `participantResponsibilities` | Non-empty strings such as `product` |
| `contextGrants` | Full grant ledger: `{scope, kind, basis}[]` |
| `product` | Any current Product fields listed below |
| `roadmap` | Any of `summary`, `lifecycleState`, `lifecycleExplanation`, `productNotes`, `candidates`, `milestones` |
| `decisions` | Any ordinary Product decision entries `{status, note?}` |
| `conditionalDecisions` | Any conditional entries `{triggered, status, note?}` |
| `nextActions` | Exactly one `{participant, action, reason}` |

Product fields are `projectName`, `summary`, `purpose`, `primaryPeople`, `need`, `currentAlternative`, `secondaryPeople`, `outcome`, `evidence`, `remainsTrue`, `shouldChange`, `uncertain`, `inScope`, `nonGoals`, `constraints`, `successSignals`, `assumptions`, `unknowns`, and `deferrals`.

- Evidence item: `{source, finding, contextScope, conflictsWithIntent?}`.
- Grant `kind`: `whole-repository`, `workspace-path`, `external-resource`, or `supplied-content`; grant `basis`: `supplied`, `selected`, or `explicitly-authorized`.
- Deferral: `{topic, question, why, revisitWhen, blocking}`.
- Candidate: `{title, outcome, priority, rationale, dependencies, nextAction, commitment}`. Priority is `Highest`, `High`, `Medium`, or `Later`; commitment is `uncommitted`.
- Current Milestone: `{title, state, outcome, nextAction}`. State is `Planned`, `Active`, `Paused`, `Blocked`, `Complete`, `Released`, `Deferred`, or `Cancelled or superseded`.
- Ordinary topics: `purpose`, `people_and_need`, `outcome`, `evidence_and_intent`, `boundaries`, `success`, `roadmap_state`, `uncertainty`.
- Conditional topics: `context_conflict`, `multiple_audiences`, `external_promise`, `high_consequence_use`, `replacement_or_migration`.
- Status: `unresolved`, `established`, `established_from_evidence`, `explicitly_none`, `not_applicable`, `deferred_non_blocking`, or `deferred_blocking`, subject to the contract's per-topic rules.

## Verified examples

Apply these examples in order to an initialized Product workspace.

### Add scoped grants and attributed evidence

<!-- apply-example -->
```json
{
  "participantResponsibilities": ["product"],
  "contextGrants": [
    {"scope": "README.md", "kind": "workspace-path", "basis": "explicitly-authorized"}
  ],
  "product": {
    "evidence": [
      {"source": "README.md", "finding": "Setup currently requires support.", "contextScope": "README.md"}
    ]
  }
}
```

### Record Product and conditional decision states

<!-- apply-example -->
```json
{
  "product": {
    "purpose": "Reduce avoidable setup friction.",
    "primaryPeople": "Customer administrators",
    "need": "Complete setup without waiting for support.",
    "currentAlternative": "Ask support to complete setup.",
    "secondaryPeople": "Support staff remain available for exceptions.",
    "outcome": "Administrators complete setup confidently.",
    "remainsTrue": ["Support remains available for exceptions."],
    "shouldChange": ["Administrators lead routine setup."],
    "inScope": ["Administrator-led initial setup"],
    "nonGoals": ["Invited teammate setup"],
    "constraints": []
  },
  "decisions": {
    "purpose": {"status": "established"},
    "people_and_need": {"status": "established"},
    "outcome": {"status": "established"},
    "evidence_and_intent": {"status": "established"},
    "boundaries": {"status": "established"}
  },
  "conditionalDecisions": {
    "multiple_audiences": {"triggered": true, "status": "established", "note": "Administrators are primary; support handles exceptions."}
  }
}
```

### Add a candidate, deferral, and one next action

<!-- apply-example -->
```json
{
  "product": {
    "uncertain": ["The first useful measurement window"],
    "assumptions": [],
    "unknowns": ["Available setup baseline"],
    "deferrals": [
      {"topic": "uncertainty", "question": "What measurement window is useful?", "why": "The baseline is not known.", "revisitWhen": "Measurement feasibility is assessed.", "blocking": false}
    ]
  },
  "roadmap": {
    "summary": "Improve administrator setup before expanding the audience.",
    "lifecycleState": "Product foundation in progress",
    "lifecycleExplanation": "Success still needs a Product decision; no Milestone is committed.",
    "productNotes": "The candidate remains uncommitted.",
    "candidates": [
      {"title": "Administrator-led setup", "outcome": "Administrators complete setup confidently.", "priority": "Highest", "rationale": "This addresses the primary need.", "dependencies": ["A useful success signal"], "nextAction": "Choose a success signal", "commitment": "uncommitted"}
    ]
  },
  "decisions": {
    "roadmap_state": {"status": "established"},
    "uncertainty": {"status": "deferred_non_blocking", "note": "Measurement timing returns after feasibility is known."}
  },
  "nextActions": [
    {"participant": "Product", "action": "Choose a success signal", "reason": "Success remains required before Product review."}
  ]
}
```

### Make the foundation ready for review

<!-- apply-example -->
```json
{
  "product": {
    "summary": "Administrators will complete routine setup with support available for exceptions.",
    "successSignals": ["More administrators finish setup without support completing steps."]
  },
  "roadmap": {
    "lifecycleState": "Product foundation ready for review",
    "lifecycleExplanation": "Required Product decisions are ready for review; no Milestone is committed."
  },
  "decisions": {
    "success": {"status": "established"}
  },
  "nextActions": [
    {"participant": "Product", "action": "Review the Product foundation", "reason": "Every required Product decision has a recorded disposition."}
  ]
}
```

## Invariants that commonly reject input

- Objects reject unknown keys. Partial objects merge, but supplied arrays replace their prior value; include the full intended array.
- `contextGrants` is the complete ledger. Scopes must be unique after canonical normalization. Repository-wide access requires `{scope: ".", kind: "whole-repository", basis: "explicitly-authorized"}`.
- Every evidence `contextScope` must match a normalized grant. `context_conflict.triggered` must match whether any evidence has `conflictsWithIntent: true`.
- `established` or `established_from_evidence` requires corresponding readable content. `explicitly_none` requires that content to be empty. Evidence-derived status requires recorded evidence.
- A deferral appears once per topic and must match its decision status and `blocking` value. Essential Product decisions can defer only as blocking; ordinary non-blocking deferral is limited to `uncertainty`.
- Untriggered conditional decisions are `not_applicable`; triggered decisions cannot be `not_applicable`.
- Candidates require every listed field and remain `uncommitted`. Candidate arrays replace the current set.
- State always has exactly one next action. Before Product confirmation its participant is Product.
- Ready state requires Product participation plus resolved essential, supporting, and triggered conditional coverage. Run `review` after the concise human review, then `confirm`; do not place confirmation receipts in `apply`.
