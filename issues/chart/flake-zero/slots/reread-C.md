**Pick: O3 — one non-blocking recovery read on a caller-owned timer at `Math.min(Math.floor(ms / 2), 5000)` inside `waitFor` (`src/hc.ts:507-543`), `waitForDoc` (`:547-580`), and `tests/hc-fixture.ts:356-402` (no heartbeat `reread`).**
- Why not O1: couples recovery to `hc 0.1.22`'s 15,002 ms heartbeat, breaking `place()`'s 15,000 ms `PANE_WAIT_MS` (F2, `src/seat.ts:43,243-253`).
- Why not O2: burns the full 90 s `WAIT_MS` per drop in tests, and breaks two-step `agyTask` (`src/seat.ts:142-176,218`), where recovering `blocked` at deadline leaves 0 ms to send the task and prove start.
- Why not immediate post-snapshot read alone: adds an `hc get` to 100% of normal waits, and `waitForDoc` already reads on snapshot (`src/hc.ts:572`) yet can still miss a change right after it.
- Mechanism: arm one timer after the snapshot at `Math.min(Math.floor(ms / 2), 5000)` ms (cancelled on settle, so normal fast waits do 0 extra reads). When it fires, run `terminal()`/`docGet()` **outside** `follow`'s `onEvent` callback (`src/hc.ts:459`), capturing an event counter before the read and discarding the result if `settled` is true or any real stream event arrived while in flight (closes F1: events never block and `agyTask`'s side-effecting predicate at `src/seat.ts:145-171` never runs after settlement or on stale state). Pass `{ terminals: [fresh] }` to `until` so no `reread` line kind is needed.

**Losses still left:**
- A drop occurring *after* the single recovery read fires (e.g., at 20 s of a 60 s wait) is not recovered unless the timer repeats while silent (or pure waits also do one read before `ms`).
- `src/listen.ts:84-99` uses `follow` directly, not `waitFor`: a turn dropped *after* its snapshot-triggered `next --resume` still waits for a later event or core restart (same as `e7e8b058`).
- A dropped startup event adds up to `min(ms / 2, 5000)` ms latency, and a hung `terminal()`/`docGet()` still expires at `ms`.

**Delete from `e7e8b058`:**
- `reread` from `HcMessage` (`src/hc.ts:379`), the `reread` flag and `method === 'heartbeat'` branch in `hcReader` (`src/hc.ts:391,399,402-405`), and the `'reread' in ...` branches in `lineOf` (`:433,435`), `waitFor` (`:526-527`), and `tests/hc-fixture.ts:385-389`.
