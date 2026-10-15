# Notes

Tiers: T1 = live record (framework issues, herdr server log, kept report), T2 = code trace on akrogon main f3557d8, T3 = my own git reproduction (git 2.56.0, scratch repo, 2026-10-15). Dates are 2026-10-15 unless stated.

## Q1. Does a stacked member's tab and worktree stay after the merge?

### Evidence first

Short answer: no, not for long. In every real stacked merge the member's tab and worktree were gone within seconds. They are closed by reconcile on the next pass, not by the merge itself.

T1, framework `issues/merge-attempts.jsonl`: three attempts with members. Holder `root-influence` + member `copyfile-install` (ejected 2026-10-11T07:14:57Z), holder `pass-two-review-notes` + member `test-port-per-check` (merged 2026-10-14T06:09:07Z), holder `technical-pack-selection` + member `favicon-audit` (merged 2026-10-14T17:01:03Z). All three member `state.yaml` files under `issues/closed` are `phase: merged`, keep their `tab` (wA:tCZ, wA:tED, wA:tF5) and have no `worktree` key. `herdr tab list` today shows none of those tabs. `git worktree list` in framework shows only main plus /tmp scratchpad worktrees.

T1, the favicon-audit case in detail:
- 17:01:03Z attempt 3b9d71b6 recorded merged.
- 17:01:06.286Z favicon-audit log `merge -> merged`, written by the holder's slot B session; 17:01:06.473Z holder `merged`.
- 17:01:09.18Z to 17:01:09.45Z herdr-server.log: four panes (142, 143, 144, 145) hang up in two bursts about 200 ms apart, each with `PaneDied for unknown pane`, meaning their tabs were already closed. Two tabs, two panes each: holder and member.
- 17:01:10.338Z timings `{"kind":"wait","slug":"favicon-audit","reason":"none"}`: dispatchLeaf ran for the member about one second after its tab closed.

The herdr log carries no `tab.close` event kind (only `tab.focus` and `tab.rename`), so the exact pass is inferred from code and timing, not logged.

T2, every path that can close a member's tab or remove its worktree:
1. `reconcileBatch` `src/next.ts:991-994` runs `closeMergedTab` and `dispatchDependents` for `moved` leaves only. Members are already `merged` when it runs, because `batchPush` `src/phase.ts:629-632` and `finishPush` `src/phase.ts:737-742` move them to merged before the holder transitions. The filter at `src/next.ts:975` (`if (item.state.phase !== 'merge') continue`) skips them. This path closes a member only in recovery, when the member still sat in `merge` while the record was applied.
2. Hook-pane path `src/next.ts:1480-1489` calls `closeMergedTab` only when the firing pane is the leaf's own pane B. At merge time the member's pane B is idle, so no hook from it fires. This closes the holder's tab, not the member's.
3. `reconcile` merged-leaf path: `src/reconcile.ts:245-246` closes a live tab when the member still has a worktree, `src/reconcile.ts:264-274` closes the tab when the worktree is already gone. This is the member closer. It runs on the tab_closed path `src/next.ts:1440-1445`, the targeted path `src/next.ts:1399`, `--all`, `--resume` and unpause.
4. Worktree removal: `mergedWorktree` `src/reconcile.ts:235-260` then `removeMergedWorktree` `src/reconcile.ts:213-222` (plain `git worktree remove`, then `git branch -d`). Kept with reasons `state.batch`, `pane list unavailable`, `live pane inside`, `active leaf`, or whatever `worktreeRemovable` `src/reconcile.ts:43-62` reports.
5. Hook events: `pane.exited` and `pane.closed` enter the hook-pane path (closer 2, pane B match required); `pane.agent_status_changed` with `working` returns at `src/next.ts:1350-1358`; `tab.closed` enters closer 3. `mergeWake` after `akrogon phase` `src/akrogon.ts:66-90` runs `mergePass` only, never `reconcile`.

The chain that matches the timings: holder's pane B status hook -> closer 2 closes the holder tab -> herdr `tab.closed` for the holder re-enters `akrogon next` -> tab_closed path reconcile (closer 3) closes the member tab and removes its worktree -> herdr `tab.closed` for the member -> tab_closed path -> `dispatchLeaf` returns `completed` -> `dispatchDependents` `src/next.ts:1455-1459`. Two tab closes 200 ms apart, `wait none` one second later.

So the member's tab and worktree stay only between the merge and the next pass that reconciles, which in practice is the holder's own tab close. They stay longer only when (a) the repo is paused (`src/next.ts:1437` returns before reconcile), (b) herdr is down so no `tab.closed` fires (startup `next.sh --resume` covers it), (c) a foreign pane sits inside, or (d) `worktreeRemovable` refuses. Case (d) is the dirty-ref member the fork asks about.

### The dirty-ref member

T2: leaf worktrees are branch-attached (`src/next.ts:332-334`). `move` `src/batch.ts:161-174` uses `git update-ref refs/heads/<slug> <target>` when `git status --porcelain` is non-empty. That moves the branch, and with it the worktree's HEAD, while the index and files stay. Afterwards the worktree shows the original dirt plus every file the rebase touched as modified.

T3: reproduced with a branch-attached worktree, one untracked file, and a rebase of the branch from elsewhere. `git status --porcelain` shows the dirt, `rev-list --count HEAD --not --branches --remotes` is 0, plain `git worktree remove` refuses with `contains modified or untracked files, use --force`, `--force` removes it.

T1: `reconcile/framework.json` (written 12:42 today) keeps `pass-two-review-notes-u3` for `uncommitted changes`. That is a worker copy, but the same guard applies to a leaf worktree.

Result today: a dirty-ref member keeps its worktree forever with reason `uncommitted changes`, its tab is closed, its branch is deleted by nobody (`git branch -d` sits after the removal in `removeMergedWorktree`), and the dirt is a mix of real uncommitted edits and rebase noise that cannot be told apart after the move.

### Pick

Force-remove a merged leaf's own worktree once its tab is closed and no live pane sits inside, ignoring `uncommitted changes` and `unreachable commits`, but still honoring the rebase and merge markers. Reason: the merged phase means the reviewed, committed tip is on main. Anything uncommitted in a merged leaf is by definition not part of the product, and the review already passed without it. Keeping the rebase/merge markers protects a human mid-operation, which the merge never creates. Cost: one branch in `mergedWorktree` (`src/reconcile.ts:235-260`) that calls `git worktree remove --force` for merged leaves instead of `removeWorktree`, one test in `tests/reconcile.test.ts` with a dirty merged worktree, and a one-line entry in `issues/log.jsonl` or the kept report naming what was discarded.

### Rejected

- Keep as today and list it under Q2. Rejected: the destination says reconcile removes what a merged leaf leaves behind, and the kept report shows these entries do not get acted on (nine stale paths in framework.json, see Q2).
- Commit or stash the dirt before `update-ref` in `move`. Rejected: adds a ref per member that nothing reads, and the dirt is mostly rebase noise anyway.
- Teach `move` to `reset --keep` through a temporary stash. Rejected: changes merge behaviour to fix a cleanup problem, and a conflicting stash pop would fail a merge that is otherwise green.

### Pitfalls

- Real uncommitted work lost. Removed by: the log entry naming the path and the dirty file list, so the operator sees what went. A merged leaf's seats are done, so the loss is bounded to what review never saw.
- Pause window. tab_closed returns before reconcile on a paused repo, so the member keeps tab and worktree through the pause. Removed by: the unpause sweep already reconciles. No change needed, but the fork should state it.
- Foreign pane inside (an operator shell in the member's worktree). Removed by: the existing `live pane inside` keep. `reconcileNeedsPanes` `src/reconcile.ts:124-145` stays true while the worktree exists, so the next pass retries.
- Member dependents start one herdr round-trip after the holder's. Not new. Removed by nothing in this fork, worth a note since `tests/next.test.ts:614-665` encodes the current order.

### Questions a peer would ask that the fork does not

- When the holder's hook arrives as `blocked` or `unknown`, closer 2 skips the holder tab, so no `tab.closed` fires and the member waits for the next targeted or `--all` pass. Is that acceptable, or should `reconcileBatch` close member tabs directly at `src/next.ts:991`?
- Should `git branch -d` of the member run even when the worktree is kept? Today the branch outlives a kept worktree, so `unreachable commits` can never clear.
- Does the member's `state.tab` need to stay recorded after the close? All three closed members still carry it, and `tabLive` returns false, so it is harmless but misleading in status.

## Q2. Plain `akrogon status` showing kept worktrees

### Pick

Print Kept lines per repo in the plain `akrogon status` output, from `readKept` `src/reconcile.ts:26`, filtered to paths that still exist. Reason: the report is already written every reconcile (`src/reconcile.ts:447`), and the only reader today is `statusCommand(slug)` `src/status.ts:352`, which an operator runs for one leaf, not to find leftovers. Cost: move the block at `src/status.ts:338-365` under the repo loop, add an `existsSync` filter, one test.

T1 for the existence filter: `reconcile/framework.json` lists 19 paths, nine of them under `/home/ivan/.akrogon/worktrees/framework/` that no longer exist (two `pass-two-review-notes-u*`, `prose-asserts-u1-cmdlogs`, six `verify-*`). The report was correct at 12:42 and the paths went away afterwards. Without the filter plain status would list nine dead paths until the next reconcile of that repo.

### Rejected

- A count only ("3 kept") per repo. Rejected: the operator then needs a second command to see paths, and the point of Q2 is to see the leftovers.
- Status quo. Rejected: the nine stale entries and the still-present `.temp`, `.dcf*node-gyp`, `emdash-conversion-ufix-b` entries show nobody reads the per-slug output.
- A new `akrogon reconcile --report` command. Rejected: another surface for one list.

### Pitfalls

- Stale reasons: a path can still exist but the reason be old (a worktree that was dirty and is now clean). Removed by: printing the report's write time next to the block, from the file mtime.
- Noise from the six `unmanaged worktree` scratchpad entries under /tmp. Removed by: nothing in this fork. They are real registered worktrees and the operator created them.
- Status with no panes: the report does not depend on herdr, so plain status stays usable when herdr is down.

### Questions a peer would ask

- Should plain status group by reason rather than path? With 19 entries the reason is the actionable column.
- Does `git worktree prune` (`src/reconcile.ts:446`, only when something was removed) ever run for the nine dead registered paths? If not, `git worktree list` keeps listing them and the next reconcile reports `git status exited 128` for each.

## Q3. Unregistered folders under the store

### Pick

Keep and report, visible through Q2. Reason: the candidate sweep `src/reconcile.ts:330-394` already names them `unknown directory`. Of the four live cases in framework.json, `.temp` and `.dcf16a3f00401334-1.node-gyp` are tool caches a running build may use, `emdash-conversion-ufix-b` is a hand-made folder, and `prose-asserts-u1-cmdlogs` came from a since-fixed bug. None is a shape the tool created on purpose, so the tool has nothing to clean. Cost: none beyond Q2.

### Rejected

- Delete `<slug>-*` when the slug's leaf is merged or failed. Rejected: `<slug>-u<N>` is already covered by Taken 3a, and anything else under that prefix is operator or seat work.
- Delete every unregistered directory in the store. Rejected: the `.dcf*` node-gyp cache belongs to a build that may be running.

### Pitfalls

- A directory that was a worktree whose admin entry got pruned shows as `unknown directory` forever. Removed by: Q2 visibility plus `rm`.
- Dot-directories could be hidden from the sweep. They are not (both `.temp` and `.dcf*` appear), so no change.

### Questions a peer would ask

- Who writes `.temp` and `.dcf*` into the store, and should the store path be given to tools as a cache root at all? Out of scope here.

# Final-shape check

Disagreements with "buildStack names its copy after the leaf's recorded build attempt, so reconcile sees a running build and keeps it":

1. A named copy is not a running build. The record is saved under the lock at `src/next.ts:1053-1063`, buildStack runs after the lock at `src/next.ts:1078-1083`, and the record is cleared only when applied or superseded at `src/next.ts:1089-1093`. A builder killed between those points (SIGKILL, OOM, machine reset; the `finally` at `src/batch.ts:155` does not run) leaves a record naming a copy nobody builds. Reconcile under 2a then keeps that copy as long as the record lives. For a holder that later fails, the record is retained (`src/next.ts:985-987`), so the copy lives for good. What removes it: tie the keep to owner liveness, the same `pid` plus `boot_id` check verify copies already use (`ownerSchema` `src/reconcile.ts:89-93`), written into an `.owner` file in the copy by buildStack. Then "named by a record" and "owner alive" both have to hold.

2. The record can be replaced while the build still runs, and the copy then loses its name. `next.sh` has no lock and every herdr event execs `akrogon next`. A second `mergePass` that reads the holder's unapplied record A passes the gate at `src/next.ts:1040-1044` (same attempt, not applied) and writes a fresh attempt B at `src/next.ts:1053-1063` while builder A is still rebasing in `batch-A`. Nothing between `src/next.ts:1004` and `:1053` checks that a build for A is in flight. Two consequences for 2a: `batch-A` is now "named by no record" and gets force-removed mid-rebase, which today's `rebase in progress` keep (`src/reconcile.ts:49-50`) prevents. And when builder A reaches `src/next.ts:1089-1093` it sees attempt B and clears the record, so `batch-B` loses its name while builder B is still running, and the next reconcile force-removes B too. What removes it: either the `.owner` liveness check from point 1 (removal needs a dead owner, not just a missing name), or keep the dirty and rebase-marker checks for `batch-*` and drop only the reachability check. The second is cheaper and already shipped.

3. The `rebuild` loop reuses the attempt name. If the `finally` removal at `src/batch.ts:155` throws, `command` propagates and the loop never reaches the next `createSparseWorktree`, so this is safe today. It stops being safe if 2a makes buildStack tolerate a failed removal. Low weight, stated so the implementer keeps the throw.

No disagreement with: `restack` `src/phase.ts:655-700` already holds `record.attempt`, so both callers can pass the name; `batchAttempts` `src/reconcile.ts:192-194` reads open and closed leaves, so a retained record on a closed holder counts.
