# Sub-brief 2: peer-ask + peer-wait anchor calls (W2-U1)

Worktree: /home/ivan/.akrogon/worktrees/akrogon/peer-pane-anchor-u2 (you are spawned there)

## 1. Goal

Implement plan decision D4 for the two no-argument scripts: `peer-ask.ts` and `peer-wait.ts` call `verifyAnchor()` after their usage/argument validation and before their first herdr spawn. Plan D1-D3 are already landed on your base: `skills/chart-issues/scripts/peer-anchor.ts` exports `verifyAnchor(): string` (throws `Error` with the refusal text, returns the verified pane id).

## 2. Acceptance criteria

1. `peer-ask.ts`: `verifyAnchor()` runs after the existing usage/budget/return-file validation and before the first `herdr` call (`seedExchange`'s `agent list`). The refusal reaches the existing `catch` → stderr + exit 1.
2. `peer-wait.ts`: `verifyAnchor()` runs after the usage/budget validation and before the first `herdr` call (`readPeerAgent`'s `agent list`). Same exit path.
3. No argument comparison in either script (they take no A-pane argument); herdr argv unchanged everywhere.
4. The committed tests pass: `bun test --timeout=30000 tests/peer-ask.test.ts` and `bun test --timeout=30000 tests/peer-wait.test.ts` green. A test staying red once your code is correct is a mismatch, not yours to fix.

## 3. Read-first

- `skills/chart-issues/scripts/peer-anchor.ts` (landed on your HEAD — read it first)
- `skills/chart-issues/scripts/peer-ask.ts` `main()` — insert after validation, before the `for (const ask of asks)` loop / `seeded` block.
- `skills/chart-issues/scripts/peer-wait.ts` `main()` — insert after the budget check, before `readPeerAgent(pane)`.
- `tests/peer-ask.test.ts`, `tests/peer-wait.test.ts` — the anchor envs the setups already pass.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

## 4. Change list and interfaces

- Own exactly: `skills/chart-issues/scripts/peer-ask.ts`, `skills/chart-issues/scripts/peer-wait.ts`.
- `import { verifyAnchor } from './peer-anchor';` then one call site each: `verifyAnchor();` (return value unused — these two scripts compare nothing).
- peer-ask's spawned peer-wait child inherits the env — nothing extra to do.

## 5. Do-not

- Do not edit tests, `peer-anchor.ts`, `peer-restart.ts`, `peer-create.ts`, `door-reset.ts` or `tests/fake-herdr.ts` — other units own them.
- Do not change any herdr argv, ordering beyond the insert point, or stdout line shapes.
- A planned test red or wrong after your code is correct: return a mismatch with evidence, never a test edit.

## 6. Ordered steps

1. Read `peer-anchor.ts`, then the two scripts' `main()` bodies.
2. Add the import and the single `verifyAnchor()` call per file at the points in §3.
3. Run the targeted tests in §7.

Advisory size: 2 files, under ~8 turns.

## 7. Commands

- `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'` (once)
- `akrogon run-check --name u2-peer-ask -- bun test --timeout=30000 tests/peer-ask.test.ts`
- `akrogon run-check --name u2-peer-wait -- bun test --timeout=30000 tests/peer-wait.test.ts`
- `akrogon run-check --name u2-typecheck -- bun run typecheck`

## 8. Done-when, evidence and report

Commit your changes on this worktree's detached HEAD (`git commit -m "feat: anchor peer-ask and peer-wait to the verified pane env"`), return the commit id, and fill:

Changed files and reasons: <paths and why>
Tests run: <commands and results, citing `check <label>: <exit> <path>` lines>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
