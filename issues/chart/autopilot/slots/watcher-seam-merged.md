# Watcher seam, merged (A, B, C), 2026-10-16
Sources: slots/watcher-seam-A.md, -B.md, -C.md.

## Q1 Who starts the leaves (agreed)
- The door runs no `akrogon next`, as today (SKILL.md:85); the operator's watcher starts Waiting leaves on its tick (watch-issues SKILL.md:8,38) (A,B,C). No skill text change at this seam (C). Other existing triggers (the operator's own `akrogon next`) stay valid (B).
- The footer says "handed off", not "started", and names leaves waiting for dispatch (A,B,C); it names a pause when `akrogon status` shows one (C).
- At switch-on, while the operator is present, the first reply says handoffs wait for the watcher, and says so when no watcher tab is visible for a destination repo. It records the operator's word and never claims the watcher's cron is verified (C; B: watcher presence is never a prerequisite).
- Rejected (A,B,C): door dispatch, prompting the watcher pane, waiting for watcher acknowledgement.
- Cost: up to one 20-minute tick per leaf; with no watcher running, leaves wait and are late, not wrong (keep-running lock) (A,B,C).

## Q2 Start right away (agreed)
- Leaves start at the watcher's next tick; the lifecycle's existing checks are the gate; no review wait (A,B,C).
- Stated cost: a wrong pick can merge to main, and for akrogon deploy (docs/guide/install.md:39), before the operator reads the morning record (A,B,C). Applies to direct landings too (B).
- Rejected (A,B,C): pause, staging, holding dispatch, low-risk-only start (C: the middle ground Boundary removed), a do-not-start note the watcher does not read (C).
- The supervised trial in Morning record is where this cost is first measured (A,C).

## Questions raised
- A failed autopilot-handed leaf: does a later autopilot door chart it? (C) A: settled by Boundary Taken, autopilot pulls nothing new, so it waits for the operator to hand it.
- One watcher covers one repo (C): covered by the per-destination line at switch-on.
