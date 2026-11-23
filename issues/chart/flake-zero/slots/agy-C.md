**Agree with A's proposal.** Snapshot `terminal()` reread belongs only to state-only waits; `agyTask` (`src/seat.ts:142-173`) skips it.
- Reject O1: after an `unavailable` first `send`, the replayed `idle` event from the same report triggers an immediate spurious retry instead of waiting for the next status report (`src/seat.ts:153-169`).
- Reject O3 for now: blocked on upstream `hc`; file separately (`seq` on `hc get` or `status_ms` on `status` events) for exact dedup later.

**Fewest-moving-parts split (no caller flag):**
- In `src/hc.ts:491-533`, delete `before` and `Bun.deepEquals` (`:513,:522`) and keep one private `watch(session, address, reread, until, ms)` sharing `merged`, timer, `settled`, and `stream.ended`.
- Narrow `waitFor(session, address, until: (t: Seen) => boolean, ms)` to `reread = true`, pure state-only (every other caller in `src/` and `tests/e2e/` is already sync state-only; replays are harmless and the signature blocks `line`/side-effect misuse).
- Add `waitForEvents(session, address, until: (t: Seen, line: HcLine) => boolean | Promise<boolean>, ms)` with `reread = false`, used only by `agyTask` (`src/seat.ts:142`), restoring repeated-`idle` retries (F3).
- Also close F4 in `tests/hc-fixture.ts:364-400` by adding a `settled` guard checked after `await get(address)`.

**Loss left:** a `blocked`/`idle` report dropped by `hc 0.1.22` during `agyTask`'s own subscription startup is not reread, so `agyTask` waits for the next report or hits `START_PROOF_MS` (`null`). Real `agy` takes seconds to boot (0 observed flakes there); main residual exposure is a fast standin in `tests/hc-delivery.test.ts` racing `agyTask` startup.
