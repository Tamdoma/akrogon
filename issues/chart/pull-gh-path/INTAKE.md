# Intake: pull-gh-path

## Scope

`akrogon pull` (and other gh/tool spawns) under a stale inherited PATH. Destination: akrogon. Sibling chart herdr-session shares the root cause.

## Provenance

- Operator: 2026-10-29 door message (autopilot switch-on)
- Operator: 2026-10-24 door message

## Source: operator 2026-10-24

also, we need to fix the akrogon pull issue, find out why that failed and chart it as well.

## Source: operator 2026-10-29T07:29Z

Previous message (door, 2026-10-29) listed peer-session and pull-gh-path as the two open charts; the operator replied:

chart them out with the consultant slot b on autopilot. Systems thinking, less code is always better, function over form, simplicity, clarity and elegance. Go. Autopilot and send to watch-akrogon when you're done charting.

## Agent findings

- 2026-10-24 door run of `akrogon pull` exited with a raw Bun trace: `error: Executable not found in $PATH: "gh"` at src/shell.ts:39 via src/pull.ts:55 `pullRepo` and `retryCommand`.
- The door process PATH held `/home/ivan/.local/share/mise/installs/gh/latest/gh_2.102.1_linux_amd64/bin`. `latest -> ./2.103.0` since 2026-10-23 13:53, which has only `gh_2.103.0_linux_amd64`. The door's Claude Code parent started 2026-10-21 08:11.
- Processes started 2026-10-24 12:05 local also carry gh_2.102.1 in PATH, inherited from long-lived parents.
- A fresh `bash -i` resolves `gh_2.103.0_linux_amd64/bin` and `mise/shims`. `mise exec -- akrogon pull` succeeded.
- `src/land.ts` forwards the caller PATH into land units with `--setenv=PATH=`.
