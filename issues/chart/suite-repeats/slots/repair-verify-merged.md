# repair-verify merged notes (A, B, C, D)

Sources: slots/repair-verify-A.md, -B.md, -C.md, -D.md, blind 2026-11-01.

## Q1

- B runs `akrogon verify` at the end of check.repair only when its move is `merge` (A,B,C,D). The check.repair to merge gate (`src/phase.ts:431-432`) stays; a skipped verify on a merge-bound pass is refused loudly (A,C). check.repair exits only to merge, check.fix or failed (`src/routing.ts:38`) (B,C); the `failed` stop needs no verify (C).
- Data (akrogon, since fb236ec0): in every repair-to-fix visit where B committed (21-22), B ran verify (27-28 runs, about 65 min); A then changed the tree in 19 of 21, 5 of 5 since 2026-10-26 (12 min) (B,C,D). Framework: 95 of 96 such visits ran verify (108 runs, 51 min), A changed the tree in 24 of 27 since 2026-10-26 (D). In 2 older akrogon visits A did not change the tree; under merge-reuse that only moves the run from B to A (C).
- The end-of-pass done-criterion proof sweep on a check.fix handoff:
  - keep it (A,B,C): it is evidence about B's repair, cheap in akrogon (20 min over 421 targeted checks) (C), and removing it could hand A an unproven repair (B O3);
  - gate it on merge too (D): B's per-Fix acceptance proofs (red/green run-check pair, a planned proof B did not write passing on the repaired head) stay in the earlier paragraphs; A's check.fix closing pass reruns every criterion whose inputs changed since its last green run, which includes B's commits; framework spent 65 min of such sweeps in 27 handoffs since 2026-10-26, e.g. 13.5 min (all-kind-design-review) and 16.6 min (launcher-ready) on heads A then changed (D).
- Rejected: remove every repair verify (the 278d5499 shape) (A,B,C,D); merge check.repair into check.fix or a bounce to implement (A,B, D3 lock); condition on what B touched (C).
- Pitfalls: a conditional around the whole paragraph defers per-Fix proofs, removed by conditioning only the closing sentence (B R1, C, D P2); destination flips after B decides (C); A reading only its own diff for reruns, removed by A's rule already counting from each criterion's last green run, stated once in the handoff text (D P1).

## Q2

- No prose-matching test (A,B,C,D).
- One gate case beside `tests/receipt-gates.test.ts:43`: check.repair to check.fix succeeds with no receipt, pinning the ungated move this decision relies on (C).
- Reviewer walks three real cases against the revised paragraph: pure handoff (fewer-repeat-calls 2026-10-26), mixed repairs (abandoned-capture-stop 2026-10-28), direct merge (B).
- Post-landing telemetry: repair visits ending in check.fix show no verify run (A,C,D).

## A's proposed pick (for the rebuttal to attack)

1. Q1: the closing "After repairs" sentence applies only when the move is `merge`: then B reruns changed-input criterion proofs and runs `akrogon verify`. On a move to `check.fix`, B runs neither; B's per-Fix acceptance proofs in the earlier paragraphs are unchanged, and the handoff text says A's check.fix closing pass reruns criteria whose inputs changed since their last green run, B's commits included. On the `failed` stop B runs neither. A takes D on the proof sweep: the per-Fix proofs already prove B's repairs, and the sweep's result on a head A changes 89-100% of the time is read by nobody.
2. Q2: C's one gate case, plus the reviewer walking B's three cases at check.review; no prose test.

## Where slots differ

- Proof sweep on handoff: keep (B,C) vs gate on merge (A,D).
- Gate test (C) vs none (B,D).
