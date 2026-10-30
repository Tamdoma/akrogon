# Brief: peer-pane-anchor

## What

The chart-issues peer scripts (peer-ask, peer-wait, peer-restart, peer-create, door-reset in `skills/chart-issues/scripts`) act only in the herdr session of the door pane they run under. Before its first herdr call, each script checks that the pane `HERDR_PANE_ID` names, read over the inherited herdr env, has a `shell_pid` that is an ancestor of the script's own process. When that fails, the script refuses and names the env values and herdr's answer. Scripts that take A's pane as an argument also refuse when it differs from the verified pane. All herdr calls keep their current form.

## Why

#117 showed a Claude Code process carrying the herdr env of an unrelated pane in another session, and pane ids repeat across running sessions today (`w1:p1` in two). The lifecycle fixed its own calls (herdr-session, delivered). The peer scripts still trust the inherited env, so a stale door could prompt, restart (`kill -TERM` of a process group) or `/clear` a same-id pane elsewhere.

## Done-criteria

1. With `HERDR_PANE_ID` naming a pane that herdr does not have, or one whose `shell_pid` is not an ancestor of the script, each of the five scripts exits non-zero before any herdr prompt, split, agent start, kill or reset. The refusal names `HERDR_PANE_ID`, `HERDR_SOCKET_PATH` and what herdr returned, and nothing is sent to any pane.
2. peer-restart, peer-create and door-reset exit non-zero with no herdr mutation when their A-pane argument differs from the verified `HERDR_PANE_ID`.
3. With a verified env, each script's existing scenarios behave as before. That includes peer-ask starting peer-wait, a standalone peer-wait rerun, and door-reset's detached child finishing its reset and start prompt after its parent exited, without the child re-checking.
4. Run from a real herdr pane shell on this machine, the check passes. Run with `HERDR_SOCKET_PATH` naming another running herdr session, the check refuses. Both results are recorded in `implementation/report.md` with the herdr version and the command.
