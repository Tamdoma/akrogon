# Proof run

## Question
Q1. Where should the operator see the cost of a leaf's live-run proof (real model sessions) before it runs?
Q2. Must the leaf's contract require its live sessions to run side by side, each with its own resources?

### Carries
- Locks: leaf-run-stalls Off route (no clock, watchdog, elapsed trigger or numeric size gate); shapes.md audit refuses a criterion naming a test count; check-reruns 3a.
- Operator 2026-10-10 (deploy-path): "I don't want to have another mental model upgrade."

## Findings
- Measured (C): 85 of 343 closed framework leaves carry live-run proof; implement median 103 vs 26 min. Conservative confirmed subset (B): 23/446, median 110 min.
- The seat's "30-60 min" was SESSION_TIMEOUT_MS (framework session-trace.ts:12), not a measurement. Plan is written after handoff; operator does not read it before implement.
- Merge history checked 2026-10-10 for opposing rules: none. 8e5e31b (2026-10-01 proof-order: cheap proof first, overlap) and d4f5427 (2026-10-02 concurrent bun test default) point the same way.
- Notes: slots/proof-run-{B,C}.md, merged slots/proof-run-merged.md, rebuttals slots/proof-run-rebuttal-{B,C}.md.

## Taken
Operator 2026-10-10, verbatim: "1a | 2a"
Binding decisions:
- Q1 1a: the handoff review shows one line per leaf with live-run proof: session count, how many run at once (rounds counted), an estimated elapsed time, and the worst case if sessions hit their timeout, labelled estimate; a recorded measured case replaces the timeout basis; "unknown" with a reason when no basis exists. Information only: never times out a leaf, never waives a criterion; the operator approves or narrows scope. (A,B,C; rounds per B)
- Q2 2a: a live-run done-criterion requires its sessions to run side by side, each with its own working root and log, unless the brief names the shared resource that forces serial. A seat that finds an unnamed shared resource cannot meet the criterion as written and ends the pass `failed` with the reason (existing red-criterion 2a exit, leaf-run-stalls). More sessions at the same width proceed. The count stays in the review line, never in the criterion (audit test-count rule). (A,C)
Foreclosed: 1b close #75 with no rule; 1c minute numbers in plan only; 2b disclosure only (B); any enforced budget, timer or numeric gate (locked).
