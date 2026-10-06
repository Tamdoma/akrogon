# Brief: check-setup

## What
Add an optional repo key `setup` to the repo config schema (`src/config.ts`). When it is set, `akrogon config` prints every `checks`, `merge_checks` and `advisory` command (A,C) as the locked install followed by the command: `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c <quoted setup> && sh -c <quoted command>` (A,B,C). When it is absent, the commands print unchanged. `implement-issue` and `check-issue` tell a seat to run the locked `setup` before a direct proof that runs outside the printed commands (A,B). `init-akrogon` proposes `setup` only when the repo has a committed lockfile. `docs/guide/setup.md` documents `setup` next to `checks`.

## Why
Leaf worktrees live inside the registered checkout (`worktree_root: issues/worktrees`) and nothing installs their packages (`src/next.ts:245-278`). Bun then looks upward and silently uses the registered checkout's `node_modules`. On framework, a leaf added `markdown-it` to `package.json` and `bun.lock`, the root install never got it, and every later leaf's `framework:verify` failed with `Cannot find package 'markdown-it'`. Installing per worktree fixes that, but two bare `bun install` runs in one worktree at the same time fail (2 of 3 per round in the chart probe), so the install runs under a per-worktree lock.

Setting `setup` in akrogon's and framework's own `issues/config.yaml` is an operator commit on main after this leaf merges, not part of this leaf.

## Done-criteria
1. With `setup` set, `akrogon config` prints each `checks`, `merge_checks` and `advisory` command as the locked install followed by that command, from the registered checkout and from a leaf worktree. With `setup` absent it prints them unchanged. (A,C)
2. In a new worktree with no `node_modules`, a printed check passes without a separate install step, and a package declared only in the worktree's lockfile resolves from the worktree's own `node_modules`.
3. When the registered checkout's `node_modules` holds a different version of a package than the worktree's lockfile, a printed check resolves the worktree's version.
4. Four printed checks started at once in one worktree all exit 0 and leave `git status --porcelain` empty.
5. A lockfile that does not match `package.json` makes the printed check exit non-zero with the install error, and the check itself does not run, including a check written as `a || b`. (A,B)
6. A `setup` of two commands joined by `&&` runs entirely inside the lock. (A,B,C)
7. `implement-issue` and `check-issue` tell a seat to run the locked `setup` before a dependency-using proof outside the printed commands. (A,B)
8. `init-akrogon` proposes `setup` for a repo with a committed lockfile and does not propose it for a repo without one.
9. `docs/guide/setup.md` states what `setup` does, that it runs before every check under a per-worktree lock kept under the git dir, and the `init-akrogon` proposal rule.
