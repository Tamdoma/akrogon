# Report: count-silent-turns

Mode: serial-solo (plan D6; one unit owns every touched file). Base: `fdb5fdc2` after refresh (planned base `8532a1f7`); head: `fd8a14d9`. Refresh: branch rebased `8532a1f7` → `fdb5fdc2`; three conflicts resolved keeping both sides (upstream `blocked_notified` work vs. this leaf's counting rule): `tests/next.test.ts` blocked-seat assertions now expect `busy_since` undefined + `attempts` 0, `docs/` rows merged (`check_refused` kind + `blocked_notified` row kept, `seat_lost`/`lost` rows added), `src/next.ts` gains `clearBlockedNotices` before each `prepare()` in the replacement paths.

## Changes

- `src/state.ts` — `lost: counts.prefault({})` beside `attempts`.
- `src/hc.ts` — `terminalSchema`/`Seen` gain `exit_code`/`signal` (nullable ints, optional on `Seen` for test literals).
- `src/timing.ts` — `seat_lost` union member per the design's literal shape.
- `src/seat.ts` — removed `attempts +1` on confirmed start.
- `src/phase.ts` — `commitMove` resets `lost` beside `attempts`.
- `src/next.ts` `dispatchSlot` — counting point at `prompted.turn < seat.turn`: `liveRuns()` gate first, then one `saveState` (attempts+1, prompted cleared, lost reset), fail at 3 with the locked reason, else deliver (deliver's +1 removed). Finished-or-missing branch: `not_found`-only catch probe of the recorded seat; finished + silent end counts at the same point (liveRuns gate included) then replaces without a loss; otherwise a recorded seat gets one `seat_lost` row (rich fields or `gone: true`), `end()` only when the terminal exists, `lost+1`, fail at 3 with `seat <S> was lost 3 times before ending a turn`, else replace.
- `tests/hc-delivery.test.ts`, `tests/next.test.ts`, `tests/phase.test.ts`, `tests/state.test.ts` — criterion tests (committed red first, then corrected; see plan-run record and Test-Change trailers).
- `docs/reference/state-and-phases.md`, `docs/reference/files.md`, `src/AREA.md` — mechanism descriptions.

## Commands and results (all on head fd8a14d9 unless marked)

- `akrogon run-check --name impl-c1` — `bun test tests/hc-delivery.test.ts -t 'silent stops are re-prompted'` → 0 (criterion 1). Log `implementation/check-impl-c1-*.log`.
- `impl-c2` — `-t 'counted once'` → 0 (criterion 2). `impl-c3` — `-t 'live or waiting'` → 0 (criterion 3). `impl-c4c5` — `-t 'lost seat|start proof'` → 0, 2 tests (criteria 4–5). `impl-c6` — `state.test.ts -t 'retain defaults'` → 0 (criterion 6). `impl-c6b` — `next.test.ts -t 'keep the leaf in phase'` → 0 (criterion 6 dispatch). `impl-c4r` — `phase.test.ts -t 'failed exits by command'` → 0 (lost reset on move).
- Full-file sweeps before verify: `hc-delivery` 10/10, `next` 197/197, `state`+`phase` 106/106, `tsc --noEmit` clean, `prettier --check` clean.
- `akrogon verify` → `verify leaf fd8a14d9...: green` (1208 tests across 83 files; test check 57.6 s). Log `implementation/check-test-1794846429573-3219342.log`.

## Plan corrections

- Proof command `-t 'lost seat'` widened to `-t 'lost seat|start proof'` so one command covers C4 and C5 (same tests and cases still run; the deliberate-break criterion-1 test still fails under the `deliver` `+1`, shown at planning on base).
- `hd-lost`/`hd-dead-start`/`exited`/`hd-runs` test corrections cited in the feat commit's Test-Change trailers (real source: `hc get --json` output on the test core — `turn` advances on every terminal end including SIGKILL; `full` line admission requires `checks` + `full` naming before spawn).

## Known limitations and unverified criteria

- Timing seam (design): `readTimings` is all-or-nothing; an older akrogon reading a timings file with `seat_lost` rows drops all timings for that repo.
- hc turn semantics (implementation note in plan.md): `terminal.turn` advances on every terminal end, so a mid-turn death is a silent turn end by definition on this hc. `lost` charges for missing terminals and pre-prompt/start-proof deaths; the finished-terminal rich `seat_lost` row is written whenever such a state is observable but on this hc no terminal reaches it except the start-proof case.
- Open leaves with stored `attempts` ≥ 2 at implementation end: none in any registered repo (scanned all `issues/open/**/state.yaml`; `competition-read-skill`'s A=4 no longer exists in open state).
- A hung live run-check holds the leaf's seat until it ends or is stopped (design Q2 stated limit).
- Criterion 1's deliberate break: not re-applied as an edit — base already held the violating `+1`; the plan-run record carries the red output it produced.

No grants, no count lines, no `.env` reads, no paid or live operation.
