# Brief: session-reads

## What

Consumes from session-routing: session discovery, the session-tagged pane, tab and workspace reads of every running session, and the session-scoped argv builder. On top of these, capacity counting (activeCount), reconcile keep-vetoes and hook pane ownership read every running session's inventory, tagged by session. Acting calls stay in the tagged session. An unreadable session counts as unknown, so nothing it might hold is closed or launched past capacity. The inventory is updated or invalidated after each launch or close within a pass. A plugin hook takes ids from its event JSON. It finds its emitting session as the `session list` entry whose socket_path exactly equals the injected HERDR_SOCKET_PATH, and it acts only when both the emitting session and the event's workspace_id equal the repo's resolved session and workspace. (A,B) hookEventSchema keeps workspace_id. Close events, tab.closed included, are handled through this route. In manual runs, scope comes from cwd or an explicit target first, and an inherited HERDR_PANE_ID is only a hint inside that scope. src/log.ts reads the slot's pane first, and with no slot its diagnostic pane is null.

## Why

After session-routing, each repo acts in one session, but seats in other sessions are still invisible to counting and vetoes. Hooks also still trust env values that herdr does not refresh. tab.closed carries a stale inherited HERDR_PANE_ID because herdr injects it only when a pane is focused.

## Done-criteria

1. A busy seat that lives in a session other than the one the pass started from counts toward capacity, so no extra seat launches past the limit. When a running session is unreadable, that repo launches no new seat.
2. Reconcile keeps a worktree when any pane in any running session has its cwd inside it. A recorded tab counts as live only when a tab with that id is live in the repo's resolved session, so a same-id tab in another session does not keep it. When a running session is unreadable, reconcile closes nothing whose liveness that session could decide. Existing eligible tab closes (closeMergedTab, mergedWorktree) stay allowed after session-routing's acting checks. (A,B,C)
3. Within one pass, a second launch sees the seat the first launch created, and a closed tab is no longer counted.
4. A hook acts for a repo only when its injected socket identifies the repo's resolved session and its event workspace_id equals that repo's resolved workspace id. Ids come from the event, whatever the inherited HERDR_PANE_ID says. An unknown origin, a different emitting session (even with the same workspace, tab or pane ids), or a different workspace takes no action for that repo and logs why. (A,B)
5. A tab.closed event updates the owning leaf through the event route, with the same acting checks as session-routing, and no attribution comes from the stale env pane id.
6. Run by hand, akrogon takes its scope from cwd or the explicit target. It does not select, attribute or act on a leaf from an inherited HERDR_PANE_ID, whether that pane is in another session or outside the scope. HERDR_PANE_ID may only narrow work inside an already established scope, such as the close-merged-tab gate, and never establishes one. (A,C)
7. A log move with no slot records `session: null` even when HERDR_PANE_ID is set. With a slot, native-session attribution comes from that slot's validated pane in the resolved session, with no environment-pane override. (A,B)
