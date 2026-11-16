# What spends a seat's no-report budget, and what bounds lost seats

## Question

Q1. Where is a no-report turn counted? Today `startSeat` (src/seat.ts) and `deliver` in `dispatchSlot` (src/next.ts) add 1 per start or delivery, while the fail move's reason says "ended N turns without reporting".

Q2. Does a turn that ends while the leaf has a live run-check run (src/admission.ts `liveRuns`) count, or does dispatch wait for that run?

Q3. What bounds a seat that keeps getting lost (process gone, terminal finished) before it ends a turn, once starts stop spending attempts?

Q4. What evidence of a lost seat is kept before `end` (src/hc.ts) kills and removes its terminal?

Q5. What happens to `attempts` values already stored under the old rule in open leaves of every repo?

### Carries

- Signposts 4a (only an observed turn ending without a report spends the budget; a separate bound still stops a start loop), 1a, 5a, 6a, 7a. Hard limits: never erase lost-seat evidence or remove every restart bound (B L2, C L2).
- Reports #136 and #137 (INTAKE.md). Map files: slots/map-A.md, slots/map-B.md, slots/map-C.md.
- Related forks: forks/failed-refusal.md (run-check refusal), forks/blocked-prompts.md.

## Findings

Blind notes: slots/turn-count-A.md, -B.md, -C.md; merged: slots/turn-count-merged.md; rebuttals: slots/turn-count-rebuttal-B.md, -C.md.

- Research (better-than-training, src/next.ts dispatchSlot/deliver, src/seat.ts startSeat, src/admission.ts liveRuns, src/listen.ts onLine, src/phase.ts reset, read 2026-11-16): the counter counts deliveries while the fail reason claims silent turns; listener wakes only on hc terminal events, no timer (A,B,C).
- Claude moves a shell command past its 600 s tool limit into the background and notifies the session when it ends, which starts a new turn (A observed on its own session 2026-11-16; framework captures last up to 806 s, C). So background waits on long runs are unavoidable for claude seats, and the seat's own completion turn wakes dispatch.
- Free probe (A, 2026-11-16, hc 0.1.21): `hc get --json` on finished throwaway terminals shows `exit_code: 3` for `sh -c 'exit 3'` and `signal: 15` for a SIGTERM-killed `sleep`; both removed, absence confirmed with `hc ls --all`. src/hc.ts terminalSchema does not parse them today (B).
- Rebuttals: C adopts A's Q1 guard and A's Q3 shape (C R1, R3). B holds a completion wake (B R1), no age expiry (B R2), per-identity charge (B R3), notify-only classification (B R4), a one-time migration (B R5), durable per-loss evidence before teardown (B R6). C notes the global lock serialises passes (C R3) and that exit code and signal need parsing (C R4).

## Taken

A's picks under full autopilot (2026-11-16, door t126), not operator words.

1. Q1: count once at the silent-stop point in `dispatchSlot`: in one state write add 1 to `attempts[slot]` and clear `prompted[slot]`, then fail at 3 with the existing reason or redeliver. Remove the +1 in `deliver` and in `startSeat`. Reason: the reason text becomes true by construction (signpost 4a), and clearing `prompted` in the same write removes the double charge with no new field. Rejected: B's `counted_prompt` cursor (an extra field for the same guard).
2. Q2: skip both counting and redelivery while `liveRuns()` holds a live or waiting record whose `repo` and `leaf` match the leaf. The wake after the run is the seat's own completion turn. No completion wake and no age expiry. Reason: long runs must background on claude, and the seat's own turn already wakes dispatch (signpost 1a, fewer parts). Stated limits: a harness that takes no turn when its background run ends waits for the next hc event in the repo, and a hung live run holds the leaf until it ends or is stopped. B's completion-wake dissent stands.
3. Q3: one new per-slot count `lost` (the `counts` schema, prefaulted like `attempts`). Add 1 before each replacement start of a seat whose prompted turn never ended (terminal finished or gone). At 3 the leaf fails with cause `attempts` and reason "seat <S> was lost 3 times before ending a turn". Reset to 0 when a prompted turn is seen ended, and on every phase move beside `attempts`. Reason: it bounds paid restarts the way attempts always did and keeps every downstream rule (C R3 agrees). B's dissent on cause and per-identity charging stands, answered by C R3: passes serialise and a failed start counts as the same class.
4. Q4: before `end` removes a lost seat, append one timing row `seat_lost` through `appendTiming` with slug, slot, phase, address, turn, status, `exit_code` and `signal` (absent when hc gives none) and the last 40 screen lines, or `gone: true` when the terminal is already missing. Parse `exit_code` and `signal` in src/hc.ts terminalSchema. Reason: one row per loss in the log that reports already read, with no new artifact class. B's dissent on best-effort append stands.
5. Q5: no migration. Old counts reset at the next phase move. The leaf report names open leaves whose stored attempts are 2 or more at merge, including framework competition-read-skill (A=4). Reason: a permanent marker field for a one-time reset is the larger part (C R5). B's dissent (B R5) stands.

Final-shape check (slots/final-check-B.md, slots/final-check-C.md), A's correction 2026-11-16, adopted without a further check because it narrows the charge condition and adds no mechanism:

- Q3 corrected (C D1): the `lost` charge keys on a recorded seat in `state.seat[slot]` being replaced because its terminal is finished or gone, not on `prompted[slot]` existing, so a seat that dies during the start proof or times out its delivery is charged too. `lost` resets to 0 whenever `dispatchSlot` observes a turn end (the silent-stop point) and on every phase move.

Leaf review (slots/leaf-review-B.md, slots/leaf-review-C.md), 2026-11-16: A adopted every defect into the leaf contracts except moving #137 out of refuse-failed-runs (C S1), which the one-completion-owner rule forbids; the listener PATH crash stays Off route by the reporter's own words.
