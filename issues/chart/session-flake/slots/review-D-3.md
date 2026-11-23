# Slot D review of session-flake, round 3

**Verdict `fix`** for `eeb57f0b` on `814a2387`.

## Findings

- **F5 remains open · `tests/hc-fixture.ts:45–53, 371–379`**. The new guard catches nonzero exit and an accepting socket. A live daemon with a missing socket path still looks stopped. I moved a private core's Unix socket aside without a listener at the old path. Real `hc server stop` exited 0 with `{"stopped":false}`. `core.stop()` returned normally and deleted the runtime and valid slice ledger while the original daemon PID was alive. Confirm the original daemon has exited before discarding its cleanup state. A slice-stop retry after a confirmed daemon exit should still work.
- **F7 · `tests/hc-fixture.ts:56–66`, `tests/hc-fixture-retry.test.ts:64–77`**. The abandoned sweep still discards the runtime after an unchecked shutdown. In a private sweep root I gave a live core a dead worker owner and refused its shutdown with exit 91. I also modeled an interrupted retry test by moving the socket to `.aside` under the runtime. In both cases the sweep returned normally, removed the ledger and left the same daemon alive. Apply the shutdown check to abandoned cores too, and restore the retry test's socket in its failure cleanup.

## Re-check

- **F6 is closed for the original malformed-ledger repro.** The retry now writes a valid ledger and simulates refusal through systemctl. Both checked-in retry tests passed. A separate nonzero `hc server stop` probe also rejected the first stop, preserved the runtime and completed on retry. The sweep still reports a slice-stop error.
- **Caller-scope proof.** I delayed scope launch by 1.2 s after admission in a disposable copy. The caller-scope test passed with `waitActive`. Removing that wait made `stop-run` exit 1.

All 70 focused tests passed across eight files. Typecheck and `git diff --check 159069b3..eeb57f0b` passed. The supplied full Verify log records 1,380 passing tests.
