# Implementation report: one-attempt-per-pass

Base: `92eb1cf4c2ba293f87234facc2643ddf8d79e090` — Head: `e09a2d9` on branch `one-attempt-per-pass`.

## Changed files and reasons

- `src/next.ts` — `dispatchSlot` rewritten straight-line (D1, D2, D7, D8): one `agent start` and one `agent prompt` per pass; `delivery_error` recorded on retryable failure; attempts charged on failure only; third consecutive failure fails in-pass; timeout settles against the seat session file; non-retryable/unstructured failure fails `seat <slot> unreachable:` without throwing. Three local helpers (`recordDelivery`, `recordFailure`, `unreachable`) deduplicate the repeated blocks from the worker draft.
- `src/session-file.ts` (new, D6) — `sessionFile` resolves `path`/`id` references under `$HOME/.pi/agent/sessions`; `deliveredAfter` finds an exact-text user record past a byte offset, ignoring a trailing partial line.
- `src/shell.ts` (D4, D5) — `herdrError` decodes `{error:{code,message}}` or maps unstructured stderr to `exit <status>` + trimmed stderr (≤500 chars); `retryable` reuses it; `agent_session` requires `kind: 'id' | 'path'`.
- `src/state.ts` (D3) — `delivery_error` strict per-slot field, default `{}`.
- `src/phase.ts` (D9) — `commitMove` clears `delivery_error` on every move.
- `src/status.ts` (D10) — `<slot> prompt <code>` NOTE token per slot with `delivery_error` and no `busy_since`, after `done`.
- `tests/fake-herdr.ts` (D11) — `startScript`/`promptScript` per-call failures (structured or raw stderr), `append` to path-kind session files, `kind: 'id'` on start.
- `tests/next.test.ts` — 17 new tests for criteria 1-6; rewrites for the new charge-on-failure semantics (D12).
- `tests/shell.test.ts`, `tests/state.test.ts`, `tests/phase.test.ts`, `tests/status.test.ts` — coverage for the new surfaces.
- `docs/reference-index.md`, `src/AREA.md` (D13) — one-attempt rule and timeout settlement.

Worker sub-briefs and returns: `implementation/brief-1..4.md`, `implementation-report-1..4.md` in this folder.

## Commands run

- `bun test --changed="$AKROGON_BASE"` (AKROGON_BASE=92eb1cf…) — 266 pass, 0 fail, 11 files.
- `bun test` — 270 pass, 0 fail, 12 files, ~65s.
- `bun run typecheck` — clean.
- `bun run format` — clean.

## Known limitations

- Settlement assumes pi's session format; an unresolvable or non-pi reference records the `timeout` as a plain error (design).
- A late-arriving record is recognized only when a later pass runs; nothing fires that pass automatically (locked).
- `delivery_error.session` stores the reported reference value, not a resolved path.

## Unverified criteria

None. All brief done-criteria 1-8 are covered by tests in the suite above.
