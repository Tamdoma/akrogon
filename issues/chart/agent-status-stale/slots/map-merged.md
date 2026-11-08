# Merged map: agent-status-stale

Sources: slots/map-A.md, map-B.md, map-C.md.

## Cause

- The door session became a Claude Code background job at 2026-11-03T19:56:41Z: `hc get t15` `status_ms` equals the job's `createdAt` (19:56:41.307Z, B) and the REPL's exit wrote a status clear hc kept as `null` (C). (A,B,C)
- Mechanism (C, from the installed claude 2.1.318 binary): program status is settled off for a worker with `CLAUDE_CODE_SESSION_KIND=bg` ("bg worker"), and the worker runs on a pty the bg-pty-host owns, not hc's; the foreground claude is only a viewer and does not re-emit OSC 7501. Trigger: `CLAUDE_BG_SOURCE=slash` (`/background` or `/bg`). Whether it was typed on purpose is unknowable from files. (C; B: exact failing layer unproven by its own checks)
- Correction (C): `CLAUDE_CODE_CHILD_SESSION` and `CLAUDE_CODE_SESSION_ATTENDED` are not in the worker's env; the gate is `CLAUDE_CODE_SESSION_KIND=bg`.
- Family: 16 background jobs since 2026-09-30, all silent to hc; closing the viewer makes the agent vanish from the sidebar. (C)
- Display: `tree.js` `topLevel` synthesizes a silent parent row with `status: null`; `main.js` ranks family by max, null ranks 0, so the family falls into Idle once sub-agents finish; the folded header's most-urgent ignores sub-agents; the duration counts from the clear. (A,B,C)

## Forks and positions

1. Where the fix lives.
   - Upstream Claude Code (emit or relay status from background jobs): the root fix, not ours to ship; an operator feedback step. (A,B,C)
   - herdr-core external status setter: rejected (breaks hc's one status source; not a registered repo). (B,C)
   - herdr-setup `agents-by-tab`, honest silence: a silent parent shows "no status", not Idle; folded header counts sub-agents. (A,B,C)
   - Mod reads `~/.claude/jobs/*/state.json`: rejected (private format, name/cwd join collides). (A,B,C)
   - Door rule "never background the door": B (only if a supported launch mode exists), C (rule text plus recovery line), A (no rule; operator choice). Recovery hint from the binary: "/stop, then claude --resume". (C)
   - Hook writing OSC to hc's pty: rejected. (C)
2. What a silent parent shows: its own "no status" marker and no duration, and not Idle by its own null. (A,B,C)
3. Plain shells stay unmarked; the vanished-viewer face has no signal and stays out. (A,C)

## Pitfalls

- No status inferred from screen text, PIDs or age. (A,B,C)
- Keep the structural ancestry tests (`tests/agents-by-tab.test.js`). (B)
- Unknown must not look like working. (A)
- Proof of display is not proof of transport. (B)

## Split

- herdr-setup leaf: agents-by-tab honest silent parent. (A,B,C)
- Operator step: report to Claude Code upstream with C's evidence. (A,B,C)
- akrogon step on main: one line in issues/chart/herdr-app/INTAKE.md for the port. (A,C)
