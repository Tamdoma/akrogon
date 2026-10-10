# Brief: worktree-store

## What
Leaf worktrees and the merge stack checkout live in one akrogon-owned store outside every checkout, `~/.akrogon/worktrees/<repo>/<slug>`, for every registered repo. When a repo config omits `worktree_root`, the store is `~/.akrogon/worktrees/<repo name>`; an explicit value starting with `~` is expanded to the home directory. Worktrees are created sparse: `git worktree add --no-checkout`, then per-worktree non-cone `git sparse-checkout set --no-cone '/*' '!/issues/'`, then checkout, so the issues tree is never materialized in a worktree while the registered checkout stays full. Consumes from check-env: `withSetup` and the `akrogon run-check` verb; this leaf inserts its two guards into that composed command (B,C). akrogon refuses to create a worktree, and every printed check, merge check and advisory command refuses to run, when a canonical ancestor of the worktree holds `node_modules` or `package.json`, or the worktree's own `node_modules` is missing, naming the path.

## Why
A leaf under `<root>/issues/worktrees/<slug>` resolves packages from the root checkout's node_modules (Bun walks parent directories), so a root install turned hooks:selftest C8 red in every merge-gate leaf with clean diffs. The worktree's copy of the issues tree costs about 405 MiB per worktree and is never read there.

## Done-criteria
1. With `worktree_root` unset, dispatch creates a leaf worktree at `~/.akrogon/worktrees/<repo name>/<slug>`; with `worktree_root: ~/x`, at `<home>/x/<slug>`; `akrogon config` prints the resolved absolute `worktree_store`.
2. A created leaf worktree holds no `issues/` directory, `git status --porcelain` in it is empty, `core.sparseCheckout` is set only in that worktree's config, and the registered checkout keeps its full tree.
3. A rebase of a leaf commit across commits that change `issues/` in a sparse worktree succeeds with a clean status and no `issues/` materialized; the merge stack build runs in a sparse checkout under the store and a stack of two leaves rebases there.
4. Creating a worktree whose canonical ancestor holds `node_modules` or `package.json` is refused with that path named, and nothing is created.
5. Running any check, merge check or advisory command printed by `akrogon config` from a worktree whose ancestor holds `node_modules` or `package.json` exits non-zero naming the path before setup runs; a worktree whose own `node_modules` is still missing after setup exits non-zero naming it before the check runs. (B,C)
7. The location check accepts an intended canonical target path that does not exist yet and refuses it, naming the ancestor, when an ancestor holds `node_modules` or `package.json`. (B)
6. In a leaf created in the store, a package absent from the leaf's node_modules fails to resolve while the registered checkout's node_modules holds it; a local package resolves; a missing-package child invocation fails without fetching.
