# Intake: check-evidence

## Scope
Check evidence kept losslessly without growing the checkout by about 1 GB of logs. Independent of worktree-cleanup and peer-wait-harness.

## Provenance
- GitHub: Tamdoma/akrogon#92
- Operator: 2026-10-15, "3 new issues came in. Let's consult with slot b and slot c and slot d, and let's chart them out."; split answer `1a` (three charts, order worktree-cleanup, check-evidence, peer-wait-harness)

## Source: Tamdoma/akrogon#92
# Check logs kept under issues/ grow the consumer repo by about 1 GB: tamdoma/framework tracks 944 MB of *.log in 4,460 files

Source: Tamdoma/akrogon#92
URL: https://github.com/Tamdoma/akrogon/issues/92

Origin repo: Tamdoma/tamdoma-framework

Unverified intake.

## Observation
On 2026-10-15 the tamdoma/framework checkout measured 3.9 GB on disk. `issues/` was 1.1 GB, and 944 MB of that is tracked `*.log` files under `issues/` (4,460 files, mostly `issues/closed/**`). The largest kinds by count are `check-cheap-*`, `check-verify-*`, `check-test_changed-*`, `check-selftest-*` and `check-setup-*` (run-check copies), plus `selftest.log`, `contracts.log`, `parity.log`, `test.log`, `test_changed.log` and `verify.log` inside `implementation/` and `merge-evidence-*` folders. Single files reach 2 to 3 MB, for example `issues/closed/backlink-audit-run/disavow/prior-disavow-lookup/implementation/check-verify-1792021674750-375809.log`.

All of these logs together, as a tar compressed with `zstd -19`, come to 19 MB, about 50 times smaller with no information lost. The git pack is 174 MB and grows with every merged leaf.

Reporter: the logs are needed as evidence, but they should be kept in a form that does not grow this large and loses no information.

## Location
`akrogon run-check` keeps logs at `src/run-check.ts:207-209`. Each check's `out.log` is copied verbatim to `<leaf>/implementation/check-<name>-<ms>-<pid>.log`, and the leaf target is resolved at `src/run-check.ts:107-127`. The leaf folders move to `issues/closed/` on completion and are committed in the consumer repo.

## Reproduction
Any leaf that runs `akrogon run-check` or `akrogon verify` adds one uncompressed log per check run to its leaf folder. Measured with:
`git ls-files -z 'issues/*.log' | xargs -0 stat -c %s | awk '{s+=$1} END{print s/1048576}'` → 944
`git ls-files -z 'issues/*.log' | tar --null -T - -cf - | zstd -19 -T0 -c | wc -c` → about 19 MB

## Expected behavior
Not provided. The reporter's target is the whole framework checkout at a couple hundred MB at most, with the check evidence still complete.

## Urgency
Every check run adds its full log to the consumer repo and its history, which bloats clones, worktrees (each leaf worktree carries `issues/` too) and the git pack. No workaround is known. Deleting the logs loses evidence the reporter wants kept.

## Suspected cause
The main cause is that `src/run-check.ts:208-209` keeps every check run by copying `out.log` byte for byte into the leaf's `implementation/` folder, with no compression, deduplication or retention limit. A contributing cause is that repeated runs of the same check (re-checks, repairs, merges) each keep a full new copy, so one leaf holds many near-identical logs.
Whose view: both. The reporter observed the size and asked for a lossless smaller form. The agent traced the writer and measured compression.
Files read: `src/run-check.ts` lines 82-127 and 160-223 in the akrogon checkout at /home/ivan/Work/infra/akrogon; `src/verify.ts` (grep only).
Not inspected: which code writes the un-prefixed `selftest.log`, `contracts.log`, `parity.log` and `test.log` files in `merge-evidence-*` and `implementation/` folders. `src/verify.ts` holds no such paths, so they may come from the merge-issue or implement-issue skill instructions rather than akrogon source.
Related reports: Tamdoma/akrogon#49 covers temp folders left in /tmp, which is a different location and not tracked files. Searched Tamdoma/akrogon, all states, my reports since 2026-10-13 (limit 30), and "check logs size" (limit 8). None cover this.

## Agent findings
Opening maps by A, B, C, D and the merged map with rebuttals: [slots](../worktree-cleanup/slots/) (`map-A.md` … `map-D.md`, `map-merged.md`, `map-rebuttal-*.md`). Per-fork findings live in the fork files.
