# Event-driven recovery without a daemon of ours

Research 2026-09-08 for # Next Command Owner Q2. Sources: herdr 0.9.0 schema and docs (socket-api, plugins, integrations), Claude Code hooks docs, Codex hooks docs, systemd 261 man pages. Tier 2 throughout, herdr schema checked on this machine.

| Mechanism | Trigger | Covers agent crash | Needs our daemon | Scope |
|---|---|---|---|---|
| herdr plugin `[[events]]` hook | herdr runs `command` once per matching event (`pane.exited`, `pane.agent_status_changed`) | yes | no, herdr server is the daemon | harness-independent |
| herdr `events.subscribe` | pushed events on an open socket | yes | yes | harness-independent |
| Claude Code `Stop` hook | end of each turn, has cwd | no (nothing on kill) | no | per harness |
| Codex `Stop` hook / `notify` | end of turn, has cwd | no | no | per harness |
| systemd `.path` unit | inotify on a file, starts a oneshot | only if something writes the file | no | harness-independent |
| systemd `.timer` | interval | timer, not event | no | harness-independent |

Details.
- herdr plugins.mdx: "Event hooks run for enabled installed plugins when Herdr emits a matching event name such as worktree.created." Manifest: `[[events]] on = "<event>" command = [...]`. Hooks receive `HERDR_SOCKET_PATH`, `HERDR_PANE_ID`, `HERDR_PLUGIN_EVENT`, `HERDR_PLUGIN_EVENT_JSON`. socket-api.mdx lists `pane.exited`, `pane.agent_detected`, `pane.output_matched`, `pane.agent_status_changed` as event names and says hook `on` values are validated against known event names at link time. Only `worktree.created` is shown as an example, so pane events as hook targets are inferred and need one `herdr plugin link` test.
- `pane_exited` carries only pane_id and workspace_id. The hook maps pane to issue through `herdr pane get` (cwd) or reports nothing and lets `akrogon next --all` decide from phases.
- herdr status for Claude Code and Codex is screen detection, not the hook, so `agent_status_changed` fires for any harness herdr recognizes.
- Claude Code Stop hook: fires when Claude finishes responding, runs in cwd, `async: true` allowed. SessionEnd reasons: clear, resume, logout, prompt_input_exit, other. Nothing on SIGKILL.
- Codex: `Stop` hook payload has cwd, session_id, turn_id; `notify` fires only `agent-turn-complete`. Hooks already enabled on this machine.
- systemd.path(5): PathModified activates on writes, uses inotify, no state, default Unit is the same-named service.

Gaps: R1 pane events as plugin hook targets are undocumented as examples. R2 pane_exited has no slug. R3 harness Stop hooks fire for every session on the machine, so the command must no-op fast outside akrogon worktrees.
