# Intake: busy-seat-notice

## Scope
Destination akrogon. A seat busy a long time in one phase reaches the operator once, even when no `akrogon next` runs for that leaf (#78).

## Provenance
- GitHub: Tamdoma/akrogon#78
- Operator: 2026-10-10 chart-issues args

## Source: operator 2026-10-10
3 new issues about the systemic problem we had encountered today. Let's chart it out and fix it. Use slot B consultant (active right now).

## Source: Tamdoma/akrogon#78
# Busy-seat duration is still only noticed in 'next': formspark-build-wiring ran 4h with notified= empty and no operator notice

Source: Tamdoma/akrogon#78
URL: https://github.com/Tamdoma/akrogon/issues/78

Unverified intake.

## Observation
Consumer `Tamdoma/tamdoma-framework`, 2026-10-10. Leaf `formspark-build-wiring` had seat A busy in `check.fix` for 3h09m to 3h12m at the time of the user's complaint, and kept iterating on a 13-case live-session proof harness (12+ `proof:` commits since 12:51 local, each rerun about 10 min). Every observe line for it showed `notified=` empty. `akrogon next` was not run for this leaf, because it was blocked on a merged sibling and the watch ran no `next` for it. The seat had been busy since 07:36 UTC session start. The user noticed it by eye. No operator notice came from akrogon.

## Location
`src/next.ts` (`STALL_MS` = 60 minutes, `observeBusy`), observe field `notified=`, and the `check.fix` phase of the `implement-issue`/`check-issue` skills.

## Reproduction
1. A leaf stays in a phase with its seat working, and `akrogon next` is not invoked for that leaf.
2. Check `notified=` after 60 minutes busy.
Seen once in this session (4+ hours). Frequency otherwise not provided.

## Expected behavior
A seat busy past a set time in one phase triggers an operator notice once, whether or not `next` ran for that leaf, and the notice names the leaf, phase and elapsed time.

## Urgency
Medium-high. The leaf cost more than 4 hours of wall time and the operator found it by looking. Workaround: run `akrogon next <slug>` often, or a watch that flags elapsed time (not built into the watch skill today).

## Suspected cause
Agent view, same mechanism as the closed #51. The stall notice is only evaluated on the `next` path, so a leaf `next` skips (blocked, or an operator watch that avoids `next` for busy leaves) never notifies. Note the notice is a stall check (60 min), not a per-phase duration against a charted estimate. #75 (closed, merged `975139d`) only added a charting-time estimate line.
Files read: observe output for the leaf, `log-tail.ts` lines, #51 and #75 bodies and comments. Not read: `src/next.ts` itself in this pass.
Related: Tamdoma/akrogon#51 (no duration ceiling, closed 2026-10-01), #75 (closed), Tamdoma/tamdoma-framework#116 (stall notice only in `next`, referenced from #51, not opened).

## Agent findings
See ../red-base-wait/slots/map-merged.md (M1, M5, M6) and the fork files.
