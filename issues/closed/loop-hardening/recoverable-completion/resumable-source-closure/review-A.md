# Review A: resumable-source-closure

Base: 35a20886b65463c0c7c6b0a30047f56a680d5e63
Reviewed head: 611d52b (Retry source closure before completion moves and cleanup)
Debate: no. No positions-A.md or rebuttal-A.md expected.

## Verdict: nits

## Verification (rerun by A in the worktree)

| Check | Exit |
|---|---|
| bun run format | 0, no working-tree change after formatting |
| bun run typecheck | 0 |
| bun test | 0, 131 pass / 0 fail across 10 files |
| test_changed (AKROGON_BASE=35a20886) | 0, 52 pass / 0 fail across phase.test.ts and next.test.ts |

Evidence in the leaf matches: evidence/cli-red.log (red 40 pass / 11 fail), evidence/cli-verification.log, format.log, typecheck.log, full-test.log. Diff touches only src/phase.ts, src/pull.ts, src/next.ts and the three test files. No issue artifacts on the branch.

## Criteria traced

- A1 (failed closure resumable): `completeOwner` closes before the `issue complete` print and before any rename. Failure propagates through `commitMove`, whose finally still logs the move. The standalone/epic loop test proves exit nonzero, no completion line, chart and owner under open, merged state logged, then `next <slug>` skips CLOSED #2, closes #1, moves owner and chart, and a repeated `phase merged` is rejected.
- A2 (intersection rule): private = sources in every leaf of the issue minus sibling union, whole union for a standalone issue, remaining union at epic completion. The two-issue test proves first closes only #2 with first's HEAD, second closes #3 then #1 with last's HEAD and skips CLOSED #2. The asymmetric test proves an empty-source leaf empties the intersection so nothing closes until the epic completes.
- A3 (existing guarantees): completion-reports-each retained and updated. Standalone union, empty sources without worktree, CLOSED skip, destination collision (still checked before external mutation when complete), missing worktree before rename, malformed responses, retry comment listing and repeated-merged rejection all present. Final-epic failure after private success is the epic variant of the loop test.
- A4 (cleanup ordering): `--all` awaits `sweepAll` then rediscovers leaves; `cleanupMerged` returns for any leaf under issues/open. next.test.ts proves recovery before removal with the worktree, open lock and open owner probed, retention of worktree/branch/tab on failure, and retention for a completed issue waiting on a hand-built sibling.
- D3: `closeSources(repo, sources, leaf)` reads HEAD only from the leaf worktree, empty set returns before the worktree check, nonempty set without worktree fails with slug and sources. `closeSource` untouched.
- D5: fake-gh probe now requires open owner, absent closed destination, held open lock and live worktree. All probe callers updated, including merge recovery in next.test.ts.

Tests spawn the real CLI in real git repositories with fake gh/herdr only at the process boundary. String assertions are limited to `issue complete`, which the merge-issue skill keys on literally, and the fake's own stderr text.

## Nits

N1. Every sweep re-derives ownership and runs `gh issue view` for each private source of every merged leaf still under open, so an epic with several completed issues probes GitHub N-leaves times per sweep until the epic moves. The plan accepted this in D1 (closeSource checks GitHub state, no persisted ownership), so it is a cost note, not a defect.

N2. docs/merge.html still says the folder moves before GitHub closure. The plan's R3 and the brief exclude documentation from this leaf. B owns doc and index authorship.

No Fix. No lesson recorded.

## Merge attempt 1 (slot A)

Rebase of 611d52b onto origin/main at eed65fb70e72215d300d40c5187b77ec01d01bdc (includes 131b02d "Fix dispatch session and recorded seat guards") stopped with a conflict.

Conflicting file: tests/next.test.ts, lines 851–1084. Both sides append new tests at the end of the file: upstream (HEAD, 851–1016) adds dispatch session and seat guard tests, this leaf (1016–1084) adds the two startup closure/cleanup tests. Both blocks are true entries and should be retained in order, then checks rerun with AKROGON_BASE=eed65fb70e72215d300d40c5187b77ec01d01bdc. The rebase is left in progress in the worktree for B. Checks not run on the conflicted tree.

## Re-check after check.fix round 1 (slot A)

Prior reviewed head: 611d52b on base 35a20886. Integration baseline: eed65fb70e72215d300d40c5187b77ec01d01bdc. Repaired head: 3902efb441a278a84e6b9ea997bf0f920a9c17d7, a single rebased commit on eed65fb. Rebase finished, worktree clean.

Repair diff inspected via git range-diff 35a2088..611d52b eed65fb..3902efb:

- tests/next.test.ts keeps the whole upstream session/seat test block followed by both leaf startup closure/cleanup tests. No assertion changed.
- src/next.ts tab_closed handler moved from removed allLeaves and the old dispatchLeaf/sweepAll signatures to registeredRepos/discover, Leaf, Invocation and DispatchOutcome. Verified eed65fb itself references allLeaves in src/next.ts while src/state.ts on that commit no longer exports it, so the base was broken and the repair fixes it forward. The closure patch in src/phase.ts and src/pull.ts is unchanged.

Checks rerun by A on 3902efb:

| Check | Exit |
|---|---|
| bun run format | 0, no working-tree change |
| bun run typecheck | 0 |
| bun test | 0, 143 pass / 0 fail across 10 files |
| test_changed (AKROGON_BASE=eed65fb) | 0, 64 pass / 0 fail |

Earlier findings confirmed. N1 and N2 stand unchanged. No defect introduced by the repair.

N3. origin/main has since advanced to a6b53fd, which applies the same tab_closed handler fix with owners[0] inline instead of an owner local. The next rebase will conflict in that hunk. Taking upstream's version resolves it with no behavior change. Merge-slot concern, not a repair defect.

Verdict: nits.

## Merge attempt 2 (slot A)

Rebase of 3902efb onto origin/main at 352fe91da011147a51561ddbfc295d7d29e00c54 (352fe91) stopped with a conflict.

Conflicting file: src/next.ts, lines 557–562, the tab_closed handler's dispatchLeaf call. Upstream a6b53fd already applies the same interface fix using owners[0] inline; this leaf's repair used an owner local. Take upstream's version (HEAD side) and drop the leaf's hunk. No behavior difference. tests/phase.test.ts auto-merged. The rebase is left in progress in the worktree for B. Checks not run on the conflicted tree. AKROGON_BASE after completion should be refreshed from akrogon config.

## Re-check after check.fix round 2 (slot A)

Prior reviewed head: 3902efb on eed65fb. Integration baseline: 352fe91da011147a51561ddbfc295d7d29e00c54. Repaired head: 2a759dd9daf3c8f917b5723eabfd50bbca5f670e, one commit on 352fe91. Rebase finished, worktree clean, HEAD on top of current origin/main.

Repair diff via git range-diff eed65fb..3902efb origin/main..HEAD: the only change is the tab_closed hunk in src/next.ts dropping out because upstream a6b53fd carries the equivalent fix. Closure logic and all tests unchanged.

Checks rerun by A on 2a759dd:

| Check | Exit |
|---|---|
| bun run format | 0, no working-tree change |
| bun run typecheck | 0 |
| bun test | 0, 146 pass / 0 fail across 10 files |
| test_changed (AKROGON_BASE=352fe91) | 0, 66 pass / 0 fail |

Earlier findings confirmed. N1 and N2 stand. N3 resolved by this repair. No defect introduced.

Verdict: nits.

## Merge attempt 3 (slot A)

origin/main still at 352fe91, HEAD 2a759dd already on top of it, worktree clean. Neither code nor integration changed since the round 2 re-check, so its check run on 2a759dd is reused: format 0, typecheck 0, bun test 0 (146 pass), test_changed 0 (66 pass). Pushing 2a759dd to origin main fast-forward only.
