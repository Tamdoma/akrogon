# What akrogon changes for #147

## Question

Q1 Cause vs symptom. Q2 Load: what admission change gives a land run a quiet repo. Q3 Judgment: how a nameless/timeout red is handled. Q4 Other surfaces and removals.

### Carries

- Locks: forks/signposts.md `## Taken`; merge-lanes red-exit Taken 3, 5a, 7, 8; operator limits (no new failure on main, PC limits, tokens).

## Findings

- Notes: slots/fix-A.md, fix-B.md, fix-C.md (blind).
- Agreed (A,B,C): load beside the land run is the akrogon cause. Framework has no `full`, so every framework run starts at once (`withAdmission`); every 11-22 land overlapped other runs, reds far more (B E2: 358-1517 s of overlapping run time on reds vs 39-85 s on greens; C: 40-72 overlapping check starts). The land verify is several sequential `checkedRun`s, so no record spans a land (A,B,C).
- Agreed (A,B,C): condition 1 (nameless disables the base pass) is red-exit Taken 7/8 working as written; a base pass would not have cleared these reds, because both bases already had green merge receipts and a green base judges `fail` (B E6, C). No verify.ts or taken8 change.
- Agreed (A,B,C): the damage path is the check-issue `## check.repair` "second red on the same unit" bullet: it sent repeated nameless timeouts B judged unrelated to A, who committed unrelated EmDash edits (runner-names-unbound-route review-B.md, 95cfceb3cd, c834d36321).
- Q2 split: land drains live runs first (A, C) vs land starts at once and only later arrivals wait (B). B: drain adds a wait inside the line with a deadlock path (a `full` run started under a live unlisted run takes its own turn) and skews merge-slow and pressure; framework runs are short (73 runs in 1517 s, 4 over 60 s).
- Hold carrier: one record held by `land` for the whole attempt, same-attempt runs pass (B, C's attempt field) vs AKROGON_RUN nesting (A). The attempt key needs no env change and covers head run, base pass and restack rerun.
- Status: the run table reads `lineRuns` (full only), so held-back runs would be invisible (B, C).
- Not akrogon's (A,B,C): framework `renderers/1.99.9` race, 19-job concurrency, hook timeouts.

## Taken

A's pick under full autopilot, 2026-11-22T15:58Z. Decided by S1 (throughput now), S2 (PC limits; no new failure on main), S3 (remove the cause, fewest parts), S4 (locks kept).

1. Land hold: `land` (src/land.ts) holds one run record for its repo for the whole attempt (`check: 'land'`, its `attempt`, `full: false`, a unit name minted from its own run id so `sweepStale` never stops the land unit). `AdmissionHolder` and the record gain optional `attempt`; `checkedRun` passes `caller.attempt`. A run that is not nested waits while a live hold of its repo has a different attempt and an earlier `since`; runs carrying the hold's attempt pass. Runs already live finish; the land does not wait. (B; C's attempt field) Rejected: drain first (A, C: deadlock path, merge-slow skew, short framework runs, add only if reds persist); framework `full` only (serializes leaf runs, misses seat run-checks, per-repo tuning; red-exit 9); AKROGON_RUN nesting (A: env coupling, the attempt key already exists); per-check flags (gaps); pressure gate (no sourced number); per-host hold (operator chose per repo for the line 2026-10-26; recorded for the operator).
2. One admission loop: every non-nested run decides its start under the existing lock pair in `awaitLineTurn`'s loop (renamed if its name stops fitting): held back -> wait; `full` -> also first among the repo's line runs that are not held back; else start. The line queue skips held-back runs so a held-back `full` waiter never blocks the land's own `full` check. The separate non-full branch in `withAdmission` goes. `stop-run` cancel works unchanged on a waiting record. (B H3/H4, C removal)
3. Visibility: `akrogon status` run lines also show the live hold and runs waiting behind it (B, C).
4. Judgment text, skills/check-issue/SKILL.md `## check.repair` red bullets only: a unit with no cause in the leaf's diff that passes B's narrowest rerun on the head is inconsistent: B returns the leaf unchanged, on a repeat too. The `check.fix` bullet applies only to a failure B judges leaf-caused, and "same unit" needs a named title on an unchanged head. The main-red `failed` stop needs a unit red outside the land run (narrow rerun on the head, or a base receipt). No commit for a failure with no cause in the leaf's diff goes on the leaf branch. (B J1-J4; A, C) Rejected: nameless base pass (#134, E6); in-land rerun (5a); seatless timeout requeue (red-exit 3); a count of returns.
5. Docs: docs/reference/checks.md `## What runs where` and skills/merge-issue/SKILL.md `## The land run` state the hold.
6. Proof: tests/run-permit.test.ts T1-T6 (B) plus the relaunch-not-swept case (B T7, P1); red before, green after; existing suites pass.

Standing: C's drain-and-fair-burst shape; B's per-host question (open for the operator). C's Q3 variant (repeated unrelated flake -> `failed`) is not taken: B's unchanged return keeps the leaf moving now that the hold removes the load; a persisting flake shows in `akrogon flaky`.
