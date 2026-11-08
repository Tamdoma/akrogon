# Chart: agent-status-stale

## Destination

The herdr-app Agents list shows a parent that reports no status as "no status", never as idle (herdr-setup `mods/agents-by-tab`); the root cause (a Claude Code background job sends no status) is reported upstream by the operator and recorded for the herdr-app port.

Route: lifecycle

## Forks taken

- [signposts](forks/signposts.md): copy; original in round-drawings (session signposts; this chart full autopilot).
- [silent-parent](forks/silent-parent.md): A's picks under full autopilot: mod shows "no status" with its own section; upstream report as an operator step; herdr-app intake line on akrogon main; no rule against /bg.

## Open forks

none

## Fog

none

## Off route

- herdr-core status setter, a mod reading `~/.claude/jobs`, a hook writing OSC to hc's pty: second status sources (forks/silent-parent.md).
- The viewer-closed case (no row at all): no signal to show.

## Pending steps

none

## Mode record

- mode 2026-11-04T12:01:22Z t15 acb047ee-5b0d-44f9-91d9-101e77575049: changed list: operator added agent-status-stale with "(autopilot, autopilot signposts)": full autopilot for this chart, A answers its direction where the session's signposts are silent; handed list now proof-limits-handoff, grant-run-count, round-drawings, signposts-docs, agent-status-stale; consultants ak-slot-b, ak-slot-c.

- handover 2026-11-04T12:32:07Z same-session: handed agent-status-stale (proof-limits-handoff, grant-run-count, round-drawings, signposts-docs handed off); consultants ak-slot-b, ak-slot-c (restart before the first exchange); signposts issues/chart/round-drawings/forks/signposts.md; instructions: as in proof-limits-handoff's handover entry; this chart full autopilot ("autopilot, autopilot signposts", operator 2026-11-04). Same session.
- continue autopilot (handover 2026-11-04T12:32:07Z).

- mode 2026-11-04T12:45:00Z t15 acb047ee-5b0d-44f9-91d9-101e77575049: off: every handed chart is handed off; autopilot ends.

## Autopilot

- switch-on: INTAKE.md "Source: operator t15 2026-11-04"
- consultant: ak-slot-b (B, codex), ak-slot-c (C, claude Fable 5.1 high)
- signposts: operator for the session (original in issues/chart/round-drawings/forks/signposts.md); A for this chart where they are silent, per the operator's "autopilot signposts"
- route: lifecycle
- main step: issues/chart/herdr-app/INTAKE.md gained "Found 2026-11-04: a backgrounded door reports no status" (verified by reading the file tail).
- recorded only: operator step, not a leaf: report to Claude Code that a background job (`/bg`, `CLAUDE_CODE_SESSION_KIND=bg`) sends no OSC 7501 program status and its viewer does not relay it; evidence slots/map-C.md section 1.
- split (A): one herdr-setup issue `agents-silent` with one leaf `silent-parent-status`. Sources: none (operator note).
- handoff review (A's answer): route lifecycle (direct refused: autopilot). Grants none; needs none (presence check `[]`); proofs: one read-only observation (theme colour `unknown`); seats: no slots block; live runs: none. Key-part line: theme colour `unknown` exists, reached by readiness `proofs[0]`; nothing cut. Preflight exit 0 at herdr-setup; destination pull ok (no seeds). Usage: chart agent-status-stale - operator wait 0.0 min, operator turns 1; A=0, B=unmeasured, C=unmeasured output, outcome partial.
- leaf writing: one combined rebuttal and leaf review (slots/review-B.md, review-C.md) adopted; transferred 2026-11-04T12:45:00Z to /home/ivan/Work/infra/herdr-setup/issues/open/agents-silent; `akrogon status` valid there.
- handed off: herdr-setup agents-silent/silent-parent-status (plan.synthesis), waits for the operator's watcher.
- off 2026-11-04T12:45:00Z: every handed chart is handed off (proof-limits-handoff, grant-run-count, round-drawings, signposts-docs, agent-status-stale); autopilot ends.

Handed off 2026-11-04
