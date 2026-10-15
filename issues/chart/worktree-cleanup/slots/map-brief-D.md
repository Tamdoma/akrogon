# Opening map brief, slot D

You are slot D, a charting peer for the akrogon chart-issues door (slot A runs the door). This is a blind opening map: work alone, do not read other slots' maps, and do not edit any repository file. Read only.

## Intake (three new GitHub reports, mirrored verbatim)
- /home/ivan/Work/infra/akrogon/issues/seeds/91-chart-issues-peer-wait-reports-failure.md (Tamdoma/akrogon#91)
- /home/ivan/Work/infra/akrogon/issues/seeds/92-check-logs-kept-under-issues-grow-the.md (Tamdoma/akrogon#92)
- /home/ivan/Work/infra/akrogon/issues/seeds/93-worktrees-of-merged-leaves-and-finished.md (Tamdoma/akrogon#93)

## Live surfaces (start here, follow callers as needed)
- Repo: /home/ivan/Work/infra/akrogon (registered key `akrogon`, main at origin/main). Consumer repo with the evidence: /home/ivan/Work/infra/tamdoma/framework. Worktree store: ~/.akrogon/worktrees/.
- #91: skills/chart-issues/scripts/peer-wait.ts, peer-ask.ts, tests/peer-wait.test.ts, tests/peer-ask.test.ts, skills/chart-issues/assets/questions.md (Blind peer exchange), learnings/history/2026-10-15-peer-wait-antigravity-idle.md, `herdr agent list` / `herdr agent wait --help`, antigravity's own session/transcript storage on this host.
- #92: src/run-check.ts, src/verify.ts, tests/run-check.test.ts, skills/implement-issue, skills/merge-issue, skills/check-issue (who writes the un-prefixed selftest.log/test.log/merge-evidence-* files), the framework repo's issues/closed/** logs and git history.
- #93: src/reconcile.ts, src/next.ts, src/verify.ts (verify-<run> worktree creation), the merge path that rebases leaf commits, skills/implement-issue (worker worktrees <slug>-u<N>), tests/reconcile.test.ts, tests/worktree-store.test.ts.

## Existing locks (read the forks before proposing anything that contradicts them)
- issues/chart/peer-wait/ and issues/chart/door-turn-and-stale-tab/forks/peer-turn.md (how the peer wait works today and why)
- issues/chart/temp-release/, issues/chart/clean-merge-gate/, issues/chart/test-runs/ (cleanup and evidence decisions)
- learnings/LESSONS.md

## Task
Write your own territory map for these three reports. Ground every claim in an inspected file and line, a command you ran, or an outside source with URL and date. Mark low-confidence items.

Return, in this order:
1. Verified facts per report: what the code really does, and whether the reporter's suspected cause holds. Correct the report where it is wrong.
2. Proposed split: which reports share one observable outcome (one chart) and which are independent; any real dependency between them.
3. Material forks per chart: each as a question a person would ask aloud, with 2 or more options, your pick, its reason and cost, and what each option could break or invite later (not only now).
4. Practitioner questions and pitfalls over the work's lifetime, each with what removes it.
5. External operations any fix would call (CLI commands, flags, APIs) that need a real proof call before handoff.
6. Fog: work in scope whose question you cannot yet state sharply.

## Return
Write the whole map to this exact path, writing to a temporary name first and renaming it into place only when it is complete:
/home/ivan/.claude/jobs/6a0d8d81/tmp/chart/map-D.md
