# Intake: direct-visible

## Scope

Direct-route chart work is tracked, shown and broadcast like a lifecycle leaf, per the operator decision. Destination repo: akrogon.

## Provenance

- GitHub: Tamdoma/akrogon#153
- Operator: door session 2026-11-24 (handed list of five seeds)

## Source: Tamdoma/akrogon#153

# A chart-issues direct-route chart is not visible as a lifecycle leaf: akrogon status shows one 'charting' chart row with no phase, seats or runs

Source: Tamdoma/akrogon#153
URL: https://github.com/Tamdoma/akrogon/issues/153

Origin repo: Tamdoma/akrogon

Unverified intake.

## Operator decision (Ivan Juras, 2026-11-23)

- Direct-route work is tracked like a lifecycle leaf, run in the charting door's current tab (not a new tab) by the current charting slot A, with whichever slot is the reviewer.
- `akrogon status` shows it exactly like a lifecycle leaf: its phase (build, review, repair, merge), its seats and its runs.
- It broadcasts on landing like a lifecycle leaf.

## Observation

During a full-autopilot chart-issues session on 2026-11-23, five charts were built on the direct route (A implements in a worktree, slot D reviews). The operator could not follow the work in `akrogon status`: each chart appears only as one row in the chart table with stage `charting`, with no phase, seat, review round or run shown. The operator also believes direct landings are not broadcasting.

## Location

`akrogon status` chart table (`src/status.ts:379`, `chartFolders` at `:405`); chart-issues direct route (`skills/chart-issues/assets/direct-route.md`).

## Reproduction

1. Run a chart through the chart-issues direct route (attempt start, implement, B review, repair rounds, landing).
2. Run `akrogon status` during any step.
3. Only the chart row with stage `charting` is shown.

Always.

## Expected behavior

Per the operator decision above.

## Urgency

The operator cannot see what a direct-route session is doing without asking the door. Workaround: ask slot A for status in chat.

## Suspected cause

- Supported hypothesis: the direct route by design writes no leaf files (`docs/use/quick-fix.md:9`: "skips the leaf handoff and `akrogon next`. No leaf files are written"), and `akrogon status` builds its leaf rows from leaves, while charts get only the `CHART, TAKEN, FOG, STAGE, AGE` row (`src/status.ts:379`). Its progress lives only in `<chart>/direct/` and `CHART.md`'s `Direct attempt` section, which status does not read.
- Broadcast: contradicted in part. `skills/chart-issues/assets/direct-route.md` step 7 sends broadcast-issue on landing when the repo configures broadcast, and A sent one for Tamdoma/akrogon#148 when 814a2387 landed. Whether that message reached the Discord channels is not confirmed.
- Whose view: reporter (visibility, broadcast doubt), agent (cause, broadcast step).
- Files read: `src/status.ts:370-420`, `skills/chart-issues/assets/direct-route.md`, `docs/use/quick-fix.md`.
- Not inspected: the Discord channels for the #148 broadcast; the discord-send exit status of that send.
- Related reports: none found. Searched Tamdoma/akrogon, own reports since 2026-11-21 (all states, limit 30) and "direct route status" (all states, limit 8); Tamdoma/akrogon#132 matched keywords only (merged leaf tab cleanup, different defect).

## Source: operator door message 2026-11-24

5 issues pulled. We need to chart them out. Use the following consultants: slot b: pi swe-2-1-max, slot c: agy neon high, slot d: pi muse wonder full 1.0. Full autopilot mode. Don't ask me anything. Think from the systems perspective: simplicity, clarity elegance.

## Agent findings

Imported at door open 2026-11-24T22:57:50Z (pull time). No identity match in open/closed leaf sources or chart intakes. Territory map findings are added after the shared opening map (issues/chart/seat-turn-idle/slots/map-merged.md).

Findings from the shared opening map and fork direct-leaf (2026-11-25, A,B,C,D; code read on akrogon main 085f2f88):

- A direct attempt writes no `state.yaml`, so `akrogon status` shows only the chart row (`chartRow` in src/status.ts), runs record slug `checkout`, and the landing broadcast is the door's own prose step with no pending signal.
- The direct route lands through its own prose steps (direct-route.md steps 5 to 9 and scripts/direct-guards.ts) beside the command's merge queue; the guards' five checks already exist as land and move gates.
- `broadcastPending`, `broadcastInProgress` and the broadcast prompt are all keyed on slot B.
- seat-turn-idle's shell-sweep leaf (in `check.fix`) ends leftover shells of every recorded seat at phase advance; a leaf that records the door and reviewer as seats must be kept out of it.
