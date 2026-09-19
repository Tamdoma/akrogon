# Design: one-attempt-per-pass

## Binding decisions, verbatim
From `issues/chart/seat-prompt-delivery/forks/delivery-retry.md`, operator 2026-09-19 "1a | 2a | 3a":
- Q1-A: one attempt per pass; pre-send rejections retry on the next pass after the pane is observed fresh; an ambiguous `timeout` is checked against the seat's session file before a resend counts; three failed passes fail the leaf. Foreclosed: sleeps, a watcher, a longer immediate loop.
- Q2-A: one `attempts` counter per slot. Foreclosed: split start and prompt counters.
- Q3-A: a non-retryable herdr error fails the leaf with a reason naming the seat and the code; recovery restarts the phase for both seats. Foreclosed: checkpointing the peer's verdict.

Locks: operator 2026-09-18 "no hidden watchdogs, clocks or polling"; 2026-09-19 "I don't want an automated program to run things without me. I need to be pushing the next commands manually." Read here as: this leaf adds no trigger; the existing plugin startup and event passes stay as they are, and "pass" means any single invocation of `next`.

## Standing design
Installed path: `/home/ivan/.claude/skills/chart-issues/assets/standing-design.md`.

Interpretation for this leaf:
- **State changes as real backend mutations.** Every outcome is a `state.yaml` write through `saveState` or `commitMove`; tests read the file back.
- **Mandatory negative and edge-case tests.** Timeout with the record after versus before the offset, inside a non-user record, partial tail, late arrival; non-retryable versus unstructured versus retryable; start failure versus prompt failure; mixed busy seats in status.
- **No vanity tests.** Asserting that `console.warn` fired does not count; assert the recorded state and the fake herdr call list.
- **Never mock auth, no secrets:** not applicable. Session fixtures hold synthetic records only; tests never read the developer's real `~/.pi`.
- **Agent-owned:** no human-only prerequisite; no env values.

## Leaf architecture
Owned surfaces:
- `src/next.ts` `dispatchSlot` (:348-428): straight-line body. Order: read state, return if phase moved or slot done; observe busy; return if busy or within `PROMPT_GRACE_MS` of a recorded prompt (:178, :355-360 unchanged); if `delivery_error[slot]` carries an `offset`, re-run the settlement from it first and treat a found record as delivery; if no agent, one `agent start`: retryable failure → record error, charge, maybe fail, return; unreachable → fail, return; re-observe; if not idle return without charging; record the session file length; one `agent prompt --wait --until working --timeout 5000` (unchanged args); success → prompted, clear error, `attempts[slot] = 0`, return; `timeout` → settlement; other retryable → record error, charge, maybe fail, return; unreachable → fail, return. "Charge, maybe fail" means: `attempts[slot] += 1`; if it reaches 3, `commitMove(..., 'failed', slot, { cause: 'attempts', reason })` in the same pass, reason built from the error just recorded.
- `src/shell.ts`: `paneSchema.agent_session` gains `kind: z.enum(['id', 'path'])` beside `value` (herdr returns both; the pi integration reports a path when the session file is known, `~/.pi/agent/extensions/herdr-agent-state.ts:73-105`). Export `herdrError(result): { code: string; message: string }` decoding the structured `{ error: { code, message } }` and mapping anything else to `{ code: 'exit <status>', message: <stderr trimmed, at most 500 chars> }`; `retryable` uses it.
- `src/session-file.ts` (new, pure over injected root): `sessionFile(ref, home)` resolves `path` directly or `id` as the single match of `<home>/.pi/agent/sessions/*/*_<id>.jsonl`; `deliveredAfter(file, offset, text)` parses complete lines past `offset`, ignores a trailing partial line, and returns true when a record with `role: 'user'` has text content equal to `text` (record shape per pi `agent-session.js:388-398`, `sessionManager.appendMessage`). `home` is `process.env.HOME`.
- `src/state.ts`: `delivery_error` optional per slot, `z.strictObject({ command: z.array(z.string()), code: z.string(), message: z.string(), pane: z.string(), session: z.string().nullable(), at: z.string(), offset: z.number().int().nonnegative().optional() })`, default `{}` like `prompted`.
- `src/phase.ts` `commitMove`: clears `delivery_error` with `prompted` (:26-34 on origin/main).
- `src/status.ts` `note` (:87-107): after `done`, one `<slot> prompt <code>` token per slot with a `delivery_error` whose `busy_since[slot]` is undefined.
- `tests/next.test.ts`, `tests/state.test.ts`, `tests/status.test.ts`, `tests/shell.test.ts`; `tests/fake-herdr.ts` scripted per-call failures (code and raw stderr); tests pass a temporary `HOME` through the existing `cli(f, args, cwd, env)` parameter (`tests/helpers.ts:33-42`).
- `docs/reference-index.md`, `src/AREA.md`.

Literal interfaces:
- Prompt text: `<skill> <slug> slot=<S> phase=<P> leaf=<folder>` (`src/next.ts:399`); equality is exact, over the record appended after the pre-send offset, never a whole-file substring search.
- Reason strings: `prompt undelivered to seat <slot> after 3 passes: <code> <message> (pane <pane>, session <session>)` and `seat <slot> unreachable: <code> <message> (pane <pane>)`. `failure.cause` stays within the existing enum (`attempts` for both); the reason text distinguishes them.
- Both slots run the pi harness (`akrogon config`: slots a and b `harness: pi`); the settlement assumes pi's session format and is skipped, recording the `timeout` as a plain error, when the reference cannot be resolved to a file.

Exclusions: no change to `--timeout 5000`; no change to `src/log.ts` (the failure reason carries the target identity); no `pane run` or `send-keys` fallback; no change to `observeBusy`, `PROMPT_GRACE_MS` or the 60-minute notifier; no change to `plugin/herdr-plugin.toml`; no change to the failed announcement (failure-attention, merged) beyond the reason text it already relays.
