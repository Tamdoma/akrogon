# Map A (written before reading B/C)

Evidence: run-check spawns child with no gate (src/run-check.ts:118-121, spawnCaptured src/shell.ts:38-45); install flock wraps setup only (src/config.ts:315); systemd 262 user manager live, cgroup v2 with cpu memory pids delegated to user@1000 (checked 2026-10-13); 32 threads.

F1 Where the host cap lives
- a: cgroup slice for every seat (harness template wrapped in `systemd-run --user --scope --slice=akrogon.slice`), slice-wide CPUQuota/MemoryMax/TasksMax. Covers workers, ad-hoc scripts, browsers; no bypass. Risk: throttled CPU makes timeouts/flakes instead of overload; Linux+systemd only.
- b: counting semaphore in run-check (N flock slot files under ~/.akrogon). Precise for config-resolved runs; bypassed by direct `bun run test:changed` and ad-hoc scripts.
- c: both: slice is the safety floor, run-check slots keep throughput sane. Recommend c.
F2 Stop reaches everything
- a: per-leaf scope/slice; pause/stop = `systemctl --user stop` of the leaf unit, kills orphans (browsers) by cgroup. Recommend.
- b: process-group kill in run-check; misses detached browsers (report step 3).
F3 Who runs tests
- a: workers never run test_changed; A runs it once per wave after landing. Removes N-per-wave multiplication. Cost: later red discovery.
- b: keep worker runs, gated by slots.
F4 Slot count: fixed config (e.g. host_test_slots: 2) vs derived from nproc/PSI. Recommend fixed config, start 2.
Destinations: akrogon (run-check gate, seat scope, pause stop, skill rule), pi-extensions (abort kills child), framework (selector breadth already in its own leaf).
Pitfalls: lock file per worktree (git-path) not host-wide; stale slot after crash (flock released by kernel on exit, fine); retry/base-run adds runs under load.
