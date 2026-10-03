# Plan: phase-stale-tab

Debate is off (`debate: "no"`); this synthesis derives directly from `brief.md` and `design.md`.

## Decisions

- D1: A `tab_not_found` result from `herdr tab rename` at either rename site in `src/phase.ts` is downgraded to one structured `console.warn` JSON line and the command continues. Detection is `error instanceof CommandError && herdrError(error.result).code === 'tab_not_found'`. `tab_not_found` is absent from `retryableCodes`, so `herdrCall` throws it on the first call and there is no retry.
- D2: The warning object follows `herdrCall`'s retry-warning style: `{ warning, slug, command: ['herdr', ...args], code, message, stderr }` with `code` and `message` taken from `herdrError(error.result)` and `stderr` from `error.result.stderr`. Tests assert the fields, not the prose.
- D3: In `announceFailed`, a swallowed `tab_not_found` never overwrites `lastError`, so an earlier notification failure still exits non-zero with `failure.delivery: 'error'`. In `commitMove`, the rename `tab_not_found` is swallowed before `logMove` in the `finally`, so the move still exits 0 and the log row is appended.
- D4: `state.tab` is not cleared and no tab is recreated; `src/next.ts` owns allocation. `retryableCodes` and every non-`tab_not_found` error keep today's handling.
- D5: Shared detection + swallow lives in one place: a `renameTab` helper in `src/phase.ts` that calls `herdrCall(['tab', 'rename', tab, label], z.object({ tab: z.object({ label: z.string() }) }), slug)` inside a targeted `try/catch`, warns per D2 on `tab_not_found`, and rethrows everything else. `herdrCall` itself is untouched so the notification call and all other herdr callers keep identical behavior. Both rename call sites call `renameTab`.
- D6: `tests/fake-herdr.ts` gains a `renameScript` entry (array of `scriptEntrySchema`, consumed like `startScript`/`promptScript`) so a rename can fail with a specific non-retryable code. Its existing `tab_not_found` answer for unknown tabs is unchanged.
- D7: Proofs are CLI fixtures in `tests/phase.test.ts` against `tests/fake-herdr.ts` asserting exit code, saved state, `issues/log.jsonl`, `herdrCalls`, and the parsed warning fields. No `merge_checks` or extra whole-suite requirement is added.

## Read-first list

- `src/phase.ts` (`herdrCall`, `announceFailed`, `commitMove`), `src/shell.ts` (`CommandError`, `herdrError`, `retryable`, `herdr`), `src/log.ts` (`logMove` pane lookup), `tests/phase.test.ts` (existing `failRename`/`failNotification` blocks near line 1200–1350, `herdrCalls` helper), `tests/fake-herdr.ts` (`scriptEntrySchema`, `tab rename` handler), `tests/helpers.ts` (`fixture`, `cli`, `leaf`, `fakeHerdr`).

## Needed interfaces

- Real herdr 0.9.3 on unknown tab: stderr `{"error":{"code":"tab_not_found","message":"tab <tab> not found"},"id":"cli:tab:rename"}`, exit 1 (proven in `readiness.yaml`).
- `CommandError.result` carries `{ code, stdout, stderr }`; `herdrError(result)` returns `{ code, message }` from that stderr JSON.
- `State.tab?: string`; `failure.delivery` is `'shown'` or `'error'`.

## File / criterion checklist

### Wave 1

- U1: `src/phase.ts`, `tests/fake-herdr.ts`, `tests/phase.test.ts` — implement D1–D5 and the criterion tests below. One unit owns all touched paths; no other unit exists, so there is no second wave.
  - Owned paths: `src/phase.ts`, `tests/fake-herdr.ts`, `tests/phase.test.ts`.
  - Shared test resource: none (fixtures are per-test temp dirs).
  - Depends on: none.

### Tests to land

- T1 (criterion 1): leaf `failed` with `tab: 'tab-1'` and fake herdr `tabs: []`; `phase <slug> implement`. Assert `code === 0`, `phase === 'implement'`, `state.tab === 'tab-1'`, `herdrCalls` is exactly `[['tab','rename','tab-1','<slug>']]`, `issues/log.jsonl` has one row, and `stderr` parsed as JSON lines contains exactly one object with `code: 'tab_not_found'`, `command: ['herdr','tab','rename','tab-1','<slug>']`, `slug`, herdr's `message`, and `stderr` set.
- T2 (criterion 2): leaf `implement` with `tab: 'tab-1'` and `tabs: []`; `phase <slug> failed --slot A --reason x`. Assert `code === 0`, `failure.delivery === 'shown'`, calls include `notification show` once and exactly one rename, the same warning shape, and one log row.
- T3 (criterion 3): same as T2 plus `failNotification: true`. Assert `code !== 0`, `stderr` carries the notification error, `failure.delivery === 'error'`, and one rename call.
- T4 (criterion 4, non-retryable): `renameScript: [{ code: 'fixture_rename_denied', message: 'denied' }]` with a live `tab-1` on a `failed` leaf; `phase <slug> implement`. Assert `code !== 0`, `stderr` contains `fixture_rename_denied`, and exactly one rename call (no retry). The existing `failRename` (`timeout`) tests asserting two calls and non-zero exit stay green unchanged.

### Docs

No agent or human doc changes: `src/AREA.md`, `tests/AREA.md`, `README.md`, and `docs/` contain no statement about stale-tab rename handling.

## Verification

| Criterion | Proof command | Failure it catches | Size | Rerun trigger |
|---|---|---|---|---|
| 1 | `bun test tests/phase.test.ts` (T1) | Exit non-zero, retry on `tab_not_found`, `state.tab` mutated, warning fields missing | seconds | Any `src/phase.ts` change |
| 2 | `bun test tests/phase.test.ts` (T2) | Swallow missing at `announceFailed`; `delivery` wrong; warning shape wrong | seconds | Any `src/phase.ts` change |
| 3 | `bun test tests/phase.test.ts` (T3) | Stale-tab warning overwriting the notification `lastError` | seconds | `announceFailed` change |
| 4 | `bun test tests/phase.test.ts` (T4 + existing `failRename` blocks) | `tab_not_found` check swallowing other codes; retry semantics changed | seconds | `herdrCall`/rename-site change |
| 5 | `bun run format && bun run typecheck && bun test --timeout=30000` | Format, types, regressions across the suite | minutes | Every implementation commit |

## Open limitations

A rename raced against a tab that exists but errors for another reason still fails the move (design intent). Tabs are never recreated and `state.tab` is never cleared here.

## Operator blockers

None. `readiness.yaml` declares no `produces` or `grants`, and `akrogon status phase-stale-tab` reports no `Missing:` entries.
