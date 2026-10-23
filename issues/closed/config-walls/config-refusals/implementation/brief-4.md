# Worker brief 4 — U2 src/init.ts early store resolution

## 1. Goal

Implement plan decision D3: `initialize` resolves the worktree store before writing anything, so an in-checkout `worktree_root` proposal refuses before issues/config.yaml, .gitignore or any other file is written; and init no longer adds a worktree store line to `.gitignore`.

## 2. Acceptance criteria

- In src/init.ts `initialize`, call `worktreeStore({ name: repoName, root, config })` for its effect after `checkGrounding(root, config)` and before `writeRepoConfig(root, config)` — before every file/directory write in the function.
- Delete the `const worktreeRoot: string = worktreeStore(...)` line near `.gitignore` and the `worktreeRoot !== root && within(worktreeRoot, root)` element of `additions`; the remaining `additions` list keeps `issues/seeds/`, `.lock`, `issues/open/**/*.log`, `issues/parked/**/*.log`, `issues/chart/*/direct/**/*.log`.
- Drop the now-unused `relative` import (node:path) and `within` import (./config); confirm no other use remains before removing.
- Committed tests/init.test.ts passes without edits: `init refuses %s worktree root …` cases (x4) exit non-zero naming the key/store/checkout with no file writes, and accepted external cases write `.env\nissues/seeds/\n.lock\n` + log ignores only.

## 3. Read-first

- src/init.ts (the full `initialize`; write order matters)
- src/config.ts `worktreeStore` (just landed: throws on an in-checkout store)
- skills `ponytail.md` in the implement-issue skill folder

## 4. Change list

- src/init.ts only: move the store resolution up, remove the in-checkout `.gitignore` entry, drop dead imports.
- Owns: src/init.ts only. Lands first: U1 (worktreeStore refusal) — already landed. Shared test resource: tests/helpers.ts fixture (read-only).

## 5. Do-not

- Do not edit tests; a red planned test returns a mismatch.
- Do not reorder other validations (seats, checkGrounding) or change messages; no new errors or fallbacks.
- Return a mismatch instead of changing scope; the exception is a revised brief from A.

## 6. Steps

1. `flock "$(git rev-parse --git-path akrogon-install.lock)" bun install --frozen-lockfile`.
2. Make the three edits in `initialize`; `bunx tsc --noEmit` clean for src/.
3. Run §7.

Advisory: 1 file, under 10 turns.

## 7. Commands

- `akrogon run-check --name u2 -- bun test --timeout=30000 tests/init.test.ts`

## 8. Done-when, evidence and report

§7 exits 0, change committed on the detached HEAD with a conventional message, report the commit ID and the `check u2: <exit> <path>` line.

Changed files and reasons:
Tests run:
Known limitations:
Unverified criteria:
