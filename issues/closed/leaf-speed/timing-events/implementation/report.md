# Implementation report: timing-events

Base: `df8868911100bf863224f71a51e70bb489d3b5d9` (origin/main at pass start)
Committed head: `2946c07` (amended after format run)
Branch: `timing-events`, 8 commits on top of base.

## Changed files and reasons

- `src/timing.ts` (new, ~110 lines): event schema (`timingEventSchema`, 8 kinds on `kind`), `appendTiming` (stamps `ts`/`repo`, warns `timing append failed: <msg>` once, never throws), `readTimings` (warns `timing read failed:` and returns `[]` on failure so `next`/`run-check` survive an unwritable file — required by criterion 5 via `recordWait`), `visitOf`, `currentVisit` (`max(0, visitOf-1)`), `recordWait` (open-wait dedup: last `wait`/`prompt` event decides).
- `src/phase.ts`: `seat_done` in `transition`'s `recorded` branch (`required.length > 1`), `visit_start` in `commitMove`'s `finally` after `logMove` (`currentVisit` subtracts the just-written `to` row).
- `src/run-check.ts`: `leafTarget` returns `scope`/`unit`/`phase`/`attempt` (exact leaf match, `<slug>-u<N>` worker basename, open `base-runs.jsonl` row, `--leaf` override, `--holder` fallback as `scope: 'leaf'`); `check_start` before `spawnLogged`, `check_end` after the kept-log copy with `exit`, `duration_ms`, `log`, shared `run` UUID. A killed run leaves start without end.
- `src/next.ts`: `attempt` threaded `mergeTurn` -> `dispatchMergeLeaf` -> `dispatchLeaf` -> `dispatchSlot`; `prompt` events in `recordDelivery`/`recordFailure` with `visit`, `session`, `outcome`, `attempt`; `visit_start` on first observation of a leaf with no prior `visit_start`; `recordWait` at every `waiting`/`completed` exit via a local `end()` helper (deps -> `parked`/`prerequisite` + blocking slug, merge -> `merge_turn` + holder slug, all others -> `none`); `batch` event at batch record creation in `mergeTurn`.
- `src/next.ts` (follow-up, own commit): parked-dep wait is recorded *before* the existing fatal-deps refusal re-throws, keeping `picked` refusal behavior; only `recordWait` was added ahead of the throw.
- `src/pause.ts`: `repo_pause on|off` after `setPaused`, no slug.
- `src/park.ts`: one `wait parked`/`wait none` per leaf of a moved issue folder after the `renameSync` loop inside the lock.
- `tests/timing.test.ts` (new, committed red at planning): five tests, one per done-criterion.
- `docs/guide/files.md`: `## timings.jsonl` section; `src/AREA.md` + `tests/AREA.md`: one key-file bullet each (`src/AREA.md` stayed at the 40-line cap by folding two pairs).

## Worker returns folded in

- U1 `src/timing.ts`: commit `d0da7b8` (picked `21cfc12`).
- U2 `src/phase.ts`: commit `e731d10` (picked `216cbdc`).
- U3 `src/run-check.ts`: commit `3f9c845` (picked `42cabaf`); also verified `check events` tests green at pick.
- U4 `src/pause.ts`+`src/park.ts`: commit `e11a98c` (picked `fc5849f`).
- U5 `src/next.ts`: commit `4d8bf85` (picked `edf502c`) plus worker's `readTimings` failure-tolerance in `src/timing.ts`; A then reverted the worker's removal of `'parked'` from the fatal dep list (commit `2946c07`) — the wait is now recorded before the throw, preserving existing refusal semantics.
- U7 docs: commit `bb618d0` (picked `838343b`).

## Refresh

`git fetch origin` + `git rebase origin/main` at pass start: branch rebased cleanly onto `df88689` (prior head `c33c339` -> `aa2399b`). Second refresh after last unit: `Current branch timing-events is up to date`, no move.

## Proof

All runs on head `2946c07` (format-amended; earlier identical content at `3096b54`), base `df88689`, leaf worktree `/home/ivan/.akrogon/worktrees/akrogon/timing-events`.

| Check | Command | Result | Wall time |
|---|---|---|---|
| format | `checks.format` (resolved) | exit 0; prettier rewrote 2 files, folded into amend | ~1.6 s |
| typecheck | `checks.typecheck` | exit 0 | ~1.8 s |
| test_changed | `checks.test_changed` with `AKROGON_BASE=df88689` | 679 pass / 0 fail | 61 s (minutes) |
| test | `checks.test` | 848 pass / 0 fail | 81 s (minutes) |
| Criterion 1 | `bun test tests/timing.test.ts -t 'visit events'` | pass — full drive to `merged` records every `visit_start` (incl. initial `plan.synthesis` v0 and `check.review` v1), delivered `prompt` per routed slot per visit, one `seat_done` A `check.review` v0, `batch` with attempt/holder/members/built_on | in suite runs |
| Criterion 2 | `-t 'check events'` | pass — leaf scope, killed run leaves start-only, `worker` scope + `unit: 'u1'`, `base` scope via real `base-run` nesting `run-check`, `exit`/`duration_ms`/`log` on end | in suite runs |
| Criterion 3 | `-t 'attempt'` | pass — `attempt: 'att-9'` on both check events for a leaf inside a merge attempt | in suite runs |
| Criterion 4 | `-t 'waits'` | pass — `repo_pause on/off`; `wait parked` on park + `wait none` on unpark; `wait parked blocking=dep` recorded despite picked refusal; `wait prerequisite` after unpark; `merge_turn blocking=m1` + `wait none` after landing; repeated `next` adds no duplicate | in suite runs |
| Criterion 5 | `-t 'unwritable'` | pass — `timings.jsonl` as directory: prompt delivered, move commits, check exits child code; exactly 1 warning on move, 2 on check, ≥1 on dispatch | in suite runs |

Red-first evidence: `bun test tests/timing.test.ts` at `aa2399b` before implementation — 0 pass / 5 fail, all assertions failing on absent `issues/timings.jsonl` (recorded in plan.md).

## Known limitations

- `readTimings` warns and returns `[]` on any read failure (not only unwritable), so a corrupt `timings.jsonl` is invisible to writers and is timing-readout's detection job; loss detection against `log.jsonl` is the stated mechanism (A,B).
- `readTimings` failure tolerance means `recordWait`/`visit_start` in `next` can silently re-derive on an unreadable file; accepted under criterion 5's "outcome unchanged" requirement.
- `--holder` `run-check` fallback stays `scope: 'leaf'`, `slug: 'checkout'`, no `phase` — brief assigns it no scope and no criterion covers it.

## Unverified criteria

None. All five done-criteria are proven green above; `merge_checks` is `{}` and the brief names no whole-suite requirement beyond the `checks` commands run.
