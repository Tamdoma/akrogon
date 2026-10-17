# Watcher seam, notes A (before reading B and C)

## Q1 Who starts the leaves
Pick: the door runs no `akrogon next`, as today (SKILL.md:85). The watcher's next tick finds the fresh leaf Waiting and runs `akrogon next <slug>` (skills/watch-issues/SKILL.md Judge, Waiting). The door's handoff footer names the handed leaves and says they start on the watcher's tick or the operator's `akrogon next`. Reason: operator "once you hand off everything in autopilot mode the watcher takes over and watches, not you"; no change to two skills' contracts. Cost: up to one tick (20 min) delay per leaf.
Rejected: door runs per-repo `next` (C map D7): adds an autopilot-only exception to SKILL.md:85 and splits who starts work between door and watcher. The keep-running lock (nothing depends on the watch) still holds: without a watcher the leaves simply wait, visible in `akrogon status`, and nothing breaks.
## Q2 Start right away or wait for review
Pick: start right away; the lifecycle's own review and merge checks are the gate. Reason: the operator's purpose is boring incoming work done while he is away; waiting for morning review removes the night. Cost: an A pick the operator would have rejected can be merged (and for akrogon, deployed, docs/guide/install.md:39) before he reads the morning record; corrections become new intake.
Rejected: leaves wait for review during a trial period (C, medin-rebuttal-C 4): belongs to Morning record's trial question, where it can be one attended trial instead of a standing wait.
## Evidence
operator · INTAKE.md scope correction 2026-10-16; better-than-training · SKILL.md:85, watch-issues SKILL.md Judge, docs/guide/install.md:39; history · keep-running lock issues/chart/night-flow/forks/keep-running.md:31-34.
## Pitfalls
Watcher not running: leaves wait, shown by status; footer says so. Bad pick merged: lifecycle review, morning record lists picks per leaf so a reversal is quick.
END watcher-seam-A
