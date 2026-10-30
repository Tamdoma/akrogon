# Sub-brief 4: door-reset anchor + pane comparison, detached child skips (W3-U1)

Worktree: /home/ivan/.akrogon/worktrees/akrogon/peer-pane-anchor-u4 (you are spawned there)

## 1. Goal

Implement plan decision D4 for `door-reset.ts <pane> <session> <log> <start prompt>`: on the parent path it calls `verifyAnchor()` and refuses when the pane argument differs from the verified pane — before the first herdr call (`readPeerAgent`). The detached child (`process.env.DOOR_RESET_CHILD === '1'`) does NOT verify: it is reparented after the parent exits, so the pane shell leaves its ancestry and a re-check would always refuse. Plan D1-D3 are landed on your base: `skills/chart-issues/scripts/peer-anchor.ts` exports `verifyAnchor(): string`.

## 2. Acceptance criteria

1. In `main()`, after the `DOOR_RESET_CHILD === '1'` early return and before `await readPeerAgent(pane)`: `const verified = verifyAnchor();` then refuse when `pane !== verified` — stderr names both pane ids, exit 1, before any agent list/prompt and before the log file is created (spawn only opens it after this point).
2. The `DOOR_RESET_CHILD` branch keeps running `child()` with no anchor call; `DOOR_RESET_INLINE` path verifies (it runs in the parent process).
3. Committed tests green: `bun test --timeout=30000 tests/door-reset.test.ts` — including the detached-child test, which decoys `shell_pid` for any second process-info read so a re-checking child fails.

## 3. Read-first

- `skills/chart-issues/scripts/peer-anchor.ts` (landed on your HEAD)
- `door-reset.ts` `main()` — the `DOOR_RESET_CHILD === '1'` guard is the split point; `DOOR_RESET_INLINE` falls through to `child()` below the spawn block, so the anchor must sit above `readPeerAgent` and below the child early-return.
- `tests/door-reset.test.ts` — anchor envs in setup, refusal assertions (`pane` and the argv pane both in stderr, `.calls` holds only `pane process-info`, no log file), the detached-child decoy test.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

## 4. Change list and interfaces

- Own exactly: `skills/chart-issues/scripts/door-reset.ts`.
- `import { verifyAnchor } from './peer-anchor';`
- Refusal stderr naming both pane ids; reuse the `refused: ...` prefix style the script already uses for consistency (tests only assert the ids appear).

## 5. Do-not

- Do not edit tests, `peer-anchor.ts` or the other scripts; do not change `child()`'s step/log lines, herdr argv, the `DOOR_RESET_CHILD`/`DOOR_RESET_INLINE`/`DOOR_RESET_BOUNDARY` env contract, or `spawn` flags.
- A planned test red or wrong after your code is correct: return a mismatch with evidence, never a test edit.

## 6. Ordered steps

1. Read `peer-anchor.ts`, then `main()` in `door-reset.ts`.
2. Insert anchor + comparison between the `DOOR_RESET_CHILD` early return and `readPeerAgent`.
3. Run the targeted test in §7.

Advisory size: 1 file, under ~8 turns.

## 7. Commands

- `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'` (once)
- `akrogon run-check --name u4-door-reset -- bun test --timeout=30000 tests/door-reset.test.ts`
- `akrogon run-check --name u4-typecheck -- bun run typecheck`

## 8. Done-when, evidence and report

Commit your changes on this worktree's detached HEAD (`git commit -m "feat: anchor door-reset to the verified pane env, detached child exempt"`), return the commit id, and fill:

Changed files and reasons: <paths and why>
Tests run: <commands and results, citing `check <label>: <exit> <path>` lines>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
