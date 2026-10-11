# Issue: worktree-isolation

Destination: a leaf worktree's checks give the same result as a clean standalone checkout of the same commit; nothing outside the worktree can change a leaf's check result. This issue holds the akrogon code changes.

Chart: framework repo issues/chart/worktree-isolation (registered root /home/ivan/Work/infra/tamdoma/framework). Framework leaves (copyfile-install, root-influence, check-scratch, recording-consumers) are a sibling issue in the framework repo.

## Leaves
- check-env: owns `withSetup`, the `akrogon run-check` verb and the `env:` schema; constructed check env, refusals, per-run TMPDIR root, runner log destination, scratch off tmpfs, tool record. blocked-by: none. (B,C)
- worktree-store: store outside every checkout, sparse worktrees without issues/, ancestor and own-modules guards inserted into check-env's composed command, target-path location check. blocked-by: check-env. (B,C)
- leaf-env-file: per-leaf 0600 .env written at dispatch from check-env's `env:` schema. blocked-by: check-env. (B)
- base-run: the `akrogon base-run` verb and the akrogon skill text swap. blocked-by: worktree-store, check-env, leaf-env-file. (B,C)
- worktree-reconciler: per-pass reconciler and migration of old worktrees, including unconfirmed base-run entries. blocked-by: worktree-store, check-env, base-run. (B,C)

## Operator steps on main
- S2: akrogon issues/config.yaml `worktree_root` moves to the store (or the line is removed to take the default), after worktree-store lands.
- S1 (framework repo): `worktree_root`, `setup` with `--backend=copyfile`, and the `env:` list, after worktree-store, check-env and framework copyfile-install land.
