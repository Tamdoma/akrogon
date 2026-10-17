# Loopholes

## Question
Q1 In autopilot, may the door take the direct route, building and landing a small fix itself? Q2 A consultant goes idle or done with no return file and `signal: unproven` at the end of a wait budget. What does an autopilot door do? Q3 A handed job leaves a step on main that can only follow its merge. Is the job handed off with that step waiting for the operator?

### Carries
- Operator handoff review answer 2026-10-17 (INTAKE.md): "Try to find the loopholes in the plan where the intent is not completely discussed. I need you to come to the same conclusion as I do."
- All earlier forks Taken. Draft leaves at review: autopilot-mode, any-consultants.

## Findings
Notes slots/loopholes-A.md, -B.md, -C.md; merged slots/loopholes-merged.md; rebuttals slots/loopholes-rebuttal-B.md, -C.md.
- operator · INTAKE.md scope corrections · "I'm only talking about the charting phase itself"; "the watcher takes over and watches, not you" (A).
- better-than-training · skills/chart-issues/SKILL.md at f7baddc :89 direct has the door build and push; :119 one more round after repair exhaustion is an operator choice; :121-124 abandon removes the branch (B I2, C G6). assets/questions.md:46 `budget` with `signal: unproven` is reported to the operator before any rerun (A, B I1, C G1). SKILL.md:85 and shapes.md Pending steps: a step waiting on a merge (B I3).
- operator · INTAKE.md history · the 2026-10-16 direct host migration took 4 repair rounds (A).
- Differences: B and C read the approved drafts as allowing direct with B and saw lifecycle-only as a change (B F1, C 4). On Q2, B wanted the operator to decide, C wanted reruns until a clear outcome, and A wanted one more wait and then a drop (B F2, C 1).
- Corrections that follow from recorded answers, applied to the drafts without a question: slots/loopholes-merged.md items 1-9, 11, 13-16, with rebuttal fixes: terminal markers named for the mode end (C 2); `fix_rounds` and push caps count as limits (C 3); overlap held on exact match or when A sees the same outcome open in another door, simultaneous start stated as a limit (B F3); a full seed match for handed work is A's to confirm, other seeds and close offers are recorded only (B F5); stop counts only in the door's own pane, which replaces merged item 12 (B F6).

## Taken
- 2026-10-17 operator "1a" (INTAKE.md "loopholes answer"): no direct route under autopilot. Every handed chart goes the lifecycle route to builders and the operator's watcher. Reason: autopilot is charting only. Removes the direct continuations (extra repair rounds, abandon) from autopilot. Foreclosed: 1b direct with no extra rounds or deletion.
- 2026-10-17 operator "2a" (INTAKE.md "loopholes follow-up answer"): after a `budget` outcome with status idle or done and `signal: unproven`, the door waits one more full budget, then drops that consultant for the session like a lost consultant. A return file arriving later is ignored and recorded as ignored. Ordinary working-status budgets are still rerun at once. Cost accepted: a slow but healthy consultant can be dropped. Foreclosed: 2b wait until a clear outcome.
- 2026-10-17 operator "3a": a handed job whose step on main waits on its merge is handed off. The step is a Pending steps entry, and the Autopilot record and the pass-end line say "after <leaf> lands, open a chart door to finish <step>", as in attended mode. Foreclosed: 3b hold the whole job.
