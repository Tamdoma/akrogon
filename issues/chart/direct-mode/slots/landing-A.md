# Landing notes, slot A

## Q1 who lands
- Pick: door lands. After B's ready/nits on head H: door fetches, rebases onto `<remote>/<default_branch>`; if rebase changed
  anything outside the review range, B re-checks the rebase diff; door runs `checks` then `merge_checks` in the worktree;
  pushes `git push <remote> <head>:refs/heads/<default_branch>` (same plain fast-forward form as src/phase.ts:469-472);
  non-fast-forward = refetch, rebase, rerun checks, push again. Then remove worktree and branch.
  Reason: operator asked for "do it immediately now"; a stop before push leaves reviewed code stranded and source closing waiting.
  Cost: door pushes code, which no skill does today (merge-issue/SKILL.md:10 "never runs git push"; the command pushes).
- Rejected: operator pushes via gacp: `git add .` sweeps chart records with code. Rejected: door stops at local commit.
- Evidence: better-than-training, src/phase.ts:455-480, read 2026-10-08.
- Pitfalls: pushing an untested top, removed by binding push to the exact sha that passed checks.

## Q2 completion
- Pick: close delivered GitHub sources with `akrogon close <owner/repo#n> --by "direct-mode <chart> <sha>"` (src/pull.ts:204,
  chart-issues/SKILL.md:35 already uses this form); broadcast yes, with the chart's brief as context, only when the repo
  configures broadcast. Reason: operator-visible "done" should mean the same thing on both routes; the operator just used
  broadcast for a direct-style change this session. Cost: broadcast skill wording is tied to `issue complete` lines
  (broadcast-issue/SKILL.md:10); needs one line allowing the door as sender.
- Rejected: no broadcast: operator demonstrably wants it for direct work.

## Q3 issues/ paths
- Pick: branch carries code only, same as leaves (shapes.md:267); chart records go through `akrogon sync` on main, which
  refuses non-issue staged paths (src/sync.ts:20-33). Reason: one rule for both routes, and the door's phase-guard duty
  (container Taken) already includes "no issues/ diff". Cost: a job whose outcome is a change to `issues/config.yaml`
  cannot go direct; operator does it on main.
