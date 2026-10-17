# Watcher seam

## Question
Q1 After an autopilot handoff, does the door run `akrogon next` for its leaves, or leave starting them to the watcher's next tick? Q2 Do autopilot-handed leaves start right away, or wait for the operator's review (akrogon has no staging; leaves merge to main before the morning record is read)?

### Carries
- Intake: "once you hand off everything in autopilot mode the watcher takes over and watches, not you"; the watcher tab is opened and run by the operator.
- skills/chart-issues/SKILL.md Handoff: the handoff runs no `akrogon next`.
- skills/watch-issues/SKILL.md Judge, Waiting: a leaf with idle or absent seats gets `akrogon next <slug>`.
- issues/chart/night-flow/forks/keep-running.md Taken: nothing depends on the watch (2026-10-11).
- Opening map: slots/map-merged.md fork 4.
- Fog moved here: no staging (slots/medin-merged.md idea 5, slots/medin-rebuttal-C.md 4; docs/guide/install.md:39 merge to akrogon main deploys a release).
- Boundary, Picking, Switch Taken.

## Findings
Notes slots/watcher-seam-A.md, -B.md, -C.md; merged slots/watcher-seam-merged.md; rebuttals slots/watcher-seam-rebuttal-B.md, -C.md.
- operator · INTAKE.md scope correction · "once you hand off everything in autopilot mode the watcher takes over and watches, not you" (A,B,C).
- better-than-training · chart-issues SKILL.md:85 no dispatch at handoff; watch-issues SKILL.md:8,16,38 tick re-reads issues/open and runs next for Waiting leaves; docs/guide/install.md:39 akrogon merge deploys; night-flow keep-running.md:31 nothing depends on the watch (A,B,C).

## Taken
- 2026-10-16 agreed by A, B and C, shown to the operator without a question: the door runs no `akrogon next`; handed-off leaves are eligible for existing dispatch and the operator's watcher normally picks them up; no review wait, the lifecycle's checks are the gate; stated cost: a wrong pick can merge to main, and for akrogon deploy, before the morning record is read. The handoff footer says "handed off", not "started", and names a pause when status shows one. At switch-on the first reply says handed-off work waits for the operator's watcher and that the door cannot check whether it runs. No change to either skill at this seam beyond that line.
- 2026-10-16 operator "1a" (INTAKE.md "Watcher seam answer"): a failed autopilot leaf that the operator hands to an autopilot door is charted like any other handed work.
