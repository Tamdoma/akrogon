# Slot A notes: evidence-location Q1

## Pick
One compressed archive per closed owner, made when the owner moves to closed (A). Logs stay plain while the leaf is open, so every in-pass reader (verify output, review-B.md citations, merge receipts) is unchanged. At close, `implementation/*.log` and other leaf logs become one `evidence.tar.zst` with an index. Cost: `akrogon flaky` and any later reader must read a member from the archive; zstd becomes a dependency (Bun has no built-in zstd tar; `tar --zstd` needs GNU tar plus zstd).

## Rejected
- Per-log `.log.zst` in repo: about 8x smaller per file (B's 1.5 MB → 177 KB), but no cross-file dedup, so near-identical reruns each cost full compressed size. Every recorded path in timings.jsonl and verify-runs.jsonl changes name.
- Host store `~/.akrogon/evidence`: evidence leaves git, so a clone, a second host or a lost laptop loses it. Not lossless across machines. Needs its own backup and retention.
- Leaf temp reaped at leaf end: deletes evidence. Breaks the reporter's lossless ask and the test-runs "keep logs" lock.

## Evidence
- Writer: run-check.ts:207-209 copies out.log to `<leaf>/implementation/check-<name>-<ms>-<pid>.log` (code, 2026-10-15).
- Paths recorded: timings.jsonl `check_end.log` (run-check.ts:210-216), verify-runs.jsonl `log` (verify.ts:16-30); verify prints the path (verify.ts:163,170).
- Reader after close: flaky.ts:10-17 reads the log, swaps open→closed, else prints `(log gone)` silently.
- Owner move: completeOwner renames to issues/closed (phase.ts:191-224), the one hook where every leaf passes.
- Reporter measure: whole tar zstd -19 is 944 MB → 19 MB, about 50x.
- akrogon: 743 tracked logs, 19.2 MB; 364 have no current writer in src/ or skills/ (old names like merge-test.log, repair-*.log).

## Pitfalls
- Recorded log paths point at files that no longer exist after close: archive keeps the original relative path as member name, and one helper resolves path → archive member for flaky and others.
- `(log gone)` hides missing evidence: the archive change makes a missing member an error, not a silent string.
- Archive created but plain logs not removed, or removed before archive verified: write, test-extract, then delete.
- Pack still grows by compressed size forever (binary blobs do not delta): accepted, about 2% of today's size.

## Questions the fork does not ask
- Who reads closed evidence today besides flaky? If nobody, the host store is cheaper. I found no other code reader.
