# cross-session-reads, seat A (before reading B, C)
Q1: one pane list per running session per invocation, each pane tagged with its session; capacity counts across all; keep-vetoes treat any unreadable session as unknown (keep); acting closes go to the tagged session. Bare-id matching compares (session, id).
Q2: HERDR_PANE_ID/HERDR_SOCKET_PATH are trusted only together inside a plugin hook pass, where the firing server injected both; the hook session is named by matching the socket against `session list --json` socket_path. Outside hooks, ignore both for routing.
