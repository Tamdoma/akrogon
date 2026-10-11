# Design: worktree-store

## Binding decisions, verbatim
Chart: framework repo issues/chart/worktree-isolation (registered root /home/ivan/Work/infra/tamdoma/framework).

### Boundary (forks/boundary.md)
Applies: 1 and 2 (store, ancestor guard, stack build in the store, proof). 3 is done and excluded.
#### Taken
2026-10-10, operator: "1a | 2 - Why do we have to move them outside of the repo, can you tell me?  What do we get with that? | 3a |" then "2a".

1. 1a: root influence is removed from dependency lookup, installed deps and implicit inputs; toolchain, credentials and live services are declared inputs. Foreclosed: 1b full sandbox, 1c C8 only.
2. 2a: leaf worktrees live in one akrogon-owned persistent store outside every checkout, `~/.akrogon/worktrees/<repo>/<slug>`, canonical path recorded once, for all registered repos (each repo's issues/config.yaml worktree_root changes; the akrogon default changes). The merge stack build (batch.ts:95-96) and base-red reruns use the same store. Ancestor guard: akrogon refuses to create a worktree, and refuses to run any check or merge check, when a canonical ancestor of the worktree holds node_modules or package.json, or when the worktree's own node_modules is missing, naming the path. This also keeps Bun auto-install off (an existing node_modules stops it); independently rooted test fixtures carry their own bunfig `[install] auto = "disable"` or empty node_modules. Proof: a created leaf missing a package fails to resolve it while the registered root holds it; a missing-package child invocation fails without fetching; a local-package invocation succeeds. Scope (B R1): this removes registered-root ancestor lookup and nested scanning; installed byte sharing and the .env link stay with install-sharing and outside-inputs. Foreclosed: 2b whole-seat namespace (mount mapping, coverage, new red sources, Linux-only), 2c compatibility symlink (second name, git reports the physical path), barrier folders, resolver interception, isolated linker, empty-root rule, bare-repo layout, copy per check, tombstones, merge-only outside.
3. 3a: temporary unblock done 2026-10-10 (see Partial answers); not acceptance proof for this destination.


### Disk stock (forks/disk-stock.md)
Applies: 2a for ensureWorktree and the stack build. 1a and 3a belong to the framework recording-consumers leaf and the operator sweep S4. base-run's sparse create belongs to base-run, which reuses this leaf's helper. Migration recreate belongs to worktree-reconciler.
#### Taken 2026-10-10
Operator: "1a | 2a | 3a |".
- 1a: every capture, record and run-*-proof script builds its consumer through the one builder (composition-spine capture.ts switches from rsync), the archive excludes issues/, and the lane's consumer is deleted in finally while holding its flock. Fixed lane paths stay, so trust holds. Crash sweep acquires and holds the lane flock before removal. Done-criterion: each multi-stage driver's later stage runs from a removed consumer.
- 2a: ensureWorktree and base-run create worktrees with `--no-checkout`, then per-worktree non-cone sparse-checkout `'/*' '!/issues/'`, then checkout. The root stays full. Migration 1a recreate applies it to old leaves. Done-criterion: leaf checks, base-run and a stack rebase pass in a sparse worktree, and reconciler clean-checks read it as clean.
- 3a: one sweep of root .temp, including proof-34b-a-consumer and the four hand notes, after 1a lands and with no proof holding a lane flock. The outputs sensor keeps it empty after.


### Migration (forks/migration.md)
Applies here only: "`~` in worktree_root is home-expanded." The rest of migration 1a and 2a belongs to worktree-reconciler.

### Exclusions
- outside-inputs (constructed env, env-var and global-bunfig refusals, tool record): check-env. Per-leaf .env file: leaf-env-file.
- outputs (run roots, scratch root move): check-env; reconciler sweep: worktree-reconciler. Framework writers and sensor: framework check-scratch.
- install-sharing copyfile `setup` line and both repos' `worktree_root` lines: operator steps S1 and S2 on main, after this leaf lands.
- base-rerun: base-run.

## Standing design

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

Interpretation: tests run real git and real worktrees in temporary repos (no mocked git). Negative cases are the guard refusals of done-criteria 4 and 5, each naming the path. The resolution proof (6) uses a real Bun child process in a fixture whose temp root carries its own node_modules above the store-like path. Every akrogon test sets AKROGON_HOME-style overrides and a temporary home for the store, never the operator's `~/.akrogon`. A guard change shows one deliberate break turning its test red.

## Leaf architecture
Owned surfaces:
- `src/config.ts`: `repoSchema.worktree_root` becomes optional; `worktreeStore(repo)` returns `expandPath(worktree_root)` when set (home-expanded, absolute) and `~/.akrogon/worktrees/<repo.name>` when unset.
- `src/next.ts` `ensureWorktree`: sparse creation sequence (`--no-checkout`, worktree-local sparse set, checkout) for both new-branch and existing-branch paths; ancestor guard before `git worktree add`. Exports one helper `createSparseWorktree(repo, path, ref, opts)` that base-run and buildStack reuse.
- `src/batch.ts` `buildStack`: the detached stack checkout is created through the same helper under the store instead of `leafTemp(repo, 'batch-...')`, still removed in finally.
- `src/config.ts` `withSetup` (owned by check-env; this leaf inserts the guards): the final composed line is `akrogon run-check -- sh -c 'akrogon guard ancestors && flock <lock> sh -c <setup> && akrogon guard own-modules && <cmd>'`: run-check performs the caller refusals and builds the constructed env, then the ancestor guard, then lock and setup, then the own-modules guard, then the command (with no `setup`: both guards back to back, then the command). (B,C) New verb in `src/akrogon.ts` plus `src/guard.ts`: `ancestors` refuses when any canonical ancestor of `git rev-parse --show-toplevel` holds `node_modules` or `package.json`; `own-modules` refuses when the toplevel's own `node_modules` is missing. Each prints the offending path and exits 1. `src/guard.ts` also exports `checkLocation(targetPath)`: canonicalizes the nearest existing ancestor of an intended path that may not exist yet and refuses when any ancestor holds `node_modules` or `package.json`; `ensureWorktree`, buildStack and base-run call it before allocation. (B)
- `src/init.ts`: no gitignore line when the store is outside the checkout (existing `within` check already covers this; verify).
Interfaces: `akrogon guard ancestors|own-modules` (cwd = checkout) exit 0 or 1 with a path; `createSparseWorktree` and `checkLocation(targetPath)` used by base-run and worktree-reconciler. (B)
Exclusions: migration of existing worktrees (worktree-reconciler); env construction and `withSetup` ownership (check-env). (B,C)
Dependencies: blocked-by check-env (consumes `withSetup` and `run-check`). Order inside a wrapped command: run-check, ancestor guard, flock setup, own-node_modules guard, check, so a fresh worktree gets its install before the own-modules check. (B,C)
