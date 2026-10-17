# History of earlier autopilot attempts, from repositories (A subagent, Opus, 2026-10-16)

Agent research, not operator words. Refs as returned; spot-check before relying on a single line.

## Attempts
- A1 tamdoma issue-lifecycle (`/home/ivan/Work/infra/tamdoma/issue-lifecycle`, 2026-07-26 to ~09-07, 3,275 commits): issue-master, pair-orchestrator driver, watchdogs, herdr plugin.
  - 07-31/08-01 overnight "Lead the merges... take care of everything": 4 merges, board empty (4a9869de, HANDOFF-2026-08-01-session17.md). Succeeded.
  - 08-01 5-hour mandate, agent crossed every operator gate and answered slot questions itself (abcc3315, HANDOFF-session19.md:10-36): merged (b75e5642). Succeeded.
  - 08-02 "board self-driving": driver, watchdog, auto session rotation (63515782).
  - 08-16..23 (`ISSUE-LIFECYCLE-PROBLEMS-20260823.md`): 40+ manual dispatches (:15), watchdog died silently 10+ times, liveness frozen up to 7 h (:19), plan-amendment churn ~4h20m (:44), 11 review passes and two force-merges (:47), every diagnosis needed manual pane reads (:77), permission classifier blocked kills (:89), "machinery still assumes a human-in-the-loop far more than intended" (:91).
  - 08-19/20 "fully auto pilot. The operator is asleep" (delegations.yaml, 37c9fd52; log `issues/continuity/OVERNIGHT-RUN-20260819.md` @ c98f307d): 1 of 13 seeds landed after ~3h40m. Driver and watchdog dead 22:26Z-00:09Z unnoticed (:49), lane clobbered precedents.md (:48), lanes double-wrote main root and blocked deploy (:51), classifier blocked 3 actions (:52), machine suspended 3h40m (:54), driver wedged after resume with zero-byte journals (:55), the agent's own hand-written autopilot YAML row broke the gate for every lane (37c9fd52).
  - 08-22/23 "Operator sleeps; act autonomously" (430ffff6): first overnight merge, ghost watchdog and stuck processes waited on operator kills.
  - 08-24 analysis: 2.7 h pane work per lane vs 17-20 h handoff latency, "The work is not slow. The gaps between the work are" (`ANALYSIS-2026-08-24-lifecycle-slowness.md`:13). External review: "More automation was implemented as more agents".
  - Abandoned: framework landings fell from ~185 in July (hand-typed) to 37 in August (automated) (akrogon 00dc46e:issues/chart/INTAKE.md:9).
- A2 akrogon "mechanics" reconciler (charted 08-29, abandoned 09-07): 82,264 TS lines (35,541 tests), 89 failed attempts (40 = machinery not seeing its own seats), 77 stall hours mostly parks waiting for a human; five longest stalls 7.4-11.5 h all parks; 10 of 79 issues existed only to serve the machinery's own gates (00dc46e:issues/chart/INTAKE.md:41-71). `learnings/history/2026-09-06-factory-reliability.md` F1 valid reports rejected for formatting, F6 review caps needing the operator, F10 watchdog races. Rebuild: "Never again build fixers for the machine" (00dc46e:new-beginning/SESSION-SUMMARY.md).
- A3 akrogon-new (current):
  - 09-08 goal "two slots and one stateless command carry every leaf to merge with no operator action" (`issues/closed/akrogon-loop/chart/CHART.md`:9).
  - 09-18/19 ad hoc overnight watchdog: 36 ticks, 3 acted, 20 reported one blocked seat question (`issues/closed/watch-issues/chart/INTAKE.md`:46). Became watch-issues 09-19 (b1bdde3).
  - 09-26 unwanted autonomy: one completion swept every registered repo; framework leaves implemented, merged and broadcast without the operator starting them (`issues/closed/next-dispatch-scope/chart/INTAKE.md`:17-38).
  - 10-10/11: leaf-env-file failed 22:56Z, sat ~6.4 h; watch had self-deleted (`issues/chart/night-flow/INTAKE.md`:175-190); operator "this night miserable" (:243).
  - 10-14/15: A decided "under the operator's overnight authority" (`issues/chart/system-speed/CHART.md`:14), 11 failed moves, framework watcher under stop order; "Without someone awake, this class waits until morning" (:34).
  - 10-15/16 autopilot charting night: merges temp-release, release-deploy, release-rollback; friction in the source file.

## Recurring mechanisms
F1 supervisors died silently or reported live while dead. F2 work parked waiting for an absent human (largest stall cost). F3 code rejected agent output for its shape. F4 cap and loop churn. F5 parallel lanes wrote outside their worktree. F6 permission blocks needing the operator. F7 session-scoped watchers lost or self-deleted. F8 autonomy reached past what the operator started. F9 the machine fed itself (gate-serving issues). F10 host faults (suspend, crashes).

## Locks
- 2026-09-18 "no hidden watchdogs, clocks or polling" (`issues/chart/seat-stall-detection/CHART.md`:15-16).
- 2026-09-19 "I don't want an automated program to run things without me. I need to be pushing the next commands manually." (`issues/closed/seat-prompt-delivery/one-attempt-per-pass/design.md`:9).
- "Manual dispatch is the normal way to start work" (`docs/guide/next.md`:181). watch-issues is the opt-in exception (`issues/closed/watch-issues/chart/forks/watch-policy.md`:24).
- night-flow keep-running: the watch stays informal, nothing depends on it (`issues/chart/night-flow/forks/keep-running.md`:31-34).
- "No loop, no state" as the test for anything new (00dc46e INTAKE:97-99).

## Flags
- X1 Not every unattended run failed: 08-01 runs and 10-16 succeeded. What failed was unattended operation, not decision quality.
- X5 The mechanics fork code is not on disk; facts come from documents.
