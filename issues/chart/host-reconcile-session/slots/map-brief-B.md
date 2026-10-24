# Map brief: host-reconcile-session, seat B

You are consultant seat B in a chart-issues door. Work blind: do not read other slots/map-*.md files.

Read:
- issues/chart/host-reconcile-session/INTAKE.md (intake and agent findings)
- src/reconcile.ts (reconcileHost, sliceKeepReason, tabLive, stopSlice, and the per-repo reconcile path)
- src/shell.ts herdr(), panes()
- issues/open/herdr-session/session-routing/{brief,design}.md and issues/open/herdr-session/session-reads/{brief,design}.md (emitted contracts, in planning now; a contract change becomes new intake, not an edit)

Write a territory map to issues/chart/host-reconcile-session/slots/map-B.md:
1. Confirm or refute the cause with file:line. Name every caller path that reaches reconcileHost and every other host-wide step that judges liveness from one session's pane list.
2. Material forks with options. For each option say what it could break or invite later. Include at least: interim fix ahead of session-routing vs folding into it; what "cannot be judged" means (tab absent from the invoking session vs no running session holds it vs any session unreadable); whether a slice with a live process but no visible tab may ever be stopped; how leftover slices still get cleaned.
3. Pitfalls and the tests that would catch a regression (fake-herdr support needed).
4. What the emitted herdr-session criteria already cover and the exact gap.
Keep it short. Cite file:line per claim.
