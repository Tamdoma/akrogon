# Brief: check-path-entry

## What

`constructedEnv` in src/run-check.ts drops every PATH entry that is the seat tool-entry folder (`<homePath()>/tool-entry`, matched by resolved path and by realpath) from the PATH it copies into a checked run. The match is one helper exported from src/tool-cgroup.ts, extracted from `realBash`'s existing entry-dir filter, which `realBash` then uses too. No other env name changes.

## Why

Tamdoma/akrogon#164. agy seats put the tool-entry folder first on PATH (src/seat.ts `startSeat`). Every other seat wiring (CLAUDE_CODE_SHELL, BASH_ENV, AKROGON_SEAT_CGROUP, AKROGON_SEAT_PID) is already left out of checked runs by the `copied` allow list, but PATH is copied as is. So from an agy seat, tests/tool-entry.test.ts's unwired run `r` goes through the host wrapper and fails, blocking every agy-seated leaf on akrogon (charting-guide failed on it).

## Done-criteria

1. A test in tests/run-check.test.ts runs `akrogon run-check` with `<AKROGON_HOME>/tool-entry` first on the caller's PATH and a check that prints `$PATH`; the printed PATH holds no tool-entry entry and keeps the other entries in order. It fails on base and passes with the change.
2. `realBash` and `constructedEnv` use the same helper; no second matcher exists.
3. From the worktree, `PATH="$HOME/.akrogon/tool-entry:$PATH" bun src/akrogon.ts run-check test` passes tests/tool-entry.test.ts (red on base).
4. The destination's `checks` pass.
