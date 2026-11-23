# Slot D review of session-flake, round 4

**Verdict `fix`** for `9f2cfc05` on `814a2387`.

## Findings

- **F8 · `tests/hc-fixture.ts:44–52, 246–252`**. A runtime can lack a daemon record even after the current fixture has started a live daemon. I ran the real `hc server start`, held its successful reply and killed the fixture worker before it wrote the record. The socket was reachable and the daemon PID was live. The sweep removed the runtime while the daemon kept running. The same probe on `eeb57f0b` stopped the daemon through its socket. Recover a reachable daemon in a runtime without a record before discarding it. This can occur during startup on the new head as well as with older leftovers.
- **F9 · `tests/hc-fixture.ts:71–81`**. The stop wait bound starts after the `hc server stop` subprocess returns. I suspended a private real daemon and called `core.stop(2000)`. At 3.2 s it was still pending with the runtime intact. Resuming the daemon let the original call finish. Use the teardown deadline for the stop command and the subsequent PID check, keeping the runtime available on expiry.

## Re-check

**F5 and F7 pass for recorded daemons.** The checked-in missing-socket retry passed. In the abandoned-sweep replay, a nonzero shutdown and an exit 0 with `stopped:false` each left the same daemon, runtime and valid slice ledger intact. Both retries completed after restoring access. The slice-stop retry also passed.

All 71 focused tests passed across eight files. Typecheck and `git diff --check eeb57f0b..9f2cfc05` passed. The supplied full Verify log records 1,381 passing tests. Probes used private cores and disposable worktrees.
