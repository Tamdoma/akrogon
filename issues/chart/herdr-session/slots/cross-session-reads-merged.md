# cross-session-reads merged notes (A, B, C)

## Facts (B,C, herdr v0.9.1 source)
- Plugin commands get HERDR_SOCKET_PATH set to the firing server's socket; the rest of the parent env is inherited unchanged.
- Event JSON is server-generated and carries workspace_id plus tab_id or pane_id; akrogon's hookEventSchema drops workspace_id (src/next.ts:75-98).
- HERDR_PANE_ID is injected only when the event has a focused pane; tab.closed has none, so a stale inherited value can reach that hook (C).
- A stopped session has no live panes (C).

## Q1 cross-session reads
- One pane+tab read per running session per invocation, each row tagged with its session, cached like panesOnce; no flattening into bare-id maps (A,B,C).
- Keep-vetoes and capacity read all sessions; a worktree-cwd hit from any session keeps or counts (A,B,C). The union covers running sessions with no registered repo too (C).
- Recorded-tab liveness compares (resolved session, tab id); a same-id tab in another session is foreign, including in foreignPaneInside's own-tab exception (B,C).
- Closes and pane effects go only to the tagged session after the acting-use checks (A,B,C).
- Unknown: a running session whose pane read errors makes vetoes keep and capacity full; server_not_running counts as stopped, per the operator's 1b (B,C).
- Capacity may admit fewer leaves the first pass after the change, because misplaced seats now count; intended, stated in criteria (C). Refresh the count after launches within a pass (B).

## Q2 hook and HERDR_PANE_ID trust
- With an event: trust the event JSON's ids, session from the injected socket matched exactly to `session list --json` socket_path, workspace_id compared to the repo's resolved workspace (A,B,C).
- tab_closed and pane_closed: (emitting session, event workspace_id, id) selects the owner for a wake; any later action still passes acting-use and second-seat checks (B,C). This replaces the deferral recorded in session-address.
- No event (manual `akrogon next` in a pane): HERDR_PANE_ID is a hint only after corroboration in the resolved session (B,C).
- src/log.ts diagnostic session: recorded slot pane first; with no slot, null (B) vs env after corroboration (C).
