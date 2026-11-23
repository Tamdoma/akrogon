# Slot D review, hc-follow, round 4

Verdict ready

- Base `40a577709865b03cdd640bbecb8475458515faa9`
- Head `c689573b23b0adfd543783719673ab32c5c11424`

**F6 fixed.** I replayed the round 3 injection through the shared fixture's wait on a real hc subscription. After a recovery snapshot showed turn 2 working, idle statuses below and at the snapshot sequence both left the wait open until it timed out. Adding an idle status one sequence above the snapshot satisfied the wait, and its payload confirmed it was the fresh status.

`follow`, the fixture, door exchange and observe each create one reader per stream (`src/hc.ts:384–402,435`, `tests/hc-fixture.ts:295–301`, `tests/door-exchange.test.ts:103–110`, `tests/hc-observe.test.ts:76–83`). In a two-reader probe, recovery at seq 12 suppressed seq 2 only on that reader. The second reader, whose snapshot was at seq 1, delivered the event.

All 62 tests across identity, listener, observe, delivery, window calls, door exchange, door reset and hc-start passed on hc 0.1.22 with `--timeout=120000 --max-concurrency=5`. `bun run typecheck` and `git diff --check 40a57770..c689573b` passed.
