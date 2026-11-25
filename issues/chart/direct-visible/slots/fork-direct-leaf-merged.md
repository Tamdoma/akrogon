# Fork direct-leaf, merged notes (A, B, C, D)

Sources: fork-direct-leaf-A.md, -B.md, -C.md, -D.md in this folder, written blind 2026-11-25 on akrogon main 085f2f88. Tags name the slots that wrote the point.

## Q1 record

- Q1a, a real leaf with one optional state field (A,B,C,D). Reason: only `state.yaml` under `issues/open` reaches status text and JSON rows, log.jsonl phase time, timings, `leafTarget` run attribution, merge queue, land and broadcast with no second reader; signposts 3a and 6a. Cost: the field must stop every command path that starts, prompts, ends, renames, closes, kills or counts a seat or tab.
  - Field name: `direct: true` (C,D); `door: <chart path>` linking the chart (A); unnamed marker (B).
  - Paths the field must stop (A,B,C,D): `dispatchLeaf` and `phaseWake` (no `allocate`, `startSeat`, `end`, attempt or loss charge), `allocate`, `seatCommand` (refuse), `broadcastPass` (no allocate or dispatchSlot), `endSeats`, `closeLeaf`, `closeTabOf`, `closeMergedTab`, `endFinishedSeats`, `stopLeaf`'s seat kill (B,C,D), `activeCount` and `capRefusal` including the session-refused `seated` branch (B,C,D), `renameTabs`, `renameTab` in phase.ts, `unnamedTabs` (C,D).
  - Construction rules: never record `tab` (A,B,C,D); never put `akrogon.leaf` labels on the door or reviewer terminals, find seats by recorded address (A,B,C,D); the field check is explicit at each kill or close path, not an accident of labels (C,D).
  - Busy: a new read path by recorded address feeding the existing `observeBusy` (A,B,C,D); scope it to the phase's required slots so charting work does not show as `busy A` on a leaf waiting in review or merge (C).
  - Worktree: created unlocked through `createSparseWorktree` at `worktree_store/<slug>`, env emitted, never `git worktree add --lock`, or reconcile keeps it forever (B,C,D).
  - Creation: one verb, since `state.yaml` is command-owned and 0444 (A,B,C,D); the same verb rewrites `seat.B` when the reviewer changes (B,C,D).
  - Owner: a standalone issue `issues/open/<owner>/<slug>/` with `sources` the chart alone delivers (A,D); brief and design in the leaf folder because broadcast reads them from `closed=` (C,D).
- Q1b rejected (A,B,C,D): a second renderer; no log-backed TIME, no JSON leaf, no busy, no merge turn, runs still slug `checkout`, prose that goes stale when a door dies.
- Q1c rejected (A,B,C,D): a new record kind against 3a; every leaf reader stays blind or gains a second path.

## Q2 landing

- Q2a, the command lands (A,B,C,D). Reason: one merge engine; the direct landing re-implements land in prose; `direct-guards.ts`'s five checks are `landGates`, `batchGuards` and `moveGuards` (B,D); direct pushes race the merge queue under Q2b (B,C,D). Delete direct-route.md steps 5 to 9 and `direct-guards.ts`.
  - Land needs (A,B,C,D): branch `<slug>` at the head, recorded unlocked worktree, a green leaf-scope receipt at entry to `check.review` and at an edited `check.repair -> merge` (so implement runs plain `akrogon verify` in the worktree, not `--holder`), phase records for review verdicts.
  - Lost: the door's two-log known-red judgment and its seed filing; land's own cover (`uncoveredMainRedUnits`, taken-8) replaces it (B,D). The direct attempt waits its merge-queue turn (B,D).
  - Frozen record: absent when the leaf starts at `implement`; `moveGuards` skips it while still running test-change citations (C); name the gap (B).
- Q2b rejected (A,B,C,D): two engines, no queue order; with Q1a no seat call can move a leaf to `merged`, so a door push leaves a phantom row (D).

## Q3 seats and broadcast

- Seats: `seat.A` = door terminal, `seat.B` = reviewer terminal, by `{session, address}` (A,B,C,D).
- Broadcast recorded by the command (`state.broadcast`, `broadcast pending`) (A,B,C,D). Recipient:
  - B, idle or done, via `hc send --if idle`, `prompted.B` as the existing ack (B,C,D). Reason: the lifecycle shape with the start removed; survives the door's turn ending; the prompt text works unchanged because the owner really moved to `issues/closed` (D).
  - the door A (A). Reason: the door's address survives handovers while door-created consultants restart on every chart entry.
- Q3b rejected (A,B,C,D): no honest ack field, a door that stops between push and send leaves no pending signal, the #153 doubt itself.

## Pitfalls and what removes each

- Reconcile or stop killing the door or reviewer, or closing the door's tab (catastrophic) (A,B,C,D): no `tab`, no leaf labels, explicit field checks, and free tests that drive a direct leaf through merge, failed and stop with live fake terminals and find no kill, close, rename or start.
- Dispatch starting seats on top of the door (A,B,C,D): early return in dispatch and refusal in `seatCommand`, tested as zero spawned terminals across passes.
- Capacity: a direct leaf counted toward `max_active` (B,C,D): excluded in `activeCount` both branches.
- Locked worktree never swept (B,C,D): unlocked creation.
- Abandon or Held leaving a live-looking row (A,B,C,D): the leaf moves to `failed` with a reason; C and D want a final disposition for an abandoned attempt (remove the open folder, or park).
- Broadcast stranded when B restarts (A,B,C,D): `broadcast pending` stays visible; the verb rewrites B; the door waits for the broadcast send before restarting consultants (A, this merge).
- Reviewer mid-exchange receiving the broadcast (C,D): idle or done gate at send.
- `broadcastInProgress` holding cleanup while a reused B works on later charts (C): clear once B's turn passes the prompted turn.
- A repo with no broadcast config getting a broadcast prompt (C): today `commandMerged` writes `state.broadcast` for every leaf; same for direct leaves, no change in this leaf.

## Where slots differ

1. Review at `fix_rounds` 0, where routing requires A and B:
   - The door writes a genuine blind A review of its own work, lifecycle-exact (B).
   - The door records A's verdict from its own proof runs (D).
   - `requiredSlots` returns `['B']` for a direct leaf (A,C).
2. Repair after a `fix` verdict, where routing sends the leaf to `check.repair` (slot B):
   - Route a direct leaf's `fix` to `check.fix` so A repairs (C).
   - The door hops `check.repair -> check.fix` on B's review file and repairs as A (D).
   - Open (B).
3. Who prompts the seats for build, review and repair:
   - The door, as today; the command prompts nobody for a direct leaf (A,B,C,D). B's OQ1: TIME stays `-` because no `prompt` timing row is written.
4. The door's wait on an asynchronous land: stay in the turn watching the leaf leave `merge` (D); a wake to the door (C).
5. Broadcast recipient: B (B,C,D) or A (A).
6. Plan and report location: the leaf's `plan.md` and `implementation/` (B,C,D); Open for the plan (A).

## Open questions raised

- Abandoned attempt's final record (C,D).
- Outside hc there is no address: no seats, no broadcast (D).
- The door session handed over mid-attempt: the verb rewrites A too (B).
- Base-red filing that the door's known-red judgment did (D).
- `status --json` `seats` for a direct leaf reads repo defaults, not the live door and reviewer (C).
