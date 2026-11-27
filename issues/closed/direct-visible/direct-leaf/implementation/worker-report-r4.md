Changed files and reasons: `src/reconcile.ts` now checks `broadcastPending` before probing the recorded direct reviewer. This keeps the worktree, temp directory, and slice before acknowledgement even if B is gone. Acknowledged cleanup and managed lifecycle behavior are unchanged.

Tests run:
- `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'` passed.
- `akrogon run-check --name r4-replacement -- bun test tests/direct-land.test.ts --timeout=120000 -t 'a pending broadcast keeps cleanup held for a replacement reviewer'` passed (1 test).
- `akrogon run-check --name r4-reconcile -- bun test tests/reconcile.test.ts --timeout=120000` passed (46 tests).
- `bunx prettier --check src/reconcile.ts` passed.

Kept check lines:
```text
check r4-replacement: 0 /home/ivan/Work/infra/akrogon/issues/open/direct-visible/direct-leaf/implementation/check-r4-replacement-1795643352107-445622.log
check r4-reconcile: 0 /home/ivan/Work/infra/akrogon/issues/open/direct-visible/direct-leaf/implementation/check-r4-reconcile-1795643359673-449481.log
```

Known limitations: None known.

Unverified criteria: Criterion 2 is partially verified. The replacement test confirms release after the acknowledged turn advances. The separate cross-session cases, including disappearance after acknowledgement, were outside the prescribed test filter and were not rerun.
