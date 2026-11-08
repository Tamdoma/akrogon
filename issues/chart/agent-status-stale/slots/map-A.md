# Map A: agent-status-stale, written before reading B and C

## Cause (inspected 2026-11-04)

- `hc get t15 --json`: foreground claude pid 2943990 (started about 28 h ago), `status: null`, `status_ms` 2026-11-03T19:56:41Z.
- `~/.claude/jobs/acb047ee/recap.trigger` created 19:56:45Z; `state.json` `"template": "bg"`, `"state": "working"`; this session's env `CLAUDE_CODE_CHILD_SESSION=1`, `CLAUDE_CODE_SESSION_ATTENDED=0`. The door session was turned into a Claude Code background job 4 s after the last status; the job's state lives in `state.json` and no OSC 7501 reaches hc from t15 since.
- Other Claude terminals report `{app: claude-code, state}`; the consultants are normal sessions and report.
- herdr-setup `mods/agents-by-tab/tree.js` `topLevel`: an ancestor reporting no status gets a row with `status: null`; `main.js` ranks it 0 and the row falls in "Idle" once its sub-agents finish (a parent takes its most urgent sub-agent's place). So the mod shows "no status" as idle.

## Forks

F1. Where the fix lives.
- a (recommended) Two parts. (1) herdr-setup `agents-by-tab`: a row whose terminal runs an agent program but reports no status shows as unknown (the theme has an `unknown` colour), not idle, so a silent agent never reads as idle. Honest and small. (2) An operator step: report the missing status from Claude Code background jobs upstream (Claude Code feedback), since the fix to reporting belongs to the program that runs the job.
- b The mod reads `~/.claude/jobs/*/state.json` and maps it to the terminal. Shows the real state, but couples a herdr-app mod to Claude Code's private job files (no documented format), and mapping a job to a terminal needs the host pid or session id; breaks on a Claude Code update.
- c The door avoids background jobs (start the door as a normal session). An operator workflow choice; the akrogon skill cannot control how the session was started.
- d akrogon or the door reports A's status itself. No hc command sets another program's status (`hc --skill` "Status": status comes from the program's OSC 7501), and 1c prefers written rules. Rejected.

F2. Does akrogon change at all?
- a (recommended) No code. Optionally one line in the herdr-app intake (issues/chart/herdr-app/INTAKE.md) that a backgrounded Claude door reports no status, for the port. That is a step on main (issues/), not a leaf.

## Pitfalls

- Unknown vs idle colour: unknown must not look like working either; a distinct ring or "?".
- A plain shell pane with no agent also has no status: the unknown mark applies only when the terminal's program is a known agent (`program`/`app`), so plain shells stay unmarked.
- herdr-setup checks: `herdr-app check` per mod plus `bun test` (tests/agents-by-tab.test.js exists).

## Split

One herdr-setup leaf (agents-by-tab unknown status), one operator step (upstream report), one akrogon step on main (intake line).
