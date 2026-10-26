# Report: one-test-run

Per-repo one-at-a-time line for runs named in the repo's `full` config list. Serial-solo (every wave one unit), implemented by A.

## Base and head

- Base: `672a2ab513d80e9705e17cbb3f883f57153a258f` (refresh during implement rebased `c9b619c` → `672a2ab`, replaying both branch commits cleanly)
- Head: `34fe236a1bcf367d25fe7eb8ffec5f933d3cb6fb`
- Prior proof runs before the refresh: pre-rebase reds recorded in plan.md; all green runs below are on the rebased head.

## Changed files and reasons

- `src/config.ts` — `full: z.array(text).default([])` plus superRefine refusing entries that name no `checks`/`merge_checks` key, message naming the entry (D1).
- `src/admission.ts` — record states `waiting|live|ended|cancelled` and `full` flag on records/holder; `liveRuns()` widened to include `waiting` (the plan's open question, one reader for cancel + slice protection); `lineRuns()` queue reader (repo → holder-first → since → token_hash); `awaitLineTurn` poll under `withAdmissionLock(slice)` + `runs/locks/line-<repo>` with the vanished-record rewrite, cancel check and `waiting for <repo>/<leaf> <check>` line; `cancelWaitingRun` under the same lock pair (D8); `nested(token, full)` gate `(record.full || !full)`; `withAdmission` writes `waiting` and waits when `holder.full` (D2–D6, D11).
- `src/run-check.ts` — `checkedRun` passes `full: repo.config.full.includes(name)`; covers verify's `checkedRun` calls too (D7).
- `src/stop-run.ts` — a `waiting` record owned by the caller's scope is cancelled via `cancelWaitingRun`; a promotion that won the lock falls through to the unit stop; already-cancelled/gone returns (D8).
- `src/status.ts` — `run line (one per repo)` table via the existing `render()`, columns `REPO LEAF CHECK STATE AGE RUN`, only while at least one listed run waits; `ended` shows its real state rather than the old code's `running` lie (D9).
- `src/state-home.ts` — liveness enum admits the new states; `liveRecords` counts `live|waiting` (D10).
- `src/reconcile.ts` — no edits: `liveRuns()` widening feeds `stopSlice`, `reconcile` and `reconcileHost` unchanged.
- `docs/reference/config.md`, `docs/reference/checks.md`, `docs/reference/commands.md`, `src/AREA.md`, `tests/AREA.md` — `full` field, wait line, status table, stop-run cancel; per-repo wording.
- `tests/run-permit.test.ts`, `tests/status.test.ts`, `tests/leaf-slices.test.ts`, `tests/state-home.test.ts` — the eight criterion cases (committed red at planning, commit `d379ecc3`).

## Commands run (kept logs under implementation/)

| Command | Head | Result |
|---|---|---|
| `bun test tests/run-permit.test.ts -t 'listed runs of one repo'` | 34fe236a | `check c1: 0 implementation/check-c1-1793017408434-183891.log` (1.4 s) |
| `bun test tests/run-permit.test.ts -t 'start at once over the line'` | 34fe236a | `check c2: 0 implementation/check-c2-1793017409759-184336.log` (1.2 s) |
| `bun test tests/run-permit.test.ts -t 'nests under its repo holder'` | 34fe236a | `check c3: 0 implementation/check-c3-1793017411195-184683.log` (1.3 s) |
| `bun test tests/run-permit.test.ts -t 'killed holder or waiter'` | 34fe236a | `check c4: 0 implementation/check-c4-1793017412548-185018.log` (1.3 s) |
| `bun test tests/run-permit.test.ts -t 'stop-run cancels'` | 34fe236a | `check c5: 0 implementation/check-c5-1793017414859-185355.log` (2.2 s) |
| `bun test tests/run-permit.test.ts -t 'refuses a full name'` | 34fe236a | `check c8: 0 implementation/check-c8-1793017415068-185804.log` (0.5 s) |
| `bun test tests/status.test.ts -t 'run line only while'` | 34fe236a | `check c6: 0 implementation/check-c6-1793017419341-186066.log` (0.2 s) |
| `bun test tests/leaf-slices.test.ts -t 'waiting run record'` | 34fe236a | `check c7a: 0 implementation/check-c7a-1793017419881-186272.log` (0.5 s) |
| `bun test tests/state-home.test.ts -t 'deferred while a waiting'` | 34fe236a | `check c7b: 0 implementation/check-c7b-1793017420122-186689.log` (1.1 s) |
| `akrogon verify` (format, test, typecheck — fresh checkout) | 34fe236a | green: 1207 pass, 0 fail in 59 s; `check-test-1793017485275-187025.log`, `check-typecheck-1793017487645-187025.log`; receipt `verify leaf 34fe236a…: green` |

## Deliberate break

With the `record.repo === record.repo` filter dropped in `awaitLineTurn`, c2's test goes red: `check c2-break: 1 implementation/check-c2-break-1793017384532-175461.log` — the cross-repo waiter joins repo's queue and the test times out. The break was first invisible because `lineRuns` sorts by repo first and `other` < `repo` alphabetically; the fixture repo was renamed `zzrepo` (commit 34fe236a) so the break is observable.

## Planned-test corrections (Test-Change trailers)

1. `tests/status.test.ts`: expected `ended` records to be excluded; real output showed the reverted code's `running` label for `ended`. Display fixed to show `ended` (old label kept for `live`); the test now expects the honest state. Source: c6 log `check-c6-1793016852053-3667575.log`.
2. `tests/run-permit.test.ts` leg B: the inner listed run's `waiting for` line is buffered inside the outer run's captured stderr until its command exits, so `waitForText` could never observe it; the wait is now observed on the inner's `waiting` record. Source: c3 log `check-c3-1793016935320-3735661.log`.
3. `tests/run-permit.test.ts` c5: waiter ids sorted by record `since`/`token_hash` can differ from spawn order (same-ms timestamps), so each waiter now gets its own leaf worktree and its record is matched by `leaf`. Source: c5 failing run `check-c5-1793017131316-169464.log`.

## Criterion map

- C1 (same-repo serialization, holder line, arrival order): c1 test — green.
- C2 (unlisted and other-repo runs start at once): c2 test — green; deliberate break red above.
- C3 (nested under same-repo listed holder runs at once; under unlisted takes a turn): c3 test — green.
- C4 (SIGKILL tolerance): c4 test — green.
- C5 (stop-run cancels a waiter; suspended exits on resume; record not rewritten): c5 test — green.
- C6 (status table only while one waits): c6 test — green.
- C7 (waiting counts as live for slice protection and migration gate): c7a, c7b — green.
- C8 (unknown `full` entry refused naming it): c8 — green.

## Known limitations

- A waiter may start up to ~5 s early after a killed wrapper (`TimeoutStopSec`, design residual); C4 covers crashes via dead-pid filtering.
- A SIGSTOPped head waiter blocks its repo's line until `stop-run` cancels it; the suspended process exits on resume. Cancelling a waiter while it is suspended *inside* its lock hold (a sub-millisecond window per second) would wait on the lock until resume — same residual class.
- A `cancelled` record swept while its writer is stopped can be rewritten `waiting` on resume (only an old binary sweeps a live parseable record — one-time activation residual).
- Runs admitted before a repo's `full` edit, or by an old binary, overlap once (activation residual).
- The leaf proves the line works, not that suites get faster; `full: [test]` on akrogon's own config is the chart's pending main step.

No blockers; no unverified criteria; no grants or credentials used.

## check.fix round 1 (B's F1–F4)

B's check.repair repaired the product items itself (commits `780c187d`/`715256ea` cross-repo nesting, `64a0be01`/`5c11b4a3` bare stop-run cancel) and handed to A the two proof items:

- **F3 (C1 ordering):** new case `a listed run waits for the holder record to be removed, not just the holder to exit` — a systemctl shim delays the holder's unit stop past its command exit so the `ended` record stays present while the next listed run must still wait; shown red under a deliberate `ended`-exclusion break (`check c1-break: 1 implementation/check-c1-break-1793018509794-1133502.log`), green after restore (`check c1-removal: 0 implementation/check-c1-removal-1793018512144-1133969.log`). Assert is spaced past one promotion poll so it does not race.
- **F4 (C3 record-count race):** leg A's outer command now waits on `outer-release` until the test has counted exactly one record, then exits — deterministic lifetime (B's `repair-b-c3` red logs).

Commit `249d01cf` carries both, with `Test-Change` trailers.

Reran on head `249d01cfb63a4bc0f4073ac46e255cf976527868` after the test-file change: c1–c5, c5b (B's bare-cancel case), c8 all green; c6/c7a/c7b inputs unchanged and retain their green runs. `akrogon verify` green: 1212 pass, 0 fail (`check-test-1793018586564-1138616.log`), receipt `verify leaf 249d01cf…: green`.

Review cycle history: B's `check.repair` entry in review-B.md holds the product-repair evidence; reviewed head before repair `5e50bb35`, repaired head `a39d363d`, this pass's head `249d01cf`.
