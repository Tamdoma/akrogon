# Rebuttal C: test-time-and-temp

Withdrawn: my Q2 option (per-test comparison where base-red tests do not block). It reopens `issues/chart/leaf-run-stalls/forks/red-criterion.md` Q2 2a ("never handed off as pre-existing") and Q1's foreclosed 1b (base probe at handoff), which `implement-issue/SKILL.md:34` already enforces. B's lock point stands. A,B's "red on base: fail to the operator with both logs" fits that lock.

## D1. leaf-temp export: `TMPDIR` only, no `TMP`/`TEMP`, no explicit worker carry (against B)

- `TMPDIR` is the first variable that Node `os.tmpdir()` (`TMPDIR`, then `TMP`, then `TEMP`) and Python `tempfile` check. `mktemp`, Bun and Chromium read `TMPDIR`. Setting `TMP`/`TEMP` changes nothing for a tool that already reads `TMPDIR`.
- The operator's environment sets none of `TMPDIR`, `TMP` or `TEMP` (`env`, 2026-10-01). No inherited `TMP=/tmp` can override it.
- Workers already inherit it. pi worker shells spawn with `env: { ...(env ?? process.env), ... }` (`~/.pi/agent/extensions/tamdoma-subagents/worker-shell.ts:184-186`). Claude Code follows `TMPDIR` (F7, A probe). An explicit carry in skill prose would be a second copy of what the process env already guarantees.
- Gap: Codex 0.159.2 is still not probed (F7). The test is one seat run that prints `os.tmpdir()` from a worker. If that run fails, carry the variable then, for Codex only.
