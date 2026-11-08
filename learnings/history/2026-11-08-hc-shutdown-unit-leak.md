# hc leaks a systemd unit per core stop

## Case

After the switch to hc (engine-on-hc merged at ~01:50Z, 2026-11-08), verify `test` runs on chart-door-on-hc, watcher-on-hc and notices-on-hc started green and turned red over the night: chart-door-on-hc 5 of 5 red on `3ffe7422` and 2 of 2 on `59638e5d`, watcher-on-hc 7 of 7 red on `d97290ff`, base `d40c1556` red too. 24 of 26 failures in one run were `this test timed out after` 15000 or 30000 ms, on varied tests (dispatch, capacity, holder, merge cleanup, session routing); the set changed every run, and each file passed alone.

## Evidence

- `systemctl --user list-units --all` at 05:25Z held 32,904 units, 32,482 of them `hc-shutdown-<16 hex>.service` in `active exited`, growing by about 60 a minute while suites ran (32,548 a minute later, 32,575 shortly after).
- One unit: `Description=[systemd-run] /bin/sh -c :`, `Type=oneshot`, `RemainAfterExit=yes`, `CollectMode=inactive-or-failed`; the oldest seen dated 2026-11-07 21:30 CET. `strings $(which hc)` holds `hc-shutdown-`; akrogon's source does not.
- akrogon's reconcile pass calls `systemctl list-units ... --output=json` (src/reconcile.ts:137) and `systemctl show` per slice (:154); with 4 test files in parallel each starting real cores and `next` passes, every call reads the whole unit table from the single-threaded user manager.
- `ListUnits` over D-Bus took 95 ms and `systemd-run --wait /bin/true` 51-81 ms on an idle host with the leak present; not yet measured after clearing.

## Learning

A test suite that starts real hc cores must check the user manager's unit count, not only load and memory: RemainAfterExit units from a dependency accumulate silently across runs and slow every systemd call. Clearing the leaked units and rerunning base verify is the test of this cause; the durable fix is hc not leaving the unit (no RemainAfterExit, or `--collect` with an exit), or a herdr-setup patch until upstream changes.

## Confirmation (2026-11-08 07:40Z)

The operator stopped the leaked units at ~07:30Z (32,575 to 18). The next `akrogon verify` on chart-door-on-hc and on watcher-on-hc, both red 5 to 7 times before on the same heads apart from the reverted timeout commit, went green and both leaves moved to `check.review`. The two suites left 1,016 new `hc-shutdown-*` units, about 500 per full test run.
