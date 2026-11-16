# turn-count, slot A notes (blind)

Q1 pick: count once in `dispatchSlot` (src/next.ts) at the existing silent-stop point (prompted turn ended, slot not done, phase unchanged): n = attempts[slot] + 1, saved; n >= 3 fails with the existing reason, else redeliver. Remove the +1 in `deliver` and in `startSeat` (src/seat.ts). Normal case keeps its fail point (3 silent turns). Rejected: keep delivery counting and skip boot starts (needs a boot detector, other pre-turn losses still count). Evidence: better-than-training, src/next.ts dispatchSlot and src/seat.ts startSeat read 2026-11-16. Pitfall: a turn end seen by two wakes counts twice; removed by saving `prompted` turn as consumed in the same write as the count.

Q2 pick: dispatch skips counting and redelivery while `liveRuns()` (src/admission.ts) holds a live or waiting record with the leaf's repo and slug, so a seat waiting on its own run-check run is not failed. Cost: a hung run parks the leaf with an idle seat; removed by letting that wait count as busy for `observeBusy`'s existing 60-min notice. Rejected: rely on the implement-issue foreground rule only (already broken once, #136). Plain background shell jobs stay invisible: stated limit.

Q3 pick: one new state field `lost: {A?, B?}` per slot holding `count` plus the last loss evidence (Q4). +1 when dispatch replaces a seat whose prompted turn never ended (terminal finished or gone, `seat.turn <= prompted.turn`). At 3 the leaf fails with the existing cause `attempts` (keeps every downstream rule in next.ts and the watch) and reason "seat <S> was lost 3 times before ending a turn". Reset to 0 when a prompted turn is seen ended, and on phase move with attempts (src/phase.ts). Rejected: time window (clock state, tuning), no bound (signpost 4a).

Q4 pick: before `end` kills and removes a finished seat, record in `lost[slot]` its address, `exit_code`, `signal` and the last 40 screen lines from `hc read`, with time. A gone terminal records address and "terminal gone". Evidence: hc schema RunResult has exit_code and signal fields (hc 0.1.21).

Q5 pick: no migration. Stored values count deliveries, which is at most as harsh as today; the next phase move resets them. Stated in the leaf.

Question the fork does not ask: should the boot `next --resume` wait for the session (the 10:30:17 refusal)? A: no, it retried fine.
