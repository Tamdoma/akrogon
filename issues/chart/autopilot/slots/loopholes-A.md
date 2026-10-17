# Loopholes and leaf review, notes A (written before reading B and C)

Revision f7baddc. Drafts: /home/ivan/.claude/jobs/6a0d8d81/tmp/drafts/autopilot/. `S` = skills/chart-issues/SKILL.md, `Q` = assets/questions.md.

## Intent gaps (where the operator's words do not yet decide the behavior)
G1 Direct route under autopilot. The operator said autopilot is "only ... the charting phase itself" and "the watcher takes over and watches, not you". The direct route (S:89) has the door write the code, B review it and the door push to main itself. K2 ("A alone has no direct route") implies that with B present, autopilot may choose direct. That means the door implements, which goes beyond charting, and bug fixes are exactly direct-sized. Not asked plainly. My pick: under autopilot the route is always lifecycle, so building goes to the watcher. Needs the operator.
G2 Turn endings. S and Q end A's turn to report to the operator at: peer-ask `failure`/`blocked`/non-zero exit (Q:46), `budget` with `signal: unproven` "reported to the operator before any rerun" (Q:46), herdr prompt errors. Under autopilot nobody answers, so the door stalls. The leaf must state the autopilot replacement at each point: drop the consultant (Picking 1a) for failure, blocked or refused; for `budget` unproven, rerun once and then drop it. The last part is my mechanism pick and is not covered by an answer.
G3 Outward actions at open. S:35 offers `akrogon close` for skipped identities still open. That is an outward GitHub change outside the handed work. S:73 destination seed matches "act only on operator confirmation". S:31 failed leaves and flaky tests "as intake candidates the operator can confirm". Under "pulls in nothing new" these become record lines only, not actions. The brief says "imports nothing new" but does not name these three points. Fix in the brief, follows from Boundary 1a.
G4 Commits. Handoff writes `issues/open/` in the registered root. Today the operator asks for the commit. Does dispatch need the chart and leaf files committed? If yes, autopilot must commit, and possibly push. Must check akrogon next / watch-issues before deciding. Lessons (S:31) are "left for the operator to commit" (skills/lesson-rule.md:7), which is fine to keep.
G5 Steps on main. S Handoff: "The door makes and verifies a needed step on main during the pass." Under autopilot this is an unreviewed direct edit to main (config, a doc). Same class as G1. My pick: allowed only for issues/ records; any other main step is a Pending step recorded for the operator. Needs the operator, or fold into G1.
G6 Human-only prerequisite (S:59) is missing from the brief's wait list (criterion 3 names approvals and needs only). Follows from Boundary; fix in the brief.
G7 "Limits" in "never changes its own switch or limits" is undefined. My reading: the handed list, the consultants and the wait rules. No spend or time cap was asked for (C raised a cap in Boundary, and it was not taken). Fix the wording; no question.
G8 Mode line and seats.yaml for a chart opened before switch-on (mid-chart switch-on): earlier operator answers stay operator's; only later points are A's. Brief silent. Fix in the brief.

## Leaf review (implementer view)
- autopilot-mode criterion 4 "overlapping hand-outs held": detection left Open for the plan. Acceptable.
- autopilot-mode has 9 criteria in one section; acceptable, one outcome.
- any-consultants criterion 2 lists the seat record, but S:37 already says "each named peer". Fine as a check.
END loopholes-A
