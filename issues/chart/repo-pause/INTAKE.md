# Intake: repo-pause

## Scope
Destination akrogon. One standalone issue: pause automatic dispatch for one registered repo while operator commands still work.

## Provenance
- GitHub: Tamdoma/akrogon#61
- Operator: 2026-10-08 chart-issues open, split answer `1a 2a`

## Source: Tamdoma/akrogon#61
# akrogon has no per-repo switch to pause automatic dispatch; closing a seat relaunches it within seconds

Source: Tamdoma/akrogon#61
URL: https://github.com/Tamdoma/akrogon/issues/61

Unverified intake.

## Observation
On 2026-10-08 the operator closed the seat panes of two running leaves under `issues/open/direct-mode` (`direct-setting`, `hand-built-removal`) to swap their slot models. Both leaves were relaunched in new tabs within about 30 seconds on the old pi slot config. `akrogon park direct-mode` is not an option because it refuses issues with a running leaf. The only way to stop relaunches was `herdr plugin disable akrogon`, which pauses automatic dispatch for every registered repo, including repos with unrelated work running.

## Location
akrogon herdr plugin (`plugin/herdr-plugin.toml`, `plugin/next.sh`) and `akrogon next` / `akrogon park`.

## Reproduction
1. Have a leaf with a working seat under `issues/open`.
2. Close its panes with `herdr pane close`.
3. Within seconds, a new tab for the same leaf appears with the same slot config.
Frequency: every time (seen twice in a row).

## Expected behavior
The operator can pause automatic dispatch for one repo, so event-driven `akrogon next` skips that repo while explicit operator commands still work and other repos keep dispatching.

## Urgency
Blocks changing a running leaf's harness or model, and stopping a repo whose agents are hitting usage limits, without pausing every repo. Workaround: `herdr plugin disable akrogon` (global), then `herdr plugin enable akrogon` afterward.

## Suspected cause
The plugin runs `sh next.sh` (`exec akrogon next "$@"`) on `pane.agent_status_changed`, `pane.exited`, `pane.closed` and `tab.closed`. Closing a pane fires `pane.closed`, and `next` sees an idle or absent required seat and relaunches it. Nothing in the plugin or in `akrogon next` checks a per-repo pause. `src/park.ts` `running()` refuses to park an issue whose leaves have `tab` or `worktree` set, so park cannot stop a leaf that has started.
View: both.
Files read: plugin/herdr-plugin.toml, plugin/next.sh, ~/.config/herdr/plugins.json (installed copy, linked to plugin/ in this repo), src/park.ts.
Not inspected: how `akrogon next` with no slug picks which repos to dispatch for a plugin event.
Related reports: none found. Searched Tamdoma/akrogon, all states: author @me since 2026-10-06 (limit 20), and "pause dispatch repo" (limit 5).

## Agent findings
See [opening map](slots/map-merged.md).
