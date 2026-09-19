# Review A: one-attempt-per-pass

Base: `92eb1cf4c2ba293f87234facc2643ddf8d79e090` — Reviewed head: `e09a2d9` (`one-attempt-per-pass`).

Debate off (`debate: "no"`); no positions/rebuttal artifacts, expected.

## Verification evidence

- `bun test tests/next.test.ts tests/shell.test.ts tests/state.test.ts tests/phase.test.ts tests/status.test.ts` — 202 pass, 0 fail (rerun by this seat, 61.6s).
- `bun run typecheck` — clean (rerun by this seat).
- `src/AREA.md` (only AREA file in diff): all named paths exist from repo root (`src/akrogon.ts`, `src/config.ts`, `src/phase.ts`, `src/shell.ts`, `docs/reference-index.md`, `tests/helpers.ts`, `tests/phase.test.ts`).
- Live contract check: `herdr pane list` on this host emits `agent_session: {agent, kind, source, value}` with `kind: 'id' | 'path'`; the new `paneSchema` requirement matches. Herdr 0.9.1 help text confirms `agent prompt --wait --until working --timeout 5000` returns `timeout` on caller-timeout expiry and `agent_prompt_stalled` on no observed activity, so `error.code === 'timeout'` is the right settlement trigger.
- `Bun.YAML.stringify` drops `undefined` values, so `delivery_error: {B: undefined}` in `recordDelivery` serializes cleanly and re-parses as `{}`.

## Decision coverage

- D1: `while (true)` gone; one `agent start` and one `agent prompt` per pass, no sleeps. Confirmed in `src/next.ts:350-493`.
- D2: attempts charged only in `recordFailure`; third consecutive failure calls `commitMove` in-pass with the full reason string; success resets to 0 and clears `delivery_error`. Old `attempts >= 3` top check and pre-charge removed.
- D3: `delivery_error` strict schema matches verbatim (`command`, `code`, `message`, `pane`, `session` nullable, `at`, optional `offset`), default `{}`.
- D4: `herdrError` decodes structured `{error:{code,message}}`, maps anything else to `exit <status>` + trimmed stderr ≤500 chars; `retryable` reuses it.
- D5: `agent_session` requires `kind: 'id' | 'path'`; fake herdr emits `kind: 'id'` on start and tests mutate panes with `kind`.
- D6: `session-file.ts` resolves `path` directly and `id` as single `*_<id>.jsonl` match under `$HOME/.pi/agent/sessions`; `deliveredAfter` parses complete lines past offset, ignores trailing partial line, requires `type: 'message'` + `role: 'user'` + exact text.
- D7: order matches — state read, phase/done return, busy return, grace return, offset re-settlement before resend, start-once, re-observe, `!idle` return uncharged, pre-send offset, prompt-once, timeout settlement both directions, retryable → record+charge+maybe fail, non-retryable → unreachable-fail.
- D8: `unreachable` commits `failed` with `seat <slot> unreachable: <code> <message> (pane <pane>)`, no error write, no charge, no throw; sibling dispatch continues (tested with two leaves under `--all`).
- D9: `commitMove` clears `delivery_error` in `after`; tested through `akrogon phase`.
- D10: `<slot> prompt <code>` token per slot gated on own seat's `busy_since`, placed after `done`; mixed-busy and legacy-absence tested.
- D11: `startScript`/`promptScript` per-call entries (structured or raw stderr), `append` writes to `kind: 'path'` session files, `HOME` passed through existing `cli` env param.
- D12: old pre-charge assertions updated to 0; the two rewritten tests now use three failing passes.
- D13: `docs/reference-index.md` and `src/AREA.md` carry the one-attempt rule and settlement.

## Done-criteria spot checks

- Criterion 2: `three consecutive prompt failures` test asserts exact reason `prompt undelivered to seat B after 3 passes: agent_prompt_stalled stalled (pane <id>, session <ref>)` and exactly 3 prompt calls; a fourth pass makes no calls.
- Criterion 3: settlement tests cover after-offset found, before-offset only, assistant/tool roles, partial tail, late arrival on next pass without resend, path-kind direct read, id-kind under temp HOME, missing file.
- Criterion 5: non-retryable code, non-JSON stderr, and malformed JSON each fail with `seat B unreachable:` without throwing; sibling leaf still dispatched.
- No mocks of the unit under test; tests assert recorded state and fake-herdr call lists, not console output.

## Findings

None.

## Verdict

ready

## Merge pass (slot A)

- Rebase: `e09a2d9` onto `origin/main` `0469b58` — clean, no conflicts. Resolved head `2704543`.
- `AKROGON_BASE` refreshed to `0469b5886ef1f781321a9270240517f526a9d47f`.
- `bun test --changed="$AKROGON_BASE"` — 266 pass, 0 fail, 11 files.
- `bun test` — 270 pass, 0 fail, 12 files.
- `bun run typecheck` — clean.
- `bun run format` — clean, no writes.
