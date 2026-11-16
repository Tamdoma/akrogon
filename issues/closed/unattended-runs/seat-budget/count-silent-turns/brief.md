# Brief: count-silent-turns

## What

The controller counts a seat's no-report attempts only when it sees a prompted turn end with no phase move, in `dispatchSlot` (src/next.ts). The +1 in `deliver` and in `startSeat` (src/seat.ts) goes away. The limit stays at 3 and the failure reason stays "seat <S> ended <N> turns without reporting". While the leaf has a live or waiting run-check record (`liveRuns()`, same repo and leaf), a seen silent turn end neither counts nor redelivers. A separate per-slot count `lost` bounds replacements of a recorded seat whose terminal is finished or gone. On the 3rd such replacement since the last seen turn end, the leaf fails with cause `attempts` and reason "seat <S> was lost 3 times before ending a turn". Before such a seat's terminal is removed, one `seat_lost` timing row records its address, turn, status, exit code, signal and screen tail.

## Why

Reports Tamdoma/akrogon#136 and #137. Today attempts count deliveries and starts while the failure reason claims silent turns. On 2026-11-16 two boot-time seat deaths took framework leaf competition-read-skill from 1 to 4 attempts with no completed turn. On 2026-11-15 a seat waiting on its own 150 s background run-check was failed after 3 re-prompts. A seat lost before ending a turn left no record of why, because `end` removed its terminal.

## Done-criteria

1. A seat that is started, re-prompted after two silent turn ends and then ends a third turn silently fails the leaf at that third turn end with reason "seat <S> ended 3 turns without reporting". A start or a delivery leaves attempts unchanged. The count moves only at a seen silent turn end, and a new phase starts at 0.
2. Repeated dispatch passes over one silent turn end count it once, including a pass where the redelivery send throws after the count was written.
3. While `liveRuns()` holds a live or waiting record for the leaf's repo and slug, a seen silent turn end leaves attempts unchanged and sends no prompt. After the record is gone, the next pass counts and redelivers as in criterion 1.
4. Replacing the seat recorded in state for the slot, when its terminal is missing or finished without a seen turn end, adds 1 to `lost[slot]`, including a seat that died during its start proof. A finished terminal whose turn moved past its prompted turn counts as a silent turn end under criterion 1 instead, with no loss charged. The 3rd replacement since the last seen turn end fails the leaf with cause `attempts` and reason "seat <S> was lost 3 times before ending a turn", and starts no further seat. A seen turn end or any phase move resets `lost` to 0.
5. Each replacement in criterion 4 first appends one `seat_lost` timing row with slug, slot, phase, address, turn, status, exit code and signal when hc reports them, and the last 40 screen lines. When the terminal is already gone, the row carries `gone: true` and no screen. The row is in `issues/timings.jsonl` before the old terminal is removed, and `readTimings` parses it.
6. A leaf state written before this change (attempts counted the old way, no `lost` field) loads and dispatches without error. `lost` defaults to 0 for both slots.

Criteria 1 to 6 are proven by the leaf's own tests at the existing controller boundary (a dispatch pass on the hc test core with the stand-in seat). Criterion 3 uses a run record written through the existing admission code, not a hand-made file. Criterion 1's test turns red under one deliberate break (the +1 restored in `deliver`).
