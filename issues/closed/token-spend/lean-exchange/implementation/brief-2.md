# Sub-brief U2: lean-exchange session receipts — peer-wait and peer-restart

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/lean-exchange-u2`

## 1. Goal

Implement plan decisions D3 and D4: add the `session` field to peer-wait's outcome line and to peer-restart's seat lines so the chart door's seat record needs no separate `herdr agent list` read. `peer-ask.ts` needs no change (outcome lines pass through from peer-wait). The planned tests already assert the contract on the branch and are red; your job is to make them green without editing them.

## 2. Acceptance criteria

- B1 Every `peer-wait.ts` outcome line (`done`, `blocked`, `failure`, `budget`) is a JSON object `{outcome, pane, file, status, signal, exchange, session}` where `session` is the `agent_session.value` `herdr agent list` shows for that pane at the moment the line is printed — one extra `agent list` read inside `finish`, after the wait loop ends and before the line is written. `session` is `null` when the pane shows no `agent_session`. A `session` that appeared during the wait (a fresh codex session, a waitScript adoption) is the post-exchange value, while `exchange` keeps its carried/prompt-time content untouched.
- B2 `peer-wait.ts` exit codes, stderr text and non-outcome error paths are unchanged; an `agent list` read failure inside `finish` fails the script the same way an `agent list` failure elsewhere does (non-zero, error text on stderr, no outcome line). The existing "agent gone from the list" case stays an error, not a `session: null` outcome.
- B3 Every `peer-restart.ts` seat line is `{seat, pane, kind, state, session}` where `session` is the `agent_session.value` herdr shows after the seat's start for a `restarted` line, `'none'` when herdr shows no `agent_session` or still shows the pre-restart value, and `'none'` on `stopped`/`untouched` lines. One post-phase `agent list` read after the mutate loop resolves every restarted seat's session; the read phase must capture each seat's pre-restart `agent_session?.value` for the comparison.
- B4 `peer-restart.ts` ordering, refusal rules, mid-run stop behavior and exit codes are unchanged; a failed post-phase `agent list` fails the script like other herdr read failures.
- B5 `tests/fake-herdr.ts`'s planned `staleSession`/`agent_session` support (already on the branch) is what the tests use; you do not modify tests or the fixture unless the planned red reveals a fixture defect — a fixture defect returns a mismatch, not a fixture edit, unless the defect is in your own brief's described behavior.

## 3. Read-first list

- `skills/chart-issues/scripts/peer-wait.ts` — `finish()`, `readPeerAgent`, `checkIdentity`, `agentListSchema`; the outcome object shape.
- `skills/chart-issues/scripts/peer-restart.ts` — `emit()`, `State` type, read phase (`rows`, `agents`), mutate loop, `paneListed`; where the pre-restart `agent list` data lives.
- `skills/chart-issues/scripts/peer-ask.ts` — confirms outcomes pass through (no change needed).
- `tests/peer-wait.test.ts` `expectOutcome`, `tests/peer-ask.test.ts` outcome assertions, `tests/peer-restart.test.ts` `seatLines`/`SeatLine` — the exact expected contract.
- `tests/fake-herdr.ts` — `agent list` emits `agent_session`; `agent start` assigns `session-<serial>` unless `staleSession`; `waitScript` `session`/`dropAgent` entries.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

- `skills/chart-issues/scripts/peer-wait.ts`: make `finish` async, add the final `readPeerAgent`-style `agent list` read (reuse the existing helper), and add `session` to the emitted object. `session` = `agent.agent_session?.value ?? null` from that read.
- `skills/chart-issues/scripts/peer-restart.ts`: add `session` to `State` (`string | null` internally, `'none'` when emitting); capture `agent_session?.value` in the read phase (`agentListSchema` needs the `agent_session` optional field); after the mutate loop run one `agent list`, resolve each restarted seat's current `agent_session?.value`, emit it when present and different from the pre-restart value, else `'none'`. Non-restarted seats emit `'none'`.
- Owns: the two scripts. Tests and fake-herdr are already on the branch (frozen at the `plan.synthesis`→`implement` move); do not edit them.
- Shared test resource: none. Prerequisite: none.

## 5. Do-not, reasons and exceptions

- Do not edit `tests/*` or `tests/fake-herdr.ts`: tests are locked after planning and a worker edits no test; a wrong planned test returns a mismatch to A.
- Do not change `peer-ask.ts`, `chart-usage.ts`, `peer-create.ts`, `direct-guards.ts`: locked exclusions.
- Do not change outcomes, `signal` values, the `exchange` object contents or shape, or any exit code: criterion 6 requires them unchanged; a test that fails because you changed one is your bug to fix, not a test to weaken.
- Do not reorder `finish`'s printed fields relative to what tests assert via `toEqual` (`session` is a new key; `toEqual` ignores order but object content must match exactly).
- A contradiction between this brief and live code or a planned test returns a mismatch with evidence; the exception is a revised brief from A authorizing the change.

Reasons and exceptions restated: the two scripts only; tests locked; contract fields and exit codes fixed; conflicts come back as a mismatch.

## 6. Ordered steps

1. Read the read-first list; run `bun test tests/peer-wait.test.ts tests/peer-ask.test.ts tests/peer-restart.test.ts --timeout 30000` to see the planned red.
2. Edit `peer-wait.ts` (B1, B2).
3. Edit `peer-restart.ts` (B3, B4).
4. Run the targeted commands in section 7 until green.
5. `bunx tsc --noEmit` or `bun run typecheck` must stay clean (the repo runs it under `akrogon verify`; run it once here if quick).
6. Commit one commit on the leaf branch in your worktree with no test-file changes.

Advisory size: 2 files, under 15 turns.

## 7. Commands

- `bun test tests/peer-wait.test.ts --timeout 30000`
- `bun test tests/peer-ask.test.ts --timeout 30000`
- `bun test tests/peer-restart.test.ts --timeout 30000`
- `bun run typecheck`

Run `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile'` first in your worktree so dependencies exist.

## 8. Done-when, evidence and report

Done when all three test files are green on your committed HEAD, typecheck is clean, your commit touches only the two scripts, and the four lines below are filled.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
