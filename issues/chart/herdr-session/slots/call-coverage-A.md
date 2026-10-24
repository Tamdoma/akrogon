# Call coverage, seat A notes

Skills ship from this repo: ~/.claude/skills/{chart-issues,watch-issues} resolve to ~/.akrogon/releases/<sha>/skills/, so skill scripts are akrogon-owned.

## Pin in this chart (session-scoped calls)
- src/shell.ts:202-224 herdr(), panes(), tabs(), workspaces(): take the resolved session and pass `--session`; discovery calls get run's deadlineMs (stopped-and-ambiguous).
- Raw bypasses must route through herdr() with the session: src/next.ts:192, :611, :646; src/reconcile.ts:387 (command tab close), :667 (run tab close).
- Other herdr() callers that inherit the default today: src/phase.ts:45-73 (rename, scoped-only lookup), src/scope.ts:123, src/verify.ts:241 (notice delivery), src/next.ts:866, :880.
- src/land.ts:33-35: stop forwarding HERDR_SOCKET_PATH; land passes the resolved session name (or resolves itself) so the unit cannot inherit a wrong socket.
- plugin/herdr-plugin.toml: hooks stay; the hook path follows cross-session-reads (socket_path match plus workspace_id). Startup `pull --all` touches no herdr pane; `next --resume` uses the per-repo resolution.
- tests/fake-herdr.ts: single-session today; needs session-keyed state, `--session` parsing, `session list --json` with running/stopped, so each lock has a passing and a breaking case.

## Leave
- src/install.ts:136-137 and src/self-update.ts:284: integration install and plugin link. Unknown whether herdr scopes plugin links per server; one real call (`herdr --session <other> plugin list`) decides. If per server, it is a separate issue (plugin missing in some sessions), not this chart.

## Split out
- chart-issues peer scripts (peer-ask, peer-wait, peer-restart, door-reset) address panes in A's own session from A's own pane, where the inherited socket is the right one. No change needed here.
- watch-issues observe.ts runs `herdr agent list` with the inherited session, so it misses seats in other sessions. Same bug class but a different consumer and test suite: a parallel leaf of this issue after the shell.ts session API lands, blocked-by it.
