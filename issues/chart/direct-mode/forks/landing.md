# Landing and completion

## Question
Q1. Who rebases the reviewed branch, runs `checks` and `merge_checks`, and pushes to the default branch: the door, or the operator?
Q2. On landing, are delivered GitHub sources closed (with what delivery reference), and is a broadcast sent?
Q3. May direct work change files under `issues/` on its branch, or are records kept to `akrogon sync` on main?

### Carries
- forks/container.md: 1a, no leaf record; door runs phase guards itself; worktree and branch removal before `Closed`.
- forks/eligibility.md: 1a code only; 2a offer only.

## Findings

- Notes: slots/landing-A.md, landing-B.md, landing-C.md; merged slots/landing-merged.md; rebuttals slots/landing-rebuttal-B.md, landing-rebuttal-C.md.
- Q1 door lands (A,B,C). Re-review trigger after rebase: any head change (B) vs content change (C) vs conflict resolution only (A, offered). Lifecycle has no re-review after rebase because the reviewer rebases (merge-issue/SKILL.md:51-53); checks reuse rule src/phase.ts:526-531.
- Q2 close after push (A,B,C); broadcast yes (A,C) vs no (B).
- Q3 no issues/ on the branch: restatement of container 1a (A,B,C); not asked.
- Research: better-than-training, src/phase.ts:455-494,526-531, merge-issue/SKILL.md:10-65, broadcast-issue/SKILL.md:10-43, src/pull.ts:104-207, src/sync.ts:10-33, read 2026-10-08. Practitioner (B): Trunk Based Development short-lived feature branches.

## Taken
Operator 2026-10-08: `1a | 2a`

Q1 1a: door lands. After B's ready/nits on a committed head, door fetches, rebases onto `<remote>/<default_branch>`, refreshes AKROGON_BASE from `akrogon config` in the worktree, runs phase guards, `checks` then `merge_checks`, and pushes the exact tested SHA with `git push <remote> <sha>:refs/heads/<default_branch>`, never force. Conflict resolution during rebase sends B a focused re-check of the resolved range (range-diff recorded) before push; a clean rebase reruns checks only. Rejected push keeps the branch; retry bound set in the growth fork. Root checkout is never reset; a failed local update is reported. Branch and worktree removed after verified delivery. Selecting direct includes the door's push authority; push, source close and broadcast are coordination, not live calls under eligibility 1a.
Foreclosed: operator pushes.

Q2 2a: after the push, door closes delivered sources with `akrogon close <id> --by "<chart> direct <sha>"` (checking other owners' outstanding work first), then runs broadcast-issue as sender when the repo configures broadcast, with the chart brief as context; broadcast-issue gains a direct-route trigger. Broadcast failure does not reopen.
Foreclosed: no broadcast.

Q3: not asked; branch carries code only, records via `akrogon sync` on main (container 1a).

## Proofs
- git push: `git push --dry-run origin f57bb356c149ed6b9d87a5e122a79d1b54de15ad:refs/heads/main` from the akrogon root, operator git identity (ivanjuras, keyring), git 2.56.0, 2026-10-08. Result: `Everything up-to-date`, exit 0. Cleanup: none, nothing written. Limits: proves remote reach, auth and the refspec form, not write permission or non-fast-forward handling.
- akrogon close: `akrogon close Tamdoma/akrogon#58 --by "f57bb35"`, gh account ivanjuras (keyring), installed akrogon at f57bb35, 2026-10-08T11:53:15Z, operator approved `yes`. Result: `closed Tamdoma/akrogon#58 with delivered by f57bb35`, exit 0, read-back `CLOSED COMPLETED`. Cleanup: none, the close is the intended final state (#58 delivered by f57bb35). Limits: does not prove the `<chart> direct <sha>` text form or the other-owner check.
- broadcast send: broadcast-issue `discord-send.ts` run by the door earlier this session for the parked-rows change, configured webhook target from `~/.config/akrogon/env`, 2026-10-08. Result: delivered, exit 0. Cleanup: none, real announcement. Limits: does not prove the direct-route message context.
- herdr prompt: `herdr agent prompt <pane> "<text>" --wait --until working --timeout 5000` to panes w8:pGY and w8:pGZ, herdr 0.9.3, 2026-10-08. Result: `agent_prompted`, both peers returned files. Cleanup: none. Limits: proves prompting chart peers, not a B review under check-issue.
