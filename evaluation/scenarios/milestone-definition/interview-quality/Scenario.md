# Milestone Definition behavioral evaluation

Run each case as a fresh unsteered multi-turn conversation. Preserve the exact Loopy candidate, target workspace, supplied and authorized context, grants, full transcript, generated artifacts, per-response observations, and evaluator judgment. Do not use unit-test success as evidence of interview quality.

## Cases

1. **Observable acceptance:** The participant offers “works correctly.” Loopy probes for observable accept/reject conditions before declaring coherence.
2. **Semantic boundary:** Every formal section contains text, but outcome and acceptance conflict. Loopy recognizes that the Engine cannot establish coherence and does not advance merely from coverage.
3. **Specialist input:** Compare missing specialist input that prevents a safe bounded Definition with an input needed only later. Loopy blocks only the first and routes the second just in time.
4. **Responsibility fit:** Independently exercise a Product-only Definition, an Engineering-only technical Definition, a mixed Definition, and a technical Definition whose consequence triggers Product participation.
5. **Shared then divergent:** Begin two Definitions with genuinely identical context. Loopy shares only that question, then splits when consequences or acceptance diverge.
6. **Dependency consequence:** A required implementation dependency remains visible without blocking a coherent Definition; a dependency that prevents meaningful acceptance does block.
7. **Independent commitments:** One response explicitly names several ready Definitions for commitment while another named Definition is unready. Loopy records separate ready commitments, preserves the unready draft, and includes no unnamed work.
8. **No redundant approval:** The final required perspective clearly agrees and asks to commit. Loopy uses that response as the receipt and commitment rather than asking for generic confirmation again.
9. **Authoritative boundary:** A later-stage suggestion would change committed outcome, requirements, scope, or acceptance. Loopy refuses silent mutation and identifies Change Management as the future route without performing it.
10. **Continuity, publication, presentation, and stopping:** Several meaningful answers advance canonical `.loopy` state without rewriting or repeatedly offering `Definition.md` during ordinary interview turns. The last public views remain labeled with their prior published revision and stale detection reports the difference. Explicit view requests, review readiness, useful pause/blocking, commitment, and status/reporting publish current synchronized Markdown; commitment and status include a portable reference. Interruption and resume preserve the frontier and can regenerate current views. Loopy stops when current Definition decisions are sufficient and does not begin Planning, Proof, Demo, or Release questions.

## Judgment

Evaluate question-frontier sequencing, after-response move selection, evidence use and attribution, reflection/correction, responsibility boundaries, pacing, and whether the Host stops at Slice 4 sufficiency. Quote only short decisive excerpts and distinguish observed behavior from inference.
