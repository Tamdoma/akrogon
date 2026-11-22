# Direct plan: land-hold

Brief and design: forks/fix-shape.md `## Taken` items 1-6 plus the corrections below (no separate leaf files on the direct route).

Corrections after the final check (slots/final-B.md, slots/final-C.md), A's pick 2026-11-22:
- 1'. Exits and wakes run after the hold ends (B F6, C 2).
- 2'. A waiting listed run of the holding attempt goes ahead of the line's other waiters (B F1).
- 2''. A listed run nests under a live land run of its repo (C 3).
- 4'. The main-red `failed` stop also takes a traced defect in main's code a narrow rerun cannot trigger, such as a suite race (C 4). A repeated named title on an unchanged head with a green `base_verdict` stays `check.fix` (B F3, lock red-exit 3). The second-red refusal text is reworded in src/phase.ts, merge-issue and state-and-phases (B F4).
- 5'. lifecycle-rules `## Kept command output`: a run waiting for a land is no failure (B F7).
- Accepted cost (B F2, S3; C 1): runs held back by one land start together when it ends, beside the next land's start; framework leaf verifies ran median 42 s, max 72 s on 2026-11-22. Reopen drain only if lands that start right after another land stay red.
- Status keeps one listing (`lineRuns`), widened to holds and waiting runs; the queue keeps its `full` filter, so the hold never heads the line (B F5 checked).

Done criteria and proofs:
1. A later run of the repo without the hold's attempt waits for a live hold and starts after it; a run already live, a run of the holding attempt and another repo's run do not wait. tests/run-permit.test.ts "a merge attempt holds its repo..."
2. A killed hold stops holding; stop-run cancels a run waiting behind a hold. "a killed hold stops holding..."
3. A listed run of the holding attempt starts ahead of earlier line waiters. "a listed run of the holding attempt..."
4. A listed run nested under a hold of its repo starts at once (deliberate break of `nested` hangs it). "a listed run nested under a hold..."
5. A run that waited behind one hold starts when it ends, beside a later hold. "a run that waited behind one hold..."
6. `land` holds its repo for its attempt with a unit that is not `akrogon-land-<id>`, a leaf run-check waits for `<repo>/aa land`, and the exit runs after. tests/merge-red-exit.test.ts "a land run holds its repo..."
7. Rule text per 4', 5' and Taken 5 (read by the reviewer).
Red before: tests 1, 2, 3, 5 and 6 fail on base fdc5acdd; test 4 fails on a reverted `nested` line.

## Round 1 repair (review-D-1.md)

- F1: the hold is the record marked `land: true` (src/land.ts, src/admission.ts `holds`); a run carrying the attempt is admitted through a live land only and never holds. Proof: "a dead land stops holding even while its own check lives, and stop-run cancels a held-back run".
- F2: the line keeps every started listed run ahead; the hold filters only waiters. Proof: "a listed run of the holding attempt starts ahead of the line's earlier waiters" now holds a started leaf `test` before the land and asserts the land's own `test` waits for it.
- F3: Test-Change trailers on 66e98364c0d655eebe303beeebb80e758aa1eb34.
- F4: the first hold test runs a land of another registered repo name beside it; the land test makes bb wait in merge and asserts the next land's launch saw no live land record.

## Proof commands and results

Run in ~/.akrogon/worktrees/akrogon/land-hold on 66e98364c0d655eebe303beeebb80e758aa1eb34, 2026-11-22:
- `bunx prettier --check src tests skills/chart-issues/scripts`: clean. `bun run typecheck`: clean.
- `bun test --timeout=30000 --parallel=4 --no-isolate`: 1321 pass, 0 fail (197.7 s).
- `bun test tests/run-permit.test.ts`: 22 pass.
- Exit-order break: with the exit moved inside `withAdmission` in src/land.ts, `bun test tests/merge-red-exit.test.ts -t "a land run holds its repo"` failed: the bb land launch line ended `holds=1`. Restored: 1 pass.
- Earlier, on 6690a8a3: tests 1, 2, 3, 5 and 6 failed on base src; the nested test hung and failed with the `nested` line reverted (A's runs, not kept as logs).

## Round 2 repair (review-D-2.md)

- F2: tests/run-permit.test.ts "a listed run that started while the land waited on its slice lock stays ahead of the land" on 91af3f0a67b8780dbcc26f6c0efd7c18d7fa684d. With the pre-repair filter `entry.full && held(entry) === undefined`, `bun test tests/run-permit.test.ts -t "slice lock stays ahead"` failed (the land's `test` run never waited for leaf-one); restored: 1 pass.

## Round 3 repair (review-D-3.md)

- F5: the race case holds the slice lock through `withLock` and releases it in `finally` (63ec3eae5b27f100c9f6a13ca1c803011a0b49c4). `bun run typecheck` clean; the case passes on the repair and fails with the pre-repair filter; full suite 1322 pass, 0 fail (183.8 s).
