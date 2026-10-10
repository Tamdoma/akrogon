# Brief 1 (revised): fake-herdr `agent list` + `agent wait --until`, peer-wait budgets (plan unit U1)

Worktree for all reads/edits/tests: /home/ivan/Work/infra/akrogon/issues/worktrees/fix-red-base-tests-u1

Prior worker already landed commit `2a7318d` adding the `agent list` handler (7/9 peer-wait green). Keep it. Two tests remain red for real fixture gaps; this revision covers them.

## 1. Goal

`peer-wait.ts` (as of f3199df) calls `herdr agent list` once per run and sends `agent wait --until working` for its 10s grace wait. The fake must answer both faithfully. Plan decisions D1, D3, D5, plus this revision's additions (D6).

## 2. Numbered acceptance criteria

1. `agent list` returns `{"result":{"agents":[...]}}`, exit 0, one entry per pane with `agent !== null`, fields `pane_id`, `agent`, and `agent_session` only when set. (Already done in 2a7318d — verify, don't redo.)
2. `agent wait <pane> --timeout <ms> --until <status>` honors `--until` (repeatable flag): when the pane's `agent_status` is already in the until-set, return the pane success immediately; otherwise sleep the timeout and emit the fixture's timeout error to stderr, exit 1. No `--until` flags = today's behavior unchanged. `waitScript` consumption, `sleepMs`, `append`, `status` override and `scriptedFailure` all keep their current precedence — the until check decides only the outcome for a call the script did not override.
3. In `tests/peer-wait.test.ts`, the two failure tests (`failure on idle with the return file missing`, `failure on done with a 0-byte return file`) run with budget `'12'` instead of `'10'` — `failure` requires `graceMs === IDLE_GRACE_MS` (10000), i.e. budget > 10s + readPeerAgent overhead.
4. `bun test tests/peer-wait.test.ts --timeout=30000` fully green (9/9).
5. `bun run typecheck` clean; no file outside `tests/` touched.

## 3. Read-first list

- `tests/fake-herdr.ts` — `result()`, `save()`, `flag()`, the `agent wait` handler and its timeout stderr string (the JSON `{"error":{"code":"timeout",...},"id":"cli:agent:wait"}` line); `scriptEntrySchema`/`waitEntrySchema`.
- `skills/chart-issues/scripts/peer-wait.ts` — `readPeerAgent`/`agentListSchema`, the grace branch (~line 170-190): `runWait(pane, graceMs, ['working'])`, `isTimeoutError` matching on `error.code === 'timeout'`, `resumedWorking = resumed.code === 0`.
- `tests/peer-wait.test.ts` — `setup()` signature and the two failure tests.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

- Owns: `tests/fake-herdr.ts`, `tests/peer-wait.test.ts`.
- In the `agent wait` handler, after `waitScript` handling (`scriptedFailure`, `entry.status` override — keep existing order), collect every `--until` value from `args`. If the set is non-empty and does not contain the pane's (possibly entry-overridden) `agent_status`: `Bun.sleepSync(Number(flag('--timeout')))`, then emit the exact same timeout stderr JSON the existing handler uses for the working-timeout case and `process.exit(1)`. If the set contains the status, fall through to the existing `result({ agent: ... })` success.
- In `tests/peer-wait.test.ts`, change the budget argument `'10'` → `'12'` in exactly the two failure tests.
- Must land first: nothing. Shared test resource: none. Consumed output: none.

## 5. Do-not, reasons and exceptions

- Do not touch `skills/chart-issues/scripts/peer-wait.ts`, `src/`, or `docs/` — the leaf diff must stay under `tests/` (done-criterion 3); the script's behavior is correct and documented.
- Do not touch `tests/dependents-first.test.ts` — U2 owns it concurrently.
- Do not change `agent prompt`'s `--until` contract — `src/next.ts` uses `prompt --wait --until working` and the existing fake validates it deliberately.
- Do not model mid-wait status transitions — the fixture DB is static during a call; an until-set miss sleeps and times out, matching real herdr on an unchanged pane.
- Do not "fix" the two failure tests by expecting `budget` — done-criterion 1 requires peer-wait reach the `failure` outcome; the cited f3199df diff removed the immediate-failure path deliberately, so the tests must exercise the grace path.
- Any conflict between this brief and real code: return a mismatch with evidence, not a scope change; the exception is a revised brief from A.
- Restated: edits limited to `tests/fake-herdr.ts` (until semantics) and `tests/peer-wait.test.ts` (two budget literals); everything else stays; deviations need evidence returned as a mismatch unless A revises the brief.

## 6. Ordered steps

1. Verify the `agent list` handler from 2a7318d matches criterion 1 (direct `agent list` invocation on a small DB).
2. Extend the `agent wait` handler per section 4 (criterion 2).
3. Bump the two budgets (criterion 3).
4. Run `bun test tests/peer-wait.test.ts --timeout=30000`; record the fail-before (7 pass/2 fail, `budget` instead of `failure`) and pass-after (9/9).
5. Run `bun run typecheck`.
6. Commit the new changes on top of 2a7318d in this worktree. The commit changes two existing `tests/` files; end the message with `Test-Change: tests/fake-herdr.ts <reason>` and `Test-Change: tests/peer-wait.test.ts <reason>` trailers (one per file), citing: f3199df added `agent wait --until` and the idle/done grace path that this fixture now emulates; the budget bump reaches the `failure` outcome.

Advisory size: 2 files, under ~15 turns.

## 7. Commands

Changed tests: `bun test tests/peer-wait.test.ts --timeout=30000`
(AKROGON_BASE = f3199df89b25b4f215df04f8703ef6d71880cd6a)

## 8. Done-when, evidence and report

Done when `peer-wait.test.ts` is 9/9 green from your commits and the worktree is clean. Report the new commit ID plus:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
