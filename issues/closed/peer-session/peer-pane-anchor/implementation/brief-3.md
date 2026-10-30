# Sub-brief 3: peer-restart + peer-create anchor + A-pane comparison (W2-U2)

Worktree: /home/ivan/.akrogon/worktrees/akrogon/peer-pane-anchor-u3 (you are spawned there)

## 1. Goal

Implement plan decision D4 for the two scripts taking A's pane as argv: `peer-restart.ts <A pane> ...` and `peer-create.ts <root> <A pane> <json>` call `verifyAnchor()` after usage validation and refuse when the A-pane argument differs from the returned verified pane — before their first herdr call. Plan D1-D3 are already landed on your base: `skills/chart-issues/scripts/peer-anchor.ts` exports `verifyAnchor(): string` (throws `Error` with refusal text, returns the verified pane id).

## 2. Acceptance criteria

1. `peer-restart.ts` `main()`: after the usage check, `const verified = verifyAnchor();` then refuse when `argv[0] !== verified` — stderr names both pane ids, prints the seat lines via the existing `finish(states)` path, exit 1, before `run(['agent','list'])`.
2. `peer-create.ts` `main()`: after the argv/spec validation, `const verified = verifyAnchor();` then refuse when `process.argv[3] !== verified` — stderr names both pane ids, prints `emit(states)`, exit 1, before the first `pane split`.
3. Refusal ordering: the anchor call itself is the first herdr call; on the mismatch path nothing else runs.
4. Committed tests green: `bun test --timeout=30000 tests/peer-restart.test.ts` and `bun test --timeout=30000 tests/peer-create.test.ts`.

## 3. Read-first

- `skills/chart-issues/scripts/peer-anchor.ts` (landed on your HEAD — read it first)
- `peer-restart.ts` `main()`: the `states`/`stateOf` setup exists before the read phase — build `states` first (it already is), then anchor+compare, then the existing read phase. Reuse the `refusing restart, <reason>` stderr form and `finish(states)` for consistency.
- `peer-create.ts` `main()`: validate argv (existing usage + `specSchema.parse`) then anchor+compare, then the split loop. Reuse `emit(states)`.
- `tests/peer-restart.test.ts`, `tests/peer-create.test.ts` — the anchor envs setups pass and the refusal text they assert (`<env pane>` and `<argv pane>` both in stderr).
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

## 4. Change list and interfaces

- Own exactly: `skills/chart-issues/scripts/peer-restart.ts`, `skills/chart-issues/scripts/peer-create.ts`.
- `import { verifyAnchor } from './peer-anchor';` in both files.
- Mismatch refusal text must contain both pane ids verbatim (tests assert `paneA` and `w8:pZ`/`paneB` substrings).

## 5. Do-not

- Do not edit tests, `peer-anchor.ts`, `peer-ask.ts`, `peer-wait.ts`, `door-reset.ts` or `tests/fake-herdr.ts`.
- Do not reorder the existing read/mutate phases, change herdr argv, or alter emitted seat-line shapes.
- A planned test red or wrong after your code is correct: return a mismatch with evidence, never a test edit.

## 6. Ordered steps

1. Read `peer-anchor.ts`, then both `main()` bodies.
2. Add import, anchor call and comparison per file.
3. Run the targeted tests in §7.

Advisory size: 2 files, under ~8 turns.

## 7. Commands

- `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'` (once)
- `akrogon run-check --name u3-peer-restart -- bun test --timeout=30000 tests/peer-restart.test.ts`
- `akrogon run-check --name u3-peer-create -- bun test --timeout=30000 tests/peer-create.test.ts`
- `akrogon run-check --name u3-typecheck -- bun run typecheck`

## 8. Done-when, evidence and report

Commit your changes on this worktree's detached HEAD (`git commit -m "feat: anchor peer-restart and peer-create and compare the A-pane argument"`), return the commit id, and fill:

Changed files and reasons: <paths and why>
Tests run: <commands and results, citing `check <label>: <exit> <path>` lines>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
