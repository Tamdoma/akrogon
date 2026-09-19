# Brief 1: shell error decoding, state field, commitMove clearing

## 1. Goal

Land the foundations for one-attempt-per-pass: `herdrError` decoding in `src/shell.ts`, the `agent_session.kind` field, the `delivery_error` state field in `src/state.ts`, and `commitMove` clearing it in `src/phase.ts`. Plan decisions D3, D4, D5, D9.

## 2. Acceptance criteria

1. `herdrError(result)` returns `{ code, message }` from a stderr JSON `{"error":{"code","message"}}`; for anything else it returns `{ code: 'exit <status>', message: <stderr trimmed, at most 500 chars> }`. `retryable` uses `herdrError` and still returns true only for the existing retryable codes; a non-JSON stderr yields `retryable === false` without throwing (regression: unguarded JSON.parse used to surface SyntaxError).
2. `paneSchema.agent_session` parses `{ kind: 'id' | 'path', value: string }`; `kind` is required when `agent_session` is present.
3. `stateSchema` accepts `delivery_error` per slot with strict shape `{ command: string[], code: string, message: string, pane: string, session: string | null, at: string, offset?: int >= 0 }`, defaults to `{}`, and a legacy state.yaml without the field parses unchanged.
4. `commitMove` writes `delivery_error: {}` on every move: a leaf with `delivery_error.B` set, moved via `akrogon phase`, has the field empty afterward.
5. `bun test --changed` passes for the touched test files.

## 3. Read-first list

- `src/shell.ts` — `paneSchema` :73-82, `herdrErrorSchema`, `retryableCodes`, `retryable`, `Result`, `CommandError`.
- `src/state.ts` — `stateSchema`, `counts`, `readState`/`saveState`.
- `src/phase.ts` — `commitMove` (the `after` object).
- `tests/shell.test.ts`, `tests/state.test.ts`, `tests/phase.test.ts` — existing patterns to copy.
- `tests/helpers.ts` — `fixture`, `cli`, `leaf`, `yaml`.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

- `src/shell.ts`: export `herdrError(result: Result): { code: string; message: string }`; rewrite `retryable` to call it; add `kind: z.enum(['id', 'path'])` inside `agent_session`'s object.
- `src/state.ts`: add `deliveryErrorSchema` (strictObject per criterion 3) and `delivery_error: z.object({ A: deliveryErrorSchema.optional(), B: deliveryErrorSchema.optional() }).default({})` in `stateSchema`.
- `src/phase.ts`: add `delivery_error: {}` to the `after` object in `commitMove`.
- Tests: extend `tests/shell.test.ts` (herdrError structured/unstructured, retryable non-JSON), `tests/state.test.ts` (field default, strict shape, legacy absence), `tests/phase.test.ts` (move clears `delivery_error`; use existing phase-move test patterns).

## 5. Do-not, reasons and exceptions

- Do not touch `src/next.ts`, `src/status.ts`, `src/session-file.ts`, `tests/fake-herdr.ts`, or `tests/next.test.ts` — later briefs own them; premature edits collide with sequential workers.
- Do not change `retryableCodes` or the `{"error":{...}}` wire shape — herdr emits it verbatim; verified live.
- Do not make `kind` optional — the design requires it and fake herdr is updated in brief 2; optional would hide fixture drift.
- Do not add `delivery_error` clearing anywhere but `commitMove` — the design centralizes move-time clearing there.
- Do not weaken or remove existing tests; a conflict returns a mismatch with evidence, and the exception is a revised brief from B authorizing the change.

Restated: exclusions exist to keep worker scopes disjoint and the wire contract exact; the only exception is a revised brief from B.

## 6. Ordered steps

1. `tests/shell.test.ts`: add failing tests for `herdrError` (structured code/message; non-JSON stderr → `exit <status>` + trimmed stderr; >500-char stderr truncated) and `retryable` on non-JSON stderr (false, no throw). Red.
2. `src/shell.ts`: implement `herdrError`, rewire `retryable`, add `kind`. Green.
3. `tests/state.test.ts`: failing tests for `delivery_error` default, strict shape (extra key rejected), and legacy absence. Red.
4. `src/state.ts`: add the field. Green.
5. `tests/phase.test.ts`: failing test that a `phase` move clears `delivery_error` (set it via `saveState`, run `cli(f, ['phase', ...])`, read state back). Red.
6. `src/phase.ts`: add `delivery_error: {}` to `after`. Green.

Advisory size: about 6 files, under 40 turns.

## 7. Commands

`: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"` with `AKROGON_BASE=92eb1cf4c2ba293f87234facc2643ddf8d79e090` exported.

## 8. Done-when, evidence and report

All criteria green under the changed-tests command; pasted results. For akrogon command work, scenarios use temporary repositories, real files/processes and herdr/gh replaced at one boundary, with no real panes, install roots, GitHub or herdr socket; tests need an observable contract or observed defect, not coverage or wording except literal commands, numbers and fixed references.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
