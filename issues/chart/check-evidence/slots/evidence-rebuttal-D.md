# Rebuttal: evidence-location Q1 (Slot D)

## Disagreements

- **On P2 (`(log gone)` as a hard error in `src/flaky.ts:10-17`)**: As Evidence line 12 notes, `issues/verify-runs.jsonl` already contains historical red entries whose recorded log path resolves by neither `open` nor `closed` (`1` in `framework`, `12 of 54` in `akrogon`). Making `failedTests` (`src/flaky.ts:12`) throw on any missing log will crash `akrogon flaky` on both repos today; instead, throw on archive read/decompression errors (or missing archive members when the owner's `logs.tar.zst` exists and lists the member), while keeping `['(log gone)']` for historical `verify-runs.jsonl` entries whose owner has neither the plain file nor the archive member.

## Q-commit

**Pick: Do not commit plain `*.log` files under `issues/open/` (gitignore `issues/open/**/*.log`); commit only `issues/closed/<owner>/logs.tar.zst` once the owner closes.**
While an owner is open or `failed` (`base-red-rule.md:27`), all seats and the operator run on the same host checkout and read the plain `.log` files on disk. If `akrogon sync` (`src/sync.ts:154-165`) commits plain `issues/open/**/*.log` before close, every raw log enters `.git/objects/pack` as an individual zlib blob forever (`~8x` instead of `25x–50x` cross-run `zstd` dedup), even after `completeOwner` replaces them with `logs.tar.zst`. Gitignoring `issues/open/**/*.log` keeps both the working tree and the git pack small while preserving every log into `issues/closed/<owner>/logs.tar.zst` at close.
