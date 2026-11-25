# Fork test-facts, rebuttal: slot D

Disagreement only. Anything not named here, I agree with `fork-test-facts-merged.md`. Tiers: T1 measured or run by me, T2 akrogon source read by me, T3 reported in the merged file.

## Correction to shared evidence: sub-ms tests do print a bracket

Merged says sub-ms passes print no bracket. That is wrong for Bun 1.4.5.

Evidence: (T1, my Bun 1.4.5 probe, 2026-11-25) `(pass) fast pass [0.03ms]`. (T1, 11 on-disk framework merge logs >1 MB read 2026-11-25) 42,550 bracketed tests under 1 ms, in all 11 logs.

Consequence if the leaf is built on the merged claim: none if the parser ignores unbracketed lines, as merged already picks. But the record should not teach the next reader that a missing bracket means a sub-ms test. A missing bracket means not a Bun timed line, so store nothing.

## Differ 1. K value: I move from 50 to 100, and disagree with 30 and below

K=10, 20 or 30 records only disasters. The seed's use is watching a known slow test at merge over time, and that test is no longer a disaster.

Evidence: (T1, 11 on-disk framework merge logs >1 MB, 2026-11-25) K-th slowest test, median across logs: K=10 about 80 s, K=20 about 40 s, K=30 about 19 s, K=50 about 11 s, K=100 about 5.6 s. (T1, same logs, per-stream file tracking) `capture-review.test.ts` has one test. On 2026-11-22 it ran 121 to 427 s, rank 2 to 19. On 2026-11-24 and 2026-11-25 it ran 6.3 to 6.7 s, rank 46, 46, 48, 48, 53. (T3, merged, C) rank #42 to #103, median #48, across 17 logs. Size stays bounded: (T3, merged, C,D) K=100 about 11.5 KB per merge row. At about 54 merge rows per day recent, that is about 0.6 MB per day.

Consequence if built at K=10 to 30: the leaf ships and still cannot answer the seed question for the seed's own example test at its current speed. At K=50 it misses about half of recent runs (rank 53 of 5 recent logs in my count, median rank 48 in C's). At K=100 it covers all 11 logs I read. My blind pick of 50 was set from one log's cutoff; the rank data beats that.

## Differ 2. Failures always in the duration list: yes, against A

I keep yes (B,D) and add the reason A misses. A timed-out failure is exactly the test whose ms the seed asks for, and its ms is about its limit. Limits in one framework command include 5,000 ms (T3, merged, B,C). A 5 s timeout sits below the K=50 median cutoff of about 11 s and near the K=100 cutoff (T1, same 11 logs as above). So "K slowest only" can store a name in `timeouts` with its duration stored nowhere.

Evidence: (T2, `src/verify.ts` `verifyRunSchema`, read 2026-11-25) `failures` is already stored unbounded as a non-empty unique string list, so adding failures to the duration list adds no new size class. Failures are few in practice: (T1, framework `issues/verify-runs.jsonl`, 2026-11-25) 390 of 3,657 finished rows carry failures.

Consequence if built A's way: timeout facts and duration facts disagree on the same row, and a fast-limit timeout loses its measured time when the log is deleted.

## Differ 3. Duration scope: every scope, against the A,B,C majority

Merge-only has a hole the majority did not price. A row's scope says how the pass was launched, not what the row later proves.

Evidence: (T2, `src/verify.ts` `greenRun` and `sameCommands`, read 2026-11-25) `greenRun` reuses a finished green row matched on tree plus command name and text only. It does not check scope. (T2, `src/verify.ts` `verify`) on reuse, `verify` returns that old row's id and writes no new row. So in any repo where the leaf and merge command sets are the same (no merge-only checks, nothing covered away), a leaf-scope row becomes the merge receipt. Framework is not such a repo today (leaf command `cheap`, merge command `verify`; T1, framework `issues/verify-runs.jsonl`, 2026-11-25), but akrogon writes rows for every registered repo, and the leaf is in akrogon. Cost of every scope stays small because K bounds it: about 0.52 against 0.22 MB per day at K=50 (T3, merged summary of my blind arithmetic; at K=100 both roughly double).

Consequence if built merge-only: in such a repo, the merge answer to "how long did this test run at merge" depends on whether the reused row happened to be launched as leaf or merge scope. The seed hole returns, only for reused runs, which are green runs and the hardest to notice missing. Every scope also needs no scope branch, and matches `failures`, stored for both scopes today (`src/verify.ts` `commandRow`, T2).

## Differ 4. `samePass` gains attempt: no, added evidence against C

I stay with A,B: record the meaning "the attempt that launched this pass" instead.

Evidence: the thing `samePass` saves is a whole pass. (T1, framework `issues/verify-runs.jsonl`, 2026-11-25) merge pass wall time from `start` to `end`: median 471 s, mean 504 s, p95 962 s, across 1,566 finished merge rows.

Consequence if C is built: two attempts on the same tree and command set each pay about 8 minutes of suite time so a stored string is exact for both, instead of exact for the launcher and absent for the joiner, whose join is already recoverable by tree. The dedupe exists to avoid that cost.

## Differ 5. Full run's duration list sits inside `rerun`, each leg from its own output

Merged leaves this open between top level and `rerun`. Store per leg: the first (full) run's duration list and timeouts inside `rerun`, the rerun leg's own list at top level. That corrects my blind wording, which took the command row's durations from the first run's output.

Evidence: (T2, `src/verify.ts` `commandRow` and `verifyRunSchema`, read 2026-11-25) on a rerun row the top-level `exit`, `log` and `failures` are the rerun leg's, while `rerun.exit`, `rerun.log` and `rerun.failures` are the first run's. Every existing fact sits beside its own log. The rerun leg runs 1 to 3 named tests (rerun only fires at 3 or fewer failures), so its top-level K list is tiny and needs no special case.

Consequence if the full run's list sits at top level: a row where `commands[].log` and `commands[]` durations describe different runs. A reader who checks a duration against the top-level log finds nothing and loses trust in both fields. Per-leg storage keeps one reader rule for durations, timeouts, failures and logs alike: facts beside their own leg.

## Differ 6. Duplicate titles: dedupe keeping max ms, no stream qualifier in this leaf

Merged lists stream qualification as a B,D option. I drop my option for this leaf and settle with A,C.

Evidence: (T2, `src/flaky.ts` `failureNames`, read 2026-11-25) stored names are bare titles, qualified only for `(unnamed)`. `timeouts ⊆ failures` (merged, A,B,C,D) and "failures always in the duration list" (Differ 2) both join on that exact name. (T1, 11 on-disk merge logs, 2026-11-25; T3, merged) only 11 duplicate titles in about 12,000 timed tests in the measured log.

Consequence if qualified names are built here: the duration list stops joining byte-for-byte to `failures` and `timeouts`, buying precision on 11 names with a second name rule in every reader. Keep max keeps the slowest fact, which is the one the seed asks about.
