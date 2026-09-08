# Harbor Product-foundation setup — v1

Use this setup only in a fresh disposable copy of the Harbor fixture. Record the exact Loopy candidate, then run its compiled Engine in this order:

```text
node <candidate>/runtime/dist/engine/src/cli.js init --source-root <candidate> --workspace <copy> --project-name Harbor --responsibilities product
node <candidate>/runtime/dist/engine/src/cli.js apply --source-root <candidate> --workspace <copy> --input <candidate>/evaluation/scenarios/product-start/large-mixed-project/setup/v1/product-update.json
node <candidate>/runtime/dist/engine/src/cli.js review --source-root <candidate> --workspace <copy>
node <candidate>/runtime/dist/engine/src/cli.js confirm --source-root <candidate> --workspace <copy> --responsibilities product
```

The update authorizes only `README.md` and `product/current-priorities.md`. Confirm that status is `product-foundation-confirmed` before beginning an Engineering scenario. Never copy the generated `.loopy` state back into the fixture.
