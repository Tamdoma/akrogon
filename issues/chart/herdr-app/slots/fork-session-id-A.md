# Fork notes A: session-id

## Q1 which features stay
- Pick: keep all four. Chart usage is shown at every handoff review (chart-issues SKILL.md, handoff paragraph); the log tail is the watcher's loop evidence in its Busy rule (signpost 4a: watcher workflow unchanged); the `session` fields in log.jsonl and timings.jsonl are one nullable value each; seats.yaml session feeds usage. Cost: the id has to come from somewhere other than herdr.
- Rejected: drop usage and log tail (changes the door's handoff review and the watcher's judging, which the operator said stay).
- Evidence: better-than-training · `skills/watch-issues/SKILL.md` Busy rule (`log<seat>=` from observe.ts), `skills/chart-issues/scripts/chart-usage.ts:130-151` (locates transcripts by id per harness), `src/log.ts:51`, `src/timing.ts:31` · 2026-11-06.

## Q2 how the id is known
- Pick: the start command chooses the id where the harness accepts one and passes it in argv: `claude --session-id <uuid>`, `pi --session-id <id>` (both in `--help`, 2026-11-06); state and seats.yaml record it at start, no lookup. codex (every leaf's B today, `~/.akrogon/config.yaml` slots.b) has no such flag: find the rollout file the codex process keeps open, from `hc get` `foreground.pid` and `/proc/<pid>/fd` (low confidence; probe that codex holds its rollout open, and that the pid is codex, not a wrapper). agy: no id flag and no known transcript; unknown.
- Rejected: matching transcripts by cwd and start time (A and B of a leaf share a worktree; D,E rejected per-harness format bets in the map); a herdr-setup patch (no source, signpost 3 needs something to patch).
- Pitfall: codex `/new` or a resumed session changes the rollout file. Removed by: resolve the open file each time it is needed, not once at start.

## Q3 unknown id
- Pick: the existing null-session paths, unchanged: observe prints `log<seat>=-` and the watcher judges from the screen with "no log"; chart-usage reports the seat as unmeasured and the review shows `outcome partial`; log and timings write `session: null`. No new fallback.
- Evidence: `skills/watch-issues/scripts/observe.ts:157-159` (`-` when no session), chart-issues SKILL.md ("a failed measurement never holding a handoff") · 2026-11-06.
- Ask: is agy as a consultant without usage acceptable, or should the config fork drop agy if usage matters?
