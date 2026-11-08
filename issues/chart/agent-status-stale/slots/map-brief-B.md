# Brief: opening map, chart agent-status-stale, slot B

You are consultant slot B for the akrogon chart door (A is terminal t15). Map this chart's territory on your own. You will not see A's or the other consultant's map until all are done.

## Reading rule

Read process text by named section for this step: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content that changed since you read it, and content lost to compaction stay readable. The full source is allowed when the source is the subject of the work. Name sections, never line ranges.

## Intake

/home/ivan/Work/infra/akrogon/issues/chart/agent-status-stale/INTAKE.md (read whole, with its Agent findings; screenshot at /home/ivan/Work/infra/akrogon/issues/chart/agent-status-stale/slots/operator-screenshot.png). The herdr-app Agents sidebar showed the door's group (c-akrogon with ak-slot-b and ak-slot-c) idle while the door's main agent was working. A found the cause: the door's Claude session became a Claude Code background job, and since then hc receives no status from that terminal.

## Live surface

- ~/.config/herdr-app/AGENTS.md sections "The model: spaces, tabs, terminals" (Agents, Sub-agents) and "Mods"; `hc --skill` section "Status, recovery, and cleanup"; `hc get t15 --json`, `hc ls --json` (read-only).
- /home/ivan/Work/infra/herdr-setup/mods/agents-by-tab/ (main.js, tree.js) and /home/ivan/Work/infra/herdr-setup/tests/agents-by-tab.test.js (registered repo herdr-setup; its issues/ and README).
- ~/.claude/jobs/acb047ee/state.json (read-only; the background job's live state).
- /home/ivan/Work/infra/akrogon/issues/chart/herdr-app/INTAKE.md (the coming akrogon move to herdr-app; how door and consultants run).

## Locks

Session signposts (/home/ivan/Work/infra/akrogon/issues/chart/round-drawings/forks/signposts.md "Taken"): 1c written rules over command checks, 4a whole family when it adds no parts, 5a, 6a parts that survive the herdr-app move. This chart is full autopilot: A answers its forks.

## Task

Write a proportional territory map: where a fix can live (Claude Code upstream, herdr-core, the agents-by-tab mod in herdr-setup, how the akrogon door is started, an operator workflow step), each with what it could break or invite later; questions a practitioner would ask; pitfalls; the split with destination repo. Confirm or refute A's cause with your own read-only checks. Mark low-confidence items.

Do not edit any file except the return file. Do not kill or prompt any terminal.

## Return

Write the map to /home/ivan/Work/infra/akrogon/issues/chart/agent-status-stale/slots/map-B.md, then run:

hc send t15 "done B: /home/ivan/Work/infra/akrogon/issues/chart/agent-status-stale/slots/map-B.md"
