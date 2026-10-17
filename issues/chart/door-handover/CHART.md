# Chart: door-handover

## Destination
Under autopilot, door seat A hands itself to a fresh A session in its own pane when it leaves a chart, and the fresh A continues the same autopilot pass without the operator; attended mode and the pane layout are unchanged.

Route: lifecycle (autopilot)

## Forks taken
- [handover](forks/handover.md): at the switch to the next runnable handed chart, A appends a `handover` mode line naming the remaining list and consultants to every handed chart still open (creating the next chart's folder if absent), then runs a detaching helper that waits for A's proven turn end, rechecks the session, sends `/clear` (claude) or `/new` (codex, pi) in the same pane, confirms a new session and sends the start prompt; a session started by that prompt continues autopilot, every other new session starts attended (operator 1a 3a 5, "reset" replacing 2b 4b)

## Open forks

## Fog

## Off route
- Door A kinds other than claude, codex and pi: they keep today's same-session behavior (handover 5).
- Handover mid-chart, at pass end, or triggered by context size (handover 1a).

## Pending steps
- Human-only prerequisite: the operator commits the uncommitted operator-requested peer fix on main (skills/chart-issues/scripts/peer-restart.ts, peer-create.ts, SKILL.md, questions.md, docs/guide/chart.md, tests/fake-herdr.ts, tests/peer-restart.test.ts, tests/peer-create.test.ts). The leaf edits the same SKILL.md and guide sections and branches from main, so its base must hold that fix. Owner: operator (commit approval). Done 2026-10-17: committed as 53eff40 and pushed by the operator; `git merge-base --is-ancestor 53eff40 origin/main` succeeds (origin/main 5fc3c3c). The push mattered because `akrogon next` branches a new leaf from origin/main (src/next.ts createSparseWorktree, trackingRef).

## Mode record
- mode 2026-10-17T15:43:32Z w8:pNP c954dd5e-b178-44b7-8495-f725d95b59e5: on, handed door-handover (#101); consultants B w8:pS3 (codex)
- mode 2026-10-17T16:49:07Z w8:pNP c954dd5e-b178-44b7-8495-f725d95b59e5: off, every handed chart handed off

## Autopilot
- switch-on: INTAKE.md "Source: operator 2026-10-17 autopilot switch-on"
- consultant: B w8:pS3 (codex); restarted at chart entry by peer-restart.ts, now w8:pSB
- friction: peer-restart.ts closed only B and split A right, but the unnamed old C pane w8:pS4 still held the right column, so B landed in a middle column (A 50, B 27, C 42 of 119); the door moved w8:pSB out and back below w8:pS4 and swapped, giving A 65% wide and B over C at 50% each; the script assumes A fills its tab once the named seats close (SKILL.md Open, "otherwise only A's area is split")
- operator direct request 2026-10-17 (door pane): "ok, and now fix that in the system so that you don't repeat this mistake again. Elegant, minimal solution." and "ok, but what if you need to create them from scratch because they don't exist? We need a solution for that, too." Done on main working tree, uncommitted: peer-restart.ts now restarts each consultant in its own pane (SIGTERM to the agent's process group, wait until herdr drops the pane's row, start same kind and argv under the same name), so no close or split and no layout change; new peer-create.ts builds the consultant column from scratch (B right of A at 0.65, later peers stacked at equal heights, ratio 1/k); SKILL.md Open, questions.md, guide updated; tests/peer-restart.test.ts, tests/peer-create.test.ts, fake-herdr exit behavior; live proof on throwaway tab w8:tDE..tDG (codex, pi, codex: create gave rows 12/13/12 beside A 77 of 119; restart kept panes and layout, new process groups, same argv, new pi session, 12.7 s); finding: during exit herdr keeps the row without `agent` and with the name held for about a second; bun test: 15 failures in peer-wait and verify tests also fail without these changes (5 s timeouts)
- operator authority: the switch-on words ask for this change to autopilot's own continuation rule ("The next session should start unattended, so the self-handover needs to be changed"), so the step that would change autopilot's switch is operator-authorized for this chart
- route: lifecycle (debate no)
- handed off: door-reset (issues/open/door-handover/door-reset, plan.synthesis, debate no)

Handed off 2026-10-17
