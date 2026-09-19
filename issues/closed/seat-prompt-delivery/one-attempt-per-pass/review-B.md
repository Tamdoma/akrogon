# Review B: one-attempt-per-pass

Reviewed head: `e09a2d9` (base `92eb1cf`), single commit, `git status` clean.

## Verification

- `bun test` — 270 pass, 0 fail (ran by B during implement; suite unchanged since).
- `bun run typecheck`, `bun run format` — clean.
- AREA.md path check: all named paths exist (`bun test tests/phase.test.ts` is a command string, not a path).
- Live contracts verified: herdr emits `agent_session: {agent, kind, source, value}` and `{"error":{"code","message"}}` on stderr; pi session records are `{"type":"message","message":{"role":"user","content":[{"type":"text","text"}]}}` under `$HOME/.pi/agent/sessions/<dir>/<ts>_<id>.jsonl`.

## Findings

No Fix findings. Criteria traced:

- One attempt per pass: `dispatchSlot` is straight-line; `while (true)`, pre-charge, and the `attempts >= 3` top check are gone. Failure paths return after one start or one prompt.
- Charge on failure only: `recordFailure` is the single charging site; success resets `attempts[slot]` to 0 and clears `delivery_error[slot]`; start-then-not-idle returns before any charge.
- Third consecutive failure fails in-pass with the full reason naming code, message, pane and session.
- Timeout settlement: pre-send offset recorded only when the file resolves; `deliveredAfter` parses complete lines past the offset, drops a trailing partial line, requires `type: 'message'` + `role: 'user'` + exact text; re-settlement runs before resend on the next pass and before the agent-start branch, per design order.
- Unreachable: non-retryable and unstructured failures `commitMove` to `failed` with `seat <slot> unreachable:` and `cause: 'attempts'` (design: enum stays `attempts`, reason distinguishes); no throw, siblings dispatch.
- `commitMove` clears `delivery_error` on every move; status token `<slot> prompt <code>` appears after `done` only when the slot's own `busy_since` is unset.
- Design exclusions held: no change to `--timeout 5000`, `src/log.ts`, `observeBusy`, `PROMPT_GRACE_MS`, `plugin/herdr-plugin.toml`, or the failed announcement.
- Tests assert recorded state and fake-herdr call lists, not console output; session fixtures use temporary `HOME`, never the real `~/.pi`.

## Nits

- `recordDelivery` re-fetches the pane and re-runs `observeBusy` rather than reusing the in-hand pane — one extra `pane get` per delivery, consistent with the old success path.
- `sessionFile` can throw ENOENT if the sessions root vanishes between `statSync` and `readdirSync`; it surfaces as a skip report, not silent loss.

## Verdict

ready
