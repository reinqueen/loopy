# Loopy Release Requirements

> Accepted as the Loopy v1 product baseline on 2026-09-05. Publication requires separate authorization.

**Audience:** Loopy builders, evaluators, and the person authorizing a Loopy Release.

## Purpose and scope

This document defines what an exact Loopy candidate must pass before it can be published and called Released.

- [V1-RELEASE-DEFINITION.md](./V1-RELEASE-DEFINITION.md) defines what the first Release contains and proves.
- [PRODUCT-LIFECYCLE.md](./PRODUCT-LIFECYCLE.md) defines the experience Loopy must provide to Humans.
- Stage contracts and automated tests define and verify detailed behavior.
- The capability registry records host-neutral capability maturity.

This document does not redefine those sources. It defines the final release checks that use them.

## 1. Identify the exact candidate

Before release evaluation begins, record:

- the proposed version;
- the exact Git commit;
- the source workspace;
- the release workspace;
- the candidate package names; and
- the intended publication destinations and visibility.

The release workspace must be clean and separate from disposable evaluation workspaces.

## 2. Verify product behavior

The exact candidate must pass:

- automated Engine, CLI, rendering, state-transition, and workspace-safety tests;
- the fresh-workspace scenarios required by the v1 Release Definition;
- independent evaluation against the Product Lifecycle and applicable stage contracts;
- readability and comprehension review of generated human-facing artifacts;
- approval-frequency and interview-quality review; and
- human review of preserved Demo and evaluation evidence.

Failures, limitations, skipped checks, and unobserved behavior remain visible. They cannot be reported as successful proof.

### Independent evaluation boundary

The agent or session that generated the code cannot evaluate its own work for a Release claim. Independent evaluation must:

- run in a fresh task or session with no inherited implementation conversation;
- use a separate clean workspace containing the exact candidate or produced package;
- receive the approved product requirements, applicable stage contracts, evaluation scenarios, and evaluation lenses;
- avoid builder conclusions, prior self-assessments, or hidden mutable state; and
- preserve its own prompts, observations, evidence, limitations, and result.

If the candidate changes after evaluation, the affected evaluation is stale and must be rerun against the new exact candidate in a fresh evaluation context.

## 3. Build and inspect Host AI packages

One source commit produces:

- a Codex package; and
- a Claude Code package.

Both packages must preserve the same Loopy lifecycle meaning, Engine behavior, skill instructions, and human-facing documents. Package integrity, clean installation, update behavior, uninstall or rollback, and a representative packaged-product run must be checked separately for each Host AI. Each walkthrough must verify artifact accessibility in that Host AI's actual interaction environment: clickable links where supported, or clear, exact paths the Human can open or copy where links are unavailable.

Building a package does not claim support. Host AI results and any support claims are recorded in Release evidence and documentation, not in the capability registry. A support claim may be published only when the preserved evidence proves it.

## 4. Preserve candidate evidence

The Release Review records:

- exact source commit and package hashes;
- automated and real Host AI test results;
- capability maturity from the host-neutral registry;
- Host AI compatibility results and any support claims;
- known limitations and unresolved risks;
- installation, update, uninstall, and rollback instructions;
- included documentation and Milestone outcomes; and
- proposed publication destinations and visibility.

Evidence must identify the exact candidate, environment, tool, command or interaction, and observed result. Screenshots are included when they materially help a human verify visible behavior.

## 5. Preserve the self-hosting boundary

Loopy v1 is built outside Loopy's governed lifecycle through direct human direction, Host AI implementation, Git, and independent tests. Building or evaluating it must not create or modify the Loopy source repository's `.loopy` state.

After a frozen v1 candidate exists, its bounded future-Loopy evaluation runs only in a separate candidate workspace. The candidate cannot change the rules or canonical project state governing its own delivery. This does not claim unrestricted self-hosting.

## 6. Authorize, publish, and verify

Before asking for approval, present a short Release summary showing:

- exactly what will be released;
- what is not included;
- known limitations and unproven behavior;
- the exact destination and visibility; and
- the rollback or uninstall path.

Release approval does not imply publication unless the same decision explicitly names and authorizes the publication destination and visibility.

After authorization:

1. publish only the approved candidate to the approved destination;
2. verify that the published version is available and matches the approved hashes;
3. record the result in `Release-Notes.md`; and
4. report any failure without marking the candidate Released.

The candidate becomes **Released** only after publication and availability are verified.
