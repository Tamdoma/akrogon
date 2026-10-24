# Fork: scope-rule

Question: how does a reconcile pass stay inside its own repo and workspace, per the operator rule "Every session and workspace only takes care of its own session and workspace"?

Evidence: slots/map-A.md, map-B.md, map-C.md, map-merged.md, map-rebuttal-B.md, map-rebuttal-C.md.

## Options considered
- D1 as merged (shrink `repos` passed to reconcileHost). Rejected: `repos` also builds leaf ownership and the sweep skip sets, so other repos' slices become unmatched and their temp and worktree-store dirs become sweepable (B, C: src/reconcile.ts:1175-1186,1296-1330).
- D2 as merged (workspace join on tabLive, slice test only). Rejected: a tab visible in another workspace of the same session would read dead (C), panes carry no workspace_id (B, C: src/shell.ts:150-168), and a slice-only gate still lets worktree removal, temp drops and tab closes run (C).
- Waiting for session-routing. Rejected by the operator ("o1").

## Taken (A, autopilot, 2026-10-24)
1. Inventory vs action: reconcileHost keeps all registered repos for leaf ownership and skip sets, and takes a separate list of repos the pass acts for. A leaf-matched slice of a repo outside that list is kept with its own reason. Unmatched slices (empty cgroup only), failed run unit reset and the host filesystem sweep keep today's rules. (B,C)
2. Own workspace: a repo is acted on only when the invoking session has a workspace labeled with the repo key (existing rule src/next.ts:407). Otherwise its per-repo reconcile is skipped entirely and its matched slices are kept in the host step, so nothing of it is stopped, closed or deleted. A failed workspace list counts as absent for every repo. (A,B,C)
3. Tab liveness stays today's tabLive over the whole invoking session's pane list, so a tab visible anywhere in the session keeps. Death is proven only when the repo's workspace is present and the tab is absent from the session. (C) The busy-leftover stop policy is unchanged. (B,C)
4. Entry paths: reconcileRepos passes its repo list as the action list; the tab_closed hook passes its owner repo. (A,B,C)
5. Stated limits: assumes one workspace per repo label across sessions; duplicate labels and true cross-session resolution stay with session-routing criteria 2 and 6. Busy leftovers of a repo nobody runs wait for that repo's own pass. tab_closed owner matching by bare tab id stays with session-reads criterion 5. (B,C)
6. Tests on today's fake: other repo's busy and empty leaf slices kept by a cross-repo pass; other repo's temp hash dir and worktree-store dir untouched; repo with no workspace in the session: merged leaf keeps worktree, temp, tab and slice; own workspace present and tab gone still stops; tab visible in another workspace keeps; paused repo untouched by another repo's pass; deliberate break of 1 or 2 turns those red. (A,B,C)

Rejected options and dissent: none standing. B's D4 concern is answered by limit 5.

## Proof
- 2026-10-24 herdr 0.9.1, identity: operator's local user, `herdr workspace list` in the invoking session (infra): exit 0, returned workspaces with `label` and `workspace_id` (akrogon w8, framework wA, ...). Read-only, no cleanup. Limits: does not show other sessions.
