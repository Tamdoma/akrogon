# run-lifetime final-shape check, slot B (round 1, A's autopilot pick)

A picked `1a 2a 3a`. Do one focused check of the final shape below: name each part that is wrong, missing or contradicts the code, with evidence. Say "none" if it holds. Do not edit other files.

Reading rule: read process text by named section, batch independent reads with bounded output, read content you already hold at most once per session; unread, changed or compacted content stays readable; full source stays allowed when it is the subject (src/verify.ts, src/stop-run.ts, src/admission.ts, src/scope.ts, src/land.ts, src/reconcile.ts). Name sections, never line ranges.

## Final shape (corrections from the merged notes marked [new])

1. Each verify pass (one `runOnce`) runs in its own systemd user transient service, launched like `src/land.ts` `launchLand` (`--slice` = the leaf's slice, `CollectMode=inactive-or-failed`). The calling `akrogon verify` process only waits and prints. Killing the caller, its process group or its pane scope leaves the pass running.
2. [new, B2] The pass records its owner (the caller's leaf target, as `verifyCaller` resolves it) at start. `akrogon stop-run <verify run id>` from that leaf stops the whole pass: current check, later checks and a waiting admission. Another leaf is refused, like stop-run today.
3. [new, B3] A repeat `akrogon verify` joins a live pass only when owner, tree, scope, exact command set and `compares` link all match. It waits for that pass's `end` and prints the same per-command lines and exit code an attached run prints. Anything else starts its own pass. Completed-receipt gates (`completed`, `greenRun`, `reuseSource`, `requireGreenReceipt`, `knownRedReceipt`) are unchanged.
4. [new, B5] At most one live pass per join key, proven by a done-criterion. Admission policy is unchanged and is not called a host bound.
5. [kept against B2's last sentence] The pass stays in the leaf slice, so reconcile's slice stop when the leaf's tab is proven gone still ends it. A pane restart with the tab alive does not.
6. Receipts: no `end` still means incomplete and never reused. No reason field, no signal handler.
7. The existing test "a run killed during setup leaves a record with start and no end or removal" encodes the old caller-bound lifetime. The leaf owns changing it.

Return to exactly: /home/ivan/Work/infra/akrogon/issues/chart/verify-lifetime/slots/run-lifetime-final-check-B.md
