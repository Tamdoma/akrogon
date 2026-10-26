# Merged notes: load-sensitive-tests

Sources: load-tests-B.md, load-tests-C.md, A's code read and runs (s1-runs.txt). Tags name the slots whose own notes hold the line.

## Q1 causes and fixes

1. Real systemd names shared across suites (A,B,C). tests/leaf-slices.test.ts uses the real user bus and fixed repo/slug pairs (:354, :388, :490); src/scope.ts hashes only repo name and slug. Three suites create and stop the same slices. Reproduced with two or three copies of one test at load 9 to 13 (B,C). Fix: one unique identity per fixture used in state, commands, cleanup and expected slices; production unchanged (B,C). Precedent tests/run-units.test.ts:45 (C). B: process-unique slug made three copies pass. B: also assert the sdrun exit before polling a marker (:524, :562) (B).
2. Short budgets inside peer-wait tests (B,C): tests/peer-wait.test.ts:899 (0.3 s) and :582 (1 s). Neither slot reproduced it on pinned CPUs. Fix: price per site against the full observation sequence; these are inputs to the code under test, not O5 per-test caps (B,C). Overlaps O1a in the same file, price once (C).
3. Ordering by sleep (B,C): tests/door-reset.test.ts:211 sleeps 700 ms then changes the session. Fix: change the session on the fake's second agent-list read. B's prototype passed in 77 ms with all three asserts (B).
4. Clock samples (B,C): tests/status.test.ts:38/:73 sample Date.now separately; minute floor at src/status.ts:114. Fix: one epoch. This is the O4 sibling chart's defect; name one owner (C).
5. Per-test caps under CPU pressure (B,C): 39 names, 71 of 98 failure events, in tests/next.test.ts and tests/batch-dispatch.test.ts. Reproduced on 2 or 8 pinned CPUs (B,C). Fix disagreement:
   - B: add `--max-concurrency=4` to the check (Bun default 20 per file). Three batch-dispatch copies on 8 CPUs: 19 fails to 0, group 10.95% faster, CPU 13.33% lower.
   - C: rejected `--max-concurrency`; one quiet file 5.74 s at 20, 10.78 s at 4, 20.41 s at 2. Instead seed preconditions and split the longest multi-stage tests, starting with names failing in 3 or more runs.
   - A measured the whole suite alone at 4 workers, 2026-10-25, a framework verify on the host: max-concurrency 4: 124.5 s green (load 3 to 15); 8: 136.9 s, 2 fail (load 15 to 48); 20: 116.4 s green (load 48 to 62). Earlier quiet 20: 84.4 and 89.4 s. Serial baseline 192 to 216 s.
   - Rejected by both: raising caps (O5, operator "2 no"), --retry, test.serial, replacing bun or git here (B,C).
6. Named target 60 s cap: already L1's O1b split (B,C).

## Q2 bar

- B: keep three full checks at once as the hard bar (operator choice; history reaches three).
- C: two at once hard, three run and reported; a three-only cap-stretch failure goes to the operator.
- History (B,C): timings.jsonl 403 test runs. Three at once totals 169 to 205 s over two weeks, four about 1 s; 92% of test wall time ran alone (C).

## Not asked by the fork

- Should akrogon itself cap how many full test checks run at once across leaves (C X3)?
- Audit for other fixed host-wide names (C X1).
- May S1 add a within-file cap beside the worker count (B Q7)?
