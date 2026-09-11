# Next Command Owner

Chart skill version: 4

Status: resolved
Type: grilling

## Question

Who types the next skill command into a pane: a dumb driver process that reads the phase and prompts, or the agent that just finished its pass, prompting the peer pane itself through herdr?

Constraints already locked: the driver never reads agent prose. # Busy Pane Prompting: whoever prompts must check idle first. Intake leans driver, leaves it open. A driver is the one loop in the system, an agent-typed handoff has no loop but puts the routing rule in every skill.

Answer must say: which process prompts, what it reads to decide (phase, slot, step), one driver for all repos or one per repo, and how many retries before a ping.

## Findings

Operator challenge, 2026-09-08: is a driver itself against the goal, another piece of software to maintain for its own sake?

Slot A view, same day: a driver is the one loop in the design and the intake's "no loop, no state" test argues against it. The no-driver shape: each skill ends by moving the phase with the lifecycle command and sending the next command to the peer pane with one herdr call. Routing lives in skill text. What is lost: kick-off when both panes are idle, retry and ping when an agent dies, and a single view over many issues. All three can be covered by one stateless read-print-exit command run by the operator or by the status view, no loop. Slot A leans no-driver. To be grilled here with slot B blind.

Slot B return, 2026-09-08 (saw slot A's lean in this file, flagged it, argued independently). Tier 1: Schluntz and Zhang, fixed workflows for predictable steps. Fowler on event-driven systems: distributed handoffs hide the overall flow. Featonby (AWS) on retries: guard against repeating a completed action. Slot B recommends a small driver because the lifecycle already fixes the route, one process for all repos, one safe retry then notify. Its pitfall: a read-and-print command cannot wake a stopped workflow, and an operator recovery command breaks the zero-operator-actions signal.

Slot A research, same day. Tier 1: Newman, Building Microservices, orchestration vs choreography: a central orchestrator turns into the one place holding all logic, choreography puts next-step knowledge in each part and needs a view to see the whole. Gall's law and Horthy per intake. Local: issue-master is 20 files, 1,492 lines, 139 must/never, 81 watchdog and 41 liveness mentions, all born from one running loop. Intake measurement: 110 stalls watching the agent against 9 checking code.

Merged batch provenance, 2026-09-08: Q1 owner = slot B Q1 plus slot A's stateless-command option. Q2 dead agent = slot A, raised from slot B's pitfall. Q3 retries = slot B Q4 plus slot A's stale marker. Slot B Q2 (phase or step record) moved to # Turn Within Phase. Slot B Q3 (one process for all repos) waits on 1-B.

Operator answers, 2026-09-08: 1-A (no loop, finishing skill runs `akrogon next`), 3-A (one re-prompt then stale). 2-A held: operator does not want heartbeats or polling, asks whether a more elegant no-timer recovery exists and whether timers or polling ever caused stalls in the old akrogon logs. Evidence to be gathered before Q2 locks.

Research for Q2, 2026-09-08. Old akrogon git log since 2026-08-01 (tier 2, local primary): 89 failed attempts, 40 of them timer expiries: 25 "no receipt" against a 120 s window and 15 "no heartbeat" against a 3600 s window, almost all firing within one 45 s reconciler tick of the deadline. Those 40 cost near zero hours, the machinery redispatched at once. The 74 hours came from 60 parks waiting on the operator. One watchdog died at 00:28 and stayed down until the operator restarted it at 05:48 (issue supervision-polling-latency). One timer callback bug killed two pi sessions (commit e1b546ff). issues/lessons/2026-09-06-factory-reliability.md:511 "A timer heartbeat can conceal a deadlocked check". So timers produced false failures and noise, the loop produced the downtime, parks produced the hours.

Event-driven option, both slots independently: herdr plugin event hooks run a command per event, including pane.exited and pane.agent_status_changed, harness-independent, no process of ours. Dump: [research/event-driven-recovery.md](../research/event-driven-recovery.md). Unverified: pane events as hook targets are only implied by the docs.

Slot B round 2: recommends event-triggered recovery, accept that a silently hung agent stays undetected rather than add a deadline, and challenges that "stale" conflicts with no parking and zero operator actions. Sources: Brooker and Featonby (AWS, tier 1) on retry boundaries.

Operator answers round 2, 2026-09-08: 2-A herdr event hook. 3-A no deadline, with a request to look for any herdr way to notice a silent agent without a timer. 4-A run the prototype.

Prototype 2026-09-08, 10 minutes, herdr 0.9.0, measured: a linked plugin with `[[events]] on = "pane.agent_status_changed"` and `on = "pane.exited"` links with no event-name warning and its command runs once per event. A prompt to the Codex pane produced two hook runs, `working` then `done`, three seconds apart. A pane that ran `exit` produced one `pane.exited` run. The hook receives `HERDR_PANE_ID` and `HERDR_PLUGIN_EVENT_JSON` with pane_id, workspace_id, agent_status and agent. No cwd or issue in the payload. Plugin unlinked and discarded.

Operator, 2026-09-08: no parks, nothing after the chart may wait on the operator. Retry-exhausted answer 1-A: hand the pass to the other slot, then failed. Wake-up addition accepted in bounded form.

Correction from # Repeat Safety 2026-09-09: the finishing skill no longer runs `akrogon next`; it runs `akrogon phase` and stops, and the herdr hook is the only caller of `next`. The retry policy here (same slot twice, peer once, then failed) stands and the contrary explanations recorded elsewhere were withdrawn.
