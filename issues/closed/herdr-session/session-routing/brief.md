# Brief: session-routing

## What

akrogon stops trusting the inherited HERDR_SOCKET_PATH. Once per invocation it runs `herdr session list --json`. For each repo, before that repo's first pane or tab list, it runs `herdr --session <name> workspace list` in every running session and picks the one workspace whose label equals the registered repo key exactly. (A,C) It refuses that repo visibly when there is no match, more than one match, or an unreadable session. Every herdr call akrogon makes for that repo then carries `--session <name>`. That includes the herdr() wrapper and its list helpers in src/shell.ts and the raw spawns that bypass it: the busy notice, agent start and agent prompt in src/next.ts, and both tab closes in src/reconcile.ts. These all go through one argv builder that both runs the command and records it. Discovery reads get a 10-second deadline through run's existing deadlineMs. The land unit stops forwarding HERDR_SOCKET_PATH and resolves for itself. Before creating a tab, a second-seat guard reads panes and tabs in every running session. tests/fake-herdr.ts learns `--session`, per-session state and `session list --json`.

## Why

Tamdoma/akrogon#117: a background job that inherited another session's socket ran `akrogon next`. Seats and a paid run were placed in a hidden session, and leaf state pointed at the wrong tab. herdr ids are per server, so the same id names different panes in different sessions.

## Done-criteria

1. The inherited HERDR_SOCKET_PATH names session Y, and the repo's workspace exists only in running session X. `akrogon next <slug>` creates the seat tab in X's repo workspace, and the seat pane's cwd is inside the leaf worktree. Session Y receives no create, split, start, prompt, close, rename or notice call.
2. When no running session has a workspace labeled with the repo key, or two workspaces carry it (in one session or across sessions), the repo is refused. The refusal names the label, the sessions searched and the sessions skipped as stopped, and for duplicates each session and workspace_id. Nothing is created for that repo. Another repo in the same `--all` pass still proceeds, and the invocation exits non-zero.
3. A session listed stopped, or one that answers server_not_running when read, is skipped and never started. Any other error from a running session, or no answer within 10 seconds, refuses the repo as unreadable. A failed `session list` is reported once per invocation.
4. Agent start, agent prompt, the busy notice and both reconcile tab closes run with the resolved `--session`. A failed agent start or prompt delivery records the exact argv that ran in delivery_error.command. Busy-notice and tab-close failures keep their existing error or kept-resource behavior, and any command they record is the routed argv. (A,B)
5. When a pane in another session, or in another workspace of the same session, has its cwd inside the expected leaf worktree, the next pass refuses before creating a tab and names that session and pane. An unreadable running session also makes the guard refuse.
6. A recorded tab is reused, and a recorded pane or tab is closed, only when the tab is in the repo's workspace in the resolved session and has a member pane whose cwd is inside the leaf worktree. Liveness lookups (reconcile tabLive, phase rename to and from `<slug> failed`) look up the stored id only in the resolved session.
7. The land unit's systemd argv carries no HERDR_SOCKET_PATH. With a stale socket in the parent environment, land's wake calls and notices reach the resolved session.
8. Phase tab renames, the verify main-red notice, merge notices and scope process-info lookups go to the resolved session. When the repo's session is stopped, no notice is shown and the verify receipt still persists.
