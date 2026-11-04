# Intake: agent-status-stale

## Scope

The herdr-app Agents sidebar showed the akrogon chart door's whole group idle while its main agent was working. Destination (herdr-setup mods, herdr-core status reporting, or the door's own start) is set by the opening map.

## Provenance

- Operator: door pane t15, 2026-11-04T12:01:22Z (added to the handed list mid-session, with screenshot slots/operator-screenshot.png)

## Source: operator t15 2026-11-04

"[Image #17] <- this also needs to be charted and fixed (autopilot, autopilot signposts). As soon as the subagents were idle, the whole pack went idle, even though the main agent was working."

Screenshot (copied to slots/operator-screenshot.png): Agents sidebar, "Idle 6" group holds c-akrogon (16h) with children ak-slot-b and ak-slot-c, all idle (boxed in red); the c-akrogon pane shows Claude "Spinning… (37s)" at the same moment; Working 1 holds c-framework.

## Agent findings

- 2026-11-04, A: `hc get t15 --json` shows terminal t15 argv bash, foreground claude (pid 2943990), `status: null`, `reported: true`, `status_ms` 1793735801327, about 16.1 h before the check, matching the sidebar's "16h". The children t3w (codex) and t3x (claude) report working/idle/done normally. So A's own status stopped reaching hc about 16 h ago while its children kept reporting; a group then shows the most urgent status of what is reported, which is idle once the children finish.
- The sidebar is the operator's `agents-by-tab` mod, linked from /home/ivan/Work/infra/herdr-setup/mods/agents-by-tab (registered repo herdr-setup).
