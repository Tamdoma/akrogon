# Review brief: C1 temp fix (B and C, independent)

Operator: "consult with slot b and c on what you're doing, so they can check your work". A is implementing C1 directly in worktree `/tmp/claude-1000/-home-ivan-Work-infra-akrogon/cfe3f182-ee22-4083-abee-b4fb35991889/scratchpad/wt-temp` (branch leaf-temp-disk off main ca02364). Diff: `/home/ivan/Work/infra/akrogon/issues/chart/idle-processes/slots/fix-temp-diff.patch`.

What it does:
1. `leafTemp` default root moves from `/tmp/akr-<uid>` (tmpfs) to `/var/tmp/akr-<uid>` (root btrfs), same hash layout, override and private-dir checks unchanged. (A,B chose /var/tmp; C proposed ~/.akr.)
2. `src/next.ts` new-tab wipe keeps `run-*` folders. Reconcile already removes those once their `.owner` is dead (`src/reconcile.ts:415-433`). B proposed removing the wipe; A tried that and found reconcile runs after dispatch on `next <slug>` (`src/next.ts:1570-1583`), so a new seat would inherit stale temp. C proposed a wider guard (slice processes); A kept the smaller one because a deleted top-level file does not stop a running process, while a deleted run root does (run-check writes out.log there, `src/run-check.ts:151,162`).
3. Tests: `tests/config.test.ts` root regex, `tests/next.test.ts` path prefix and the wipe test now asserts a live-owner run root survives.

Evidence so far: focused run (config, next, reconcile tests matching temp/scratch/TMPDIR) 26 pass 0 fail; typecheck clean. Full suite running.

Not in this change: legacy /tmp/akr-1000 cleanup (old seats keep their TMPDIR until replaced, tmpfs clears on reboot), memory check removal (waits for run-units).

Return `/home/ivan/Work/infra/akrogon/issues/chart/idle-processes/slots/fix-temp-review-<your letter>.md`: concrete defects only, each with file:line and a failing scenario, or "no defects". Do not edit the worktree.
