# Intake: direct-mode

## Scope
One destination in akrogon: an opt-in, per-repo direct mode where, after full charting and gating, the chart door (A)
implements a single small item and the chart's B pane reviews it, with the door recommending direct or full lifecycle
at the end of charting.

## Provenance
- Operator: chart-issues session d6811aa5, 2026-10-08

## Source: operator 2026-10-08
Great, we also need to chart one thing. I was thinking about something like a non-handoff mode where all of the gating and all of the charting is done, but then after that what actually happens is that the consultant slots do the implementation. This would be done only for smaller issues that dont need the entire process. Is that doable? Consult with slot B and slot C, they're both active here in this tab. I need you to understand what I want. My intent is to have a mode that is not gonna be default mode, but that can be changed in the settings of the Aprogon Repo or whatever other repo is consuming. Aprogon system. So what happens is that this mode would enable the consultants to do the actual implementation themselves. This is for smaller issues that don't need multiple issues or multiple leaves, etc. The main charting session would also be able to advise at the end, just like it advises for debate. It could also advise on whether to use the full life cycle or whether to just do it immediately now. We would only have slot , which is who I'm talking to right now, and slot B involved as the reviewer. So slot A would be the implementer, and slot B would be the reviewer. Very similar to what's happening inside of the life cycle.

## Agent findings
- `hand_built: true` leaves cannot reach `merged`: `mergeQueue` excludes them (src/turn.ts:9-10), so `akrogon phase <slug> merged` is refused and nothing pushes; docs/guide/state.md:47-60 does not say so. (C) Candidate separate seed.
- Ordinary leaf merge dispatch allocates a fresh tab and new panes (src/next.ts:337-438).
- Repo config is strict (src/config.ts:38-60); a new key needs schema support.
- Earlier this session the door implemented a status-display change on main with no reviewer: the informal version of this mode.
- Full maps: slots/map-A.md, map-B.md, map-C.md, merged slots/map-merged.md, rebuttals slots/rebuttal-B.md, rebuttal-C.md.
