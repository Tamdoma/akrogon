# Intake: fresh-leaf-base

## Scope

A leaf's first phase runs on a base holding the current tracking ref, not a stale reused worktree or branch. Destination repo: akrogon.

## Provenance

- GitHub: Tamdoma/akrogon#156
- Operator: door session 2026-11-24 (handed list of five seeds)

## Source: Tamdoma/akrogon#156

# A re-handed-off leaf opened plan.synthesis on a 5-day-old worktree base, 1271 commits behind origin/main, missing its merged dependency and holding leftover uncommitted files

Source: Tamdoma/akrogon#156
URL: https://github.com/Tamdoma/akrogon/issues/156

Origin repo: Tamdoma/tamdoma-framework
Lesson history: akrogon learnings/history/2026-11-24-leaf-worktree-stale-base.md

Unverified intake.

## Observation

Framework leaf `mockup-content-syncs-every-string` was handed off on 2026-11-24 (state.yaml `created: 2026-11-24`, attempts A 0). The plan.synthesis seat found its worktree `~/.akrogon/worktrees/framework/mockup-content-syncs-every-string` at HEAD 6e5e758549 (2026-11-19), 1271 commits behind origin/main 4055186fd7. `akrogon config` printed `AKROGON_BASE: 6e5e7585…`. The worktree was left from an earlier start of the same slug on 2026-11-19 whose handoff was withdrawn.

- The design said its dependency leaf (mockup-content-closes, two-root resolve with `--content-dir`) had merged. Those commits were on main and missing from the worktree.
- Four files held uncommitted test edits dated 2026-11-19 from the earlier attempt.
- The leaf branch had no commits of its own. The seat saved the diff, ran `git merge --ff-only origin/main`, and re-applied it. One file conflicted and was rewritten by hand.

## Location

akrogon `src/next.ts` `ensureWorktree` (called from the seat allocation path at `src/next.ts:468`), and `src/config.ts:468` `base()` (`git merge-base HEAD <trackingRef>`).

## Reproduction

1. Start a leaf so its worktree and `refs/heads/<slug>` are created.
2. Withdraw it before any commit and leave the worktree in place.
3. Let the default branch move on, then hand off the same slug again.
4. The first phase runs on the old HEAD, and `AKROGON_BASE` is the old commit.

Frequency: seen once. Not provided: whether withdraw is meant to remove the worktree.

## Expected behavior

Not provided by the reporter as a rule. The seat expected the first phase of a fresh handoff to run on a base that holds the dependencies the design says have landed.

## Urgency

A planning seat plans against code the design says is gone, and leftover uncommitted files sit in the new attempt with no record. Workaround: the seat checks `git log HEAD..<trackingRef>`, and when the branch has no commits of its own, saves any leftover diff and fast-forwards by hand before planning.

## Suspected cause

Supported hypothesis (agent's view). `ensureWorktree` reuses an existing worktree path after only checking it is a worktree root of the same repo (`existsSync(path)` branch). If the path is missing but `refs/heads/<slug>` exists, it checks out that branch. Only when the branch is missing does it start from `trackingRef(repo)`. Nothing compares a reused branch with the tracking ref, so its old HEAD becomes the leaf base through `base()`. A contributing condition is that the earlier withdrawn attempt left both the worktree and its uncommitted files behind.

Files read: `src/next.ts` (`createSparseWorktree`, `ensureWorktree`, call at line 468), `src/config.ts` `base()`, at akrogon checkout 47bca6c1 (the installed release `~/.akrogon/releases/47bca6c1…` resolves to the same commit).

Not inspected: the withdraw path, to see whether it is meant to remove the worktree or branch. If withdraw is supposed to remove both and failed here, the cause is in withdraw instead.

Related reports: none found. Searched Tamdoma/akrogon, all states, the filing account's reports since 2026-11-22 (limit 30), and keyword searches "ensureWorktree stale" and "worktree stale base" (limit 10 each).

## Source: operator door message 2026-11-24

5 issues pulled. We need to chart them out. Use the following consultants: slot b: pi swe-2-1-max, slot c: agy neon high, slot d: pi muse wonder full 1.0. Full autopilot mode. Don't ask me anything. Think from the systems perspective: simplicity, clarity elegance.

## Agent findings

Imported at door open 2026-11-24T22:57:50Z (pull time). No identity match in open/closed leaf sources or chart intakes. Territory map findings are added after the shared opening map (issues/chart/seat-turn-idle/slots/map-merged.md).

Map findings 2026-11-25 (issues/chart/seat-turn-idle/slots/map-merged.md, inspected at akrogon 085f2f88):
- Cause confirmed (A,B,C,D). `src/next.ts:ensureWorktree` reuses an existing path after only a same-repo worktree check, checks out an existing `refs/heads/<slug>`, and starts from `trackingRef(repo)` only when the branch is missing. `src/config.ts:base` is `git merge-base HEAD <trackingRef>`.
- The report's open question is settled: there is no withdraw verb in `src/`. Withdrawing was deleting the leaf folder by hand, and `src/reconcile.ts` keeps an orphan store worktree as "unmanaged worktree". The leftover is expected, not a failed cleanup.
- Dispatch does not fetch before a first allocation. `src/next.ts` fetches only in `reconcileBatch`; `checkBase(repo, mustCreate)` proves the remote branch exists with `ls-remote` but does not update the local ref.
- The direct route's growth stop hands a worktree with a partial commit to the lifecycle, which relies on `ensureWorktree` adopting it as-is.

