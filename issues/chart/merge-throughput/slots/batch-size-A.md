# batch-size, slot A notes (before reading B or C)

## Why 2
Leaves landed per run, all-or-nothing batch of n, independent pass rate p: E = n * p^n. Best n = -1/ln p.
- p 0.62 (10-08): n* 2.1, E(2) 0.77 vs E(1) 0.62 vs E(9) about 0.1.
- p 0.86 (10-09): n* 6.6, E(4) 2.19, E(6) 2.43.
- p 0.90: n* 9.5.
So 2 was right only for the worst observed day. The right size is set by p, and p moves (1a and the hold raise it). Independence is violated by BASE and load (B), which the hold removes, so p after the hold is closer to independent.

## Loops
- Wrong-target reinforcing: batch size is set by queue length (src/next.ts:1017-1020 takes the whole queue). Long queue -> big batch -> almost always red -> nothing lands -> longer queue. The stock sets its own outflow rule, in the wrong direction.
- Wrong-target balancing: the split keeps the holder and halves followers (src/phase.ts:788-798). It optimizes "get this holder through", not "land the most leaves". The holder may be the culprit; green followers are thrown back and retested later.
- Wrong-target balancing: halving with no recovery (src/phase.ts:154 resets per holder today; the recorded 2a never grows). Either forgets everything or ratchets to 1.

## Most elegant smallest change
- Size: additive increase, multiplicative decrease per repo (start 2, +1 per green batch, halve on red, floor 2? no: floor 1 with +1 on green recovers). This tracks n* without measuring p. Zuul gate window and TCP congestion avoidance use exactly this rule. One number per repo.
- Red batch: bisect instead of keep-holder. Already-built stack is ordered; test the first half (members in queue order incl. holder at top?). Cost: more code, holder semantics change (holder is whoever is first). Defer: once p is high, red batches are rare and halving is cheap.
- Pick: AIMD window per repo, floor 1, +1 on each green batch, halve on red; keep today's split mechanics. Cost: one stored number per repo (gitignored under globalHome like paused.yaml).

## Pitfalls
- Window grows during a quiet day then a bad day burns one big red run: bounded by halving, cost one run.
- Hold-caused reds must not shrink the window (red-main-hold Taken already says no halving on base red).
