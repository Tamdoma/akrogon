# Opening map, slot A, chart akrogon-test-line, 2026-10-26

Written before reading any other seat's map.

## Forks

### K1 · Mechanism

- O1 (pick) Restore the reverted line from 20455420 (config field, `waiting` record state, `awaitFullTurn`, nested rule, stderr line, status table) with the turn computed per repo: `fullSuites` filters to the waiter's repo and the lock path carries the repo name. Reason: the code, tests and residuals were reviewed and ran for a day (host-run-load, B review-B-3 ready); the only defect the operator named was cross-repo waiting, and a per-repo turn removes that problem class even if another repo is marked later. Cost: one small diff on restored code.
- O2 Restore exactly as before (host-wide) and mark only akrogon. Same behavior today. Invites the O7 failure again the day a second repo is marked.
- O3 No code: wrap the configured command in `flock <lockfile>`. Rejected: no status view (operator asked for one), flock waiters are not served in arrival order, and the wait hides inside the check's own run.
- O4 Lower `--parallel` in the test command. Rejected: two runs still overlap; it trades every solo run's speed for less overlap damage.
Evidence: better-than-training, `git show 20455420` (src/admission.ts `awaitFullTurn`, `fullSuites`, `nested`), 2026-10-26; operator, host-run-load forks/full-suite-line.md Taken and O7 revert message, 2026-10-24.

### K2 · What counts as a "test" run

- O1 (pick) Runs whose `--name` is listed in the repo's `full` config field, as before: `akrogon verify`'s `test` command and a seat's `akrogon run-check --name test` both count. Ad-hoc names and raw `bun test` stay outside (stated residual, as before).
- O2 Match on the command text. Rejected: brittle, and seats pass shell lines.
Evidence: better-than-training, src/run-check.ts `checkedRun` (reverted `full: repo.config.full.includes(name)`), 2026-10-26.

### K3 · Status view

- O1 (pick) Restore the table only while at least one run waits, as the operator required on 2026-10-24 ("ONLY if there's waiting"), titled per repo. Columns REPO, LEAF, CHECK, STATE, AGE.
Evidence: operator, full-suite-line.md "Operator correction 2026-10-24 (status)".

### K4 · Rollout order

The repo schema is strict, so `full: [test]` in akrogon's issues/config.yaml before the release with the field is deployed breaks config reads. The leaf cannot carry it either (leaf branches refuse `issues/` files). Pick: a pending main step after the leaf lands and the deploy record shows its release: add `full: [test]` to issues/config.yaml and prove it with `akrogon config`. Evidence: better-than-training, src/config.ts `repoSchema` `.strict` use and full-suite-line.md Taken detail 1, 2026-10-26.

## Practitioner questions

- Q1 Does the wait count inside the run's recorded time? In the reverted code `begun` was taken before the wait, so timing and receipt durations included it. Does any consumer (land unit, verify receipts, `akrogon timing`) time out or report on that number? Open for B.
- Q2 Fairness inside one repo: arrival order by `since` with a host lock, as before. Is there anything new since 2026-10-24 (land units, stop-run, guard) that runs `test` under a parent run and could self-deadlock? The nested rule covered full-under-full only.
- Q3 Is "faster overall" proven anywhere? Not inside the leaf: it is a host-load claim. The leaf proves the mechanism; speed is checked later from verify-runs.jsonl.

## Pitfalls

- P1 fewer-repeat-calls criterion 5 starts two `test` copies on purpose. Removed: its pairs run under `run-check --name c5r2-pair-*`, a name outside `full`, so the line does not touch them (design.md Proof 1a, c5r2 logs).
- P2 Config before deploy breaks every config read. Removed by K4 order.
- P3 A stopped or hung head waiter blocks the repo's line. Accepted residual before (C R4); status shows it as `waiting 1`. With a per-repo line it blocks only akrogon.
- P4 A SIGKILLed wrapper: a waiter may start up to ~5 s before the old processes are gone (B R2 residual, TimeoutStopSec=5).
- P5 Tests of the line itself run under the suite's own `test` run: they must use a separate state home so they never queue behind the real line (the reverted tests did).

## Fog

none
