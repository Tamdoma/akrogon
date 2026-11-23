# Slot D review of session-flake, round 2

**Verdict `fix`**

Base `814a2387`  
Head `159069b30d1a979f54119cfd3caf743f2447ff5b`

## Findings

- **F5 · `tests/hc-fixture.ts:61–66, :371–375`.** A refused core shutdown still discards a live core. I refused the first `hc server stop` on a private core. Fixture stop returned successfully, removed its runtime, and unregistered it while the same daemon PID was still live. A second stop skipped the core. Check the shutdown result and retain the cleanup state until the daemon has stopped.
- **F6 · `tests/hc-fixture.ts:56–80, :206`, `tests/hc-fixture-slices.test.ts:102–104`.** A malformed abandoned ledger can block every subsequent fixture startup. The retry test writes `not a unit` into a real ledger, so worker death before restoration leaves this state. I seeded that ledger for a dead PID in a private sweep root. Real systemctl rejected it, and two consecutive `hcCore` calls failed before startup. Both left the same ledger behind. Handle bad ledger entries without preventing unrelated cores from starting.

## Re-check

- **F1 and F2 closed for the original cases.** The ledger stopped the real slice after its terminal was removed, and the next worker stopped an abandoned worker's real slice. A labelled decoy with no launch ledger left the sibling's live seat alone.
- **F3 closed.** I delayed the idle stand-in's initial task write for both leaves past the three-second start-proof window. The checked-in inherited-terminal test passed. Its counts now wait for the status sent after the task write.
- **F4 closed for the original failure and the tested slice retry.** Stop no longer reads the terminal list. The checked-in test retried a failed slice teardown and completed. F5 covers a failed core shutdown.
- **Shared slice.** Two actual seat launches from separate cores in one fixture home wrote the same repo-and-leaf slice into both ledgers. Stopping one core killed the sibling's seat. I found no overlapping launches of that shape in the existing tests. The explicit session handoff stops the old core before launching the new seat (`tests/hc-identity.test.ts:67–103`), and the same-slug identity test uses separate fixture homes (`tests/fixture-repo-identity.test.ts:46–47`). Both tests passed.

All 42 focused tests passed across `hc-fixture-slices`, `session-reads`, `session-routing`, `hc-delivery`, `hc-identity` and `fixture-repo-identity`. Typecheck and `git diff --check` passed. The supplied full Verify log records 1,379 passing tests. Probes used private cores and disposable worktrees.
