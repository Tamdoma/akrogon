# Fork test-facts, merged notes (A, B, C, D), 2026-11-25

Sources: fork-test-facts-A.md, -B.md, -C.md, -D.md in this folder, written blind.

## Shared evidence

- verify-runs.jsonl is parsed whole by every `readVerifyRuns` call (11 call sites: verify, land, flaky, status, reconcile) and rewritten whole by `runOnce` at each pass end, so per-row bytes are paid on every later read and rewrite (A,B,C,D). No pruning exists (A). Framework file: 3,666 rows, 2.7 MB over ~42 days, median row ~690 B (B,C,D). Framework rows: ~53 leaf + ~39 merge per day average, ~54 merge/day recent, one command per row (B,C,D). C benchmarked bun 1.4.5: whole file 44.7 ms parse+zod; +26 ms for K=20 on 1,567 merge rows.
- Bun 1.4.5 non-TTY per-test lines: `(pass) <title> [<n>ms]`, `(fail) <title> [<n>ms]`, always ms (C,D probed); sub-ms passes print no bracket (C). Timeout: next line in the same stream `  ^ this test timed out after <n>ms.` (B,C,D observed; C,D probed). The end summary repeats fail and timeout lines (B,C). Printed ms overshoots the limit (5009.97 vs 5000, 134184 vs 120000) (B,C,D). Framework runs 5000, 30000, 120000 and 300000 ms limits in one command (B,C).
- One framework merge log: ~12,000 timed tests in ~800 files under ~78 streams; 11 duplicate titles (A,B,C,D). JSON sizes: K=10 ~1.1 KB, K=20 ~2.4 KB (cutoff ~17.9 s median), K=50 ~5.8 KB (cutoff ~6.5 s), K=100 ~11.5 KB, every test ~1.5 MB, per-file ~65 KB, floor >=1 s ~55 KB (C,D measured; A,B agree).
- capture-review.test.ts (the seed's 88-169 s example) now runs 6-12 s at merge, rank #42-#103 (median #48) across 17 logs (C).
- The pass record already carries `caller.attempt` (land `--attempt` → `verifyCaller` → `leafFields` → `passOnce`); `runOnce` drops it from the receipt; zero rows carry it today (A,B,C,D). `samePass` ignores attempt (A,B,C,D). Reused green receipts write no row; `tested_top` on the attempt row joins by sha (B,C,D). Window joins today leave 93 of 1,268 attempts unjoined, 21 red (B); 32 attempts since 2026-11-21 had 2 verify runs (C).
- per-command ms already lands in timings.jsonl `check_end` (A,D).

## Q1 durations

- a K slowest `{name, ms}` per command (A,B,C,D). Reason: the only bounded option. Cost: a test below the cutoff keeps only an upper bound (`<=` the K-th ms).
  - K: A 10, B 5-20, C asks 30 or 50, D 50. A's 10 misses the watched test (C's rank data).
  - Failures always included even below the cutoff (B,D; C asks). A did not.
  - Duplicate titles: dedupe keeping max ms under failureNames' name rule (A,C); qualify by stream token (B option, D option).
- b every test (rejected A,B,C,D): ~1.5 MB per merge row, ~60 MB/day into a whole-rewrite file.
- c per-file or floor (rejected A,B,C,D): per-file ~65 KB and new parser state; floor unbounded under load.
- d keep the log (rejected A,B,C,D): ~4 MB per run, ~160-250 MB/day, reverses b9fe5027, works against the footprint chart.
- Pitfalls and removals: custom `PASS x (pass)` lines (parse only the anchored Bun grammar failureNames already pins) (A,B,C,D); summary double count (dedupe max per name) (A,B,C,D); green rows today get no parse (run the parse on every finished command output) (D); blocked and reused rows carry foreign bytes (no field on them) (B,C,D); fractional ms (integer ms) (C,D); rerun leg (see Q2 split).

## Q2 timeouts

- a `timeouts: string[]` subset of `failures`, same split inside `rerun` (A,B,C,D). `failures` stays byte-identical so flips, known-red and taken8 logic cannot change.
- b objects (rejected A,B,C,D): changes an existing field's type across verify, flaky and land readers; against signpost 6a.
- c inference (rejected A,B,C,D): overshoot and mixed limits make it false.
- Pitfalls and removals: interleaved streams (attach a timeout line only to the last `(fail)` of the same stream chain) (A,B,C,D); look-alike text such as `lock acquisition timed out` (anchored exact Bun shape) (C,D); summary repeat (Set) (B,C); `(script)`/`(no test name)` names never enter `timeouts` (A,D); empty list never written, same non-empty unique schema as `failures` (C,D); `timeouts ⊆ failures` on each leg (C,D); three scans drifting (one scan returns names, timeouts and durations) (D).

## Q3 join

- a optional `attempt` on the verify row from the pass caller (A,B,C,D). One writer where both keys coexist; 0..N runs per attempt (head, base `compares`, restack).
- b run ids on the attempt row (rejected A,B,C,D): nine scattered `appendAttempt` writers, most without a run id; lost on a land crash mid-verify.
- c both (rejected A,B,C,D).
- Pitfalls: a joined live pass keeps the launcher's attempt (state the meaning "the attempt that launched this pass") (A,B,D); C would add `attempt` to `samePass` instead. Reused green receipt has no row (join by `tested_top` sha) (B,C,D). Head vs base: reader filters `compares` absent (C,D). No fake attempt on non-attempt runs (conditional spread) (D).

## Q4 scope

- Durations merge scope only, `compares` runs included (A,B,C). D picks every scope: no branch, same as `failures`, bounded by K, ~0.52 vs ~0.22 MB/day at K=50.
- Timeouts every scope, like `failures` (A,C,D; B silent).

## Rerun leg (difference)

- Each leg's facts parsed from its own output and stored beside its own log: first run under `rerun`, rerun at top level (A, B for timeouts, C,D for timeouts).
- Durations: take the first (full) run's output, never the 1-3 test rerun (C,D). A said follow the split. Open: whether the full-run list sits at top level or in `rerun`.

## Points where slots differ

1. K value: 10 (A), up to 20 (B), 30-50 (C), 50 (D).
2. Failures always in the duration list: yes (B,D), asked (C), no (A).
3. Duration scope: merge only (A,B,C) vs every scope (D).
4. `samePass` gains attempt: yes (C) vs no, stated meaning (A,B,D).
5. Where the full run's duration list sits on a rerun row.
6. Duplicate titles: max under failureNames' rule (A,C) vs stream qualifier (B,D options).

## Open questions

- Should verify-runs.jsonl stop being rewritten whole as it grows? Out of this leaf (C); related to the footprint chart.
