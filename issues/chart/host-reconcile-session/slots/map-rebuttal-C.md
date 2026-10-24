# Rebuttal C: host-reconcile-session

## D1: disagree as written

The `repos` argument does two jobs in `reconcileHost`, and passing only invoked repos breaks the second one.

- `leafOf` is built from the passed repos (`src/reconcile.ts:1175-1186`), but the loop still walks every loaded slice (`src/reconcile.ts:1190`). Another repo's slice becomes "unmatched": busy ones survive only via the existing process veto (`src/reconcile.ts:1227-1231`), empty ones still stop, and that repo's unreadable/foreign slice protections vanish because it was never inventoried. D1 must say whether another repo's empty leaf slice is "host-global garbage" or that repo's property. As written the code decides by accident.
- The sweep skip sets come from the same list: `repoNames` (`src/reconcile.ts:1296-1311`) and `repoHashes` (`src/reconcile.ts:1317-1330`). With invoked-only repos, every other registered repo's worktree-store dir reads as unregistered and its leaf-temp hash dir is no longer skipped, so `dropPath` can delete another repo's temp tree, vetoed only by the invoking session's panes plus process and owner scans (`src/reconcile.ts:1250-1275`). That is a new cross-repo delete, in the step D1 says keeps today's rules.
- Fix shape: keep all-registered inventory for identification and skip sets, scope only the actions on leaf-matched slices to invoked repos. That needs both lists, not a smaller `repos`.
- What D1 drops, accepted or not: today any pass cleans every repo's finished and closed leaf slices (`src/reconcile.ts:1140-1143`). Under D1 a quiet or paused repo's busy leftovers (tab gone, process leaked) are never stopped until someone runs that repo, and `--all` inside a repo dir only reconciles that repo (`src/next.ts:1410`). Nobody else cleans them. That follows the operator rule, but it is a relied-on cleanup being removed, and the leaf should say so.

## D2: disagree on two cases

- Duplicate label across sessions: a workspace labeled `repo.name` exists in the invoking session and the seat's real workspace with the same label is in another session. D2 judges in the invoking session, tab absent, D3 stops the busy slice. Workspace presence does not prove this is the seat's session, and the existing lookup takes the first label match (`src/next.ts:407-408`). Only session-routing's uniqueness refusal (its criterion 2) closes this, so D2 interim is safe only under a one-workspace-per-repo layout. State that precondition.
- D2 must scope `tabLive` only, not the pane list. `Pane` carries no `workspace_id` (only `Tab` does, optionally: `src/shell.ts:150-168`), so the workspace test needs a tabs join. If implemented by filtering the pane list to own-workspace panes, the occupation vetoes `livePaneInside`/`foreignPaneInside` (`src/reconcile.ts:245-257`, used at `src/reconcile.ts:704,765,787,952`) stop seeing foreign panes, and reconcile can remove a worktree or temp under a pane from another workspace, backstopped only by the `/proc` scan (`src/reconcile.ts:540-548`). And if D2 changes only the slice test, a workspace-absent pass still closes tabs and removes merged, failed and old-root worktrees and drops leaf temps (`src/reconcile.ts:694-723,765,787,1079`). "Tab-based decisions read as unknown" has to mean the whole per-repo pass sees the existing null-keep (`src/reconcile.ts:208`), not just `sliceKeepReason`.

## D3: agree only if "proven gone" is strengthened

Busy-stop on proven death is my map's K3-O3. But D2 plus D5-T4 count a tab as gone while its pane is visible in the invoking session in another workspace. Tab ids are unique within a server, so a visible pane with that `tab_id` proves the tab lives; an operator moving a seat tab to another workspace would get its busy slice stopped under it. Minimum fix inside D2's cost: a `tab_id` found anywhere in the invoking session's pane list keeps (today's `tabLive`, `src/reconcile.ts:255-257`); death is proven only when the own workspace is present and the tab is absent from the whole session.

## D4: agree

One new leaf ahead of session-routing, rebase the other onto it.

## D5: disagree on T4, and two missing tests

- T4 codifies the D3 failure above. Replace it: tab visible in another workspace of the same session, busy slice, expect no stop.
- Missing T6: cross-repo `next` deletes nothing under the other repo's leaf-temp hash dir or worktree-store dir. This is the test that catches D1's skip-set break.
- Missing T7: workspace-absent pass against a merged leaf removes no worktree, drops no temp and closes no tab. This catches a slice-only D2.
- T1 also cannot tell D1 scoping from the unmatched process veto (`src/reconcile.ts:1227`): both keep a busy foreign slice. Pin D1's decision on the other repo's empty leaf slice in a test either way.

## Tags and residuals

- M3's `(A,B,C)` overclaims for C: my map did not name `start` via `nextCommand` (`src/stop.ts:97-106`). The path is correct, the tag is not. No other merge tag misstates my note.
- Residual outside D1+D2, already in M6: the `tab_closed` hook matches owners across all repos by bare `tab_id` (`src/next.ts:1429-1433`), so one session's close can reconcile and dispatch another repo's leaf that records the same id. D2's null-keep limits the damage when that repo's workspace is absent in the emitting session. Full fix stays with session-reads criterion 5.

Most important: D1 as written does not remove cross-repo action by construction. Shrinking `repos` makes other repos invisible to the identification and skip sets, so their slices fall into the unmatched path and their temp dirs into the sweep. Scope the actions, not the inventory.
