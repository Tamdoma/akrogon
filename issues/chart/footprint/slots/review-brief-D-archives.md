# Review brief: stop-archives (slot D)

Decision: /home/ivan/Work/infra/akrogon/issues/chart/footprint/forks/archives.md ("Proof and pick").
Worktree /home/ivan/.akrogon/worktrees/akrogon/stop-archives, base origin/main f323d9fc. Two commits:
- cb780d97 fix: knownRedReceipt reads stored failures before any log (legacy rows without failures still read the log; gone log on a legacy row never covers).
- 47885cf7 feat: completeOwner deletes the owner's plain logs (new pack.ts logFiles, symlinks refused, full list before any delete) instead of packFolderLocked; same lock, .closing marker, capture refusals. akrogon pack and old archives unchanged.
Key judgment call: two existing tests asserted "stored names never satisfy the receipt when a linked head or base log is gone"; they were flipped. Find why that rule existed (git log -S / blame on those tests and knownRedReceipt) and whether trusting stored names opens a hole (forged or stale rows, a row whose names don't match its log, a gate a seat can satisfy without a real red).
Also check: any reader that still expects a closed leaf's log or archive; the run-check .closing comment; docs.
Verdict ready or fix.
