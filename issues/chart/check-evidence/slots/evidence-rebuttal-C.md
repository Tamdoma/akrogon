# Evidence-location rebuttal, slot C

1. O1 attributes "logs stay plain while the owner is open" to C without the second half of C's pick: plain on disk, never committed. C's notes bind the archive to a `.gitignore` for `issues/open/**/*.log` and `issues/chart/**/direct/*.log`, so `sync.ts:154-165` never commits a plain log and only the archive enters history. That is C's pick, not an open question; it is the only form in which the pack stops growing (log blobs already 115.7 MiB on disk across history, measured 2026-10-15).

2. Missing fact for P1: `timings.jsonl` is not an index of the copies. Framework holds 1,088 `check_end` events against 1,606 `implementation/check-*` files (measured 2026-10-15), so a resolver or migration that walks timings misses a third of the run-check copies; the archive must be built from the files on disk, not from records.

3. Correction to the resolution counts: over unique recorded paths in framework `issues/verify-runs.jsonl`, 1 resolves exact (the open leaf browser-socket-runtime), 75 via open→closed, 1 by neither (measured 2026-10-15; B's 77 exact counts repeated records). akrogon 21 / 21 / 12 agrees with B. No change to P1.

Q-commit: No. Ignore plain logs under `issues/open` and chart `direct`, archive at close, commit only the archive. Reason: every open-phase sync lands the plain log in the pack forever (`sync.ts:154-165`), and zlib already stores it there 8x smaller than the tree, so the close-time archive alone saves the tree but not the pack. Cost: an open or failed leaf's logs live on one host until close, as its leaf temp does today; a leaf that fails and never closes needs the failed path to archive too, or a reported plain log under `issues/open`.

No other disagreement: D-form, D-shared and the worker-worktree line (`worker-protocol.md:11`, `git worktree add --detach`, not sparse) stand as merged.
