# Plan: one-attempt-per-pass

Debate off (`debate: "no"`); synthesized directly from brief and design.

Note for review: the brief's done-criteria text is interleaved (criterion 3 carries session-file sentences, criterion 7 mixes status and session-file text). The design's split is coherent and wins; every brief behavior is covered below.

## Decisions

- D1: `dispatchSlot` (`src/next.ts:348-428`) loses `while (true)`. One pass performs at most one `herdr agent start` and at most one `herdr agent prompt`, then returns. No sleeps, no resend loop, no new trigger.
- D2: `attempts[slot]` is charged only on a failed delivery (start or prompt). The current pre-charge (`saveState` before `agent start`, :370-371) and the `attempts >= 3` top check (:362-369) are removed: the pass that records the third consecutive failure calls `commitMove(..., 'failed', slot, { cause: 'attempts', phase: state.phase, slot, reason })` in the same pass, reason `prompt undelivered to seat <slot> after 3 passes: <code> <message> (pane <pane>, session <session>)`. A successful prompt resets `attempts[slot]` to 0 and clears `delivery_error[slot]`.
- D3: New state field `delivery_error` in `src/state.ts`: `z.object({ A: deliveryErrorSchema.optional(), B: deliveryErrorSchema.optional() }).default({})` where `deliveryErrorSchema = z.strictObject({ command: z.array(z.string()), code: z.string(), message: z.string(), pane: z.string(), session: z.string().nullable(), at: z.string(), offset: z.number().int().nonnegative().optional() })`. `command` is the full argv including `herdr`; `session` is `pane.agent_session?.value ?? null`; `at` is ISO now; `offset` is set only for the timeout-settlement case.
- D4: `src/shell.ts` exports `herdrError(result: Result): { code: string; message: string }`: decode `{ error: { code, message } }` from stderr JSON via the existing `herdrErrorSchema`; anything else maps to `{ code: 'exit <status>', message: <stderr trimmed, at most 500 chars> }`. `retryable` reuses `herdrError` (fixes the recorded lesson: unguarded JSON.parse loses non-JSON stderr).
- D5: `paneSchema.agent_session` gains `kind: z.enum(['id', 'path'])` beside `value` (live herdr emits `{agent, kind, source, value}`; non-strict object already tolerates the rest). Fake herdr and test pane mutations must emit `kind`.
- D6: New `src/session-file.ts`, pure over injected root: `sessionFile(ref: { kind: 'id' | 'path'; value: string }, home: string): string | undefined` resolves `path` directly, `id` as the single match of `<home>/.pi/agent/sessions/*/*_<id>.jsonl` (zero or several matches → undefined); `deliveredAfter(file: string, offset: number, text: string): boolean` parses complete JSONL lines past `offset`, ignores a trailing partial line, returns true when a `type: 'message'` record has `message.role === 'user'` and text content equal to `text` (live record: `{"type":"message","message":{"role":"user","content":[{"type":"text","text":...}]}}`). `home` is `process.env.HOME`. A missing file counts as absent.
- D7: `dispatchSlot` order: read state → return if phase moved or slot done → `currentPane` + `observeBusy` → return if agent busy → grace check unchanged → if `delivery_error[slot]?.offset !== undefined`, re-run settlement from that offset; found records delivery (prompted, prompted_at, clear error, `attempts[slot] = 0`) and returns; not found or unresolvable falls through to resend → if `pane.agent === null`, one `agent start`; failure: `herdrError` retryable → record error, charge, maybe fail, return; otherwise unreachable-fail, return → re-observe (`currentPane` + `observeBusy`); not idle → return without charging → resolve session file, record byte length → one `agent prompt --wait --until working --timeout 5000` (unchanged args) → success: prompted, prompted_at, clear error, `attempts[slot] = 0`, return → failure by `herdrError`: code `timeout` with resolvable file → settlement, found = delivered, not found = record error with `offset`, charge, maybe fail; `timeout` unresolvable or other retryable code → record error (no offset), charge, maybe fail; non-retryable → unreachable-fail.
- D8: Unreachable-fail means `commitMove(..., 'failed', slot, { cause: 'attempts', phase: state.phase, slot, reason: 'seat <slot> unreachable: <code> <message> (pane <pane>)' })`. No `delivery_error` write, no charge (the move clears both), no throw — the pass continues with other leaves. `failure.cause` stays `attempts`; the reason text distinguishes the cases.
- D9: `commitMove` (`src/phase.ts`) adds `delivery_error: {}` to the `after` state so every move clears it; recovery out of `failed` restarts the phase for both seats as today.
- D10: `src/status.ts` `note` (:87-107): after the `done` tokens, one `<slot> prompt <code>` token per slot with a `delivery_error` whose `busy_since[slot]` is undefined, independent of the other seat's busy state. Legacy states default to `{}` and show nothing.
- D11: `tests/fake-herdr.ts`: scripted per-call failures for `agent start` and `agent prompt` — each call consumes a script entry carrying either a structured `{ code, message }` (emitted as `{"error":{...}}` on stderr) or raw stderr text; absent entry succeeds. `agent start` emits `agent_session` with `kind`; `agent prompt` can append a scripted raw line to the pane's `kind: 'path'` session file so tests control what lands after the pre-send offset. Tests pass a temporary `HOME` through the existing `cli(f, args, cwd, env)` parameter.
- D12: Existing tests asserting the old pre-charge semantics are updated, not preserved: successful prompts now leave `attempts` at 0 (`next dispatches…`, `next creates one worktree/tab…`, `operator pane`, `re-prompts an idle seat`, `prompted session still alive`, `delayed working…`, `exited hooks`, `blocked agent` — where start-then-blocked now charges nothing), and `next resumes interrupted tab creation…` / `a stale prompt never re-prompts…` are rewritten: three failing passes (not three sends in one pass) produce the failure, and stale re-prompts that succeed never fail the leaf.
- D13: Docs: `docs/reference-index.md` and `src/AREA.md` gain the one-attempt-per-pass rule and the timeout settlement; no change to `src/log.ts`, `observeBusy`, `PROMPT_GRACE_MS`, `plugin/herdr-plugin.toml`, or the failed announcement.

## Read-first

- `src/next.ts` — `dispatchSlot` :348-428, `observeBusy`, `PROMPT_GRACE_MS` :178.
- `src/shell.ts` — `paneSchema` :73-82, `herdrErrorSchema`, `retryable`, `run`, `CommandError`.
- `src/state.ts` — `stateSchema`, `counts`, `readState`/`saveState`.
- `src/phase.ts` — `commitMove`.
- `src/status.ts` — `note` :87-107.
- `src/routing.ts` — `routing`, `requiredSlots`.
- `tests/helpers.ts` — `cli` env parameter :33-42, `fixture`, `leaf`, `fakeHerdr`.
- `tests/fake-herdr.ts` — `databaseSchema`, `agent start`/`agent prompt` handlers.
- `tests/next.test.ts` — `dispatchFixture`, `database`/`saveDatabase`/`calls`, existing attempts assertions.
- `tests/status.test.ts`, `tests/state.test.ts`, `tests/shell.test.ts`.
- `docs/reference-index.md`, `src/AREA.md`.
- Live references: `~/.pi/agent/extensions/herdr-agent-state.ts:73-105` (session ref reporting); pi session JSONL shape verified on this seat's own session file.

## Interfaces

- `herdrError(result: Result): { code: string; message: string }` — `src/shell.ts`.
- `sessionFile(ref: { kind: 'id' | 'path'; value: string }, home: string): string | undefined` — `src/session-file.ts`.
- `deliveredAfter(file: string, offset: number, text: string): boolean` — `src/session-file.ts`.
- `delivery_error` state field per D3.
- Prompt text unchanged: `<skill> <slug> slot=<S> phase=<P> leaf=<folder>`; settlement equality is exact over records appended after the pre-send offset.
- Reason strings per D2/D8; `failure.cause` stays `attempts` for both.

## Ordered checklist

1. `src/shell.ts` — `herdrError` export, `retryable` reuses it, `agent_session.kind` (D4, D5). Criteria: shell tests decode structured and unstructured stderr.
2. `src/state.ts` — `delivery_error` field (D3). Criteria: default `{}`, legacy state parses, strict shape.
3. `src/session-file.ts` — new module (D6). Criteria: path/id resolution, exact-text user record after offset, before-offset and non-user records rejected, partial tail ignored, missing file absent.
4. `src/phase.ts` — `commitMove` clears `delivery_error` (D9). Criteria: move through `akrogon phase` clears it.
5. `src/next.ts` — straight-line `dispatchSlot` (D1, D2, D7, D8). Criteria: one start/prompt per pass; retryable failure records error + charges + returns; third consecutive failure fails in-pass with full reason; start failure skips the prompt; start-then-not-idle charges nothing; timeout settlement both directions; unreachable fails without throwing and siblings still dispatch; success clears error and resets attempts.
6. `src/status.ts` — `<slot> prompt <code>` note (D10). Criteria: per-slot token gated on own seat's `busy_since`, mixed busy seats, legacy absence.
7. `tests/fake-herdr.ts`, `tests/helpers.ts` — scripted failures, `kind`, session append, `HOME` env (D11).
8. `tests/next.test.ts`, `tests/state.test.ts`, `tests/status.test.ts`, `tests/shell.test.ts` — new coverage per brief criteria 1-7 plus D12 rewrites.
9. `docs/reference-index.md`, `src/AREA.md` — one-attempt rule and settlement (D13).

## Verification

- `bun test` — all new and rewritten tests pass.
- `bun run typecheck`, `bun run format` — clean.
- Concrete scenario replaying the incident: fake herdr answers `agent_prompt_stalled` on prompt; pass 1 records `delivery_error.B` and `attempts.B = 1` with exactly one prompt call; passes 2-3 repeat; pass 3 ends with `phase: failed`, `failure.cause: attempts`, reason naming code, pane and session — and no fourth prompt call.

## Implementation notes

2026-09-19, B seat:

- D11 script shape: `fake-herdr` gains `startScript` and `promptScript`, each an array consumed one entry per `agent start`/`agent prompt` call. An entry is `{ code, message }` (emitted as `{"error":{"code","message"}}` on stderr, exit 1) or `{ stderr }` (raw text on stderr, exit 1); a `promptScript` entry may also carry `append` (raw line appended to the pane's `kind: 'path'` session file before the exit, so tests control post-offset content). Empty script = success. `agent start` emits `agent_session: { kind: 'id', value: 'session-N' }`.
- D6 record shape: `deliveredAfter` matches a `type: 'message'` record whose `message.role === 'user'` and whose `message.content` contains an item `{ type: 'text', text }` equal to the prompt; verified against the live pi session file on this seat.
- D7 re-settlement resolves the session file from the live pane's `agent_session` each pass, not from `delivery_error.session` (which stores the reported reference value for diagnostics only).

## Open limitations

- Settlement assumes pi's session format; an unresolvable or non-pi session reference records the `timeout` as a plain error (design).
- A late-arriving record is only recognized when a later pass runs; nothing fires that pass automatically (locked: no watchers, no new triggers).
- `delivery_error.session` stores the reported reference value, not a resolved path; `id`-kind resolution depends on the `*_<id>.jsonl` layout under `HOME`.
