# Opening map brief, slot C

You are slot C, a charting peer for the akrogon chart-issues door (slot A runs the door). This is a blind opening map: work alone, do not read other slots' maps, and do not edit any repository file. Read only.

## Intake (one new GitHub report, mirrored verbatim)
- /home/ivan/Work/infra/akrogon/issues/seeds/94-akrogon-reconcile-removed-a-live-chart.md (Tamdoma/akrogon#94): reconcile removed a live chart-issues direct-route worktree mid-attempt. The operator calls this the most important open issue.

## Live surfaces (start here, follow callers as needed)
- Repo: /home/ivan/Work/infra/akrogon (registered key `akrogon`, main at origin/main 0a80ab9). The main checkout has an uncommitted, reviewed change: new `akrogon leftovers` command (src/leftovers.ts) and `readKept` in src/reconcile.ts now fails on an unreadable report. Treat it as present.
- Consumer repo where it happened: /home/ivan/Work/infra/tamdoma/framework (chart issues/chart/script-lane-effort, branch fork-only-effort-pin). Worktree store: ~/.akrogon/worktrees/.
- src/reconcile.ts (worktreeRemovable, livePaneInside, the leftover-candidate sweep, keep rules), src/next.ts (reconcileRepos and the tab-close caller), src/verify.ts, src/shell.ts (Pane), tests/reconcile.test.ts, tests/worktree-store.test.ts.
- skills/chart-issues/SKILL.md (## Direct route), skills/chart-issues/assets/shapes.md (Direct attempt section), skills/chart-issues/scripts/direct-guards.ts, skills/implement-issue (direct mode and delegated <slug>-u<N> workers).
- Commit a77c260 (keep rule for delegated worker worktrees after the 2026-10-14 removal), and `git log -- src/reconcile.ts`.
- herdr 0.9.1 source at /home/ivan/Work/infra/herdrdev/herdr (tag v0.9.1): what pane cwd and process info herdr exposes (`herdr pane process-info --pane <id>`).

## Existing locks (read before proposing anything that contradicts them)
- issues/chart/worktree-cleanup/ (Tamdoma/akrogon#93, handed off today): its forks decide what cleanup removes and keeps. Its leaves in issues/open/worktree-cleanup/ (store-sweep, finished-leaf-processes, test-isolation and others) are being implemented now and change the same sweep.
- issues/chart/temp-release/, issues/chart/clean-merge-gate/ (cleanup decisions).
- learnings/LESSONS.md.

## Task
Write your own territory map for this report. Ground every claim in an inspected file and line, a command you ran, or an outside source with URL and date. Mark low-confidence items.

Return, in this order:
1. Verified facts: what the code really does, whether the reporter's suspected cause holds, and which caller could have removed the worktree. Correct the report where it is wrong.
2. How this interacts with the in-flight #93 leaves: does any of them widen or narrow this exposure, and is there a real ordering dependency.
3. Material forks: each as a question a person would ask aloud, with 2 or more options, your pick, its reason and cost, and what each option could break or invite later (not only now). Include how reconcile should know a worktree holds live work (for example an owner record written by whoever creates the worktree, versus reconcile reading charts, versus never removing unknown directories), and what happens to the direct route and any other worktree a person makes in the store.
4. Practitioner questions and pitfalls over the work's lifetime, each with what removes it.
5. External operations any fix would call (CLI commands, flags, APIs) that need a real proof call before handoff.
6. Fog: work in scope whose question you cannot yet state sharply.

## Return
Write the whole map to this exact path, writing to a temporary name first and renaming it into place only when it is complete:
/home/ivan/Work/infra/akrogon/issues/chart/live-worktree-guard/slots/map-C.md
