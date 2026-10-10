# Report: fix-red-base-tests

## What landed

Three commits on `fix-red-base-tests`, all under `tests/`:

- `08698c5` — `tests/fake-herdr.ts`: added `agent list` handler returning `{result:{agents:[...]}}`, one entry per pane with `agent !== null`, `agent_session` passed through only when set (worker commit `2a7318d`).
- `eaca512` — `tests/fake-herdr.ts` + `tests/peer-wait.test.ts`: `agent wait` now honors `--until` (miss sleeps `--timeout` and emits the herdr timeout error; hit succeeds); the two failure tests' budgets `'10'`→`'12'` (worker commit `6ee8201`).
- `82b79cc` — `tests/dependents-first.test.ts`: `toBe(1)`→`toBe(0)` plus stdout assertions for `waiting: d1 on many (plan.synthesis)` and `waiting: d2 on d1 (plan.synthesis)` (worker commit `122d5db`).

## Deviation from plan

Worker U1 returned a mismatch after the `agent list` handler: two failure tests could never reach `failure`. f3199df replaced the immediate `idle/done` → `failure` finish with a 10 s grace wait (`agent wait --until working`); `failure` requires `graceMs === IDLE_GRACE_MS`, impossible at budget 10 s, and the fake's `agent wait` ignored `--until`, returning instant success on a non-working pane (`resumedWorking` always true). Fixed inside `tests/`: `--until` semantics added to the fixture's `agent wait`, and the two budgets raised to 12 s. No `src/`/`skills/`/`docs/` change.

## Evidence

| Criterion | Proof | Result |
|---|---|---|
| 1 peer-wait reaches all four outcomes, no `Unexpected fixture invocation` | `bun test tests/peer-wait.test.ts --timeout=30000` | 9 pass / 0 fail: done×2, blocked, failure×2 (~10 s each via the grace wait), budget×2, pass-through, arg validation |
| 2 `next --all` ordering, `waiting:` lines, exit 0 | `bun test tests/dependents-first.test.ts --timeout=30000` | 4 pass / 0 fail, incl. exit 0 and both `waiting:` lines |
| 3 diff only under `tests/` | `git diff --name-only f3199df..HEAD` | `tests/fake-herdr.ts`, `tests/peer-wait.test.ts`, `tests/dependents-first.test.ts` only |

## Checks run

- `bun run typecheck` — clean.
- `bun run format` — prettier rewrote unrelated `skills/chart-issues/scripts/peer-wait.ts` and `src/status.ts` (pre-existing drift per the 2026-10-08 lesson); both reverted, diff stays tests-only.
- `bun test --timeout=30000` — 663 pass / 0 fail across 33 files (wall ~1m07s; log: `implementation/full-test.log`). Base suite red at f3199df is now green.
- `bun test --changed="$AKROGON_BASE" --timeout=30000` — 13 pass / 0 fail across the 2 changed test files.

## Base / head

- Base `AKROGON_BASE`: `f3199df89b25b4f215df04f8703ef6d71880cd6a`
- Committed head: `82b79cc`

## Known limitations

None known. The `--until` fixture path sleeps the full timeout before failing (real herdr would also return early on a status change); the fixture DB is static mid-call, so early-return cannot be observed and the sleep is the faithful emulation.

## Unverified criteria

None.
