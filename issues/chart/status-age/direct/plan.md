# Plan: total-time-column (direct)

Task: brief.md and design.md in this folder. One unit, serial-solo.

1. Tests first (`tests/status.test.ts`, `tests/dependents-first.test.ts`): header column list `AGE` -> `TIME`; overview test expects `0h23m` for the failed leaf (prompt 30m ago, last failed move 7m ago); replace the AGE history test with a running-leaf test (no timings, failed-only prompts, other slug -> `-`; earliest delivered of several -> `0h12m`) and a finished-leaf test (merged `17h28m`, failed `0h29m`, no move `-`, end before start `-`, all identical after shifting every record 60 minutes older). Commit with `Test-Change:` trailers.
2. `src/status.ts`: read `readTimings(repo.root)` in `scanRepo`; `starts` maps slug to earliest delivered prompt; `cells` takes the start, ends at the last move into `merged`/`failed` or now, prints `clock(ms)`; the busy note reuses `clock`; header `TIME`.
3. Proof: the two test files, typecheck, deliberate break (finished end = now) turns the frozen test red; full checks through `akrogon verify` at landing.
