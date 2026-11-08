# Brief: silent-parent-status

## What

Change the `agents-by-tab` mod (`mods/agents-by-tab/main.js` and `mods/agents-by-tab/tree.js`, which holds the mod's pure helpers the tests import) so a parent row that reports no status is shown as "no status" instead of idle, and the folded group header counts sub-agents.

## Why

Operator report, 2026-11-04 (akrogon chart agent-status-stale, screenshot in that chart's `slots/operator-screenshot.png`): the akrogon door's group (c-akrogon with ak-slot-b and ak-slot-c) sat under "Idle" while the door's main agent was working. Cause: the door's Claude session became a Claude Code background job, and a background job sends no program status to its terminal, so hc holds `status: null` for it. `tree.js` `topLevel` gives such a silent ancestor a row with `status: null`, and `main.js` ranks a family by its most urgent member, so once the sub-agents finish the whole family shows as Idle. The root fix is upstream; this leaf makes the list honest.

## Done-criteria

1. A row for an ancestor whose own status is null and that has live sub-agents shows a "no status" marker drawn in the theme's `unknown` colour, distinct from the idle ring, the done dot and the working spinner, shows no idle duration, and keeps its name in the foreground colour rather than the muted idle look.
2. In the priority view such a family is placed in a "No status" section between Working and Idle when no member is more urgent than idle under the existing normalized urgency (a sub-agent's done counts as idle, as `kidStatus` does today); a family with a working or blocked member stays in that member's section, with the parent still marked "no status".
3. A folded group header's most-urgent state includes sub-agents' states, so a folded group whose only working agent is a sub-agent shows working.
4. Rows for agents that report a status, and pane-less sub-agents, render and group as before; the existing ancestry behaviour (one row per farthest live ancestor with a pane, sub-agents under it) is unchanged.
5. `herdr-app check mods/agents-by-tab` passes, and the repo's `checks` pass.
