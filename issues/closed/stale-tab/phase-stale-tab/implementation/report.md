# Implementation report: phase-stale-tab

Base: `69038ef023a8434104bb9c6335f79daa1a6c2377` (`add issues`)
Head: `0170deb` (`format: prettier after renameTab changes`)

## Changes

Delegated mode, one unit, worker commit `8d9ede872cd154e0bf288f2bc860c9f384989c92` cherry-picked as `0d86998`; report: `implementation/report-u1.md`, brief: `implementation/brief-1.md`.

- `src/phase.ts`: new `renameTab(tab, label, slug)` helper calls `herdrCall(['tab','rename',tab,label], ...)`; on `CommandError` with `herdrError(error.result).code === 'tab_not_found'` it emits one `console.warn` JSON line (`warning`, `slug`, `command`, `code`, `message`, `stderr`) and returns, else rethrows. Both rename sites (`announceFailed`, `commitMove` resume path) now use it (D1–D5). `herdrCall` untouched: `tab_not_found` is not retryable so no retry occurs; swallowed errors never assign `lastError`.
- `tests/fake-herdr.ts`: `renameScript` fixture entry consumed via `scriptedFailure` in the `tab rename` handler, after the unknown-tab `tab_not_found` check (D6).
- `tests/phase.test.ts`: new parameterized block `rename on a missing tab warns once and continues` (three cases covering criteria 1–3) plus a `fixture_rename_denied` test via `renameScript` (criterion 4).

## Criterion proof

| Criterion | Proof | Result |
|---|---|---|
| 1 (leave `failed`, stale tab: exit 0, no retry, warning fields, `state.tab` unchanged, one log row) | parameterized test, `failed → implement` case in `tests/phase.test.ts` | pass |
| 2 (enter `failed`, stale tab: exit 0, `delivery: shown`, warning, log row) | `implement → failed` clean case | pass |
| 3 (stale tab + failing notification: non-zero exit, notification error, `delivery: error`) | `implement → failed` with `failNotification` case | pass |
| 4 (other codes keep today's handling; retryable retried once) | `fixture_rename_denied` via `renameScript` asserts non-zero exit and one call; existing `failRename` (`timeout`) tests assert two calls and non-zero | pass |
| 5 (`bun run format`, `bun run typecheck`, `bun test --timeout=30000`) | all three run, below | pass |

New tests were verified red before the `src/phase.ts` change.

## Commands run

- `bun install` (worker worktree) — seconds
- `bun test tests/phase.test.ts --timeout=30000` — 48 pass, 0 fail (worker)
- `AKROGON_BASE=69038ef… bun test --changed="$AKROGON_BASE" --timeout=30000` (worker + lane after cherry-pick) — 48 pass, 0 fail
- `bun run format` — clean; reformatted the worker's lines, committed as `0170deb`
- `bun run typecheck` — clean
- `bun test --timeout=30000` — 399 pass, 0 fail, 18 files, ~12 s

All commands sized seconds/minutes; none are slow or live runs.

## Docs

None affected: `src/AREA.md`, `tests/AREA.md`, `README.md` and `docs/` contain no stale-tab rename statement (verified by grep).

## Known limitations

A rename failure for any reason other than `tab_not_found` still fails the move (design intent). Tabs are never recreated and `state.tab` is never cleared; `akrogon next` owns re-allocation.

## Unverified criteria

None.

## Operator blockers

None. `akrogon status phase-stale-tab` reports no `Missing:` entries; readiness declares no `produces` or `grants`.
