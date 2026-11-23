# Map brief: footprint

Read issues/chart/footprint/INTAKE.md (the operator's words are the destination's source) and CHART.md, plus issues/chart/bun-copyfile/ (why copyfile was chosen), src/reconcile.ts (store, temp, release sweeps), src/release.ts and src/self-update.ts (release builds and retention), src/config.ts (worktreeStore, leafTemp, setupCommand), src/guard.ts (own-modules), src/pack.ts. Code: /home/ivan/.akrogon/worktrees/akrogon/land-own-reds (main plus land-own-reds). Measure on this host where useful (btrfs: `btrfs filesystem du -s` gives the real Exclusive bytes).

Map independently, aiming for the fewest parts, any PC, and fast, predictable merges:
1. Every place akrogon or a managed repo stores bytes that are redundant or can grow without bound: worktree store (leaf, verify-*, batch-*, -uN copies), node_modules per worktree, ~/.akrogon/releases, Bun cache, temp roots, evidence archives in git, ledgers (*.jsonl), logs, worktrees of other harnesses (.claude/worktrees). Give a measured size and the rule that removes each one today, or say there is none.
2. node_modules with no redundancy: compare copyfile (reflink on btrfs/xfs, full copy on ext4), hardlink (rejected in #122, give the reason), a shared read-only node_modules per lockfile hash with a symlink in each worktree, and Bun's isolated linker. What breaks for each: tools that write into node_modules, native builds, the own-modules guard, verify on a fresh checkout, ext4 PCs.
3. "No overgrowth MUST be maintained": what single mechanism bounds the footprint by construction, not by a sweep that can fall behind? Name the existing rule it replaces or tightens.
4. Pitfalls over the lifetime and what each option could break.

Write slots/map-<your slot letter>.md, then run: hc send t126 "done <letter>: <path>"
