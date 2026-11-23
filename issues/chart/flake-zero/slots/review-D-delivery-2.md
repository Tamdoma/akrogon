# Slot D delivery-flakes round 2

Verdict **fix**. Reviewed `fe7e6361` on `14774a0e`.

- **F3. The equality check skips a real agy retry signal.** hc 0.1.22 emits a fresh `status: idle` event even when the visible status stays idle at turn 0. In a real-core replay of the existing refused-send test, I gated a second `idle` report until after the first send had been refused. A stream opened before the report showed snapshot seq 3 at idle, then a separate idle status at seq 4. The base retried, delivered one task and confirmed the start. This head logged one send and reported `started, not confirmed` after the 2.5 s proof budget. Preserve new status reports for agy when the payload matches the last report. The other product caller, the first-task proof, only checks terminal state and is safe to skip on equality. See `src/hc.ts:513–524`, `src/seat.ts:145–169,218–223` and `tests/hc-delivery.test.ts:479`.
- **F4. The fixture can call its predicate after the wait has rejected.** With a 150 ms fixture wait and `hc get` delayed 550 ms, the wait rejected on time and then called the predicate once. The same delay on the product wait gave zero late calls. Add the fixture settlement check after the snapshot read, as the design specifies. See `tests/hc-fixture.ts:364–400` and `src/hc.ts:517–524`.

The heartbeat path is gone. The product recovered a fresh turn from a `missed` snapshot after an empty initial snapshot. Its startup read still holds queued events until it returns, as the design accepts, and a late result cannot call the product predicate. F2 is closed by dropping the heartbeat dependency. Document placement reads on the snapshot, and the listener queues its resume on the snapshot.

Typecheck and 48 focused tests passed. The supplied logs show zero failures in 104 hc-delivery copies across 26 rounds, and 1,421 suite passes plus 40 repeat passes.
