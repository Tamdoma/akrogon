# Design: green-merge

## Binding decisions, verbatim

### stack-fate (issues/chart/merge-stacks/forks/stack-fate.md), operator 2026-10-19

Goal carried from 2026-10-18: "most elegant systemic issues. Always better to remove redundancies and complicated code first before adding and stacking new code."

Operator 2026-10-19: "Okay, say say I didn't rule anything out. What would be the best possible solution? Consult with the consultants and tell e this is very important to me. If I'm stuck with only one at a time merge, that's fine, but I need to find something faster that is just as precise and as good. So do some deep research on this without me imposing any rules or restrictions. Of course consult with both consultants."

Operator 2026-10-19: "This was a part of the speed up because if they were running two full checks of test suites during their run and inside of the merge that just doubles the amount of time that takes to merge. Consider all the updates that we did in the past week. I am aiming for speed as well as accuracy.As well as the cost reductions."

Operator 2026-10-19: "1a | 2 - Explain to me how this works, who will commence the merging? I'm leaning towards A but I need you to explain it more, dumb it down for me. What are the gains gonna be in absolute and relative terms from this? | 3 - I'm leaning towards A, but I need more explanation. What is this? Dumb it down for me. | 4a | 5a"

Operator 2026-10-19: "2a | 3a"

- 2a: command-only green merge. The merge turn's command lines the holder up on main, runs the merge verify, checks the receipt and pushes on green with no seat. A red verify, a rebase conflict or a dirty worktree, or a refused push it cannot restack wakes seat B as today. The completion broadcast still needs a model, so a seat starts only when an issue or epic completes. Gains, estimates: about 1 of 13 min per green merge (about 9%), about 3 of 4 merge agent sessions removed, and agent-session failures removed from green merges.
- 5a: no upgrade code for an in-flight stacked merge; drain merges before installing; the strict state parse refuses a leftover loudly.

Reason: a green merge needs no judgment; every step B takes on green is a command the command already owns. Precision is unchanged because the same `akrogon verify` merge scope runs on the same top and the same receipt and gate checks guard the push. Foreclosed: landing a red or known-red head without B (B's cause judgment stays the guard; B rebuttal on best-merge rejected command-side known-red landing); running the full suite twice (operator correction above); batching several leaves into one verify (1a, leaf solo-turns).

Exclusions: member stacking removal belongs to solo-turns (this leaf's prerequisite). Framework suite reshaping (3a) is a separate framework chart. Parallel next-leaf testing (4a) is off route.

### Standing design

/home/ivan/.akrogon/releases/b5a877c1c21d952e7ef86579e8eacecbd582aa5f/skills/chart-issues/assets/standing-design.md

Interpretation for this leaf: proof runs at the command boundary (`akrogon next`, `akrogon phase`) in temporary repos with the existing helpers (`tests/helpers.ts`, `tests/fake-herdr.ts`, `tests/fake-systemd-run.sh`, `tests/fake-systemctl.ts`, the repo's existing fake check commands for green and red verify); no new machinery. Each new behavior shows one deliberate break turning its test red (for example a red verify that the command pushes, or a second `next` that starts a second verify). The broadcast criterion proves that one seat is started with the broadcast prompt; it sends nothing to Discord. No live model run.

## Leaf architecture

Owned surfaces: `src/next.ts` (`mergeTurn`, `reconcileBatch`, `dispatchMergeLeaf`, `mergeContext`, `mergeWake`, the hook path that closes a merged tab), `src/phase.ts` (`batchCheck`, `batchPush`, `restack`, `finishPush`, `transition`, `commitMove`, `completeOwner`, `phaseCommand` merge branch), `src/verify.ts` (`verify`, `verifyCaller`, `runOnce`, `greenRun`), `src/akrogon.ts` (the land entry), `src/scope.ts` (the land unit's lifecycle), `src/stop.ts` (stopping a land unit with no tab), `src/reconcile.ts` (cleanup protection while land or broadcast work is pending), `src/log.ts`, `src/timing.ts` and `src/timing-report.ts` (truthful seatless merge records), `src/status.ts` where it shows an active land run or a pending broadcast instead of an active B seat, `src/routing.ts` if a broadcast route is needed, `src/state.ts` `batchSchema`, `skills/merge-issue/SKILL.md`, `skills/broadcast-issue/SKILL.md`, `src/AREA.md`, and the merge tests under `tests/`. (B,C)

### Flow

1. `mergeTurn` builds the holder top as today (after solo-turns). If the rebase failed (`top` undefined), it dispatches B with `attempt=<id> solo` as today. Nothing else changes on that path.
2. With a top applied, the command claims the attempt for the land run and launches it (see "Where the run executes") instead of dispatching B. The land run: merge verify on the top (the same code path as `akrogon verify --attempt <id>`, reusing a receipt only for an identical tree), then the `merged --check` gates, then the push, then `finishPush` on refusal.
3. Outcomes:
   - green, gates pass, push lands: the holder moves to `merged` through the command-owned move below, the `merged` attempt line is written, and steps 5 and 6 follow.
   - verify red: nothing pushed; hand the attempt to B (see "Ownership") with the red run id in the batch record; dispatch B with `attempt=<id> top=<sha> wake=red red=<run>`. (C)
   - gate refusal: record the refusal text in the batch record; dispatch B with `attempt=<id> top=<sha> wake=gate`; B reads the recorded text and can rerun `merged --check` for the live refusal. (C)
   - non-fast-forward, clean restack (`rerun tested=... pushed=...`): loop to step 2 on the new top with no seat, only while the restacked top differs from the refused head; a second consecutive non-fast-forward refusal records the refusal and dispatches B with `wake=push`. (C)
   - non-fast-forward, `rerun rebase <slug> onto <sha>`: dispatch B with that line, as the existing restack instruction.
   - any other push error: record the error text in the batch record and dispatch B with `attempt=<id> top=<sha> wake=push`, as the skill's "report it rather than retrying". (C)
   Prompt values stay single `key=value` tokens because the merge prompt is one space-joined line (`dispatchSlot`, `src/next.ts`); free text lives in the batch record. (C)
4. B's red handling starts from the command's red receipt instead of running the first verify itself: judge the cause, one rerun on an unchanged head for a no-cause red, `--known-red`, the memberless mechanical repair, or `check.fix`, all as today. B's later `merged --check` and `merged` calls are unchanged.
5. Broadcast seat: `completeOwner` returns the completed owner (`{ kind: 'issue' | 'epic', name }`) or `null` instead of only printing the line, and `commitMove` passes it through. (C) Before owner closure can erase the trigger, the command persists a broadcast handoff holding the owner identity, its closed destination, the pushed SHA and the closed sources. (B) The land run then starts one agent with seat B's harness and model in the holder's tab B pane (allocated as for a merge dispatch when absent) with a broadcast-only prompt that runs `broadcast-issue` as sender. `dispatchSlot` cannot do this as it stands: its prompt comes from `routing[phase].skill` and `merged` has none (`src/routing.ts`). (C) Recovery dispatches an undispatched handoff even when the leaf is merged and its owner closed, including a completion recovered by `reconcileBatch`; a confirmed dispatch is never repeated. Pending or active broadcast work blocks tab, slice, worktree and context cleanup (`closeMergedTab` and the merged-tab hook close today unconditionally, `src/reconcile.ts`, `src/next.ts`). The seat uses the sender's existing retry and failure policy. No owner completed means no handoff. Open for the plan: where the handoff is stored and how dispatch is acknowledged, using the existing delivery conventions. (B,C)
6. Post-merge wake: after a landed push and step 5, the land run runs the same wake `src/akrogon.ts` runs after a committed `merged` (`selfUpdate` for the akrogon repo, then `mergePass`), so dependents dispatch, the merged tab closes once no broadcast is pending, and the next holder's turn starts without waiting for a hook or the cron. A wake failure is reported, not retried inside the land run. (C)

### The command-owned move

The green move records `slot: null` and no agent session. It never goes through `transition` without a slot, which defaults to the single required slot B (`src/phase.ts` `transition`, `requiredSlots`), nor through a slotless `phaseCommand`/`batchPush`, which skips the attempt-id check and the `head === tested_top` equality. (B,C) The command path shares the guards the seat path runs: clean worktree, issue files, test-change citations, frozen citations, retired lessons, green receipt on the exact head, attempt id, `tested_top` equal to the pushed head, fast-forward only, and the `candidate` record before the push; then it commits the move without recording B as done, with the precedent `reconcileBatch`'s `commitMove(..., 'merged', null)`. (B,C) `src/log.ts` must not attribute the move to the invoking hook's pane session. Timing reports treat a completed command-owned merge visit as complete without a B prompt (`src/timing-report.ts` today marks a merge visit with no B prompt as missing evidence). (B)

### Where the run executes

`akrogon next` runs from herdr hooks on every pane status change and from a 20-minute cron (`plugin/herdr-plugin.toml`, `plugin/next.sh`, `skills/watch-issues/SKILL.md`), and `mergeWake` runs at the end of every `akrogon phase` call (`src/akrogon.ts`). A 12-minute verify inside those calls would hold a seat's `phase` command or a hook process open for the whole run. So the run executes detached from the caller.

Decision (B,C; A's pane proposal withdrawn): the land run is a transient user service, `systemd-run --user --unit=akrogon-land-<attempt> --slice=<leafSlice>` running `akrogon land <slug> --attempt <id>`, reusing `src/scope.ts`'s unit and slice machinery. It is not the blocking check-scope wrapper; the verify inside it still uses its normal logged run scopes. A service does not inherit the caller's environment, so the unit receives `AKROGON_HOME` when set, `PATH`, `HOME`, and `DBUS_SESSION_BUS_ADDRESS` from `sessionBusAddress()`, which the push's credential helper needs. The initiating hook or `phase` call returns after launch acknowledgement. `akrogon stop` and `stop --all` stop it through the leaf slice even with no tab (`src/stop.ts` today selects only leaves with a tab). No agent is allocated or started for a healthy run. Operator visibility is the unit journal plus the retained verify logs. Rejected: a plain process in the merge tab pane. A pane is a shell with an agent inside it (`herdr agent start` only when the pane has no agent, `src/next.ts`); a plain command there raises no `pane.exited`, is invisible to busy detection, can collide with a later red dispatch into the same pane, and would write tab, pane and prompted seat state for a turn that starts no seat. (B,C) Open for the plan: the exact launch command, environment and liveness check (unit name with `systemctl --user is-active`, or the pid, start-time and boot-id check `src/admission.ts` already uses). (B,C)

### Ownership, concurrency and crash (criteria 7, 8)

The batch record persists who owns the attempt, the command or B, separately from whether the land unit is alive. (B) The command claims execution under the global lock before launching, with an identity whose launch and liveness can be reconciled without a duplicate verify, and never holds the global lock while the verify runs. Before dispatching B for a red, refusal or push outcome, it persists B's ownership with the receipt or error context; later `next` calls continue that handoff and never restart the command's verify for a B-owned attempt. If a command-owned unit dies, reconcile a landed `candidate` first (lost-push recovery as today), then resume the unfinished work exclusively. Open for the plan: the field representation and launch handshake. (B)

### State consumers

- `verifyCaller` resolves the leaf by `batch.attempt`; the land run passes the attempt directly.
- `dispatchLeaf` returns `merge_turn` unless the slug is the queue head with a merge context; the red, refusal and push dispatches pass the new context through the same `dispatchMergeLeaf`.
- `completeOwner` callers (`transition`, `commitMove`, `dispatchLeaf` for a merged leaf, `phaseCommand`) take the new return value; only the command-owned move and `reconcileBatch` recovery act on it. (C)
- `src/status.ts` shows an active land run or a pending broadcast handoff instead of inventing an active B seat. (B)

In-flight records (5a): a new batch field parsed strictly means an old release cannot read a record written by the new one; deploys go forward only. Existing in-flight batch records without the new fields parse unchanged.
