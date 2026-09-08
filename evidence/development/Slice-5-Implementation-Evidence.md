# Slice 5 Implementation Evidence

## Scope

This record covers the bounded Change Management implementation authorized by the human-approved [Slice 5 definition](../../CHANGE-MANAGEMENT-EXPERIENCE.md). It does not accept the implementation, accept Slice 4 implementation, or authorize Planning, Build, Proof, Demonstration, Release, publication, deployment, merge, or push.

## Implemented mechanics

- One internal route in the single Loopy skill distinguishes declared routine corrections from material proposals.
- Material proposals remain separate from accepted lifecycle meaning, use readable collision-safe `Change.md` paths, declare exact targets and bases, and record impact, unaffected work, participants, unknowns, authority, disposition, and one next action.
- Same-revision responsibility receipts and clear natural-language authority drive one all-or-nothing acceptance and reconciliation transaction. There is no partial-acceptance input.
- Accepted target changes preserve existing Product, Engineering, Roadmap, and Milestone Definition revision/history structures, synchronize mechanical anchors, and leave unnamed target meaning unchanged.
- Overlapping accepted targets invalidate the older competing proposal; disjoint targets remain independently applicable.
- Canonical interview persistence is separate from public rendering. Pause/resume and stale-view repair follow the corrected Slice 4 boundary.
- Rejection, withdrawal, deferral, invalid input, stale/conflicting acceptance, and write failure do not change accepted target meaning.

## Evidence boundary

Automated checks prove declared-state validation, transitions, hashes, rendering, containment, atomic file rollback, and regression behavior. Builder-authored scenarios describe intended behavior but do not prove the Host AI will classify meaning, ask good questions, trace complete impact, route responsibility, or interpret ordinary-language authority correctly. Those claims require fresh independent multi-turn evaluation against the exact implementation commit.

## Builder verification and corrections

The original builder run passed 111 automated tests across all six suites, the TypeScript production build, skill validation, changed-document link checks, changed-YAML parsing, and `git diff --check`. No `.loopy` state existed in the Loopy source.

Focused development checks exposed two integration defects before the final run. Product-only reconciliation initially advanced a Product anchor without completing the downstream anchor history; the corrected transaction now records mechanical Engineering and Roadmap synchronization while preserving their meaning. Earlier lifecycle renderers initially omitted the new Change Management overlay; the shared project-view compositor now preserves synchronized `LOOPY.md`, Roadmap, Definition, and Change views from every existing render route. Regression cases cover both corrections.

## Independent evaluation correction

Independent evaluation of candidate `8cd0221` reproduced five bounded defects: separate Product and Engineering receipts could not accumulate; a proposal could overwrite a same-target edit made outside its own history; routine corrections to committed Definitions incorrectly demanded material receipts; multi-field changes duplicated a Change link in one artifact; and the Change template contained two trailing-space warnings. The clean Host conversations otherwise supplied qualified evidence of conservative routine-versus-material judgment and bounded material-change handling, but the receipt defect made the material run fail and the Definition routine defect prevented completion.

The correction preserves each real participant's same-revision receipt and records an `agree` history transition until the final required perspective accepts. A single participant may cover several perspectives only when that exact person is recorded for each and explicitly represents each; synthesized combined identities are rejected. Proposal creation captures an internal hash of every exact target value, and review and acceptance revalidate those hashes before any write, so an intervening Product, Engineering, Roadmap, or Definition edit rejects the complete transaction without consuming a receipt or changing state, history, or views.

The routine path now requires the Host to declare both resolved meaning preservation and its basis. The Engine validates only that formal declaration and does not claim semantic equivalence. Committed Definition receipts remain attributable and advance to the corrected Definition revision without demanding material-change approval. Production interview guidance keeps subtle expansions material while their meaning is uncertain. Rendering now emits one Change entry per affected artifact, and the template no longer relies on trailing spaces.

Focused regressions cover receipt accumulation in both orders, legitimate one-person multi-perspective representation, rejection of a synthesized participant, exact stale detection for all four supported target kinds, stale multi-target rollback, routine committed-Definition correction, unresolved subtle expansion, deduplicated links, and exactly one project next action. These automated checks prove Engine mechanics and structural guidance only. A fresh independent evaluation of the correction commit is still required before any Slice 5 implementation acceptance claim.

The correction verification passed 118 automated tests across all six suites, the TypeScript production build, official skill validation, eight-file YAML parsing, changed-document link checks, and working-tree and candidate-diff whitespace checks. The committed source contains no `.loopy` state.
