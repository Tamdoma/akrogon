# Layout scope

## Question
Q1. Is the invariant "a replacement A is placed left of the surviving B" (split from B, then `herdr pane swap`), or "A is left of B after every allocation", which would also move panes the operator rearranged?

### Carries
- Intake: Tamdoma/akrogon#60. herdr 0.9.3 `pane split` accepts `right|down` only.

## Findings
- Opening map and fork notes: A and B both recommend the local repair (slots/layout-scope-merged.md). Bootstrap and B-only replacement already put A left (B, src/next.ts:416-431).
- Live probe: forks/layout-scope-probe.md. Swap fixes order; swap has no --no-focus and moves operator tab/workspace focus; same-tab move is refused; `tab focus <prev>` restores; swap with source=B keeps B the focused pane in the leaf tab.
- Failure sequence (B rebuttal 1, revised by A): save the new A pane ID right after the split, then swap with source=B; a failed or lost-ack swap is reported as an error and leaves A recorded on the right (today's state): no orphan, no duplicate, no double-swap reversal, no close step. No retry helper on swap (src/shell.ts:54).
- Focus (B rebuttal 2): restoring tab focus sends an operator who switches tabs within the ~0.1 s window back to the previous tab; that is the option's cost.

## Taken
Operator 2026-10-08: `1a | 2a |`
- 1a: local repair only: when recorded A is absent and recorded B survives, split B right, save the new A pane ID at once, then `herdr pane swap --source-pane <B> --target-pane <new A>` with no retry helper. On swap error, keep the recorded A ID, report the error and do not retry or close; its position may be right if the swap was unapplied or left if only the reply was lost (B final check). No duplicate, no reversal. Other allocation paths (bootstrap, B-only replacement, present seats) unchanged. Fake herdr models parent-relative left/right geometry and swap; tests assert positions. Foreclosed: 1b enforce A-left on every pass.
- 2a: before the swap read the operator's focused tab; after the swap, also on failure, `herdr tab focus <prev>` when it differs from the leaf tab. Costs carried into the contract: an operator switching tabs during the ~0.1 s window is sent back once; an operator already in the leaf tab with an extra (non-seat) pane focused ends with B focused, because herdr pane focus is direction-only and cannot restore a pane by ID (B final check, confirmed at handoff review). Foreclosed: 2b accept the focus jump.
- Handoff review 2026-10-08: operator `1a` approved the handoff with the extra-pane focus cost written into the contract.
