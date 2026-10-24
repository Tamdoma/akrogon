# Merged opening map (A, B, C)

## Chart herdr-session (#117)
- M1 Session source: discover across running sessions, exactly one exact-label workspace, refuse on zero or several, never create (A,B,C). Config binding rejected: strict repoSchema, drift (B,C).
- M2 Pin: `herdr --session <name>` per call; proven on 0.9.1 to beat a stale HERDR_SOCKET_PATH (B,C). HERDR_SESSION env ranks below the socket, a trap (C).
- M3 Stored tab/pane ids: derive session per pass, store nothing (A,C) vs session-qualified address in state (B). Disagreement.
- M4 Cross-repo reads (activeCount, reconcile veto, hook owners): session-tagged union, unknown session never reads as empty (B,C).
- M5 Scope: every src herdr call incl. raw bypasses next.ts:192,611,646, reconcile.ts:387,667 (B,C); plugin link/install stay ambient (C); chart/watch scripts are a separate outcome (B,C).
- M6 Stopped sessions: never started by discovery (B,C). Open: does `--session <stopped>` auto-start a server (C, probe needed).
- M7 Land unit: stop forwarding the inherited socket (A,B,C); land resolves itself (C) or carries recorded session (B).
- M8 Stale HERDR_PANE_ID attribution: trust only in hook passes or with cwd check (C); fog (A).
- M9 Test fake needs sessions (B,C).
- Allocate closes recorded panes (next.ts:383) before the workspace check, so a wrong session acts before refusing (B,C).

## Chart pull-gh-path (operator note, A only so far)
- Door's `akrogon pull` died with raw Bun ENOENT trace: `gh` not on PATH.
- PATH held mise/installs/gh/latest/gh_2.102.1_linux_amd64/bin. mise moved `latest` to 2.103.0 on 2026-10-23 13:53; the versioned subdir is gone under latest. A fresh interactive shell resolves gh_2.103.0 and shims.
- Stale holder: Claude Code process started 2026-10-21 08:11; processes started today 12:05 also carry gh_2.102.1 (inherited from long-lived parents).
- Same class as #117: a long-lived parent's env goes stale and akrogon trusts it. land.ts also forwards PATH into units.
