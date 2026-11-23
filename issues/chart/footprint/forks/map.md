# Map merge: footprint (A, 2026-11-22)

Sources: slots/map-B.md, slots/map-C.md, A's census (Explore hand-back, copied in INTAKE findings). Real bytes are btrfs exclusive.

## Agreed (B,C)
- M1. Keep copyfile. On one copy-on-write filesystem node_modules is already shared (34 trees, 20 GB apparent, 1.2 GB real, all of it ffmpeg-static postinstall). Hardlink, symlink and a shared tree reopen #122 or break writers and path lookups. Isolated linker saves nothing. (B,C)
- M2. Bytes that overgrew are all named after an event (red run, deploy, consult, chart, pack), never after a live owner. Bound them by owner: the call that ends the owner removes the root. (B; C's "owner-bound allocation" is the same rule)
- M3. Kept red run roots: 16 GB here. run-scratch D1 (always remove at run end) already does this. (B,C)
- M4. Releases: 13 kept, 2.1 GB real. issues/ is 97% of each release. (B,C)
- M5. Watch consult folders: 1.7 to 3.1 GB, no rule. One folder per anchor, removed with the leaf. (B,C)
- M6. -uN worker worktrees: 3 idle for hours, 458 MB real each, removed only when the leaf ends. (B,C)
- M7. Evidence archives in git: about 6 MB a day in framework, no cap. History already committed stays. Only the inflow can be bounded. (B,C)
- M8. Bun cache: two caches, 3.65 + 1.74 GB real, no rule. Never auto-clear during runs. (B,C)
- M9. Cleanup uses reconcile's liveness tests, never rm by pattern (live verify and land units were running). (B,C)

## Disputed
- X1. Releases: B adds `issues/ export-ignore` in .gitattributes (250 MB to 70 MB, keeps the 24 h window so an old land never loses a module). C caps at current+previous with a live-pid guard. B's keeps a safety window C's drops.
- X2. Direct-route worktrees (168 MB each, never swept): B makes them sparse and ends them with the chart. C does not cover them.
- X3. Locks: B counts 12,179 empty lock files with no rule and moves them under the leaf temp. C does not cover it.
- X4. Archives: C proposes gitignoring them or packing only red logs. B asks first who reads them (Q1).
- X5. ext4: B adds an init probe that reports full-copy cost. C bounds the worktree count instead.

## Open for the operator
- Q1. Does anyone read logs inside closed leaves' evidence archives? If not, stop committing archives and keep only the receipt rows.
