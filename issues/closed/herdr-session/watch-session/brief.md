# Brief: watch-session

## What

Consumes from session-routing: session discovery and the session-scoped argv builder. skills/watch-issues/scripts/observe.ts finds the repo's session through that shared resolver instead of the inherited socket. It runs `agent list` there and maps stored pane ids within that session only. It prints `session=<name>` as its first stdout line, before any leaf lines, so (A,C) the watcher's acting commands in skills/watch-issues/SKILL.md (agent read, send-keys, wait, prompt) can carry `--session <name>`. The OBSERVE_HERDR test override reaches every herdr call the observer makes, session discovery included.

## Why

After session-routing, seats open in the repo's session. The observer still lists agents in whatever session it inherited, so it would report live seats as absent, or report another session's agent under the same pane id.

## Done-criteria

1. The inherited socket names session Y, and the repo's seats run in session X. The observer reports each seat's status and log from X, and a same-id pane in Y is not reported.
2. A missing, duplicate or unreadable repo workspace makes the observer exit non-zero with the refusal on stderr and no status lines, the same failure shape as a herdr failure today. (A,C)
3. With OBSERVE_HERDR set, the session list, workspace list and agent list calls all go to that binary.
4. skills/watch-issues/SKILL.md describes the `session=` line, and its acting commands name that session.
