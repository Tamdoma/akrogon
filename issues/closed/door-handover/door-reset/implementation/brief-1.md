# Brief 1: door-reset helper + fake-herdr extension (U1)

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/door-reset-u1` (detached at the leaf's committed HEAD `61727e0`).

## 1. Goal

Implement the autopilot door self-handover helper: `skills/chart-issues/scripts/door-reset.ts` (new), export the turn-end readers from `peer-wait.ts`, and relax `tests/fake-herdr.ts` prompt contract. Plan decisions D1–D5. Criteria C2–C5.

## 2. Acceptance criteria

- C2: wrong kind, wrong session or pane without agent → exit 1, nothing sent, log file not created.
- C3: reset sent only after the kind's proven turn end; open turn at the bound or identity change → logged, nothing sent.
- C4: start prompt only after a different session appears; codex gets one harmless check prompt first; unconfirmed reset logged, no start prompt.
- C5: stalled start/check prompt logged `prompt_stalled`; one JSON line per step; no retries.
- All 9 currently failing tests in `tests/door-reset.test.ts` pass; the docs test (last one) may stay red — another unit owns docs.

## 3. Read-first

- `skills/chart-issues/scripts/peer-wait.ts` (turn-end readers to export, in-place)
- `skills/chart-issues/scripts/peer-ask.ts` (prompt contract conventions)
- `tests/fake-herdr.ts`, `tests/door-reset.test.ts` (db shape, expected steps/argv)
- `issues/chart/door-handover/slots/reset-probe/proto.ts` in the registered repo `/home/ivan/Work/infra/akrogon` (prior-art child flow)
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

## 4. Change list and interfaces

Owned paths (do not touch others): `skills/chart-issues/scripts/door-reset.ts`, `skills/chart-issues/scripts/peer-wait.ts`, `tests/fake-herdr.ts`, `tests/door-reset.test.ts` (no edits allowed — planned tests are locked).

- `peer-wait.ts`: export `claudeTurnOpen`, `codexRollout`, `codexEnded`, `piAuthority` and the `agentListSchema`-compatible `readPeerAgent`/list reader as needed; zero behavior change to the script's own flow.
- `fake-herdr.ts` `agent prompt`: when `--wait` is absent, accept the prompt without the wait-contract check; `promptScript` entries may set `session` (apply to target pane's `agent_session.value`, keeping `kind`/`source`) — the fake db update drives `agent list`.
- `door-reset.ts` interface: `bun <script> <pane> <session> <log> <start prompt>`. Parent: validate, refuse (exit 1, no log, nothing sent) unless kind ∈ {claude,codex,pi} and `agent_session.value === <session>`; else spawn self detached (env `DOOR_RESET_CHILD=1`, stdio appended to `<log>`), print `queued`, exit 0. When env `DOOR_RESET_INLINE=1`, run the child synchronously in the same process (test path).
- Child steps, each one JSON line `{step, result, ...}` appended to `<log>`, first failure exits 1:
  1. `wait-turn-end` poll ~500 ms up to `DOOR_RESET_TURN_BOUND_MS` (default 600000): claude `!claudeTurnOpen(session)`; codex rollout for session — `task_complete`/`turn_aborted` for the last `task_started` seen after a byte boundary taken at child start; pi `piAuthority(row)` and `agent_status !== 'working'`. Timeout → `result: 'turn open'`, exit 1.
  2. Recheck kind+session → `result: 'identity changed'`, exit 1.
  3. `send-reset` plain `herdr agent prompt <pane> </clear|/new>` (claude `/clear`; codex, pi `/new`); non-zero → `result: 'reset refused'`, exit 1.
  4. Codex only: `send-check-prompt` — `herdr agent prompt <pane> "Reply OK" --wait --until working --timeout 5000`; failure → `prompt_stalled`, exit 1.
  5. `wait-new-session` poll up to `DOOR_RESET_CONFIRM_MS` (default 60000): `agent_session.value !== <session>` and non-null → confirmed; timeout → `result: 'reset unconfirmed'`, exit 1.
  6. `send-start-prompt` `herdr agent prompt <pane> <start prompt> --wait --until working --timeout 5000`; failure → `result: 'prompt_stalled'`, exit 1. Success → `result: 'sent'`, exit 0.

## 5. Do-not

- No test edits — planned tests are the contract; a wrong/red planned test is a mismatch.
- No behavior change to `peer-wait.ts` beyond exports; `tests/peer-wait.test.ts` must keep passing.
- No new deps, no framework, no classes. Follow the style of the sibling scripts (zod parse, Bun.spawn, small functions).
- Do not touch `fake-herdr.ts` semantics for `agent start`/`wait`/`list` beyond the two additions.
- Return a mismatch with evidence instead of changing scope or interface; exception: a revised brief from A.

## 6. Ordered steps

1. `bun install --frozen-lockfile` in the worktree.
2. `tests/fake-herdr.ts`: relax wait contract + `session` in promptScript. Run `bun test tests/door-reset.test.ts` — prompt calls now accepted (still red elsewhere).
3. `peer-wait.ts` exports; run `bun test tests/peer-wait.test.ts` green.
4. `door-reset.ts` parent + child per §4; iterate `bun test tests/door-reset.test.ts` until all but the docs test pass.
5. Commit chunks separately (fake/exports first, then helper).

## 7. Commands

- `akrogon run-check --name door-reset-u1 -- bun test tests/door-reset.test.ts --timeout=30000`
- `akrogon run-check --name peer-wait-reg -- bun test tests/peer-wait.test.ts --timeout=30000`

## 8. Done-when, evidence and report

All tests in `door-reset.test.ts` except the docs test green; `peer-wait.test.ts` green; commits on the worktree branch (detached HEAD is fine, return the sha).

Changed files and reasons:
Tests run:
Known limitations:
Unverified criteria:
