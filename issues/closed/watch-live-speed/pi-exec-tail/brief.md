# Brief: pi-exec-tail

## What

`skills/watch-issues/scripts/log-tail.ts` reads pi `exec` tool calls by the tool calls inside their code (`tools.bash(`, `tools.edit(`, `tools.read(`, `tools.write(`, `tools.ls(`), so each pi exec line shows its command or path target and its outcome, and the watch's loop rules work on pi seats.

## Why

pi runs its tools through `exec` code, while log-tail scans that code for codex's `exec_command(`/`write_stdin(` calls. Every pi exec prints `exec #- -> unknown` (134 `tools.bash(` calls in one worker transcript), so the watcher could not see the watch-timer worker's 1h40m of work.

## Done-criteria

1. For a pi `exec` call with a result, log-tail takes each inner call's name, input and status, and a bash call's exit code, from the result's `details.traces`, and prints a bash command as the target with the same `#<hash>` as an identical command. For an exec still running, it scans the code; a command that is not a literal then prints `#-`.
2. For `tools.edit`, `tools.read`, `tools.write` and `tools.ls` with a literal path, log-tail prints the path as the target, and an edit's old and new text give `old#`/`new#` as for pi's native `edit` call.
3. An exec whose code holds several tool calls prints one line per inner call, in order. A call with no trace (the exec failed before it ran, such as a syntax error) prints `unknown` and never counts as a repeated command or edit. Codex exec output keeps today's lines.
