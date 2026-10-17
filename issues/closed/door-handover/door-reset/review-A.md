# Review A: door-reset

Base: `17d611718c` · reviewed head: `01cf9de` (leaf branch `door-reset`).

## Evidence

- `git diff 17d6117...HEAD --stat`: 7 files, +549/−11 — helper (193 lines), test file (328), fake-herdr/peer-wait small diffs, 3 doc diffs.
- `check door-reset: 0` (12/12), `check peer-wait-reg: 0` (35/35), `check typecheck: 0`, `check format: 0`, `akrogon verify` green on `df41b94` (1043 tests, fresh checkout).
- Live run (report §C1): codex/pi/claude each reset in-pane, appended `continue autopilot (handover …)` and started chart 2; claude fresh session without start prompt asked the operator. Logs verified in `implementation/live-evidence/`.
- Test-Change trailers: `fake-herdr.ts` (e7ec7e7 change cited in d9ff431), `door-reset.test.ts` (df41b94 format cited in 01cf9de) — both consistent with cited reasons.

## Judgment against plan/criteria

- C2 refusal path: parent refuses wrong kind/missing agent/foreign session with exit 1, no log, nothing sent — matches. Same-kind session change queues the child which logs `identity changed` and sends nothing — the criterion's observable outcome holds.
- C3: turn-end readers reused from peer-wait (claude `turn_duration`, codex last `task_started` needs own complete/aborted, pi hook authority + not working); codex reads the whole rollout rather than a byte boundary — conservative (never ends a live turn early), deviation recorded in report.
- C4/C5: codex check prompt precedes `wait-new-session`; start prompt carries `--wait --until working --timeout 5000`, stall logged `prompt_stalled`; one JSON line per step; no retries.
- C6: skill/shapes/guide carry the entry forms, kinds and `handover queued` wording; attended text byte-identical.
- Docs listed per AREA check: no AREA.md touched; skills/AREA.md and tests/AREA.md name no changed path — no stale pointer.

## Findings

- **N1 (Nit)** `tests/AREA.md` Key files does not list `tests/door-reset.test.ts`. Concern: discoverability consistency; deferred because the file list is illustrative, not exhaustive (several existing test files are also unnamed).
- **N2 (Nit)** A thrown child error (e.g. ambiguous claude transcript) exits 1 with stderr text rather than a JSON `step` line; in the detached production path stderr still lands in the named log file, so the "one line per step" record survives only as plain text. Deferred: rare, self-limiting, and the failure is still logged.
- **N3 (Nit)** `docs/guide/chart.md` says "After the first handed chart" while the rule is "when switching to the next runnable handed chart" — slightly looser phrasing; deferred as operator prose with no behavioral contract.

## Verdict

`nits` — no Fix: no wrong behavior, broken contract or maintainability defect with a concrete consequence today; every criterion proven by its planned test plus the live three-kind run.
