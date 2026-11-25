# Fork direct-leaf, proposed final shape (A's pick 1a 2a 3a under full autopilot)

Round: fork direct-leaf, one pick. Corrections to the asked options are marked [new]. Everything here is a mechanism or contract the leaf would carry.

## Record (Q1a)

1. A direct attempt is a real leaf at `issues/open/<chart-slug>/<slug>/` (a standalone issue, owner folder named after the chart, so the chart link survives completion by name) holding ISSUE.md, brief.md, design.md and readiness.yaml written by the door from the chart, and `state.yaml` with one new optional field `direct: true`, `phase: implement` and `sources` the chart alone delivers. Old states parse unchanged.
2. [new] One verb, run by the door from its own terminal inside hc, after the door writes the leaf files: it creates the unlocked sparse worktree at `worktree_store/<slug>` with the leaf env (the leaf worktree setup, never `git worktree add --lock`), records `worktree`, records `seat.A` = the caller's terminal and `seat.B` = the named reviewer terminal (each validated by an hc read), and refuses outside hc, on a leaf without `direct: true`, or on a twin owner. Rerun on an existing direct leaf, it rewrites `seat.A` and `seat.B` from live values and nothing else (never clears `prompted`).
3. The leaf never records `tab`. The door and reviewer terminals never get `akrogon.leaf` labels.
4. For a direct leaf the command never: allocates, starts, ends or prompts a seat, or charges attempts or losses (`dispatchLeaf`, `phaseWake`, `dispatchSlot`, `allocate`, `seatCommand` refuses); kills a recorded seat terminal (`endSeats`, `closeLeaf`, `closeMergedTab`, `endFinishedSeats`, `stopLeaf` seat kill), with an explicit `direct` check at each; counts it toward `max_active` (`activeCount`, both branches). Worktree removal, branch deletion, slice stop and run cancellation stay as for any leaf.
5. [new] Busy: the command reads the recorded seat addresses directly and writes `busy_since` only for the current phase's required slots. For a direct leaf it writes no blocked or stall notice (the door is a shared terminal).
6. [new] TIME: status shows elapsed time for a direct leaf from the attempt's start (the verb's run), not `-`, without writing a `prompt` timing row (which would attribute the door's whole session to the leaf). Source left to the plan.
7. [new] Seats display: status for a direct leaf shows the recorded seat terminals, not the config recipe.

## Landing and phases (Q2a)

8. The command lands a direct leaf through the merge queue and land run, unchanged. direct-route.md steps 5 to 9 (except the chart tail: pack, landed SHA, `Closed`) and `skills/chart-issues/scripts/direct-guards.ts` are removed.
9. [new] Slots for a direct leaf: `check.review` requires only B at every round; `check.repair` requires A (the door). All other phases unchanged. The routing slot function takes the leaf's state so no caller can omit the route.
10. [new] Flow: implement (door as A; writes `<leaf>/plan.md` and `<leaf>/implementation/report.md`, runs plain `akrogon verify` in the worktree for the leaf receipt, moves `check.review --slot A`); review (the door sends B the lifecycle check-issue `check.review` task for the leaf; B records `--slot B --verdict`); on `fix` the leaf enters `check.repair`, the door moves `check.fix --slot A`, repairs, moves `check.review --slot A`, and B re-checks; on ready the leaf enters `merge`. A land red, gate, conflict or dirty exit lands in `check.repair` with `merge_exit` and the door handles it under check-issue's check.repair red-merge rule as A (unedited return to `merge`, or `check.fix` for edits).
11. [new] The door stays in its turn until the leaf leaves `merge`, then closes the chart on `merged` or repairs on `check.repair`.
12. [new] Abandon: the door removes the worktree and branch and deletes the leaf's owner folder from `issues/open` (the chart keeps the brief, design and reason), then `Held`. Growth stop to lifecycle: the same deletion keeping the unlocked worktree and branch, then a normal lifecycle handoff with the same slug adopts them.
13. [new] No frozen record: a direct leaf starts at `implement` with no `state.frozen`, so the frozen-citation gate does not run; test-change citations still do. Nothing is lost against today's direct-guards, which never checked it; the weaker gate against a lifecycle leaf is accepted and named.
14. The door's two-log known-red judgment at landing goes; land's cover and the check.repair red-merge rule replace it.

## Broadcast (Q3a)

15. `commandMerged` records `state.broadcast` as today. [new] It records it only when the repo configures broadcast (applies to every leaf: one rule, matching direct-route step 7's gate).
16. For a direct leaf, `broadcastPass` never allocates or dispatches a seat: it reads `seat.B`'s status in the recorded session and sends the existing broadcast prompt once when it reads idle or done, recording `prompted.B` on a started send and `delivery_error.B` otherwise. `broadcastInProgress` stops holding cleanup once B's turn passes the prompted turn.
17. [new] Before restarting consultants after a landing, the door waits until `broadcast pending` clears and B's broadcast turn ends; if B is gone or stays busy, the door reruns the verb to point `seat.B` at a live idle consultant and runs `akrogon next <slug>` so a merge pass sends it.

## Skills and docs in the same leaf

18. skills/chart-issues/assets/direct-route.md, skills/chart-issues/SKILL.md `## Direct route` and `## Handoff` direct lines, skills/chart-issues/assets/shapes.md (Direct attempt shape, "writes no leaf files"), skills/implement-issue/SKILL.md direct form, skills/check-issue/SKILL.md direct review lines, skills/broadcast-issue/SKILL.md chart-door sender line, docs/use/quick-fix.md.

Out: direct-route eligibility (autopilot excluded) unchanged.
