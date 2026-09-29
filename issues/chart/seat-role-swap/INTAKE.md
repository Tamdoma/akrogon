# Intake: seat-role-swap

## Scope
Leaf lifecycle seats in the akrogon command and its phase skills. Destination: the seat doing synthesis, implementation and repair sits in the left pane of a leaf tab.

## Provenance
- Operator: chart-issues door, 2026-09-29

## Source: operator 2026-09-29
I want to swap slot A and slot B in the life cycle. The intent is that slot B is the one that works most of the time because there are usually no debates and slot A only comes later into play. Just for the sake of my own let's say sanity, so it's in the left pane. verything should start in the left pane. Everything else is the same. I just want to swap the roles. Do you understand me? Use slot B (codex, open the pane, use the default).

## Agent findings
- Today B owns plan.synthesis, implement and check.fix. A owns re-review after a fix and merge. Both run plan positions, rebuttals and initial review (src/routing.ts:26-39).
- A gets the tab's first pane (left), B is split to the right (src/next.ts:321-342).
- Installed `akrogon` is a symlink into this checkout's src, so a change goes live when local main moves.
- Framework leaf update-replay is in implement with B working (framework issues/open/satellite-update-loop/update-replay/state.yaml).
- Full maps: slots/map-A.md, slots/map-B.md, merged in slots/map-merged.md.
