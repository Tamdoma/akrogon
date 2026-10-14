# Review A — run-units

- Base: ca023641f2945cb8902ebccbf9b6314c77027df4 (origin/main at fork)
- Reviewed head: 95010f3
- Verdict: **fix**

## Evidence

- Full diff `ca02364..95010f3` read: admission/scope/stop-run/run-check/base-run/akrogon.ts, all tests, docs, skills.
- Checks on reviewed head via `akrogon run-check`: test exit 0 (902 pass / 0 fail, 206 s, log /tmp/akr-1000/5d20/358c1156/checks6/test/log), typecheck exit 0, format exit 0.
- AREA.md path listings: every named path in src/AREA.md and tests/AREA.md exists from the repo root (issues/config.yaml resolves in the registered checkout, absent only in the worktree — not a defect).
- Doc pages opened: setup.md (rewritten per amendment, consistent), next.md and README.md stop-run/run-check/base-run rows, files.md timing fields, implement-issue/check-issue skills stop-run wording.
- Earlier red check (checks5/test): one unrelated 60 s timeout in next.test.ts, retried green in checks6 → comparison record implementation/compare-test.md marks it inconsistent, no base run.

## Fix

### F1 — docs still describe the removed start check

- `README.md:150`: run-check "starting it once the start check admits it"; `README.md:151`: same for base-run; `docs/guide/files.md:85`: `wait_ms` is "the time spent waiting for the start check".
- Realistic source: an operator reading the command reference or timing docs.
- Consequence today: the command reference describes a gate that no longer exists; setup.md (updated for the amendment) says "starts at once", so the docs contradict each other, and `wait_ms` is documented as queue wait when it is now just admission overhead. An operator diagnosing slow starts hunts for waiting-to-start behavior that cannot occur.
- Criterion hit: brief criterion 5 (operator 2026-10-14, replaces the reservation criterion) — the leaf now guarantees start-at-once; the reference docs still claim the opposite.
- Fix: reword the three lines to describe records + immediate start; no code change.

## Nits

- N1: `stopRunCommand` stops scope and guard in one `systemctl` call; a scope already collected by `inactive-or-failed` during the wrapper's teardown window makes the call exit non-zero → `CommandError` although the run stopped. No realistic source yet (millisecond race); a real occurrence or a forced reproduction inside the check env would promote it. Note `stopRunUnits` (internal) already stops per unit.
- N2: `waiting`/`ended` record states and `waitingRuns()` are dead on records this build writes; kept for foreign/stale records and status compat. Deferred: removal is a schema decision, not a defect.

## Notes

- Not a finding: `callerScope()` falls back to the cgroup scan when `AKROGON_RUN` is absent; a process inside a run scope therefore cannot match `record.scope` (pane scope) and is refused — correct per D3.
- Not a finding: `release()` writes 'ended' before the finally `rmSync` — makes the end visible to a racing sweep/read for the window between write and delete; consistent with D5's claim ordering.
