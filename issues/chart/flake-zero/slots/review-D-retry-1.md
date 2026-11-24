# Slot D retry-slices review, round 1

Verdict **fix** for `54566384` on `7aafd2eb`.

- **F1. A pending launcher can recreate the slice after the sweep.** The ledger is written before launch. If the worker dies before its launcher registers the slice, the sweep stops a name that does not exist yet and deletes the runtime. A launcher that survives the worker can then register the slice. I held a private launcher before its real `systemd-run` call, killed its owner, and swept the ledger. After release, `systemd-run` exited 0 and the slice was active with no runtime left for the next sweep. Coordinate pending registration with ledger removal. See `tests/hc-fixture-retry.test.ts:42–58` and `tests/hc-fixture.ts:45–54,176–184`.

The new name places the slice directly under the shared retry slice. In a separate replay, I killed the owner after registration and the sweep stopped the slice and removed the runtime. Both replays used private slice names and cleaned them up.

All seven fixture retry tests, typecheck, and diff check passed. I relied on the supplied full verify and guard results.
