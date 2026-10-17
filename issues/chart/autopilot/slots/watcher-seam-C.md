# Watcher seam notes, slot C (blind)

Skill lines at `f7baddc`.

## Q1 Who runs `akrogon next` after an autopilot handoff?

Pick: the watcher, on its next tick. The door appends `Handed off`, footers the leaves now awaiting watcher dispatch, and moves on. It runs no `next`, as attended handoff already does (`chart-issues/SKILL.md:85`). No text changes at this seam. Starting waiting leaves is the watcher's defined job: it re-reads `issues/open` each fire (`watch-issues/SKILL.md:8`), and a leaf with absent seats is Waiting and gets `next` (`:38`). The operator's division is explicit: charting separate, watcher opened and run by him, "not you". Cost: up to one 20-minute tick (`:16`) against leaf runs measured in hours.

Rejected: door runs `next` after each handoff, as the 2026-10-16 night did. It adds an autopilot-only exception to `:85`, duplicates the watcher, and revives a recorded failure shape, dispatch reaching work nobody handed it. That night itself ran per-repo to avoid starting another repo's leaf. Rejected: door prompts the watcher to tick now. No such watcher input exists, and watcher changes are off route.

One switch-on duty: while the operator is present, the first reply states handoffs await watcher dispatch, and shows it then if no watcher pane is visible. CronList lives inside the watcher session (`:16`), so the door records the operator's word and never claims the watcher verified.

## Q2 Start right away, or wait for review?

Pick: right away, at the next tick. Morning review stays after merge, the test the operator set for the autopilot night. A wait seam has no mechanism: valid leaves in `issues/open` are dispatched by watcher rule (`:38`). Holding them needs pausing the repo, which also stops attended work there, withholding `state.yaml`, which is not handing off, or a watcher change, off route. The honest form of "wait" is "do not hand off", and Boundary settled that autopilot hands off. Cost stated plainly: wrong direction merges before the operator reads anything, and for akrogon a merge deploys a release (`docs/guide/install.md:39`). No staging exists. The Morning record trial measures this cost first. It is not a permanent checkpoint.

Rejected: start only low-risk leaves. The removed middle ground, with A judging its own risk. Rejected: a do-not-start note in the chart. The watcher reads state, not chart prose. It would claim a control nothing enforces.

## Evidence

- Operator · INTAKE.md 2026-10-16 · "the watcher takes over and watches, not you", watcher operator-run; night judged on morning merges and quality.
- Better-than-training · `watch-issues/SKILL.md:8,16,38`; `chart-issues/SKILL.md:85`; `docs/guide/install.md:39`. Night-flow's "nothing depends on the watch" (`issues/chart/night-flow/forks/keep-running.md:31`) is a correctness lock and holds here: an undispatched leaf is late, not wrong, and any later pass starts it.

## Pitfalls

- Watcher dead (session loss, 7-day expiry, `:14`) and the night idles. Bounded, not removed: switch-on surfaces a missing pane, morning record lists leaves still waiting. A second starter at the door would hide which one failed.
- Repo paused: the watcher acts on nothing (`:22`). The door's footer names the pause when handoff status shows it, instead of reporting a clean takeover.

## Missing questions

- An autopilot-handed leaf fails on an operator decision. The watcher notifies, never recovers (`:40`). Does a later autopilot door chart that failure as handed work, or does a failed autopilot leaf always return to attended charting first?
- One watcher covers one repo (`:8`). A handed chart may land in another registered repo with no watcher. Does the switch-on reply check each destination, or only the repo the door opened in?

END watcher-seam-C
