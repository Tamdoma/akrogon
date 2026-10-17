# Brief R1: door-reset check.fix repair (F2 + F3)

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/door-reset-r1` (detached at `054ea9d`).

## 1. Goal

Repair two review findings in `skills/chart-issues/scripts/door-reset.ts` only. Do not edit tests or fixtures — they are locked and now red on head.

## 2. Acceptance criteria

- F2: parent refuses (exit 1, nothing sent, no log file created) whenever the pane's `agent_session.value` differs from the passed session — no `heldBefore` exception. A session change observed *after* validation, during the child's `wait-turn-end`, is still logged `identity changed` (existing behavior, keep).
- F3: after the codex check prompt, wait for the check turn to end before anything else: `herdr agent wait <pane> --timeout <ms> --until idle --until done`, bounded by `DOOR_RESET_TURN_BOUND_MS`. On timeout log `{step:'wait-check-end', result:'turn open'}` and exit 1; on other non-timeout failure log the step and exit 1; on success log `wait-check-end` `idle`|`done` and continue to `wait-new-session`. No retries.

## 3. Read-first

- `skills/chart-issues/scripts/door-reset.ts` (whole file)
- `tests/door-reset.test.ts` — the failing tests are the contract: `refuses a session mismatch even when the passed session has a transcript`, `codex handover sends reset…`, `a codex check turn still working at the bound sends no start prompt`, `a session change during the turn wait…`
- `tests/fake-herdr.ts` `agent prompt`/`agent wait` handlers (fixture semantics)
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

## 4. Change list

- Remove `heldBefore` and its call; parent condition becomes `kind === null || live.agent_session?.value !== session` → refuse.
- Add `waitCheckEnd` after `send-check-prompt` (codex only): spawn `herdr agent wait <pane> --timeout <remaining turn bound> --until idle --until done`, parse `{error:{code:'timeout'}}` on stderr for the open case. Export `isTimeoutError` from `peer-wait.ts` and reuse it (peer-wait already has it private).
- Keep all other steps and log shapes unchanged.

## 5. Do-not

- No edits to `tests/door-reset.test.ts` or `tests/fake-herdr.ts`.
- No new env vars, no new files, no extra waits for claude/pi.
- Return a mismatch with evidence instead of scope changes; exception: revised brief from A.

## 6. Ordered steps

1. `bun install --frozen-lockfile` in the worktree.
2. Implement F2 (parent refusal) + F3 (`wait-check-end`).
3. `bun test tests/door-reset.test.ts --timeout=30000` — all green.
4. `bun test tests/peer-wait.test.ts --timeout=30000` — green (exports only).
5. Commit once, message `fix: strict session refusal and codex check-turn wait`.

## 7. Commands

- `bun test tests/door-reset.test.ts --timeout=30000`
- `bun test tests/peer-wait.test.ts --timeout=30000`

## 8. Done-when

All tests in `door-reset.test.ts` and `peer-wait.test.ts` green; commit sha returned.

Changed files and reasons:
Tests run:
Known limitations:
Unverified criteria:
