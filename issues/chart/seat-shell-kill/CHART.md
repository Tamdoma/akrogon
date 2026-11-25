# Chart: seat-shell-kill

## Destination

When a leaf's phase advances, the tool shells its seats left running, and everything they started, end through one kernel `cgroup.kill` write per tool cgroup, with no process picked from /proc snapshots; harness-direct children, the calling tool call and akrogon's own writers are untouched by placement; a seat terminal hc recovered as a bare shell is a lost seat. Replaces the stopped leaf seat-turn-idle/shell-sweep. Destination repo: akrogon. Map: slots/map-merged.md.

## Forks taken

- [Seed decision](forks/seed-decision.md): Tamdoma/akrogon#157 operator decision (Ivan Juras, 2026-11-24), taken at import, copied from seat-turn-idle
- [Signposts](forks/signposts.md): session signposts (original in seat-turn-idle), A's picks

## Open forks

- [Tool cgroup kill](forks/tool-cgroup.md): granularity and caller, akrogon process placement, harness entry hooks, delegation, width, seat scope resolution

## Fog

none

## Off route

- Periodic listener wake for a shell started after the phase call or a turn ending with no phase call: seed-decision Findings F1, a separate chart candidate (map, all slots).
- Ending the whole seat per phase, freeze plus selection, census plus root kill: slots/map-merged.md Options.

## Pending steps

- At handoff (door): take seat-turn-idle/shell-sweep out of issues/open (it holds Tamdoma/akrogon#157 in sources) and point direct-visible/direct-leaf's blocked-by at the new leaf. Check: `akrogon status` shows the new leaf, no shell-sweep, direct-leaf blocked by the new leaf.

## Mode record

- mode 2026-11-25T07:15:22Z t126 /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/c50ea560-71af-4450-8734-dc2cd89a61d7.jsonl: on autopilot; handed list seat-shell-kill (re-chart of akrogon seat-turn-idle/shell-sweep, Tamdoma/akrogon#157); consultants B t3p0 pi devin/swe-2-1-max high, C t3p1 agy neon high, D t3p2 pi meta/muse-wonder-full-1.0 high (door-created, carried over); signposts /home/ivan/Work/infra/akrogon/issues/chart/seat-turn-idle/forks/signposts.md; words in INTAKE.md "Source: operator door message 2026-11-25"; instructions in force "Full autopilot mode. Don't ask me anything. Think from the systems perspective: simplicity, clarity elegance." (operator door message 2026-11-24, seat-turn-idle INTAKE.md; scope: this door session)

## Autopilot

- switch-on: INTAKE.md "## Source: operator door message 2026-11-25" (the operator's "2a" to the door's round naming autopilot, consultants B, C, D and the carried signposts)
- signposts: A, original in issues/chart/seat-turn-idle/forks/signposts.md
- route: lifecycle
- wait: none. Needs sheet for this chart: none foreseen (local systemd, cgroup and hc only, free tests, no account, key or paid call beyond the standing grant 3b)
- consultant: restarted empty at entry 2026-11-25 (B t3p0 -> t3qb, C t3p1 -> t3qc, D t3p2 -> t3qd, same recipes), first task the map brief
