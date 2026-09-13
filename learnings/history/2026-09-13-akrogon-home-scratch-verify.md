# AKROGON_HOME scratch verification

2026-09-13. Leaf rename-vocabulary changed `status --charts` output, but the worktree entrypoint could not read the authoritative root: pending root work had written a `prompted_at` state key the worktree schema rejects, so every repo reported `unreadable`.

Case: copy the real migrated `issues/chart/` tree into a scratch repo, write a minimal `config.yaml` registering it, and run `AKROGON_HOME=<scratch> bun <worktree>/src/akrogon.ts status --charts`. `globalHome()` reads `AKROGON_HOME` (src/config.ts:59), so the new code exercises real chart bytes without touching the root checkout or its pending state.

Learning: when a leaf changes command output but the live store is unreadable to the worktree's schema, a scratch `AKROGON_HOME` plus copied real data gives end-to-end evidence. Record the scratch path as the artifact.
