# turn-count merged notes (A, B, C)

## Q1 counting point
- Count once at the silent-stop point in `dispatchSlot` (src/next.ts): a prompted turn seen ended with no phase move; remove the +1 in `deliver` and in `startSeat` (src/seat.ts); limit stays 3, so a seat still gets 3 prompts and fails after the third silent turn end (A,B,C).
- Double charge across wakes or a failed redelivery: (A) clear `prompted[slot]` in the same write that adds the count, so a later pass delivers without counting; (B) a persisted `counted_prompt.{A,B}` cursor; (C) accept a recount only when the turn really moved again.
- A missing terminal is never completed-turn evidence (B).
- Evidence: better-than-training, src/next.ts dispatchSlot/deliver, src/seat.ts startSeat, 2026-11-16 (A,B,C); framework log 2026-11-15T21:36:56Z attempts A=3 (B,C).

## Q2 live run-check run
- Skip counting and redelivery while `liveRuns()` (src/admission.ts) has a live or waiting record for the leaf's repo and slug (A,B,C). Match by repo and leaf only; no slot field exists (C).
- Hung run: (A) let the wait feed the 60-min busy notice; (C) honor the run only while its `since` is within `STALL_MS`; (B) add a completion wake (`next --wake`) after the outer admission record is removed.
- Wake after the run: no listener event comes from a run-check scope (src/listen.ts wakes on hc terminal events only; no timer). A seat that takes a turn when its background run ends (claude) wakes dispatch itself; another harness waits for the next hc event (A).
- Rejected: fixed grace time (runs last seconds to 806 s, C); infer from check_start without check_end (B).

## Q3 lost-seat bound
- A separate per-slot count, persisted, of seats lost before ending a prompted turn, +1 before the replacement start (A,B,C differ in shape):
  - (A) `lost` count, fail at 3 with cause `attempts` and reason "seat <S> was lost 3 times before ending a turn"; reset on an observed turn end and on phase move.
  - (B) `seat_losses` plus `lost_seat` identity so one old seat is charged once; fail at 3 with cause `blocked`, so the watch notifies instead of auto-recovering.
  - (C) `starts` plus `starts_at`, 3 per 10 minutes; past it skip the start and send one attention notice, no fail.
- All reset on phase move (src/phase.ts) and when a turn end is observed (A,B,C).
- Rejected: derive from timings (C), listener debounce (C), no bound (A,B,C).

## Q4 lost-seat evidence before `end`
- (A) state field with address, exit code, signal, screen tail; (B) append-only `<leaf>/implementation/seat-events.jsonl`, written before teardown, failure keeps the terminal; (C) reuse `delivery_error` with new code `lost`, written after the start because the launch clears it (latest loss only).
- hc get --json shows `exit_code` and `signal` fields on a terminal (A observed on t126, 2026-11-16); src/hc.ts terminalSchema does not parse them today (B).
- A gone terminal records the address and "terminal gone", no invented cause (A,B,C).

## Q5 stored attempts
- (A,C) no migration: old counts are never lower than the new rule's count, phase moves reset them; the leaf report names the seam. Named case: framework competition-read-skill at A=4 fails at its first silent turn end, same as today (C).
- (B) lazy migration with marker `attempts_rule: ended-turns`, resetting old counts once at first dispatch.

## Points where slots differ
Q1 double-charge guard; Q2 hung-run handling; Q3 shape and failure cause; Q4 where evidence lives; Q5 migration.

## Open questions raised
- A refused phase move (dirty worktree) counts as no report (C N1).
- Does codex's turn counter move like claude's when it backgrounds a command (C N2)?
