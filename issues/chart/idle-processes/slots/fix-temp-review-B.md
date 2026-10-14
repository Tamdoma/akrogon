# F1. The dispatch wipe still deletes a running check's captured output

**Fix — `src/next.ts:466–468` in the reviewed wt-temp worktree.** Preserving `run-*` does not preserve all files owned by a detached run-check or base-run.

Failing scenario:

1. A seat launches a detached run-check with its inherited `TMPDIR=<leaf scratch>`. `constructedEnv` sets the **child's** TMPDIR to `run-*`, without changing the wrapper's environment (`src/run-check.ts:45–57`).
2. `spawnLogged` calls `spawnCaptured` (`src/run-check.ts:66`). The wrapper's `spawnFiles` creates `<leaf scratch>/akrogon-io-*/out` and `err` using its own `tmpdir()`, not the supplied child environment (`src/shell.ts:34–43`). Base-run uses the same path through `spawnLogged` (`src/base-run.ts:165–169`).
3. The tab disappears while that check continues. Redispatch executes the new wipe. It keeps `run-*` but removes the live `akrogon-io-*` directory.
4. The child can keep writing through its open descriptors, but when it exits, `finishCaptured` reopens the deleted paths with `readFileSync` and throws ENOENT (`src/shell.ts:54–61`). `spawnLogged` never appends the result, and run-check never reaches its saved-log/check_end path (`src/run-check.ts:181–196`). A successful child therefore becomes an incomplete check with lost output.

This is a source-traced failure in the exact detached-check scenario being fixed, not a claim that the earlier vanished merge retry had this cause. The new test creates only a `run-detached/.owner` sentinel, so it cannot catch this failure (`tests/next.test.ts:3907–3920`).

Remove the dispatch wipe, or defer the whole wipe while scratch has active owners using ownership coordination that also covers concurrent starts. Merely preserving another filename prefix does not establish ownership. Prove the repair with a real captured child that survives redispatch and returns its output and terminal check evidence.
