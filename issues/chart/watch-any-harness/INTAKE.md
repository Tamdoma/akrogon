# Intake: watch-any-harness

## Scope

Destination: akrogon (registered root /home/ivan/Work/infra/akrogon). One chart: watch-issues runs from one shared script on every harness the skill is linked into (claude, codex, pi, agy), instead of refusing outside Claude Code cron.

## Provenance

- Operator: door t126, 2026-11-20 /chart-issues message with screenshot (images/2.png in the door session)

## Source: operator 2026-11-20 door t126

[Image #2] <- This is a problem right now because sometimes I don't want to use only Claude code as the watcher agent inside of the watch issues. We need to make an elegant solution where there is only one script because the watch issues are symlinked and it's the same scale for all harnesses.  Is this possible to do? Consult with these consultants: slot a (codex astra 6.2 high) and slot b (agy neon high). Full autopilot mode except for the signposts. I want to do the signposts myself.

Screenshot content (transcribed by A): a pi terminal (gpt-6.2-sol, Codex adapter) running the watch-issues skill replied "This watch needs Claude Code cron, so no watch is running."

## Agent findings

- `skills/watch-issues/SKILL.md` § Invocations: "Claude Code only. When CronCreate is absent, say "This watch needs Claude Code cron, so no watch is running."". The timer, job identity, stop and /clear detection all rest on Claude Code's CronCreate/CronList/CronDelete.
- The skill is one folder linked into each harness: `~/.claude/skills/watch-issues -> ~/.akrogon/current/skills/watch-issues`; pi and codex skill folders also list `watch-issues`.
- History: herdr-app chart fork `forks/watcher.md` (operator 2026-11-06, Q3 3a) kept the watcher in a Claude terminal. Leaf watcher-on-hc added a listener wake to a terminal labelled `akrogon.watch=<repo>`; commit 3fdf8cd2 (2026-11-08) removed that wake path because the label outlived /clear and the agent, so ticks were typed into whatever idle terminal held the label.
- `observe.ts` and `log-tail.ts` are already harness-neutral bun scripts; only the timer and its lifecycle are Claude-specific.
- Mode words: "Full autopilot mode except for the signposts. I want to do the signposts myself." read as autopilot (operator answers signposts, A answers forks).
