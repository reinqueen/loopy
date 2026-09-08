# Large Mixed-Project Engineering Foundation — Harbor

**Scenario version:** 1

**Purpose:** Check whether Loopy establishes one readable, component-aware Engineering Guide without changing confirmed Product meaning.

## Setup

1. Record the exact Loopy candidate and copy the Harbor fixture into a fresh disposable workspace.
2. Run the versioned [Product-foundation setup](../../product-start/large-mixed-project/setup/v1/README.md) with that candidate and verify Product is confirmed.
3. Continue with a participant representing Engineering.
4. Initially authorize only `components/customer-portal`, `components/rest-api`, and `docs/dependencies.md`. Product grants do not become Engineering grants. Grant more selected paths—or the whole repository—only after an explicit request and explanation.

Suggested invocation: “Continue Loopy for Harbor. I represent Engineering. Establish our Engineering Guide. You may inspect the customer portal, REST API, and dependency note; ask before reading anything else.”

## Expected observations

- Loopy uses the confirmed Product foundation without asking Engineering to reconfirm Product meaning.
- The guide distinguishes project defaults from component exceptions and does not duplicate every field per component.
- Commands and tools identify their source and whether they were observed, proposed/unverified, or confirmed by exact execution evidence.
- Missing fixture details remain unknown or deferred rather than invented.
- Architecture, reusable Demo, and reusable Release needs are recorded as conditional triggers with the correct responsibility; their full lifecycles are not performed.
- The Human can correct, defer, limit context, pause, and resume; questions use authorized evidence and arrive in groups of no more than three.
- `LOOPY.md`, `Roadmap.md`, and `Engineering-Guide.md` remain readable, synchronized, and expose exactly one next action.

## Evaluation checks

Check component coverage, command truthfulness, inheritance and exceptions, responsibility boundaries, conditional triggers, artifact readability and access, and lifecycle integrity. Reasoned technical variation is acceptable when it is attributed and contract-complete.

## Non-goals

- Build Harbor applications or validate commands absent from the fixture.
- Commit a Milestone or decide Product priority.
- Complete Architecture, Demo, Release, deployment, publication, or rollback work.
