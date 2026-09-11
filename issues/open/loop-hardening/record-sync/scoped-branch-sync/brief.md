# Brief: scoped-branch-sync

## What
`akrogon sync` commits only issue records, only from the checked-out default branch, under the global then repo lock. Unrelated tree and index contents are left untouched, and pre-staged changes outside `issues/` make sync refuse before any mutation.

## Why
Today sync stages the whole repo and pushes `HEAD:<default_branch>` from any branch, so unrelated operator work and stray deletions land on main (reproduced: side branch plus `unrelated.txt` reached remote main; parked leaf deletion committed in 13f92e0).

## Done-criteria
1. `bun test tests/sync.test.ts` passes with new cases: (a) an unrelated modified and an unrelated untracked file remain uncommitted and unstaged after a successful sync; (b) sync from a non-default branch exits nonzero, names the branch and the default branch, and makes no commit or push; (c) detached HEAD exits nonzero the same way; (d) a pre-staged file outside `issues/` exits nonzero listing that path and makes no commit; (e) `issues/seeds/` and the configured `worktree_root` are never staged even when untracked files exist there.
2. Sync holds `~/.config/akrogon/.lock` then `issues/.lock` for the whole run; a test proves a concurrent `park` waits (existing fake or a held `flock`).
3. The CLI end-to-end run against a local bare remote leaves `issues/<slug>/implementation/cli-artifact.log` with the remote branch listing showing only issue paths in the sync commit.
4. `bun run format`, `bun run typecheck`, `bun test` pass.
