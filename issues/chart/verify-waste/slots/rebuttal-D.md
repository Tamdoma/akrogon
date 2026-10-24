# Rebuttal D: verify-waste map

Disagreements only. Agreed with everything in map-merged.md not named here.

1. Q3 option A (fresh base run limited to the head's red members, under Q1). It keeps the base-red reason, and it removes less cost than reusing receipts while adding a code path.
   - Keeps the reason: `baseCoversHead` (AK/src/verify.ts:113-119) skips every head command with exit 0 and compares only red ones, so a fresh base run of the red members observes exactly what the pass rule reads. A current base red in those members is seen. Nothing in the rule ever looks at a green head member's base result.
   - Cost: a base run becomes the red members, median 2 of 14 (M5), nearly always hooks:selftest and render-satellite (33 and 13 of 37 red logs). Their member CPU is unmeasurable today (P3); by wall they are the two longest members (165 s and 169 s of a 489 s core), and hooks:selftest runs `--parallel=8` (FW/package.json:8), so the remaining CPU is plausibly 30-50% of a suite, not near zero. Fourteen of the 20 base trees also hold a green receipt, which under Q1 becomes a green member receipt for the very members option A would rerun; option A must carry an explicit "fresh on the base side" exception to keep running them, one more rule than the head follows.
   - What it buys: the same pass that has fired 0 times in 10 observable comparisons (M4). Running the red members alone, without 12 siblings' load, makes a base flake less likely, so the pass rate goes down, not up, and the 10 flake-driven main-red notices keep a path to fire.
   - My position stands: under Q1 the base side uses the same member-receipt reuse as the head, with no base-side exception; a base member without a receipt on that tree runs fresh, which is option A's behavior for exactly the cases where a receipt does not already answer. That is a strict subset of option A's runs at one rule fewer. The accepted loss is the one P1 scenario (environment drift makes a green-receipt tree red now); it surfaces as a head red A cannot reproduce in check.fix, and its observed frequency in 11 days is 0 of the 9 base-red cases, all of which were the named fixture-flakes timeouts.

2. Tail saving (Q2). B is right that wall share is not CPU share: after members finish, the survivors run on fewer cores. My "about 35 CPU-h" (42% of 82 CPU-h) is an upper bound; the true figure needs member-grain CPU from Q1 before Q2 goes to the operator.

3. Minor: "26 flipped green (D), 29 (B)" is not a dispute. Mine counts head merge reruns since 2026-10-14 whose earlier same-tree run was red (query L); B's window or completeness filter differs. Either number says the same thing.

Last operation: read map-merged.md only; wrote this file; no code, ledger or suite touched.
Next: A settles Q3 with the member-grain receipt rule; if A keeps option A, the fork text must name the base-side exception as a rule the head does not have.
