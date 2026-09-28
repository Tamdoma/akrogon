# Brief: worker-path

## What
`akrogon config` prints a derived key `worktree_store`: the absolute directory that holds leaf worktrees, resolved exactly as leaf worktree creation resolves it (src/next.ts:231, `resolve(repo.root, repo.config.worktree_root)`). skills/implement-issue/worker-protocol.md places every new delegated leaf worker at `<worktree_store>/<slug>-u<N>` read from that output, instead of `<lane>/<worktree_root>/<slug>-u<N>`.

## Why
Tamdoma/akrogon#37: owner-defect-stop created its workers inside the leaf worktree because worker-protocol.md:11 builds the path from `<lane>` plus the relative `worktree_root`, while create-peer-panes read the same rule and put its worker at the registered root. The rule reads two ways. Its stated reason, avoiding a pi confirm dialog, is obsolete since pi-extensions seat-subagent-freezes merged.

## Credentials
None.

## Done-criteria
1. `akrogon config` run from the registered root or from any linked worktree of a registered repo prints `worktree_store` as an absolute path equal to the parent of the path `ensureWorktree` uses for leaf worktrees, with one resolution shared by both. It is absent when `repo: none`. The printed `worktree_root` stays exactly as configured.
2. tests/config.test.ts drives the real CLI against real temporary git repos and covers: default `issues/worktrees`, a custom relative root, an absolute root, invocation from the registered root and from a linked worktree, and an unregistered cwd with no key.
3. worker-protocol.md:11 names the worker path `<worktree_store>/<slug>-u<N>` from `akrogon config`, created with `git worktree add --detach` at the leaf's committed HEAD, and says B uses that one absolute path unchanged as the sub-brief worktree path, spawn cwd, inspection path and `git worktree remove` target. `<lane>` as a path and the "inside pi's parent root" and "inside the repo so it is gitignored" reasons are gone.
4. worker-protocol.md keeps retained workers (:17, :25) resuming at their recorded path, including one at the old nested path, and says an occupied `<slug>-u<N>` path is reported to the operator, never deleted, forced or reused. Standalone workers stay sequential in the current checkout.
5. The implementation report records one real run, output kept outside tracked `issues/` paths with its path in the report: in a temporary registered repo with a leaf worktree holding a commit ahead of main, `akrogon config` from the leaf, then `git worktree add --detach <worktree_store>/<slug>-u1 HEAD`, showing the worker is a sibling of the leaf worktree at the leaf's HEAD. The configured `checks` pass.
