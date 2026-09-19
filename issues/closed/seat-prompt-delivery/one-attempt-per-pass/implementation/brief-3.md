# Brief 3: session-file module and one-attempt dispatchSlot

## 1. Goal

Implement the core leaf: new `src/session-file.ts`, and `dispatchSlot` in `src/next.ts` rewritten straight-line — one `agent start` and one `agent prompt` per pass, `delivery_error` recording, attempt charging on failure only, timeout settlement against the pi session file, unreachable-fail without throwing. Plan decisions D1, D2, D6, D7, D8, D12.

## 2. Acceptance criteria

1. A retryable prompt failure (e.g. `agent_prompt_stalled`) charges `attempts.B` 0→1, records `delivery_error.B` with `{ command, code, message, pane, session, at }`, sets no `prompted.B`, and the fake herdr received exactly one `agent prompt` call that pass.
2. Three consecutive failing passes move the leaf to `failed` during the third pass: `failure.cause === 'attempts'`, `failure.slot === 'B'`, reason `prompt undelivered to seat B after 3 passes: <code> <message> (pane <id>, session <ref>)`. A success between failures resets `attempts.B` to 0. A pass that starts the agent then observes it not idle charges nothing.
3. Timeout settlement under a temporary `HOME`: a `timeout` failure with an exact-text user record appended after the pre-send offset records `prompted.B` and no error; the same text only before the offset, or only inside an assistant/tool record, records `delivery_error.B` with `offset`; an incomplete trailing line is ignored without discarding earlier records; a record appended after the timeout is recognized by the next pass before any resend; a `path`-kind reference is read directly; a missing file counts as absent (timeout recorded as plain error, no offset).
4. A pane with no agent whose `agent start` fails retryable charges one attempt, records `delivery_error`, and returns without an `agent prompt` call; the next pass with a healthy fake starts and prompts.
5. A non-retryable herdr code, non-JSON stderr, and a malformed JSON error object on prompt each move the leaf to `failed` with reason starting `seat B unreachable:`, do not throw, and a second eligible leaf in the same pass is still dispatched. Unstructured failure yields code `exit <status>` and trimmed stderr as message.
6. A successful prompt clears `delivery_error` and resets `attempts` for that slot.
7. Existing `tests/next.test.ts` assertions on the old pre-charge semantics are updated: successful prompts leave `attempts` at 0; `next resumes interrupted tab creation…` and `a stale prompt never re-prompts…` are rewritten so failure comes from three failing passes, not three sends in one pass; `next waits on a blocked agent…` charges nothing for start-then-blocked.
8. `bun test --changed` passes.

## 3. Read-first list

- `src/next.ts` — `dispatchSlot` :348-428 (the `while (true)` body), `observeBusy`, `PROMPT_GRACE_MS` :178, `launch`, `currentPane`.
- `src/shell.ts` — `herdrError`, `retryable`, `paneSchema.agent_session` (has `kind`), `run`, `Result`.
- `src/state.ts` — `delivery_error` field (landed), `readState`/`saveState`.
- `src/phase.ts` — `commitMove` signature.
- `src/routing.ts` — `routing[phase].skill`.
- `tests/next.test.ts` — `dispatchFixture`, `database`/`saveDatabase`/`calls`, `nextAt`, `skips`; tests named in criterion 7.
- `tests/fake-herdr.ts` — `startScript`/`promptScript`/`append` (landed).
- `tests/helpers.ts` — `cli(f, args, cwd, env)` env parameter :33-42.
- Live pi session record shape (verified): `{"type":"message","message":{"role":"user","content":[{"type":"text","text":...}]}}`; session files live at `$HOME/.pi/agent/sessions/<dir>/<ts>_<id>.jsonl`.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

- `src/session-file.ts` (new, pure over injected root):
  - `sessionFile(ref: { kind: 'id' | 'path'; value: string }, home: string): string | undefined` — `path` → value; `id` → single match of `<home>/.pi/agent/sessions/*/*_<id>.jsonl`, zero or several → undefined.
  - `deliveredAfter(file: string, offset: number, text: string): boolean` — parse complete JSONL lines past `offset`, ignore a trailing partial line, true when a `type: 'message'` record has `message.role === 'user'` and `message.content` contains `{ type: 'text', text }` equal to `text`. Missing file → false.
- `src/next.ts` `dispatchSlot`, straight-line order:
  1. `readState`; return if `phase` moved or `done` includes slot.
  2. `currentPane` + `observeBusy`; return if `pane.agent !== null && busy(pane)`.
  3. Grace check unchanged (agent non-null, `prompted[slot]` set, `agent_session?.value === prompted[slot]`, within `PROMPT_GRACE_MS`).
  4. If `delivery_error[slot]?.offset !== undefined`: resolve file from live `pane.agent_session` via `sessionFile(ref, process.env.HOME)`; if `deliveredAfter(file, offset, prompt)` → record prompted/prompted_at, clear `delivery_error[slot]`, `attempts[slot] = 0`, save, return. Otherwise fall through to resend. (`prompt` string is computed before this step.)
  5. If `pane.agent === null`: one `agent start` (unchanged argv). Failure → `herdrError(started)`; retryable → record `delivery_error` (no offset), charge, maybe-fail, return; else unreachable-fail, return.
  6. `currentPane` + `observeBusy`; `!idle(ready)` → return without charging.
  7. Resolve session file from `ready.agent_session`; record byte length when resolvable.
  8. One `agent prompt --wait --until working --timeout 5000` (unchanged args).
  9. Success → existing prompted/prompted_at write plus `delivery_error[slot] = undefined`, `attempts[slot] = 0`; return.
  10. Failure → `herdrError(result)`:
      - `code === 'timeout'` and file resolvable → `deliveredAfter(file, offset, prompt)`; found = same as success; not found = record `delivery_error` **with** `offset`, charge, maybe-fail.
      - `code === 'timeout'` unresolvable, or other retryable code → record `delivery_error` (no offset), charge, maybe-fail.
      - non-retryable → unreachable-fail.
- "Charge, maybe-fail": `attempts[slot] += 1`; at 3, `commitMove(repo, leaf, next, 'failed', slot, { cause: 'attempts', phase: state.phase, slot, reason: 'prompt undelivered to seat <slot> after 3 passes: <code> <message> (pane <pane>, session <session>)' })` in the same pass, reason built from the error just recorded.
- "Unreachable-fail": `commitMove(repo, leaf, state, 'failed', slot, { cause: 'attempts', phase: state.phase, slot, reason: 'seat <slot> unreachable: <code> <message> (pane <pane>)' })`; no `delivery_error` write, no charge, no throw.
- Remove: `while (true)`, the `attempts >= 3` top check, the pre-charge `saveState`, both `console.warn` calls, both `throw new CommandError` paths inside the loop.
- `delivery_error` record: `{ command: <full argv incl. 'herdr'>, code, message, pane: pane.pane_id, session: pane.agent_session?.value ?? null, at: new Date().toISOString(), offset? }`.
- `tests/next.test.ts`: new tests per criteria 1-6; rewrites per criterion 7. Timeout tests pass `HOME` via `cli` env and point `agent_session` at `{ kind: 'path', value: <file> }` via `saveDatabase`; `promptScript` `append` controls post-offset content.

## 5. Do-not, reasons and exceptions

- Do not change `observeBusy`, `PROMPT_GRACE_MS`, `launch`, `allocate`, `dispatchLeaf`, `src/log.ts`, `src/status.ts`, `plugin/herdr-plugin.toml` — design exclusions; status is brief 4.
- Do not keep any resend loop, sleep, or pre-charge — locked operator decision (one attempt per pass, charge on failure only).
- Do not store a resolved path in `delivery_error.session` — it stores the reported reference value; re-settlement resolves from the live pane each pass.
- Do not throw on any start/prompt failure — the pass must continue with other leaves; `CommandError` from `currentPane`/`panes` still propagates as today.
- Do not weaken existing tests to make them pass — rewrite only what criterion 7 names; a conflict returns a mismatch with evidence, and the exception is a revised brief from B authorizing the change.

Restated: exclusions preserve the locked scope and disjoint worker ownership; the only exception is a revised brief from B.

## 6. Ordered steps

1. `src/session-file.ts`: implement both functions (small, pure; `readdirSync`/`readFileSync`/`statSync`).
2. `tests/next.test.ts`: write the new failing tests for criteria 1-6 first (red against the old loop where observable — e.g. one-prompt-per-pass fails red because the loop sends three).
3. `src/next.ts`: rewrite `dispatchSlot` per section 4. Green.
4. Rewrite the criterion-7 tests to the new semantics.
5. Run the changed-tests command; repair within this brief's scope only.

Advisory size: about 3 files, under 60 turns.

## 7. Commands

`: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"` with `AKROGON_BASE=92eb1cf4c2ba293f87234facc2643ddf8d79e090` exported.

## 8. Done-when, evidence and report

All criteria green under the changed-tests command; pasted results. For akrogon command work, scenarios use temporary repositories, real files/processes and herdr/gh replaced at one boundary, with no real panes, install roots, GitHub or herdr socket; tests need an observable contract or observed defect, not coverage or wording except literal commands, numbers and fixed references.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
