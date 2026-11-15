# Intake: merged-batch-cleanup

## Scope

Destination: a merged leaf whose command-owned merge batch is released is cleaned up (tab closed, finished seats ended, worktree and branch removed) without depending on a later unrelated `akrogon next` pass. One chart, destination repo akrogon.

## Provenance

- GitHub: Tamdoma/akrogon#132
- Operator: door t15, 2026-11-09T14:14Z

## Source: operator 2026-11-09T14:14Z

/chart-issues Look at the new pulled issue. Chart it out with slot b (codex, already here). Full autopilot mode. Most elegant solution. This worked on the old herdr, I don't know why it's not working here. But it was only one case.

## Source: Tamdoma/akrogon#132

# Merged leaf scenario-settle-read keeps its tab, two live seats, worktree and branch 2 h after merge; reconcile kept the worktree for state.batch 2 s before the batch was released

Source: Tamdoma/akrogon#132
URL: https://github.com/Tamdoma/akrogon/issues/132

Origin repo: Tamdoma/tamdoma-framework

Unverified intake.

## Observation

In the framework repo (`/home/ivan/Work/infra/tamdoma/framework`), leaf `scenario-settle-read` (issue `variant-parity-settle`, source Tamdoma/tamdoma-framework#579) merged cleanly: `merge_stamp: 2026-11-09T10:56:39.528Z`, pushed `263c2dc6a1`, the leaf moved to `issues/closed/variant-parity-settle/scenario-settle-read/` with `phase: merged`, and #579 was closed at 2026-11-09T11:02:42Z ("delivered by scenario-settle-read"). `akrogon status` shows "no open leaves".

At 2026-11-09T13:03Z, about 2 hours later, the leaf's runtime was still all there:
- Both seat terminals were live in the leaf's tab: `t114` `fw-scenario-settle-read-a` (pi, state done) and `t117` `fw-scenario-settle-read-b` (codex, state done), `where: framework / scenario-settle-read`.
- The worktree `/home/ivan/.akrogon/worktrees/framework/scenario-settle-read` at `263c2dc6a1` and the branch `scenario-settle-read` were still present.
- Its `state.yaml` still carries `tab: akc244439dc7fe48ad291f6cf52bd2f8`, `worktree:` and the `seat:` addresses. It has no `batch` key.

The comparison leaf merged earlier in the same repo, `network-distinct-slugs` (merge_stamp 10:15:17Z), was cleaned up normally. Its seats `t10y`/`t119` no longer exist, and it has no worktree and no branch.

`~/.akrogon/reconcile/framework.json` (mtime 2026-11-09 11:04:03Z) records under `kept`:
- `/home/ivan/.akrogon/worktrees/framework/scenario-settle-read`, reason `state.batch`, clears "removed once the leaf releases its merge batch"
- `akrogon-lc244439dc7fe.slice`, reason `live tab`

`~/.akrogon/reconcile-host.json` has the same mtime. The leaf's `state.yaml` mtime is 2026-11-09 11:04:05Z, 2 seconds after that reconcile write. Its current content has no `batch`, so the batch appears to have been released right after the pass that kept the worktree for it. No later reconcile write exists.

## Location

akrogon merge batch release and merged-leaf cleanup:
- `src/reconcile.ts` `mergedWorktree`: keeps the worktree with `state.batch` while `leaf.state.batch !== undefined`.
- `src/next.ts` `reconcileBatch` (around the `saveState(..., batch: undefined)` calls after `commandMerged`): releases the batch.
- `src/next.ts` `reconcileRepos`: the cleanup pass.

Akrogon release at the time of observation: `~/.akrogon/releases/50d925f2d952fcfca06db529b49b9cfe21efe22c`. Which release ran the 10:56Z merge was not checked.

## Reproduction

Seen once, on 2026-11-09:
1. A leaf goes through a command-owned merge batch to `merged`.
2. The cleanup pass (reconcile) runs while the leaf's `state.batch` is still set, and keeps the worktree with reason `state.batch`.
3. The batch is released (`batch: undefined`) about 2 s later.
4. No further cleanup pass runs, so the tab, both seats, the worktree and the branch stay.

Exact steps that trigger the ordering: Not provided.

## Expected behavior

Once a merged leaf's batch is released, the leaf's tab and finished seats are closed, and its worktree and branch are removed, as happened for `network-distinct-slugs`. This should not depend on a later, unrelated `akrogon next` pass happening to run.

## Urgency

Medium. Two idle agent terminals and a tab stay open after a merge, which reads as a stalled leaf during monitoring and keeps a worktree, a branch and a systemd slice alive. No effect on other leaves was observed. Workaround: a later `akrogon next` pass may clean it up (not verified here), or close the tab and remove the worktree and branch by hand.

## Suspected cause

The batch release and the cleanup pass are not ordered. Release happens in `reconcileBatch` (`src/next.ts`), the cleanup decision happens in `reconcile` → `mergedWorktree` (`src/reconcile.ts`), and the cleanup pass ran first. `mergedWorktree` returns early on `state.batch` with "removed once the leaf releases its merge batch", but nothing appears to schedule a cleanup pass when the batch is then released. With no open leaves left in the repo, no later pass came along to finish the job. Contributing condition: `src/leftovers.ts` treats `state.batch` as an in-use reason, so the kept entry is not shown as a leftover either.

Evidence gaps:
- Whether the release and the pass ran in the same `akrogon next` invocation or in two concurrent ones (listener and command) was not established.
- Whether any `akrogon next` ran after 11:04:05Z: the unchanged reconcile file mtime suggests none wrote a reconcile record, but the invocation log was not read.

Whose view: agent (the operator reported that the leaf "hasn't closed after merge" and suspected akrogon).

Files read: `/home/ivan/Work/infra/akrogon/src/reconcile.ts` (`mergedWorktree`, the merged-leaf loop), `src/next.ts` (`reconcileBatch` batch release, `reconcileRepos` and its call sites), `src/leftovers.ts` (in-use reasons), the akrogon workspace checkout at HEAD `50d925f2` (same commit as the installed release). Also `~/.akrogon/reconcile/framework.json`, `~/.akrogon/reconcile-host.json`, and both leaves' `state.yaml` in the framework repo.

Not inspected: the akrogon invocation or listener logs for 10:56Z–11:05Z, `commandMerged`, and whether the listener triggers reconcile on state changes. A log showing a reconcile pass after 11:04:05Z that still kept the worktree would disprove this ordering hypothesis.

Related reports: Tamdoma/akrogon#30 (closed): a merged leaf's tab stayed open because the merge slot skipped its tab close and `cleanupMerged` skipped leaves still under `issues/open`. That is a different mechanism; this leaf moved to `issues/closed`. Tamdoma/akrogon#94 (closed): reconcile removed a live direct-route worktree, which is the opposite direction and is listed for context. Searched Tamdoma/akrogon, all states: the filing account's reports since 2026-11-07 (limit 40), "merge batch worktree" (limit 10), "merged leaf tab cleanup" (limit 10).

## Agent findings

A, 2026-11-09, inspected at main 50d925f2 (the installed release):

- The batch for a command-owned landing is released only by a `next` pass's `mergePass` → `mergeTurn` → `reconcileBatch` (src/next.ts `reconcileBatch`): for a holder already `merged` it takes the last branch, `saveState(... batch: undefined)`. While the land process is alive (`landAlive`) it returns early, so the land process cannot release its own batch.
- In `nextCommand` (src/next.ts) every mode runs `reconcileRepos` inside the global lock first and `mergePass` after it. So the pass that releases the batch has already run cleanup, which kept the worktree for `state.batch` (src/reconcile.ts `mergedWorktree` and the per-leaf loop). Cleanup of such a leaf always needs a second pass after the release.
- Framework timeline: land attempt b816f348 ended 11:02:40Z; `merge -> merged` logged 11:02:44.9Z (land process `landPush` → `commandMerged`, closes #579, moves the issue to closed). `landedWake` skipped the tab close because `state.broadcast` was set. A pass at 11:04:03Z wrote the reconcile record (kept: `state.batch`), then released the batch at 11:04:05Z (state.yaml mtime). No later pass ran.
- Under hc, passes run only on listener events (src/listen.ts): startup/resubscription (`next --resume`) and a labelled terminal's `turn`, `blocked`, `finished` or `lost` (`next --wake`). The hc listener replaced the old herdr wake path on 2026-11-07 (09c80175). With no other open leaf in the repo and both seats already done, no event followed the release.
- Live on 2026-11-09T14:14Z: t114 and t117 still live, both seat scopes and `akrogon-lc244439dc7fe.slice` still running.
