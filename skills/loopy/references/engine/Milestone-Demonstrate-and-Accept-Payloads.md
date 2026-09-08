# Demonstrate and Accept CLI Payloads

Use these schemas through the commands in [Milestone Demonstrate and Accept Engine Operations](Milestone-Demonstrate-and-Accept-Apply.md). Replace angle-bracket values with current canonical values. Fingerprints are lowercase 64-character SHA-256 values. Arrays may be empty only where shown.

## Activation: `demo-init` or `demo-activate`

```json
{
  "buildId": "<ready Build identity>",
  "candidateId": "<exact integrated candidate identity>",
  "modes": ["human-guided", "ai-operated-recorded"],
  "method": {
    "surface": "<observable surface>",
    "summary": "<concise method>",
    "basis": "<why this method fits the outcome and available environment>"
  },
  "authority": {
    "participant": "<authorized participant>",
    "perspectiveContext": "<context they bring>",
    "candidateId": "<same exact candidate identity>",
    "sourceFingerprint": "<candidate source fingerprint>",
    "workspaceFingerprint": "<candidate workspace fingerprint>",
    "environment": { "name": "<Demo environment>", "fingerprint": "<environment fingerprint>" },
    "target": {
      "name": "<endpoint, process, file, service, or other operated target>",
      "fingerprint": "<expected target identity fingerprint>",
      "verificationBasis": "<how the operated target will be tied to the exact candidate before observation>"
    },
    "tools": ["<authorized tool>"],
    "actions": ["<authorized Demo action>"],
    "scope": ["<bounded observable outcome>"],
    "externalSystems": [],
    "externalEffects": [],
    "consequentialPermissions": [],
    "accessibilityNeeds": [],
    "productMutationAllowed": false
  },
  "scenarios": [{
    "key": "observable-path",
    "title": "<readable scenario>",
    "whatToObserve": "<observable behavior>",
    "mode": "human-guided",
    "replayable": true,
    "order": 1
  }]
}
```

Use one or both mode values. Every scenario mode must be among them. A changed authority payload for `demo-authorize` has `demoId`, `explicitAuthorization: true`, the complete replacement `authority` object above, and a nonblank `reason`.

## Observation: `demo-observe`

Before submission, verify the actual operated target and expected environment. Preserve that verification in independently inspectable evidence. For `workspace-file`, `reference` is relative to the project root and its fingerprint must match the file bytes. The Engine rewrites it relative to nested `Demo.md`. `durable-uri` requires HTTPS. `ephemeral` is recorded as inaccessible and cannot support `demonstrated` coverage.

```json
{
  "demoId": "<Demo identity>",
  "sourceFingerprint": "<exact candidate source fingerprint>",
  "workspaceFingerprint": "<exact candidate workspace fingerprint>",
  "environmentFingerprint": "<authorized environment fingerprint>",
  "targetVerification": {
    "expectedTargetFingerprint": "<authorized target fingerprint>",
    "observedTargetFingerprint": "<verified operated-target fingerprint>",
    "method": "<how target identity was verified>",
    "evidenceIds": ["target-verification"]
  },
  "productMutation": "none",
  "scenario": {
    "key": "observable-path",
    "status": "demonstrated",
    "result": "<observed result>",
    "limitations": [],
    "partialEffects": []
  },
  "evidence": [{
    "key": "target-verification",
    "kind": "log",
    "summary": "Verified the operated target",
    "reference": "docs/loopy/evidence/target-verification.txt",
    "referenceKind": "workspace-file",
    "fingerprint": "<SHA-256 of referenced file bytes>",
    "result": "passed",
    "operator": "host-ai",
    "tool": "<authorized tool or null>",
    "action": "<exact authorized action>",
    "externalSystem": null
  }],
  "coverage": [{
    "criterion": "<exact committed acceptance criterion>",
    "status": "demonstrated",
    "scenarioKeys": ["observable-path"],
    "evidenceIds": ["target-verification"],
    "note": "<what the evidence establishes>"
  }],
  "whatDemonstrated": "<plain summary>",
  "observedResult": "<plain result>",
  "limitations": [],
  "unproven": [],
  "readiness": { "status": "ready-for-judgment", "basis": "<Host semantic assessment>" }
}
```

Allowed scenario statuses: `planned`, `in-progress`, `demonstrated`, `failed`, `inaccessible`, `unproven`. Coverage statuses additionally include `deferred`. Evidence results are `passed`, `failed`, `partial`, or `unproven`. Readiness is `active`, `ready-for-judgment`, or `blocked`.

If expected and observed target fingerprints differ, do not describe candidate behavior or submit a candidate failure. Correct/retry the Demo target, use `demo-authorize` if consequential target or environment authority changed, or use `demo-block`.

## Judgment or advisory input: `demo-decide`

For an actual human's own decision:

```json
{
  "demoId": "<Demo identity>",
  "candidateId": "<exact candidate identity>",
  "sourceFingerprint": "<source fingerprint>",
  "workspaceFingerprint": "<workspace fingerprint>",
  "environmentFingerprint": "<environment fingerprint>",
  "reviewedRevision": 0,
  "actorKind": "human",
  "participant": "<actual human>",
  "perspectiveContext": "<perspective/context brought>",
  "personalJudgment": true,
  "naturalLanguageIntent": "<their clear words>",
  "decision": "accept",
  "acceptedOutcome": "<exact committed outcome>",
  "acceptedBoundary": ["<each exact acceptance criterion in order>"],
  "reason": "<human judgment basis>"
}
```

For a correction, retain the common identity/provenance fields and use:

```json
{ "actorKind": "human", "personalJudgment": true, "decision": "request-correction", "correctionRoute": "build", "reason": "<judgment basis>" }
```

For deferral use `"decision": "defer"` and `"revisitWhen": "<observable condition>"`. For simulated or proxy input, retain the common fields and use:

```json
{ "actorKind": "simulated-participant", "personalJudgment": false, "decision": "accept" }
```

`actorKind` may instead be `proxy-ai`. Preserve the actual participant label and words. Such input is advisory only regardless of its recommendation.

## Block, interrupt, resume, render, and status

`demo-block` payload:

```json
{ "demoId": "<Demo identity>", "reason": "<blocker>", "nextParticipant": "<who acts>", "nextAction": "<single action>" }
```

`demo-resume` payload:

```json
{
  "sourceFingerprint": "<source fingerprint>",
  "workspaceFingerprint": "<workspace fingerprint>",
  "environmentFingerprint": "<environment fingerprint>",
  "restartScenarioKeys": []
}
```

Use `demo-interrupt --demo-id <id> --resume-action <text>`. `demo-render`, `demo-status`, and `demo-stale` need only `--source-root` and `--workspace`. Repair stale views with `demo-render` before resume. Restart every interrupted non-replayable in-progress scenario explicitly.
