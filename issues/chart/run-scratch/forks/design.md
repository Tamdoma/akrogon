# Design: run-scratch

## Question

How do run folders stop piling up, then move to RAM (#148 lock), on any PC, with the fewest parts?

## A's draft (from lean-akrogon map-merged "After rebuttals")

- D1 (K3). Every run root is removed at run end, green or red. `.akrogon-kept` and its reconcile branch go. Refused-root keep stays (C 5).
  Evidence: run-check exports `AKROGON_EVIDENCE=<holder>/evidence-<check>-<run>/` (created empty, next to the check log). Whatever the command writes there survives. Empty is removed at run end. `pack` takes `evidence-*/**` beside `**/*.log`. Skills name the path. The framework adopts it by seed, not as a gate.
- D2 (K5). The run guard (src/scope.ts startRunGuard) also does `rm -rf <run root>` after the wrapper dies. No new sweep.
- D3 (K2). One optional machine-config key `run_root: <abs path>`. When set, run roots are created under `<run_root>/<repo hash>/<leaf hash>/run-*` (same layout as the leaf temp, so reconcile reads one more root). When absent, they stay under the leaf temp on disk. Seat TMPDIR stays on disk. `init` proposes the key when /tmp is tmpfs and at least 25% of RAM. This host sets it.
- D4. The receipt row records the run unit's `memory.peak` (cgroup file read before the scope stops), so a later automatic choice can be decided on data.
- Figure: temp root size after a full verify (du of the leaf temp roots), and run roots left per verify. Baseline before landing. Undo if run roots still remain after green runs, or if any ENOSPC on tmpfs.

## Open points for the final-shape check

- P-a. D3 makes run roots live under a second root. Is a whole-leaf-temp-root switch simpler (one setting, no second layout) while keeping seat TMPDIR on disk, or does it move seat files to RAM?
- P-b. D2: is `rm -rf` in a guard shell safe if the run root path is quoted and the wrapper's own finally already removed it?
- P-c. D4: where is memory.peak readable for a scope (cgroup v2 path via AKROGON_CGROUP_ROOT), and is it read before the scope collects?
- P-d. Rollback safety: the receipt gains a field (schema-only release first, like land-own-reds commit 2), and config gains a key (strictObject).

## Taken (A, 2026-11-22, after slots/final-B.md and slots/final-C.md)

- D1 (K3). Every run root is removed at run end, green or red. `.akrogon-kept` and its reconcile branch are deleted. Refused-root keep stays as it is (rare, reported). (A,B,C)
  Evidence: run-check exports `AKROGON_EVIDENCE=<leaf temp>/evidence/<check>-<run>` and does not create it. The command runs `mkdir -p` if it wants it. The folder lives on disk outside git and goes with the leaf temp, the same rule kept roots follow today. This means no pack change, no ignore lines and no new evidence member kind. The name is reserved in repo env/pass_env. (B X1. C's ignore/pack scenarios no longer apply.)
- D2 (K5) cut. Reconcile's dead-owner drop already removes a dead wrapper's root, and leaf-slice stops kill the guard too. (B X3. C's reorder is no longer needed.)
- D3 (K2). An optional machine-config key `run_root: <abs path>` puts run roots flat at `<run_root>/run-XXXXXX`. Seat TMPDIR stays on disk. The host step reads it with one loop using the existing refusal/owner-age/dead-owner rules. The schema refuses a path equal to or inside the retired root or the leaf temp root (B S2) and longer than 40 bytes (B S3, Chrome socket). It ships in two releases: (a) the schema accepts and ignores the key, (b) the key is used. A rollback past (a) needs the key removed by hand first. The init-akrogon skill prose proposes it, not init.ts code (C). No env override is needed, because test homes read their own config.
- D4 (memory.peak) cut. It cannot be read after the scope collects, and on disk it is mostly page cache. (B, C)
- Before release: remove the existing kept roots by hand (28 now) so the first pass does not block (B P-d).
- Figure: leaf temp root size and run roots left after a full verify; seconds from command exit to return (B S4); the `akrogon.slice` memory.events `high` count. Baseline before landing. Undo if green runs leave run roots, any ENOSPC on tmpfs, or `high` rises after run_root is set.

## Split (A, 2026-11-22, after slots/review-D-1.md)

D's five findings are all in commit 2 (flat run_root). D found none in commit 1. Commit 1 (703f784d: every run root removed, AKROGON_EVIDENCE, run_root accepted only) lands first. That is the #148 lock's first step, stopping the pile-up.
Commit 2 is parked on branch run-scratch-ram (6396e3a6) and needs a redesign before it returns:
- F1. The leaf temp is protected only by an `.owner` under it. A flat root moves that `.owner` away, so reconcile removes a live check's evidence. The run must leave a liveness record under the leaf temp.
- F2/F4. Resolve run_root with realpath at parse time, and refuse a symlink or any path that resolves inside the retired or leaf temp root.
- F3. The flat sweep must treat an entry that vanished between listing and stat as gone.
- F5. A moved or removed run_root strands its roots. Either the host step also sweeps the last used root, recorded in the host state, or the docs state the hand cleanup.
