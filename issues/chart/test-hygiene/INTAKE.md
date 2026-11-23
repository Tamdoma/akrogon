# Intake: test-hygiene

## Scope

The watch-live standin cell passes on main, and akrogon test-unit slices stop with their test's own slice.

Covers: #150, #149 P12. Opening map and picks: issues/chart/lean-akrogon/slots/map-merged.md (with map-B.md, map-C.md, rebuttal-B.md, rebuttal-C.md, history-reversals.md).

## Provenance

- GitHub: Tamdoma/akrogon#150
- Operator: /chart-issues 2026-11-22T17:54Z, verbatim in issues/chart/lean-akrogon/INTAKE.md

## Source: Tamdoma/akrogon#150

# watch-live standin cell red on base: timer never sends due=3 behind the due=2 hold (head and base both fail)

Source: Tamdoma/akrogon#150
URL: https://github.com/Tamdoma/akrogon/issues/150

Origin repo: Tamdoma/akrogon

Unverified intake.

## Observation

`watch standin cell: criteria 1-9 and 12 end to end` in `tests/e2e/watch-live.e2e.ts` fails: the
standin watcher never receives the `due=3` tick line. The timer screen shows `due=2` held
behind a busy watcher (`hold due=2: watcher working`), then `due=4` onward sent; `due=3 sent`
never appears, so `sentTurn(tier, timer, 3, ...)` throws after its window. The free standin
cell otherwise runs end to end — this is a tick-drop flake/bug in the cell or the timer
script, not an environment problem.

## Location

`tests/e2e/watch-live.e2e.ts` (test 'watch standin cell', `sentTurn` helper at line ~263 and
the held-tick block near line 836), exercised with
`AKROGON_E2E=watch-live AKROGON_E2E_KIND=standin AKROGON_E2E_SHAPE=root WATCH_TICK_SECONDS=10
bun test ./tests/e2e/watch-live.e2e.ts --test-name-pattern 'standin'`.

## Reproduction

Seen on head `f3181752` (leaf `ai-budgets/budget-rules` implement pass) and on base
`d8957dad` (AKROGON_BASE) in a detached worktree: three consecutive runs, all red with the
same `due=3` gap. Failing excerpt (head run): `hold due=2: watcher working` then
`due=4 sent` … `due=13 sent`, no `due=3 sent`; error `timer screen has no due=3 sent line`.

Kept logs (leaf `issues/open/ai-budgets/budget-rules/implementation/`):
- head run 1: `check-c4-wlive-standin-root-1795366960312-449033.log`
- head retry (same command, same result): `check-c4-wlive-standin-root-r2-1795367111823-660859.log`
- base run at `d8957dad` (same result): `check-c4-standin-base-1795367369277-1123062.log`

## Expected behavior

The held tick runs once after the busy check and `due=3` is sent exactly once, or the cell's
wait matches the timer's drop behavior. On the failing path the run shows one of: `due=3
dropped` or `due=3 sent` — the screen showed neither.

## Urgency

Blocks any leaf that needs a green watch-live standin cell as criterion proof on this base.
Workaround: none known; the same command is red on head and base.

## Suspected cause

`timer.ts` drops or skips the `due=3` tick while the `due=2` hold is still resolving — the
hold screen shows `due=2` still working when `due=3` is due, and no drop line is emitted, so
the tick may be lost silently rather than reported. No supported hypothesis beyond that;
`tests/e2e/watch-live.e2e.ts` and `skills/watch-issues/scripts/timer.ts` read. Agent view.
Related reports: none found (searched Tamdoma/akrogon open issues for "watch-live",
"standin").


## Agent findings (A, 2026-11-22, agy door-reset flake)

- `agy: the reset helper runs its stages in order…` (tests/door-reset.test.ts:270) failed 15 times and blocked direct verifies on k1 and land-own-reds. The helper log holds only `started`. No `wait-turn-end` stop line is written, so the helper threw after skills/chart-issues/scripts/door-reset.ts:86, most likely src/hc.ts:477 `event stream ended` in waitFor. Its stderr is not kept, so the cause is unproven. 6/6 passes when run alone, so it fails only under full-suite load. The first step is to make the helper write an uncaught error to its log.
