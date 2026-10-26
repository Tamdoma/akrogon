# Intake: akrogon-test-line

## Scope

akrogon only: its whole-suite `test` check runs one at a time within the akrogon repo, and `akrogon status` shows the running run and the waiters. Other repos and other checks keep starting at once. One destination, the akrogon repo, lifecycle route.

## Provenance

- Operator: door pane w8:pNP, 2026-10-26, messages below.

## Source: operator 2026-10-26

"If we make testing consecutive and create akrogon status that shows it (we've already done this two days ago), overall, is having those heavy tests go one by one, provided all other optimizations on the tests themselves going to make it faster than trying to test heavy tests all at the same time?"

"how about if we do it one at a time per repo? Would it help all repos? Or just Akrogon is the better solution?"

"in the grand scheme of things, it will be faster, am I correct?"

"ok, let's do it then for akrogon only. Tell watch-akrogon what to do with the running leaves, and build a new one and put it into production lifecycle, or you do it yourself in manual and autopilot."

"while using slot b consultant as a checker. But I'd do it through the normal lifecycle on autopilot"

## Agent findings

- The same line existed host-wide from 2026-10-24 (chart host-run-load, landed f474544b): repo config field `full:` listing check names, `awaitFullTurn` in src/admission.ts with lock `runs/locks/full-suite`, a `waiting` record state, a stderr `waiting for full suite <repo>/<leaf> <check>` line and an `akrogon status` table (REPO, LEAF, CHECK, STATE, AGE) shown only while one waits. The operator removed it the same day (O7, revert 20455420) because akrogon runs queued behind framework's ~20 min `verify`.
- Replay of 14 days of issues/verify-runs.jsonl (door, 2026-10-26): akrogon 263 runs, 73 overlapped another akrogon run; 48 of 73 overlapped runs passed against 122 of 190 solo. A per-repo line adds about 4 min/week of waiting at the current suite speed. framework (~2109 min/week) and lingua-relay (~267 min/week) would wait much longer, so they stay out.
- Timing on this host (door, 2026-10-26): head `bun test` alone 45.9 s; two copies at once take 89-143 s per pair (median ~97 s) against ~92 s for two in sequence, and two at once fail on both head and base (fewer-repeat-calls c5r2: head 12 of 20 copies green, base 0 of 20).
- akrogon's `test` check today: `bun test --timeout=30000 --parallel=4 --no-isolate` (issues/config.yaml `checks.test`); akrogon has no `merge_checks`.
