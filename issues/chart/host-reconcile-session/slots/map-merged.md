# Merged map: host-reconcile-session

## Agreed
- M1 Cause confirmed: one pane list from the invoking session judges every repo's leaf slices; tabLive is a bare tab_id match; leaf-matched slices have no process veto (src/reconcile.ts:196-212,255-257,1153-1201; src/shell.ts:202-216). (A,B,C)
- M2 Both stop sites are exposed: host step src/reconcile.ts:1199 and per-repo step src/reconcile.ts:520-531. A host-only fix leaves the per-repo path. (A,B,C)
- M3 Entry paths: reconcileRepos always ends with reconcileHost over all registered repos, paused included (src/next.ts:1307-1322), reached from next target/cwd, --all, --resume, unpause (src/next.ts:1399-1428,1526) and start via nextCommand (src/stop.ts:97-106); tab_closed hook calls it directly (src/next.ts:1440-1447). (A,B,C)
- M4 Emitted herdr-session contracts cover resolved-session tabLive and unknown-keeps, but never name stopSlice, the host leaf-matched stop, or a cross-repo cross-session test. Criterion 6 could be met inside per-repo reconcile while the host stop stays single-session. (A,B,C)
- M5 Pitfall: an empty list means "dead"; unknown must stay null-keep, never []. (C) Finished leaves with no tab must still stop (src/reconcile.ts:205). (C)
- M6 Same-pattern surfaces owned by herdr-session leaves, not this chart: activeCount (src/next.ts:353-370), paneOwners (src/next.ts:1325-1334), closeMergedTab id collisions. (B,C)

## Operator rule (autopilot switch-on, verbatim in INTAKE)
"Every session and workspace only takes care of its own session and workspace, there should be no care about others."

## A's proposed decisions
- D1 Pass scope: a reconcile pass acts only on the repos the command was invoked for. reconcileRepos passes its own repo list to reconcileHost, not all registered repos; the tab_closed hook passes its owner repo. Host-global garbage with no leaf owner (unmatched slices with empty cgroup, failed run units, host filesystem sweep) keeps today's rules, which already require no process inside. Removes cross-repo kills by construction.
- D2 Own-workspace judgment: a repo's recorded tab is judged only inside the repo's own workspace, found today as the invoking session's workspace labeled repo.name (existing rule src/next.ts:407). If the invoking session has no such workspace, that repo's tab-based decisions read as unknown (null-keep), so a pass from another session touches nothing of it. A tab is live when a pane has that tab_id and the workspace's workspace_id. session-routing later swaps "invoking session" for the repo's resolved session; the rule stays.
- D3 Process policy unchanged: with a correct own-workspace judgment, a busy slice whose tab is proven gone still stops (B O3, existing tests tests/release-any-phase.test.ts:421-422). No process veto is added.
- D4 Delivery: one new leaf, not blocked by session-routing (no actual dependency; file overlap only). It lands ahead or session-routing rebases onto it.
- D5 Tests on today's fake (one session; "other session" = workspace absent from workspace list): T1 cross-repo next leaves the other repo's busy slice running; T2 per-repo pass with the repo's workspace absent stops nothing of it; T3 own workspace present and tab gone still stops (cleanup not disabled); T4 tab id present but in another workspace counts as gone; T5 paused repo untouched by another repo's pass; deliberate break: revert D1/D2 and T1/T2 go red.
