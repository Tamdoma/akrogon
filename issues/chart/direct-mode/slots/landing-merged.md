# Landing merged notes

## Q1 who lands
- Door lands: fetch, rebase onto `<remote>/<default_branch>`, refresh AKROGON_BASE via `akrogon config` in the worktree, run `checks` then `merge_checks`, run phase guards, push exact tested SHA with `git push <remote> <sha>:refs/heads/<default_branch>`, never force. (A,B,C)
- B re-check after rebase: whenever the head differs (B); only when content outside `issues/`/`learnings/` changed, with range-diff recorded (C); when the rebase changed anything outside the review range (A).
- Non-fast-forward: repeat rebase/check/push (A); repeat, stop after two refusals keeping the branch (C); do not loop, report and keep branch, bound set by growth fork (B).
- After push: fast-forward local main at root, remove worktree and branch, then `Closed` marker and `akrogon sync`. (C) A,B agree on cleanup after verified delivery.
- Selecting direct includes the door's git push authority; git push, source close and broadcast are coordination, not "live calls" under eligibility 1a. (B)
- Door may run `akrogon preflight` before push. (C)
- Cost: a skill pushes code for the first time; merge-issue's "seats never push" exists because the command owns leaf pushes. (A,B,C)

## Q2 completion
- Close delivered sources after the push with `akrogon close <id> --by "<chart> direct <sha>"`. (A,B,C) Check other owners' outstanding work first; close command has no ownership guard (B).
- Broadcast when repo configures it, door as sender with chart brief (A,C) vs none in the first version, shown at route choice (B).
- Source close failure: record pending action separately; does it block `Closed`? (B, open)

## Q3 issues/ paths
- No; branch carries code only; records through `akrogon sync` on main. Already bound by container 1a, a restatement, not a new choice. (A,B,C)
- Direct artifacts live under the chart, never in the worktree (C).

## Differences
- Broadcast yes (A,C) vs no (B).
- B re-check trigger after rebase: any head change (B) vs content change (A,C).
- Non-fast-forward retry bound.
