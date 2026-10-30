# run-lifetime final-shape check 2, slot B (round 1, A's autopilot pick, after your C1-C3)

A adopted C1-C3. One focused check of the changed points below: name each part that is wrong, missing or contradicts the code, with evidence, or say "none". Do not edit other files.

Reading rule: read process text by named section, batch independent reads with bounded output, read content you already hold at most once per session; unread, changed or compacted content stays readable; full source stays allowed when it is the subject (src/verify.ts, src/stop-run.ts, src/admission.ts, src/scope.ts, src/land.ts, src/reconcile.ts, src/run-check.ts). Name sections, never line ranges.

## Final shape v2 (changes since v1 marked [C1], [C2], [C3])

1. [C1] Each verify pass (one `runOnce`) runs in its own systemd user transient service launched like `src/land.ts` `launchLand`, placed in `akrogon.slice`, not a leaf slice. Its checks keep today's placement through `checkedRun` (leaf slice, or `akrogon.slice` for the `checkout` holder target). Reconcile rules are unchanged: the live-run veto keeps running and waiting checks, and the pass itself is never a slice-stop target. The calling `akrogon verify` only waits and prints. Killing the caller, its process group or its pane scope leaves the pass running.
2. [C3] The pass carries the starting caller's scope (`callerScope()` in the caller), so every check record it creates keeps that scope as owner, exactly as today. Plain `akrogon stop-run` and `stop-run <check run id>` behave as today. New: `akrogon stop-run <verify run id>`, authorized by the same scope match, stops the whole pass service: the current check, later checks and any waiting admission. Ordinary run-check cancellation is unchanged.
3. [C3] Join key: the caller target as `verifyCaller` resolves it (leaf folder, or the exact holder path for `--holder`, so distinct holders never share), plus tree, scope, exact command set and `compares` link. A repeat `akrogon verify` joins only a pass whose service is active. Anything else starts its own pass.
4. [C2] The waiter ends when the receipt has `end` or the pass service is no longer active, already collected included. It prints the same per-command lines and exit code an attached run prints, and returns non-zero for a receipt with no `end`. A dead pass is never joined.
5. At most one live pass per join key, proven by a done-criterion. Admission policy unchanged.
6. Receipts: no `end` still means incomplete and never reused. No reason field, no signal handler. Completed-receipt gates unchanged.
7. The existing test "a run killed during setup leaves a record with start and no end or removal" encodes the old caller-bound lifetime. The leaf owns changing it.

Return to exactly: /home/ivan/Work/infra/akrogon/issues/chart/verify-lifetime/slots/run-lifetime-final-check-2-B.md
