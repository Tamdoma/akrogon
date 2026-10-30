# Run lifetime

## Question

Q1. When the seat command waiting on `akrogon verify` dies (tool timeout, pane loss, TaskStop), who keeps the run going?

Q2. With the run kept alive, what does a repeat `akrogon verify` on the same tree do, and how is an unwanted run cancelled?

Q3. What does a receipt with no `end` mean after the change?

### Carries

- Operator overnight-recs D3, 2026-10-15 (issues/chart/overnight-recs/CHART.md): pi keeps its 120 s default shell timeout, which bounds a forgotten timeout after a 59 min hang, and drops the 600 s ceiling. implement-issue runs slow commands once in the foreground with the tool timeout set above the expected run time.
- Related: issues/chart/verify-waste (handed off 2026-10-24, receipt reuse), issues/chart/host-run-load (admission).

## Findings

See [merged notes](../slots/run-lifetime-merged.md) and [B rebuttal](../slots/run-lifetime-rebuttal-B.md).

## Taken
A's autopilot pick, 2026-10-27: `1a 2a 3a`, refined by B's final-shape checks ([1](../slots/run-lifetime-final-check-B.md), [2](../slots/run-lifetime-final-check-2-B.md)). Labelled A's, not the operator's.

Binding shape:

1. Each verify pass (one `runOnce`) runs in its own systemd user transient service launched like `src/land.ts` `launchLand`, placed in `akrogon.slice`, not a leaf slice. Its checks keep today's placement through `checkedRun`. Reconcile rules are unchanged: the live-run veto keeps running and waiting checks, and the pass service is never a slice-stop target. The calling `akrogon verify` only waits and prints. Killing the caller, its process group or its pane scope leaves the pass running. (A; B C1)
2. The pass carries the starting caller's scope (`callerScope()` in the caller), so every check record it creates keeps that scope as owner, as today. Plain `akrogon stop-run` and `stop-run <check run id>` behave as today. New: `akrogon verify` prints its pass id before any check, and `akrogon stop-run <verify run id>`, authorized by the same scope match, stops the whole pass: current check, later checks and any waiting admission. (A; B C3)
3. Join key: starting caller scope, caller target as `verifyCaller` resolves it (leaf folder, or the exact holder path), tree, verify scope, exact command set and `compares` link. A repeat `akrogon verify` joins only a pass whose service is active and whose key matches. Anything else starts its own pass. (A; B C3, C4)
4. The waiter waits for the pass service to exit, then prints the same per-command lines and returns the same exit code an attached run would, including a failure after the receipt is written (main-red notice, checkout removal), and non-zero for a receipt with no `end`. A dead pass is never joined. (B C2, C5)
5. At most one live pass per join key. Admission policy unchanged and not described as a host bound. (A; B B5)
6. Receipts: no `end` still means incomplete and never reused. No reason field, no signal handler. Completed-receipt gates (`completed`, `greenRun`, `reuseSource`, `requireGreenReceipt`, `knownRedReceipt`) unchanged. (A,B)
7. The test "a run killed during setup leaves a record with start and no end or removal" (tests/verify.test.ts) encodes the old caller-bound lifetime; the leaf owns changing it. (A)

Reason: 1a removes the whole class (tool timeout, pane loss, task stop) with nothing for a seat to remember; the instruction fix of 2026-10-15 was in place for all 21 pi kills. 2a keeps one live pass per caller and keeps cancel rights where stop-run puts them today. 3a keeps receipts truthful without schema.

Rejected: 1b instructions only (probabilistic, already failed 21 times; B withdrew it in its rebuttal); 1c raise pi's default (reverses the operator's D3 answer); 2b joins across leaves (one leaf could hold or cancel another's evidence); 2c no join (double suites); 3b abandoned marking (schema without saved time).

Standing consultant dissent: none. B's rebuttal point that the pass should survive leaf-slice cleanup is met by point 1 (pass outside leaf slices, reconcile unchanged). C4 and C5 adopt B's own proposed fixes verbatim, so no third check ran.

Proof: [systemd-run survival probe](#proof-systemd-run-survival).

## Proof: systemd-run survival

- Command: `setsid bash -c "systemd-run --user --quiet --unit=akrogon-probe-verify-lifetime-b -p CollectMode=inactive-or-failed -p TimeoutStopSec=5 -- sleep 60; exec sleep 30" &`, then `kill -KILL -- -<pgid>` of the caller's process group, `systemctl --user is-active`, `systemctl --user stop`, `systemctl --user list-units --all 'akrogon-probe-verify-lifetime-b*'`.
- Identity: user ivan's systemd user manager on host omarchy, the same manager akrogon's run units use. No credential.
- Version: systemd 262 (262.1-1-arch). Date: 2026-10-27T07:37:22Z.
- Result: caller group SIGKILLed and dead; unit `active` after the kill.
- Cleanup: `systemctl --user stop` then `inactive`; 0 matching units listed.
- Limits: not run inside pi's bash tool, a Claude task stop or a herdr pane scope; not run with `--slice=akrogon.slice` or akrogon's env; proves only that a transient service outlives its caller's process group. A first probe at 07:37:07Z missed the group (wrong pgid) and is not evidence.
