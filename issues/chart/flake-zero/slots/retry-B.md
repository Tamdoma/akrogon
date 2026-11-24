# Retry B: flake-zero

Read at retry-slices head 54566384. (H) marks what I ran on this host on 2026-11-24 in throwaway user units (`akrogon-probeb9-*`, all stopped). Nothing in the repo changed.

1. Recommendation: O1. Keep ledger-first and accept F1.
2. F1 is not new with this commit. Every fixture seat is launched the same way: `tests/core-bin/systemd-run` appends the slice to the ledger and then starts the real `systemd-run` (`:6-12`). A fix for F1 in this one test would leave the same window on every seat, so the test would be the odd one.
3. F1 needs three things at once. A worker dies while its runner lives. That happens during the launcher of this one test, which took 17 ms here (H). And the launcher is still pending after another worker's sweep has stopped the dead worker's core, which is an `hc server stop` plus a wait in 50 ms steps (`tests/hc-fixture.ts:154-171`), before it reaches the ledger. D needed a frozen launcher to get there.
4. What F1 costs: one empty slice under `akrogon-retry.slice`. No test fails, so it is not a flake. One `systemctl --user stop akrogon-retry.slice` removes any such leftover.
5. Not O2. Its window is wider: any kill between the launcher's return and the record leaks, with no sweep needed.
6. Not O3. A scan of process command lines is a second liveness check beside the owner pid, and it races the same way: the launcher can start after the scan.
7. Q2, O4: I found none that fits. systemd has `StopWhenUnneeded=yes`, which stops a slice when its last unit is gone. `systemd-run` cannot set it on a slice, so it takes a raw D-Bus call. Probe (H): a transient slice with it, made alone, was inactive within 0.3 s. A scope started right after got a plain slice without the setting, which stayed active after the scope ended. Slice and scope would have to be made in one D-Bus call.
8. It also does not fit the test. The test needs an empty slice that stays until the core's stop removes it. That is what a leaf slice does, and it is what the last assertion proves.
9. If the rule must hold exactly, the shape I would pick is the name as the record. The slice name already carries the owner's pid (`akt<pid>_<n>`), so a sweep can list `akrogon-retry-akt*.slice` and stop those whose owner is dead. Record and creation are then one act, and a launcher that registers late is found by the next sweep. It is about 8 new lines for this test only, so I would not add it now.
10. Main risk: a leftover slice from F1 stays until someone looks. One slice does no harm. The harm on record came from tens of thousands (`tests/hc-fixture.ts:173-174`).
