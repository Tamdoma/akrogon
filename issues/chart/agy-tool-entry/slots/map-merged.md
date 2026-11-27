# Merged map: #164 (A)

- Cause: agy seats put `<home>/tool-entry` first on PATH (src/seat.ts startSeat `agyPath`). constructedEnv (src/run-check.ts) already drops every other seat wiring (CLAUDE_CODE_SHELL, BASH_ENV, AKROGON_SEAT_CGROUP, AKROGON_SEAT_PID) but copies PATH. (A,B,C) Reproduced by prefixing PATH: red at `r`, green without. (B)
- Every checked command's env comes from constructedEnv: run-check, verify-pass via checkedRun, land via verify(), setup in next.ts. (A,B,C)
- Pick (c): one helper in src/tool-cgroup.ts, extracted from realBash's entry-dir match, used by constructedEnv to drop entry-dir PATH entries. (A,B,C)
- Scope disagreement: C also strips in launchPass (verify.ts) and launchLand (land.ts). A and B: not needed, their checks still pass through constructedEnv; only the akrogon process itself keeps the PATH, and the wrapper is inert there. A keeps constructedEnv only.
- Match homePath() only (the dir the seat used). C adds `~/.akrogon` when AKROGON_HOME is overridden. A: the seat and the check share one AKROGON_HOME, so homePath() is the same dir; a second literal adds a path nobody wires.
- Proof: a tests/run-check.test.ts case with `<f.home>/tool-entry` first on the CLI PATH and a check printing $PATH; red before, green after. (A,B,C) Plus end-to-end: `PATH="$HOME/.akrogon/tool-entry:$PATH" akrogon run-check test` green. (B)
- Off route, seed separately: direct `bun test` from a seat shell with the entry dir or BASH_ENV (B F6), and realBash baking the host wrapper into scratch homes (B F5, C). (B,C) A: seed both as one report.
