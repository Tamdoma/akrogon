# Fork test-facts, slot A blind notes (2026-11-25)

## Evidence (A)

- better-than-training · akrogon src/verify.ts `commandRow`, `runOnce`, `verifyRunSchema` (read 2026-11-25): names come from `failureNames(first.output)` at row time; the row is a `z.strictObject`; `runOnce` appends the receipt then rewrites the whole file under the lock at pass end. `passOnce` already puts `caller.attempt` in the pass record; `runOnce` does not copy it to the receipt. `samePass` does not compare `attempt`, so a joined live pass keeps the first caller's attempt.
- better-than-training · src/run-check.ts `checkedRun`: per-command ms already lands in timings.jsonl `check_end` with `attempt`; returns no duration.
- better-than-training · readers: `readVerifyRuns` is called 11 times in src/flaky.ts, status.ts, land.ts, verify.ts, reconcile.ts; it parses the whole file. No pruning of verify-runs.jsonl exists.
- measured · framework issues/verify-runs.jsonl 2026-11-25: 3666 rows, 2.7 MB; last 8 days 1194 rows = 693 leaf + 501 merge (~63 merge rows/day), every merge row one command (`verify`).
- measured · framework merge log check-verify-1795568767546-3477817.log (4.1 MB, bun 1.4.5): 12,077 `(pass) <title> [<n>ms]` lines; 423 tests >= 1 s, 37 >= 10 s; slowest 63.9 s. A 25-entry `{name, ms}` list is 2,993 bytes; 10 entries about 1.2 KB. False friend: `PASS explore-freely (pass)` lines from a custom reporter; the anchored `(pass) ` form excludes them.
- measured · framework logs: timeout line is `<stream> |   ^ this test timed out after 300000ms.` (also 5000ms), in the failing test's own stream.

## Q1 durations

- Pick a, K = 10. Answers "how long did the slow tests run at merge" for exactly the tests that cause load reds, bounded at ~1.2 KB per merge row (~75 KB/day on framework, comparable to today's growth). Cost: a test that leaves the top K is only known to be below the K-th value.
- b rejected: ~700 KB per merge row, the whole file re-parsed by every status call and rewritten each pass; ~45 MB/day on framework.
- c rejected: a floor is unbounded under load (load inflates every test) and per-file totals still ~770 entries.
- d rejected: 4 MB per merge log, ~250 MB/day; reverses b9fe5027 and works against the footprint chart.
- Pitfall: `[15.00s]` and `[1369.45ms]` units both print; parse both to integer ms, skip an unparseable suffix. Pitfall: duplicate titles across streams; keep the title as `failures` names it (one naming rule, shared with failureNames).

## Q2 timeouts

- Pick a. One optional subset list, old rows parse, `failures` stays byte-identical so flips and known-red logic cannot change.
- b rejected: changes an existing field's type; every reader unions forever (against 6a).
- c rejected: per-test timeouts vary (5000ms and 300000ms both seen); guessing where the line already says it.
- Pitfall: attach by stream, not by next raw line (parallel streams interleave). `(script)`/`(unnamed)` names never enter `timeouts`.

## Q3 join

- Pick a. The pass record already holds `attempt`; one field in schema and writer. Every run of one attempt (head, base, post-restack) carries it; readers filter by attempt.
- b rejected: attempt rows are appended at attempt end by several writers; one attempt runs verify several times; a run id list is the reverse of where both keys coexist.
- Pitfall: a live pass joined by a later attempt of the same leaf keeps the earlier attempt id (samePass ignores attempt). Rare; state it as the leaf's stated limit, or add attempt to samePass (Open for the plan).

## Q4 scope

- Pick b for durations (merge only, the seed's question; leaf rows are 58% of rows), timeouts in every scope (written only on red, tiny).
- a rejected: doubles growth for a question nobody asked.

## Questions the fork does not ask

- Should `slowest` follow the rerun split (rerun row top-level = rerun's own tests)? I say yes, same rule as `log` and `failures`.
