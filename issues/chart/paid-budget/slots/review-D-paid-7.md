# Slot D review of paid-budget, round 7

**Verdict `fix`** for `38308408` on `814a2387`, before the session-flake rebase.

## Findings

- **F10 · `tests/e2e/watch-consults.e2e.ts:436–455`**. A red selected before the deadline now disarms the kill timer before collecting screens. I returned an immediate send failure and held the first diagnostic screen read for four seconds with a 2.4 s budget. The result stayed red, but the fake watcher's last heartbeat was 1.86 s after the cutoff. On `49b32bcf` the same probe kept the red and stopped the heartbeat at the cutoff. Keep the deadline stop effective through diagnostics while preserving the selected red.
- **F11 · `tests/e2e/watch-consults.e2e.ts:202–207, 252–280, 450–455`**. The known pre-connect window permits a paid start after the deadline. My launch client entered the shim before the cutoff, then connected 1.87 s after it. Real `hc run` started a fresh core and the fake watcher ran. The deadline result and final empty absence list both passed. Prevent the pending launch from auto-starting a replacement core once the deadline has fired.
- **F12 · `tests/e2e/watch-tier.ts:188–197, 211–214`**. `stopCore` can hang or report success while the original daemon and its terminal program live. I moved a private core's socket aside. The unbounded probe timed out at 20 s. With a 1.5 s cap on the real status subprocess, it was killed with no output and `stopCore` returned true while both PIDs were alive. Record the daemon identity at startup, bound the stop requests, and confirm that identity has exited before reporting success or removing state.

## Re-check

The original F8 and F9 shapes pass. The checked-in test with an already-started watcher's buffered launch reply stopped the watcher with the first core. The removed-watcher test kept the deadline outcome without a teardown error. Both passed in isolated sessions.

All 175 focused tests passed. Typecheck and `git diff --check 49b32bcf..38308408` passed. The supplied logs record all eight deadline cases and 1,358 full Verify tests passing. All probes used private sessions and stand-ins.
