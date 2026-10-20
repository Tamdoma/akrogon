# Leaf review, seat C: merge-solo handoff (solo-turns, green-merge)

Disagreements only, by the brief's five points. Draft paths are quoted as `solo-turns/brief.md` etc. under the scratchpad `merge-solo/` folder.

## 1. Done-criteria inside ownership; tests, counts, repo-health claims

### solo-turns

- **D1. Criterion 4 names a reader that does not read the file.** `akrogon flaky` reads `issues/verify-runs.jsonl`, not `merge-attempts.jsonl` (`src/flaky.ts:3` imports `readVerifyRuns`; `src/flaky.ts:64`). As written, an implementer proves a false consumer list. Replace criterion 4's first sentence with:

  > History written before this change still reads: `merge-attempts.jsonl` and `timings.jsonl` lines carrying `members` parse in every reader that reads them (`src/attempts.ts` attempt history and the timing readers in `src/timing.ts` / `src/timing-report.ts`).

- **D2. Criterion 5 can be read against the design's own history rule.** The design keeps `attemptRecordSchema.members` optional for old lines, but criterion 5 says "no `members` field on the batch record" with no qualifier; an implementer can satisfy the criterion as written only by guessing which record it means. Replace criterion 5 with:

  > No member stacking code remains in `src/`: no `pickMembers`, no `redMemberHeads`, no `BatchMember` type, no `members` field on the state batch record (`batchSchema`), and `buildStack` takes the holder only. The history schemas in `attemptRecordSchema` and the timing event schema keep accepting a `members` field on old lines per criterion 4.

- Otherwise no disagreement: no criterion names a test file, assertion or test count, and criterion 5's symbol list is the deletion outcome inside the leaf's owned `src/`, observable by search.

### green-merge

- **D3. Criterion 6 as written requires a live Discord send as proof, with no grant or proof recorded.** The brief says the seat "runs the completion broadcast"; broadcast-issue sends to configured Discord webhooks (`skills/broadcast-issue/SKILL.md` Send section). `readiness.yaml` has empty `grants` and `proofs`, and the design's own standing-design interpretation narrows the proof to "one seat is started with the broadcast prompt; it sends nothing to Discord". Brief and design prove different things. Replace criterion 6 with:

  > A command-landed push that completes an issue or an epic starts exactly one seat with a broadcast-only prompt naming that completed owner, and a push that completes no owner starts none. The broadcast send itself is the started seat's work under `skills/broadcast-issue/SKILL.md`, not part of this leaf's proof.

- Otherwise no disagreement on this point.

## 2. Missing consumers of removed or changed state

### solo-turns

- **D4. The delete bullet can be read as deleting `memberBase`, which the holder still uses.** `memberBase` computes the holder's base at `src/next.ts:1069` and the retirement range at `src/batch.ts:152`; only its `pickMembers` use (`src/batch.ts:100`) is member-only. Replace the design bullet "`pickMembers`, `memberBase` uses that only serve members, ..." with:

  > `pickMembers` (its `memberBase` call goes with it; `memberBase` itself stays for the holder's base in `mergeTurn` and the retirement range in `buildStack`), `redMemberHeads`, `BatchMember`, `batchMemberSchema`, `batch.members`.

- Otherwise no disagreement. Searched `src/status.ts`, `src/timing-report.ts`, `src/reconcile.ts`, `src/lessons.ts`: no reader of `batch.members` beyond the design's owned list (status prints no batch field at all; timing-report's `members` is its own cohort type at `src/timing-report.ts:309`). The design's two "Open for the plan: confirm every reader / locate status lines" items resolve to none found.

### green-merge

- **D5. The command move cannot go "through `transition` with no slot" (Flow step 3), and cannot reuse `phaseCommand` without a slot.** Three separate slot gates bite:
  - `transition` defaults a missing slot to the single required slot, which for `merge` is `B` (`src/phase.ts:261-264`, `src/routing.ts:36`), so a no-slot call records `done: [B]` and a B log line for a merge no seat ran. That contradicts the design's own State consumers bullet (the `commitMove(..., 'merged', null)` path) and criterion 1's "no agent seat" outcome in the records.
  - `batchPush` checks `head === tested_top` only when a slot is given (`src/phase.ts:592`).
  - `phaseCommand` checks the attempt id only when a slot is given (`src/phase.ts:798`).
  Replace Flow step 3's green bullet with:

  > green, gates pass, push lands: holder to `merged` through `commitMove(..., 'merged', null)` (the move `reconcileBatch` already uses), never through `transition` or a slotless `phaseCommand` call, because `transition` defaults a missing slot to `B` (`src/phase.ts:261-264`) and the slotless `phaseCommand`/`batchPush` path skips the attempt-id check (`src/phase.ts:798`) and the `tested_top` equality (`src/phase.ts:592`). The command path therefore checks the attempt id and `head === tested_top` unconditionally itself, records the `merged` attempt line, and leaves tab and worktree cleanup to the existing sweep.

- **D6. Nothing in-process can learn that an owner completed.** Flow step 3 says "If `completeOwner` reports `issue complete` or `epic complete`", but `completeOwner` returns `void` and only prints the line (`src/phase.ts:223`). The crash-recovery path has the same hole: `reconcileBatch` moves a landed holder through `commitMove`, which calls `completeOwner` internally, so a recovered completion would also start no broadcast seat, against criterion 6. Add to Leaf architecture, after the Flow list:

  > `completeOwner` returns the completed owner (`{ kind: 'issue' | 'epic', name }`) or `null` instead of only printing the line; `commitMove` passes it through. The direct command move and the `reconcileBatch` recovery move both start the broadcast seat from that return value, so a completion recovered after a crash broadcasts exactly once as well.

- **D7. The broadcast seat cannot be started by the existing dispatch, and the tab can close before it starts.** `dispatchSlot` builds its prompt from `routing[state.phase].skill` (`src/next.ts:648-650`) and `routing.merged.skill` is `null` (`src/routing.ts:37`), so there is no existing prompt path for a merged leaf. Any later sweep can close the holder's tab first (`closeMergedTab`, `src/reconcile.ts:360`). The broadcast sender rule also lives in `skills/broadcast-issue/SKILL.md` ("the merge slot's own terminal task", "never delegated"), which the design's owned surfaces do not list. Replace Flow step 5 with:

  > Broadcast seat: the land process itself, immediately after the move that completed the owner and before its post-merge wake (step 6), starts one agent in the holder's recorded B pane through a new broadcast dispatch (not `dispatchSlot`, whose prompt comes from `routing[phase].skill` and phase `merged` has none). The prompt names the completed owner folder under `issues/closed/`, the pushed SHA and the closed sources, and runs `broadcast-issue` as sender with seat B's harness and model. Starting it inside the land process, before any sweep can run, is what keeps the tab alive until that pane goes idle, as after a seat-run `merged` today. Owned surfaces add `skills/broadcast-issue/SKILL.md`: its sender is now the merge seat after a seat-run merge, or this broadcast seat after a command-run merge.

- **D8. Post-merge wake is unnamed: nobody runs `selfUpdate`, the next holder, dependents or tab close after a command landing.** Today those happen because the `phase` entry calls `mergeWake` after a committed move (`src/akrogon.ts:94`), and sweeps call `dispatchDependents` and `closeMergedTab` (`src/next.ts:875`, `src/next.ts:1510`). A new `akrogon land` entry that moves the leaf in-process bypasses all of it until the next hook or the 20-minute cron, and for an akrogon-repo leaf it would also skip the self-update solo-turns' deploy timing relies on. Add Flow step 6:

  > 6. The land process ends a landed merge the way the `phase` entry does today: after the broadcast seat starts (step 5), it runs the same post-merge wake as `src/akrogon.ts` runs after a committed `merged` (`selfUpdate` for the akrogon repo, then `mergePass`), so dependents dispatch, the merged tab closes and the next holder's turn starts without waiting for a hook or the cron. A wake failure is reported, not retried inside the land process.

- **D9. Raw refusal and error text cannot ride in the prompt.** The merge prompt is one space-joined line (`src/next.ts:648-650`); gate refusals carry file lists and push errors carry stderr with spaces and newlines, so `refused=<one-line reason>` and "dispatch B with the error text" break the prompt's own `key=value` shape. Replace the gate-refusal and push-error outcome bullets with:

  > - gate refusal: record the refusal text in the batch record; dispatch B with `attempt=<id> top=<sha> wake=gate`. B reads the recorded text from the batch record (and can re-run `merged --check` for the live refusal).
  > - any other push error: record the error text in the batch record and dispatch B with `attempt=<id> top=<sha> wake=push`, as the skill's "report it rather than retrying".

  And the red bullet's prompt token for consistency: `attempt=<id> top=<sha> wake=red red=<run>`.

- **D10. The clean-restack loop has no bound.** Flow step 3 loops to step 2 on every clean restack; an external pusher racing main, or a restack that reproduces the refused top, loops full verifies forever with no seat to judge it. Replace that bullet with:

  > - non-fast-forward, clean restack (`rerun tested=... pushed=...`): loop to step 2 on the new top with no seat, only while the restacked top differs from the refused head; a second consecutive non-fast-forward refusal records the refusal in the batch record and dispatches B with `wake=push` instead of looping again.

## 3. Where the green-merge run executes

**Pick: a transient `systemd-run --user` service unit, not the pane process. The design should settle this, not the plan**, because criterion 1 (no seat started), criterion 7 (liveness) and the batch field shape all depend on it.

Reasons, from the code as it stands:

- A pane is a shell; seats are agents started inside it (`herdr agent start` only when `pane.agent === null`, `src/next.ts:668-690`), and busy detection tracks the agent, not shell children (`observeBusy` via `dispatchSlot`). A plain command typed into the B pane's shell would not raise `pane.exited` when it finishes (the shell is the pane process), would not register as busy, and a later red dispatch would start an agent into the same shell while the command may still be running. The proposal's pickup mechanism does not exist as written.
- Going through `dispatchLeaf`/`allocate` also writes seat state (tab, pane allocation, prompted records) for a turn criterion 1 says starts no seat.
- The repo already runs detached work this way: `src/scope.ts` builds `systemd-run --user` units in the leaf slice (`runUnitArgv`, `startRunGuard`, `stopRunUnits`, `src/scope.ts:41-98`), and `src/admission.ts:86-92` already does pid + start-time + boot-id liveness over such runs. A land unit in the leaf slice is covered by the existing stop paths, its name can be derived from the attempt id so `systemctl --user is-active` is the liveness check, and `scope.ts:32` `sessionBusAddress()` pins the D-Bus address the push's credential helper needs.
- No hook pickup is needed: per D8 the land process runs the post-merge wake itself before exiting; the cron remains the backstop for a dead unit.

Replace the second paragraph of "Where the run executes" with:

> The run executes as a transient service unit: `systemd-run --user --unit=akrogon-land-<attempt> --slice=<leafSlice>` running `akrogon land <slug> --attempt <id>`, reusing `src/scope.ts`'s unit and slice machinery. A systemd service does not inherit the caller's environment, so the unit explicitly receives `AKROGON_HOME` when set, `PATH`, `HOME`, and `DBUS_SESSION_BUS_ADDRESS` from `scope.ts` `sessionBusAddress()` (the git push's credential helper needs the session bus). Liveness is `systemctl --user is-active` on the unit name, which the batch record stores; `akrogon stop` stops it through the leaf slice as it stops check units today. Not a pane process: a pane is a shell with an agent inside it, so a plain command there raises no `pane.exited`, is invisible to busy detection, and blocks the later red dispatch into the same pane; it would also write tab, pane and prompted seat state for a turn that starts no seat. Operator visibility is the unit journal plus the retained verify logs the seat reads today.

## 4. solo-turns in-flight records: strip an empty `members` list, or not

**Strip an empty list; refuse a non-empty one. The design should settle this instead of leaving it open for the plan**, for two reasons the draft does not state:

- Every batch record the current code saves carries the key, empty or not: `mergeTurn` constructs the record with `members` always (`src/next.ts:1070`). So without a strip, the upgrade break is not limited to stacked merges anyone can drain; it hits every solo in-flight batch in every registered repo.
- Some records are never drained at all: a failed leaf keeps its batch record indefinitely (`src/next.ts:988` saves `{ ...batch, notified, recorded: true }` on the failed holder). One such leftover with `members: []` would make `allLeaves` throw on that repo for every command after the upgrade. 5a refuses upgrade code for a *stacked* merge; an empty list has no member commits, no candidate and no member state, so reading it as absent runs no upgrade and contradicts nothing in 5a.

Two corrections ride with this. The design says "through the existing legacy-key strip in `readState` (the same mechanism as `priority`, ...)": that strip filters top-level state keys only (`src/state.ts:123`); `batch.members` is nested, so the mechanism as written cannot do it. And the design says a non-empty list "is refused by the strict `batchSchema` parse, naming the file": `readState` (`src/state.ts:117`) throws the schema error unwrapped, naming the key but not the file. Replace the design's whole "In-flight records (5a)" paragraph with:

> In-flight records (5a): `readState` deletes a nested `batch.members` key before the strict parse only when it is an empty list (the top-level legacy-key strip at `src/state.ts:123` cannot reach a nested key, so this is a new nested delete beside it, added to owned surfaces). An empty list carries no member commits or state, so this is not upgrade code for a stacked merge. A non-empty `batch.members` is refused by the strict `batchSchema` parse, and `readState` wraps a parse failure so the error names the leaf's `state.yaml` path. There is no other upgrade code. This matters beyond in-flight merges: every batch record saved today carries the key (`src/next.ts:1070`), and a failed leaf retains its batch record indefinitely (`src/next.ts:988`), so without the empty strip a drained queue would still break on leftovers nobody can drain.

And add to brief criterion 4, before its last sentence:

> A leaf `state.yaml` whose `batch` carries an empty `members` list reads exactly as if the key were absent.

## 5. Anything that breaks 2a or 1a as the operator took them

- solo-turns against 1a: no disagreement.
- green-merge against 2a: D5 is the one break as drafted. 2a says the command pushes "with no seat"; a no-slot `transition` records seat B as the mover (`done`, log line via `commitMove`'s `logMove`, `src/log.ts:32`), so the records would claim a seat session that never happened, and the slotless `phaseCommand` path would skip two of the guards 2a's precision rests on (attempt id, `tested_top`). The D5 replacement restores 2a as taken. Nothing else in either draft breaks 1a or 2a: the known-red foreclosure in green-merge's design matches 2a's "a red verify ... wakes seat B as today".

Everything not listed above: no disagreement.
