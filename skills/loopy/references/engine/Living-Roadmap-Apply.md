# Living Roadmap operation input

This is internal Host-AI guidance. Never show candidate identities, JSON, or Engine commands as the Human experience.

Read `roadmap-status` to obtain stable internal candidate identities. Write one operation object with an `actor` containing a human-readable name and the responsibility explicitly represented: `product`, `engineering`, or `loopy`. When Loopy carries out an operation that changes Product meaning or priority, include `intentBasis` recording the explicit Product instruction it is following.

Supported operation types are `add`, `rename`, `combine`, `split`, `prioritize`, `defer`, `cancel`, `supersede`, `set-dependencies`, `set-blockers`, `record-participation`, `select`, and `reconcile-product`. Use `reconcile-product` after the Product draft or confirmed Product revision advances; it re-anchors unchanged portfolio state and does not approve or apply a material change. Use the exact fields described by the current Engine types and contract; do not invent workspace, worktree, commitment, or approval fields.

Dependencies contain exactly one target—an internal `candidateId` or an `external` description—plus `kind`, `boundary`, `note`, and `recommendedBy`. Valid kinds are `required-before`, `helpful-non-blocking`, and `independent-potentially-parallel`. Valid boundaries are `definition` and `implementation`. Attribute Engineering recommendations to `Engineering` and Product relationships to `Product`.

Product Start dependency notes arrive as unresolved text. Before selection, classify each material note with `set-dependencies`. If the Humans say outcomes are independent, record `independent-potentially-parallel` or an empty dependency set as appropriate; never leave an explicit independence statement as an unresolved blocker.

Product or Loopy acting on explicit Product intent may change outcome meaning or priority. Engineering may record its dependencies, blockers, sequencing recommendations, or participation but may not rename, group, defer, cancel, supersede, or reprioritize Product outcomes.

Submit the operation only once. On rejection, do not edit canonical state or human views manually; explain the error and correct the input or ask the responsible participant.
