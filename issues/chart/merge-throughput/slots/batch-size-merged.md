# batch-size, merged notes

Sources: slots/batch-size-A.md, batch-size-B.md, batch-size-C.md. Code at 2e78945.

## Why 2

- "2" is the best size from n·p^n at p 0.62 only. It counts leaves landed by a green run and ignores what a red run costs (A,B,C).
- Measured framework pass rate by merge exits is 0.49-0.64 per day, not the 0.86 in #68. Splits write no log line, so the real rate is lower (B,C).
- Once red-run cost is counted, today's red handling makes any batch size worse than solo at today's pass rate (C). A's check simulation agrees: at p 0.62, solo 0.63 leaves per run, fixed 2 0.49, AIMD window 0.45. AIMD only reaches solo near p 0.86 (0.88 vs 0.86) (A).

## Loops

- R-queue, reinforcing: queue length sets batch size (`src/next.ts:1017-1020`), and the limit resets per holder (`src/phase.ts:154`). Longer queue, bigger batch, more red, longer queue (A,B,C).
- R-solo, reinforcing: a conflict marks solo forever (`src/next.ts:1179-1181`), fewer leaves per run, longer wait, more conflicts. Already fixed by first-package 2a clear-after-clean-run (B,C).
- B-halve, balancing on the wrong target: the split keeps the holder and halves followers (`src/phase.ts:788-798`). It aims at "smaller next run", not "find the bad leaf". If the holder is bad, every halving is red. Green followers' evidence is discarded (A,B,C).
- B-ratchet, balancing with no recovery: recorded 2a only shrinks, fixed point 1 (A,B,C).
- `max_active` balances seat load, not the merge turn. Not this fork (C).

## Options

- O1 AIMD window, keep today's split. Start 2, +1 per green, halve on red, floor 1 (A). B refines: W counts total leaves including holder, +1 only when a full window lands, a red retry reuses only the frozen failed members and never refills from the queue. Cost: one stored number per repo. Weakness: simulation says it does not beat solo below p about 0.86 (A, from C's point).
- O2 Eject the bad leaf, no size tuning (C). Red ending gains `--culprit <slug>`. The named leaf goes to check.fix (counted under bounce-counting 1a). Holder and other members restore. Batch record clears. Next turn rebuilds from the queue with existing code. Unnamed means the holder takes it, and its seat reruns the exact command (first-package 1a), and a green rerun returns it to merge. Size: whole eligible queue up to `batch_limit` in issues/config.yaml, default 8. Halving and the state key go away.
  - Simulation (A, independent of C's): leaves per run at p 0.62, cap 8: 1.23 with correct naming, 1.05 at 80% correct, 0.78 at 50% correct. All beat solo 0.63 and today 0.49. At p 0.86, cap 8: 3.24 / 2.86 / 2.09.
- O3 Bisect by the command (test the first half). Mechanical, no naming, but log2(n) runs per red and needs an ending for "half green, half red" (B,C reject now).
- O4 Fit n from measured p. Needs data that does not exist yet and ignores red cost (B,C reject).

## Evidence

- Code: `src/next.ts:1017-1020, 1179-1181`, `src/phase.ts:152-154, 781-798`, `src/batch.ts:42-76` (A,B,C).
- Framework log 10-08/10-09 merge exits (B,C).
- Zuul gating window grows on success, shrinks on failure, and re-tests changes behind a failure. GitHub merge queue removes only the failing PR and re-tests the rest (B,C). Both find the failing change by testing each change's prefix in parallel, not by reading output (A).
- Simulations: C's and A's scratch scripts. Assumptions: independent pass rate, equal run length, endless queue.

## Pitfalls

- P1 B names the wrong leaf. A good leaf spends one fix round and one check.fix cycle. First-package 1a reruns the exact command in its seat, green returns it (C). Cost is off the merge turn.
- P2 two leaves red only together. Eject one, the other lands, the ejected one is red on new main and that is now its real defect (C).
- P3 base red named as a culprit. Removed by red-main-hold order: `--red-on-base` judged first (B,C).
- P4 big stacks conflict more. Bounded by cap and solo clear (C).
- P5 off-by-one on "2": today `batch_limit` counts followers (B).
- P6 double adjust on reused green attempts. Only relevant for O1 (B).
- P7 old processes keep old code. Operator restart at handoff (carried).

## Where slots differ

- D1 size rule: O1 AIMD (A,B) versus O2 cap with no tuning (C). A now leans O2 because the simulation shows O1 below solo at today's pass rate.
- D2 red rule: keep holder split (A,B) versus eject a named leaf (C). B says naming from one red run invents attribution. A's simulation says even 50% correct naming beats today, and the cost of a wrong name lands off the turn.
- D3 holder position in stack (C Q2): irrelevant under O2.
