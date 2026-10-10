# Opening map, slot A

## #63 dirty worktree hides failures
- Cause is plausible and mechanical. The merge gate runs in the leaf's long-lived worktree (skills/merge-issue/SKILL.md "on HEAD in the worktree"). The only cleanliness check before the gate is `git status --porcelain` in src/batch.ts:82-89, which never shows empty folders and never shows ignored files. So an empty untracked folder from an earlier round is invisible and survives into the gate. Framework fix 264cc2f5b (mkdir in the test) confirms the two folders were not tracked.
- Not proven: that the agent-content-extraction worktree held those folders at merge (worktree removed).
- Options:
  - O1 the command runs `git clean -fd` in the worktree before prompting B (removes untracked files and folders, keeps ignored ones like node_modules). Cheap, mechanical. Misses tests that need an ignored generated file.
  - O2 gate runs in a fresh worktree at the recorded top. Catches everything, but pays setup (bun install, framework build caches) on the serial merge turn, every attempt. Slows the bottleneck.
  - O3 skill text tells B to clean. Probabilistic, skipped under pressure.
- Pick O1 with `-x` excluded. Pitfall: clean deletes a seat's uncommitted work; removed because move() already refuses dirty worktrees (dirty-ref) and attempt-top has B commit nothing. Pitfall: solo mode B commits first, then clean.
- Interacts with merge-throughput leaves red-main-hold and bounce-repair-proof (same merge path); no overlap in mechanism.

## #69 host load flakes
- Evidence is weak. Host is 32 threads, 123 GB (heavy-run-slot fork, 2026-10-02). The 7 "load flakes" in framework#207 were classified by an agent from logs, not traced to load. 2 of them (EPIPE in deploy) and the zombie `bun test --isolate` look like test bugs, not load.
- The test-runs chart ruled out a slot on 2026-10-02 because #53 was a capture bug.
- Fork 1: trace first. Record host load (PSI, loadavg, count of running test processes) with each merge gate result, so a flake can be matched to load. Merge-attempt-records leaf (merge-throughput) already records attempts; adding load fields may belong there.
- Fork 2 if load is real: one host-wide slot for merge_checks only (flock), or lower max_active. Slot on merge only protects the bottleneck without slowing leaf checks.
- Pitfall: a slot without a trace repeats the 2026-10-02 mistake.

## Split
Two destinations: (1) a green gate means the pushed commit passes on a clean checkout; (2) a merge run fails only from code under test. Independent; run side by side.
