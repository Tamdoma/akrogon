# Worker brief 1 — U1 src/config.ts store refusal

## 1. Goal

Implement plan decision D1/D2: `worktreeStore` refuses a configured `worktree_root` whose canonical store equals or lies inside the canonical registered checkout.

## 2. Acceptance criteria

- `worktreeStore(repo: Repo): string` keeps its signature; `worktree_root` unset returns `~/.akrogon/worktrees/<repo name>` unchanged.
- For a configured value it expands via `expandPath(value, repo.root)`, canonicalizes store and `repo.root`, and throws `Error` containing all of: `worktree_root`, `issues/config.yaml`, the canonical resolved store, the canonical checkout root, and instruction to remove the key (default `~/.akrogon/worktrees/<repo>`) or point it outside the checkout. Use this exact message:

```
`worktree_root in issues/config.yaml resolves inside the registered checkout: store ${store} is inside ${root}; remove the key (default ~/.akrogon/worktrees/${repo.name}) or point it outside the checkout`
```

- Canonical means: realpath of the path's deepest existing ancestor joined with the remaining suffix (nonexistent tails resolve against it). Equality and prefix siblings (`/a/repo` vs `/a/repo2`) are covered by the existing `within` helper.
- Accepted external stores return the canonical resolved path.
- The committed tests in tests/config.test.ts, tests/verify.test.ts and tests/sync.test.ts pass without edits.

## 3. Read-first

- src/config.ts (`worktreeStore` ~line 267, `within`, `expandPath`, `readRepo`; imports `existsSync`, `realpathSync`, `dirname`, `relative`, `resolve` already present)
- src/guard.ts `offendingAncestor` — similar walk that returns an offender, not a path; do not reuse
- skills `ponytail.md` in the implement-issue skill folder

## 4. Change list

- src/config.ts: add private `canonicalPath(path: string): string` helper; extend `worktreeStore` with the refusal. No other file, no signature changes.
- Owns: src/config.ts only. Lands first: nothing. Shared test resource: tests/helpers.ts fixture (read-only).

## 5. Do-not

- Do not edit any test file; a red planned test returns a mismatch with evidence.
- Do not touch `checkLocation`, `readRepo`, `expandPath`, `within`, or any consumer (verify/next/batch/reconcile/sync/self-update/init).
- Do not add exports, options, or fallbacks.
- Return a mismatch instead of changing scope; the exception is a revised brief from A.

## 6. Steps

1. `flock "$(git rev-parse --git-path akrogon-install.lock)" bun install --frozen-lockfile` in the worktree.
2. Read src/config.ts, add `canonicalPath`, rewrite `worktreeStore` per §2.
3. Run the commands in §7; all must pass.

Advisory: 1 file, under 15 turns.

## 7. Commands

- `akrogon run-check --name u1 -- bun test --timeout=30000 tests/config.test.ts tests/verify.test.ts tests/sync.test.ts`

## 8. Done-when, evidence and report

All §7 runs exit 0, change committed on the worktree's detached HEAD with a conventional message, report the commit ID and the `check u1: <exit> <path>` line.

Changed files and reasons:
Tests run:
Known limitations:
Unverified criteria:
