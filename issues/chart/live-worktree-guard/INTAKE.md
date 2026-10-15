# Intake: live-worktree-guard

## Scope
Reconcile must never remove a worktree that holds live work, such as a chart's direct attempt, while cleanup keeps working. One destination: Tamdoma/akrogon.

## Provenance
- GitHub: Tamdoma/akrogon#94
- Operator: 2026-10-15 chat, screenshot of the reporting agent's summary

## Source: Tamdoma/akrogon#94
# akrogon reconcile removed a live chart-issues direct-route worktree mid-attempt

Source: Tamdoma/akrogon#94
URL: https://github.com/Tamdoma/akrogon/issues/94

Origin repo: Tamdoma/tamdoma-framework

Unverified intake.

## Observation
On 2026-10-15 the chart door (seat A) was running a chart-issues direct attempt for chart `issues/chart/script-lane-effort` in Tamdoma/tamdoma-framework, branch `fork-only-effort-pin`.

1. As chart-issues SKILL.md Direct route step 1 says, the door created the worktree at `/home/ivan/.akrogon/worktrees/framework/fork-only-effort-pin`, which is the repo's `worktree_store`.
2. The door committed two commits there and got slot B's `ready` review. It then rebased and ran `akrogon verify --holder <chart>/direct` from inside the worktree. Verify went red on 3 slot-dispatch tests, which is a separate matter.
3. A few minutes later the worktree directory was gone and `git worktree list` no longer showed it. Branch `fork-only-effort-pin` and both commits survived.

In the same window another session's lifecycle leaf `upload-kit` merged to main (53a93507b). That leaf's tab close and its `akrogon next` both run reconcile.

## Location
- akrogon reconcile leftover-candidate sweep: `src/reconcile.ts:330-390`. It removes through `removeWorktree` when `worktreeRemovable` (`src/reconcile.ts:43-62`) passes and `livePaneInside` (`src/reconcile.ts:64-66`) is false.
- Callers: `src/next.ts:1336` (`reconcileRepos`, on every `akrogon next` pass, manual or automatic) and `src/next.ts:1450` (the leaf tab-close event).
- The direct-route worktree location is set by chart-issues `SKILL.md:101` (`<worktree_store>/<slug>`) and `assets/shapes.md:43` (the branch is also the worktree directory name under worktree_store).

## Reproduction
1. Create a worktree in `worktree_store` on a branch that has no leaf `state.yaml`, for example a direct attempt.
2. Leave it clean, with its commits reachable from that branch, and with no herdr pane cwd inside it.
3. Run `akrogon next` or close any leaf's tab.
4. The worktree directory is removed.

Seen once. The code path makes it deterministic.

## Expected behavior
Reporter: the cleanup stays, because worktrees must not pile up on disk (#93 counted 13 GB of leftovers today). But reconcile must never remove a worktree that holds live work, such as a chart's live direct attempt.

## Urgency
Every direct attempt is exposed for its whole life: implementing, waiting for B's review, and landing.
- The door's next command fails, and it must recreate the worktree and reinstall dependencies.
- A long command running with its cwd inside the worktree (tests, verify prep) can lose its directory mid-run. This happens because the check looks at the pane's cwd, not the process's cwd.
- Ignored files such as `node_modules` and local logs are lost.
- Any other worktree an operator makes in the store is exposed the same way.

Workaround: `git worktree add <store>/<slug> <slug>`, then reinstall dependencies.

## Suspected cause
Main condition: the sweep removes by default. Any store directory it cannot match to a known kind is removed once it is clean, has no rebase or merge in progress, has no commits unreachable from a branch or remote, and has no herdr pane cwd inside. The known kinds are:
- a leaf slug from open/closed `state.yaml`
- an in-progress `verify-<run>`
- a recorded `batch-<attempt>`
- an active leaf's `<slug>-u<N>` worker

Contributing conditions:
- A direct attempt meets every removal check between commits. Direct writes no leaf `state.yaml` by design, its commits sit on its branch, and the door's pane cwd is the repo root, not the worktree.
- Reconcile reads no chart, so it cannot see a chart's `Direct attempt` section.
- `livePaneInside` sees only the pane's foreground cwd, not the cwd of child processes.

The same class was hit on 2026-10-14. Delegated `<slug>-u<N>` worker worktrees were removed mid-run because no pane sits inside them. Commit a77c260 fixed that one kind by adding a keep rule.

Whose view: agent, from reading the code. The reporter observed the deletion and set the expectation.

Files read, all in the akrogon source at /home/ivan/Work/infra/akrogon (HEAD 0a80ab9, same as origin/main):
- `src/reconcile.ts` (worktreeRemovable, livePaneInside, the sweep)
- `src/next.ts` (the two callers)
- `skills/chart-issues/SKILL.md`
- `skills/chart-issues/assets/shapes.md`

Not inspected: the reconcile log or result for the run that removed this worktree. It is not proven which caller (next pass or tab-close) did it. A kept-entry or removal record naming `fork-only-effort-pin` with a different cause would disprove this hypothesis.

Related reports: Tamdoma/akrogon#93 (open). It is the opposite failure in the same sweep: merged leaves' verify and worker worktrees are kept forever (13 GB) by the unreachable-commits guard. A fix that removes more would widen the exposure described here. Searched Tamdoma/akrogon, state all, `--author @me created:>=2026-10-13` limit 60, and `reconcile worktree removed` limit 10.

## Source: operator 2026-10-15 screenshot
Operator: "this is what the agent that found out about this issue wanted to do". Transcribed from the image:

What happened: The system has a cleanup that deletes old worktree folders to save disk space. It decides what to delete by checking a short list: "Does this folder belong to an issue, a test run, a batch or a helper agent I know about?" If not, and nothing looks busy, it deletes the folder. My worktree was for a "direct" fix, which works without an issue file. The cleanup didn't recognize it, so it deleted it. My saved commits were safe. I lost the folder and its installed packages, and I rebuilt it. Filed as https://github.com/Tamdoma/akrogon/issues/94.

Why it will keep happening: Yesterday the same thing happened to helper-agent folders. The fix then was to add "helper folders" to the keep list. Today it hit direct folders. Every new kind of folder gets deleted first and added to the list afterwards.

What merged today: Today's merge only made akrogon status show which folders cleanup kept. It deletes nothing new. Your 13 GB was a different bug (#93): cleanup was too scared and kept old folders forever. You deleted them by hand. Risk: fixing #93 makes cleanup delete more. If #94 isn't fixed first, more live folders get lost.

The fix I'd pick when it's charted: Flip the rule. Today it says "delete unless I know it." It should say "delete only when I know it's finished": folders of merged or failed issues and finished test runs.

## Agent findings
See slots/map-A.md, map-B.md, map-C.md and slots/map-merged.md.
