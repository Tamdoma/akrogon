# Brief 2: fake-herdr scripted failures and session-file support

## 1. Goal

Extend `tests/fake-herdr.ts` so later briefs can script per-call failures on `agent start` and `agent prompt`, emit `agent_session.kind`, and append controlled lines to a pane's `kind: 'path'` session file. Plan decision D11 and its Implementation note.

## 2. Acceptance criteria

1. `databaseSchema` gains `startScript` and `promptScript`, each `z.array(...).default([])`. Each `agent start`/`agent prompt` call shifts one entry; an empty script behaves exactly as today.
2. A script entry `{ code, message }` writes `{"error":{"code","message"}}` to stderr and exits 1. An entry `{ stderr }` writes the raw text to stderr and exits 1. Both still append to `.calls` and save the db.
3. A `promptScript` entry may carry `append`: when the pane's `agent_session.kind === 'path'`, the raw line is appended to that file before the exit, on success and on failure.
4. `agent start` emits `agent_session: { kind: 'id', value: 'session-N' }` (was `{ value }` only).
5. Existing fixture behavior is unchanged when scripts are empty: `failPrompts`, `blockOnStart`, `failSplitOnce`, pane/tab/workspace handlers all work as before.
6. `bun test --changed` passes; existing `tests/next.test.ts` tests that construct panes with `agent_session` are updated to include `kind` so they still parse (minimal edits only where the schema now requires it — `tests/next.test.ts:236` `{ value: 'other' }` → `{ kind: 'id', value: 'other' }`, and :1492 if it lacks `kind`).

## 3. Read-first list

- `tests/fake-herdr.ts` — whole file; `databaseSchema`, `failure()`, `result()`, `agent start` and `agent prompt` handlers.
- `tests/helpers.ts` — `fakeHerdr` db seed (must still parse under the extended schema).
- `tests/next.test.ts` — `database`/`saveDatabase`/`calls` helpers and the two `agent_session` literals above.
- `src/shell.ts` — `paneSchema.agent_session` now requires `kind` (brief 1 landed it).
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

- `tests/fake-herdr.ts`: add `scriptEntrySchema = z.object({ code: z.string().optional(), message: z.string().optional(), stderr: z.string().optional(), append: z.string().optional() })` (or equivalent); `startScript`/`promptScript` fields; consume-and-apply logic in both handlers; `kind: 'id'` on start's `agent_session`; append support on prompt.
- `tests/next.test.ts`: add `kind` to the two `agent_session` literals only.
- No `src/` changes.

## 5. Do-not, reasons and exceptions

- Do not change `src/` files — briefs 1, 3, 4 own them.
- Do not change the `.calls` append or `prompts`/`starts` recording — dispatch tests count them.
- Do not make scripts global flags like `failPrompts` — per-call ordering is the point; keep `failPrompts` working for existing tests.
- Do not rewrite `tests/next.test.ts` attempts assertions — brief 3 owns the semantic rewrite; only the `kind` literals are touched here.
- A conflict returns a mismatch with evidence; the exception is a revised brief from B authorizing the change.

Restated: exclusions keep this a pure fixture extension; the only exception is a revised brief from B.

## 6. Ordered steps

1. Extend `databaseSchema` with `startScript`, `promptScript`, and the entry schema.
2. `agent start`: consume `startScript`; on entry, emit structured or raw stderr and exit 1 before mutating the pane; on success emit `agent_session` with `kind: 'id'`.
3. `agent prompt`: consume `promptScript`; if `append` is set and the pane's `agent_session.kind === 'path'`, append the line to that file; then apply the scripted failure or the success path.
4. Update the two `agent_session` literals in `tests/next.test.ts`.
5. Run the changed-tests command; the fixture's own behavior is covered by existing next.test.ts tests still passing.

Advisory size: about 2 files, under 25 turns.

## 7. Commands

`: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"` with `AKROGON_BASE=92eb1cf4c2ba293f87234facc2643ddf8d79e090` exported.

## 8. Done-when, evidence and report

All criteria green under the changed-tests command; pasted results. For akrogon command work, scenarios use temporary repositories, real files/processes and herdr/gh replaced at one boundary, with no real panes, install roots, GitHub or herdr socket; tests need an observable contract or observed defect, not coverage or wording except literal commands, numbers and fixed references.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
