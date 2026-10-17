# Leaf review and intent loopholes, merged (A, B, C), 2026-10-17

Sources: slots/loopholes-A.md, slots/loopholes-B.md, slots/loopholes-C.md. Revision f7baddc. Drafts: /home/ivan/.claude/jobs/6a0d8d81/tmp/drafts/autopilot/. `S` = skills/chart-issues/SKILL.md.

## Needs the operator
- N1 Direct route under autopilot. S:89 has the door build, B review and the door push to main. The intake says autopilot is "only ... the charting phase itself" and "the watcher takes over and watches, not you". Direct inside autopilot also brings choices the recorded answers do not settle: repeated "one more round" after repair exhaustion against "never changes its own limits" (B I2), and abandon deleting a branch (C G6). Lifecycle only under autopilot removes both (A G1). B and C treat direct as available with B (B walkthrough, C G6) and flag its continuations.

## Corrections that follow from recorded answers (apply to drafts)
1. Fork shape and preflight accept an A answer under autopilot. shapes.md:93,95,287 need operator words in Taken and refuse a fork without one. The Autopilot rule is referenced there, approvals still operator-only (B L1).
2. The mode record holds the latest operator instruction: on, off, a changed list, "continue autopilot". A door reads the latest before continuing, and the same session continues only while that still says on (B L2).
3. The mode ends when every handed item reaches a final state: handed off, closed (delivered, duplicate or direct landing) or held. Pending main steps and waiting charts are listed in the footer (B L3, B I3).
4. A chart waiting on a need or approval keeps autopilot on across the pass end for the same session. The operator's next message in that door, such as a supplied key, resumes it under the same record (C L3; Switch Taken "supplying a key ... keeps it on").
5. Waits: approvals, missing needs, and human-only prerequisites (A G6, B walkthrough, C G3). A mutating proof waits for the operator's grant approval, and read-only proofs proceed (C G2).
6. Nothing new is acted on: destination seed matches, close offers for skipped identities, flaky tests and failed leaves outside the handed list are listed in the Autopilot section, not acted on. Closes for handed work recorded as delivered or duplicate run as today (A G3, C G4). B: seed matches fit the general delegation (B walkthrough). A and C: S:73 needs confirmation and Boundary says "pulls in nothing new".
7. Overlap means an exact match only: the same chart folder, the same GitHub identity or the same legacy path in another door's open chart intake, reusing the S:33 dedupe rule (C L2). This is detection, not a lock. The operator's disjoint assignments at switch-on are the guard (B I4).
8. Consultant skip: only a seat in another door's open chart (no end marker, latest A seat on a different pane). The door's own waiting charts never trigger it (C L1, B I4 latest A seat).
9. The Autopilot section names the operator's universals itself (simplicity, function over form, removing over adding, systems thinking, speed, price), so the skill does not depend on a harness file (C L4).
10. Peer outcomes with no operator present: `failure`, `blocked` and a refused prompt drop the peer (Picking 1a). An A invocation mistake is fixed without dropping anyone (B I1). `budget` with `signal: unproven`: B wants it dropped as unverified with an operator decision; C wants reruns until done, failure or blocked; A wants one rerun, then a drop. Picked below.
11. Main steps and lesson writes run as today for handed work and are named in the Autopilot section (B walkthrough, C G5). A main step or lesson that changes autopilot's own rules waits (Boundary "only the operator changes them") (C G5).
12. A stop the operator types into a consultant's pane counts as off from the next decision point. Returns carry operator words verbatim (C G7).
13. Autopilot requires herdr. Outside herdr the first reply says it cannot start (C G8).
14. Mid-chart switch-on: answers already given stay the operator's, and only later points are A's (A G8).
15. "Limits" means the handed list, the consultants and the wait rules. There is no spend or time cap (A G7).
16. any-consultants keeps the existing "only when A's pane fills its tab" qualification (B L4). C L5: smaller panes for later peers is a layout cost, already in the plan note.

## A's pick on item 10
One more full wait, then the peer is dropped as unverified, and any later file from it is not used. Reason: C's unlimited reruns can stall the door forever, which is the failure Picking 1a exists to avoid. B's immediate drop loses a slow but healthy peer after one budget. One rerun matches today's rule ("every other budget is rerun at once"), minus the report. It follows from Picking 1a ("keeps going ... stops using that consultant"), so no new operator question.
