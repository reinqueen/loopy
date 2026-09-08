# Milestone Demonstrate and Accept Engine Operations

Use the repository Engine through its `demo-*` operations. Keep commands and internal identities out of the ordinary human conversation.

## Runtime

Let `<loopy-root>` be the directory containing the loaded `skills/loopy/` directory and built `dist/` runtime. Invoke an operation directly; `--help` is not an operation:

```text
node <loopy-root>/runtime/dist/engine/src/cli.js demo-status --source-root <loopy-root> --workspace <project-root>
node <loopy-root>/runtime/dist/engine/src/cli.js demo-init --source-root <loopy-root> --workspace <project-root> --input <activation.json>
```

The Engine prints canonical JSON on success and a validation message with a nonzero exit on rejection. Do not inspect TypeScript, tests, or contract YAML to construct inputs. Read [the complete Demo payload reference](Milestone-Demonstrate-and-Accept-Payloads.md), substitute current values from the canonical Build/Demo status, write the JSON in a disposable or project-contained input file, and invoke the corresponding command.

- `demo-init --input <activation.json>` starts the first exact ready-for-Demonstration candidate after current Build views and Definition/Plan/Proof anchors are verified.
- `demo-activate --input <activation.json>` starts another explicitly named ready candidate without silently including other Milestones.
- `demo-authorize --input <authorization.json>` records an explicitly changed candidate/environment/tool/action/scope/effect authority. Exact unchanged authority is reused without another authorization operation.
- `demo-observe --input <observation.json>` first verifies the operated target against the authorized target/environment, then records one scenario result, durable linked evidence/media, acceptance-boundary dispositions, limitations, partial effects, unproven behavior, and Host-declared readiness. It must declare no product mutation. A target mismatch rejects without mutation and is a Demo target/environment failure, not candidate failure. Ordinary active observations may remain canonical without republishing views.
- `demo-decide --input <decision.json>` records explicit natural-language genuine human acceptance, correction, or deferral against the exact candidate and current Demo revision. Acceptance requires the exact committed outcome/boundary and demonstrated evidence for every criterion. Inputs identified as simulated-participant or proxy-ai must set `personalJudgment` false; the Engine records them as advisory input without a final disposition or completion.
- `demo-block --input <block.json>` records unavailable or unsafe tooling, privacy/security constraints, missing authority, or another blocker with one next action.
- `demo-interrupt`, `demo-resume`, `demo-render`, `demo-status`, and `demo-stale` preserve interruption, non-replayable-scenario restart, and canonical-state/published-view safety.

Validation precedes writes. Rejected operations do not mutate state, history, evidence, `Demo.md`, `LOOPY.md`, or `Roadmap.md`. Acceptance atomically publishes the exact Demo, makes the Milestone Complete but unreleased, and synchronizes project views. No operation grants Release, merge, push, tag, deployment, publication, or distribution authority.
