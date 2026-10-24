# Chart: herdr-session

## Destination

`akrogon next` and every lifecycle herdr call act in the herdr session that holds the repo's own workspace, whatever session an inherited HERDR_SOCKET_PATH names, and refuse visibly when that workspace is missing or ambiguous.

Route: lifecycle (debate no)

## Forks taken

- [session-address](forks/session-address.md): discover by exact label across running sessions, no stored session plus a cross-session worktree guard, resolve once per invocation
- [stopped-and-ambiguous](forks/stopped-and-ambiguous.md): skip stopped sessions, refuse duplicates and errors, per-repo refusal, 10-second discovery deadline, no new notice, Himne workspace created in personal
- [cross-session-reads](forks/cross-session-reads.md): session-tagged reads of all running sessions, act only in the tagged session, hooks by socket_path match plus workspace_id, env pane id only as a scoped hint, log.ts null without a slot
- [call-coverage](forks/call-coverage.md): all src callers and raw bypasses on one argv builder, land resolves itself, multi-session test fake, watch observer as its own leaf, chart peer scripts split to peer-session
- [leaf-split](forks/leaf-split.md): three leaves, routing first, then reads-and-hooks and watch side by side

## Open forks

none

## Fog

none

## Off route

none

## Pending steps

none

Handed off 2026-10-24
