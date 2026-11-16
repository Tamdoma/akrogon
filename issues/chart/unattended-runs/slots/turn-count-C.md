# Fork notes, slot C: turn-count

## Q1. Where a no-report turn is counted

Pick: count once in `dispatchSlot` (src/next.ts), at the place that already judges turn movement. After the `prompted.turn >= seat.turn` early return, read current state, set `counted = attempts[slot] + 1`, save it, and fail through the existing `commitMove` when `counted >= 3` with the existing reason text naming `counted`. Under the threshold, call `deliver()` as today. Remove the attempts +1 from `deliver` in src/next.ts and from the confirmed record in `startSeat` (src/seat.ts). Threshold stays 3. A seat still gets 3 prompts in total and fails after the third silent turn end, the same total as today.
Cost: a seat whose turn never moves never spends attempts. Q3 and the busy and blocked notices carry that case.

Rejected: keep delivery counting and drop only the startSeat increment, because the failure reason stays false for the redelivery path. Count in the listener on turn events, because src/listen.ts is a pass queue and holds no state judgement today. Count from transcript turn records, because that adds a second turn source next to hc `seat.turn`, which `prompted.turn` already trusts.

Evidence: [code, src/next.ts `dispatchSlot` and `deliver`, read 2026-11-16] delivery adds 1 and the fail move reads `attempts < 3`. [code, src/seat.ts `startSeat`, 2026-11-16] a confirmed first task adds 1. [record, framework issues/log.jsonl entry 2026-11-15T21:36:56Z] the #136 leaf failed at attempts A=3 about 30 seconds after the first background wait.

Pitfalls: the delivery_error resettle path converts a failed send into a prompted record at `error.turn`, so a turn the seat took after a send that reported not started still counts. Accepted, since the turn did move. What removes the never-moving seat pitfall is Q3 plus the existing `observeBusy` notice, not a second counter.

## Q2. Turn ends while a run-check run is live

Pick: it does not count, and no prompt is delivered either. In `dispatchSlot`, before the Q1 counting point, call `liveRuns()` (src/admission.ts) and return when any record matches this repo and leaf and its `since` age is at most `STALL_MS` (the existing 60 minute constant in src/next.ts). Matching is by repo and leaf only. No new field stores the seat scope today, so slot exact matching is not available.
Cost: in check.review, slot B with a live run graces a silent slot A turn end until the run ends or ages out. Plain background commands outside run-check stay invisible and stay covered only by the implement-issue proof order foreground rule.

Rejected: a fixed grace time after delivery, because run lengths in the records range from seconds to 806 seconds and any fixed value is wrong for one end. Count the turn but delay the fail, because the budget still burns and fails the leaf after the run. Wait inside dispatch for the run to finish, because a pass holds locks and the listener kills overdue passes at `PASS_DEADLINE_MS`.

Evidence: [code, src/admission.ts `liveRuns`, 2026-11-16] live and waiting records carry repo, leaf, check name, scope and `since`. [record, framework issues/timings.jsonl, 2026-11-16] one capture run lasted 806850 ms under run-check. [report, INTAKE #136, unverified] the slow command in the reported case was itself launched through run-check.

Pitfalls: a hung run parks the leaf with an idle seat and `observeBusy` cannot notice it, since it needs a working or blocked seat. The `STALL_MS` age bound in the pick removes the unbounded version of this. What remains is a run hung under 60 minutes delaying a deserved fail by up to that bound.

## Q3. Bound for a seat that keeps getting lost

Pick: two new state fields in src/state.ts next to attempts. `starts: counts.prefault({})` reuses the existing counts schema. `starts_at` mirrors the `busy_since` shape, one optional ISO string per slot, default `{}`. In the `dispatchSlot` start branch only, before `startSeat`: when `starts[slot] >= 3` and now minus `starts_at[slot]` is under 10 minutes, skip the start and write one attention notice with id `noticeId(repo.name, 'lost', slug, slot)`, gated once per window by `noticeState` exactly as `observeBusy` gates the busy notice. Otherwise increment `starts[slot]`, set `starts_at[slot]` to now when the window is fresh, and start. The Q1 counting point resets `starts[slot]` to 0, because an observed turn end proves the seat lived. The phase move in src/phase.ts adds `starts: {A: 0, B: 0}` and `starts_at: {}` beside the attempts reset. The manual start verb `seatCommand` (src/next.ts) does not pass through this branch, so operator starts stay unbounded.
Cost: the 3 per 10 minutes values are judgement with one observed case. A seat lost once an hour restarts forever, one notice per lost episode at most from Q4 records, and that limit is stated.

Rejected: derive starts from timings.jsonl prompt rows, because `readTimings` strict parses the whole file and a metrics log should not become a control input. Debounce wakes in the listener, because it delays every legitimate wake in every repo. A systemd start limit, because `startSeat` names each scope unit with random hex, so no stable unit exists to limit.

Evidence: [code, src/state.ts counts schema and `attempts: counts.prefault({})`, 2026-11-16] the prefault pattern covers open leaves with no migration. [code, src/phase.ts phase move, 2026-11-16] attempts reset to zero at every move. [record, framework issues/timings.jsonl, 2026-11-16] three delivered starts at 09:30:55Z, 09:31:13Z and 09:31:27Z fit inside any 10 minute window with room to spare.

Pitfalls: counting the start before `startSeat` means a start that then throws still spends the bound. That is wanted, since a throw loop is the same class. The notice could re-fire after its window while the seat is still dead, one per 10 minutes at worst while passes keep running, bounded by passes stopping when the bound blocks starts and no new events arrive.

## Q4. Evidence kept before end removes the terminal

Pick: reuse `delivery_error` with one new code. Add `'lost'` to the code enum in `seatDeliveryErrorSchema` (src/state.ts). In the `dispatchSlot` start branch, when the old seat is finished, read `screen()` (src/hc.ts) before `end()`, then after `startSeat` returns save `delivery_error[slot]` as `{code: 'lost', address: <old address>, turn: <old seat turn>, status: <old status state or null>, screen: <screen text>, at: <now>}`. Write it after the start because the launch record inside `startSeat` clears `delivery_error[slot]`. When the seat is already gone from the listing, write the same record after the start with the address from `state.seat[slot]`, the turn from `prompted[slot]`, and no screen. The record survives until the next successful `deliver()` clears it, and the Q3 notice body carries its screen text when the bound fires.
Cost: latest loss only. A second loss overwrites the first record, since the shape holds one entry per slot.

Rejected: leave finished terminals in place instead of `end()`, because reconcile teardown and the tab layout both assume removal. Write screen files into the leaf folder, because that invents an artifact class with no retention owner. Log to the journal only, because the record then sits outside the leaf state every other tool reads.

Evidence: [code, src/hc.ts `end` and `screen`, 2026-11-16] end kills then removes, and screen is one `hc read` call. [code, src/seat.ts `startSeat` launch record, 2026-11-16] delivery_error is cleared at launch, which forces the after-start write in the pick. [code, src/state.ts `seatDeliveryErrorSchema`, 2026-11-16] screen and status are already optional fields in the shape.

Pitfalls: `screen()` on a terminal the core just removed can fail. The record then writes without screen, which the schema already allows, and the restart must not block on the read. The existing resettle logic keys on `recordedError.address === seat.address`, so a lost record carrying the old address is ignored for the new seat, which is what keeps it as evidence instead of delivery state.

## Q5. Stored attempts under the old rule

Pick: leave stored values as they are. No migration and no install time reset. The leaf report lists open leaves across repos with `attempts >= 2` at merge time so the residue is visible once. Reason: every phase move already resets attempts to zero in src/phase.ts, so residue lives only inside a current phase visit, and an old count is never lower than the new rule count for the same history.
Cost: one named case exists today. Framework `competition-read-skill` sits at attempts A=4 from starts alone, so its first silent turn end under the new code fails it at once. The recovery is the existing phase move the operator already uses.

Rejected: reset attempts in every repo at install, because the installer has no state rewriting precedent and touching every state.yaml from install is a new mechanism class. Rename the field and prefault a fresh counter, because two counters then live in state, observe output and the watch skill forever. Clamp values at first dispatch under the new code, because a one-time branch then sits in the hot path permanently.

Evidence: [code, src/phase.ts phase move, 2026-11-16] `attempts: {A: 0, B: 0}` on every move. [record, framework leaf state via INTAKE #137, 2026-11-16] attempts A=4 with seat t1xv alive. [code, src/install.ts link planning, 2026-11-16] install plans links and units, and never rewrites leaf state.

Pitfalls: attempts changes meaning at the release seam, so timing and learnings comparisons across the seam mislead. The leaf report naming the seam date removes the silent version of this.

## Questions the fork does not ask

N1. A seat that writes its report and then has its phase move refused, for a dirty worktree or a trailer, counts as no-report under every option here. Should a refused move attempt read as a report for this budget?

N2. Codex moves long commands into a background terminal while its main turn can end. Does `seat.turn` move the same way for codex and agy as for claude, and does the Q2 live run match see a codex background run at all when the command was not launched through run-check by the seat itself?

N3. When one slot reports and the phase moves, both slots reset. Inside check.review with no move yet, should slot A finishing into `done` stop slot B silent turns from counting against a shared phase outcome, or is per slot counting right?
