# Chart: seat-shell-kill

## Destination

When a leaf's phase advances, the tool shells its seats left running, and everything they started, end through one kernel `cgroup.kill` write per tool cgroup, with no process picked from /proc snapshots; harness-direct children, the calling tool call and akrogon's own writers are untouched by placement; a seat terminal hc recovered as a bare shell is a lost seat. Replaces the stopped leaf seat-turn-idle/shell-sweep. Destination repo: akrogon. Map: slots/map-merged.md.

## Forks taken

- [Seed decision](forks/seed-decision.md): Tamdoma/akrogon#157 operator decision (Ivan Juras, 2026-11-24), taken at import, copied from seat-turn-idle
- [Signposts](forks/signposts.md): session signposts (original in seat-turn-idle), A's picks
- [Tool cgroup kill](forks/tool-cgroup.md): per-tool-shell cgroups killed at commitMove, deferred kill for `t-` dirs with an akrogon call in flight, akrogon processes relocate, per-kind entry, Delegate=yes, uniform width, enumeration, bare-shell lost seat; A's autopilot pick, two final-shape checks, C dissents on the deferred kill

## Open forks

none

## Fog

none

## Off route

- Periodic listener wake for a shell started after the phase call or a turn ending with no phase call: seed-decision Findings F1, a separate chart candidate (map, all slots).
- Ending the whole seat per phase, freeze plus selection, census plus root kill: slots/map-merged.md Options.

## Pending steps

- Done at handoff 2026-11-25: direct-visible/direct-leaf blocked-by points at tool-cgroup-kill, with its brief and design references renamed (checked: `akrogon status` shows direct-leaf blocked by tool-cgroup-kill). seat-turn-idle/shell-sweep moved to `failed` with reason "superseded by re-chart seat-shell-kill/tool-cgroup-kill", and its 22 commits stay on branch `shell-sweep`.
- Done 2026-11-25: seat-turn-idle parked. The operator ran `akrogon start shell-sweep`, a pass removed the worktree, and the door dropped the stale `tab:` line (the tab was confirmed gone, since herdr answered "no tab") so park would accept it. Checked: `akrogon status` shows no shell-sweep and seat-turn-idle parked.

## Mode record

- mode 2026-11-25T07:15:22Z t126 /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/c50ea560-71af-4450-8734-dc2cd89a61d7.jsonl: on autopilot; handed list seat-shell-kill (re-chart of akrogon seat-turn-idle/shell-sweep, Tamdoma/akrogon#157); consultants B t3p0 pi devin/swe-2-1-max high, C t3p1 agy neon high, D t3p2 pi meta/muse-wonder-full-1.0 high (door-created, carried over); signposts /home/ivan/Work/infra/akrogon/issues/chart/seat-turn-idle/forks/signposts.md; words in INTAKE.md "Source: operator door message 2026-11-25"; instructions in force "Full autopilot mode. Don't ask me anything. Think from the systems perspective: simplicity, clarity elegance." (operator door message 2026-11-24, seat-turn-idle INTAKE.md; scope: this door session)
- mode 2026-11-25T08:56:00Z t126 /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/c50ea560-71af-4450-8734-dc2cd89a61d7.jsonl: off; every handed chart handed off

## Autopilot

- switch-on: INTAKE.md "## Source: operator door message 2026-11-25" (the operator's "2a" to the door's round naming autopilot, consultants B, C, D and the carried signposts)
- signposts: A, original in issues/chart/seat-turn-idle/forks/signposts.md
- route: lifecycle
- wait: none. Needs sheet for this chart: none foreseen (local systemd, cgroup and hc only, free tests, no account, key or paid call beyond the standing grant 3b)
- consultant: restarted empty at entry 2026-11-25 (B t3p0 -> t3qb, C t3p1 -> t3qc, D t3p2 -> t3qd, same recipes), first task the map brief
- pick tool-cgroup 2026-11-25: A's, standing dissent C (pure a); signposts 1a, 3a, 6a and the seed decision's sentence decided
- leaf review 2026-11-25 (slots/leaf-review-{B,C,D}.md): all items adopted with slot tags except D7 (the helper moves itself), not taken because it reopens the spawn-to-move window closed at check 2. Recorded in forks/tool-cgroup.md.
- handoff review 2026-11-25: written in t126 and answered by A. Destination check: seed 157 is this chart's own source, no other seed matches. The release moved a118b2ff -> 2185ddfc during the chart. The only owned-surface change is env copying in src/run-check.ts, outside the leaf's lines. Preflight exit 0, presence check [], no collision for seat-shell-kill or tool-cgroup-kill. Tree: seat-shell-kill/tool-cgroup-kill, lifecycle route (autopilot), no seats block, grants none, no live run (paid probes ran under standing grant 3b at charting). Leaf written 2026-11-25, `akrogon status` valid.
- consultant: B t3qb, C t3qc, D t3qd collected in every exchange, none dropped, transcript paths unchanged.

Handed off 2026-11-25
