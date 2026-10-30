# Slot B final-shape check 2

**C4. Points 2–3 leave cross-scope joining undefined.** Two panes in the same leaf can have the same target, tree, verification scope, commands and compares link, so point 3 joins them. Point 2 retains only the starting pane's scope as cancellation owner. The second pane therefore cannot stop the pass it joined. Include the starting caller scope in the join key, or explicitly choose observation-only joins across scopes and state that cancellation remains with the original scope. Do not silently grant another scope cancellation authority.

Evidence tier: inspected code and concrete-case inference, 2026-10-27. `src/run-check.ts:leafTarget` resolves both panes' worktree to the same target. `src/verify.ts:verifyScopeSchema` defines verification scope as leaf/merge, distinct from `src/admission.ts:callerScope`. `src/stop-run.ts:stopRunCommand` refuses another caller scope. `tests/run-units.test.ts`, “stop-run stops only the caller pane scope runs”, explicitly covers that refusal.

**C5. Point 4 can return before the attached run's outcome is known.** `runOnce` writes the receipt's `end` before sending notices and removing the checkout. Checkout removal can still throw. An attached invocation then fails, while a waiter returning immediately on a green receipt's `end` reports success. Wait for service termination as well as inspect the receipt, and preserve failures after receipt publication. A collected service plus a completed receipt alone does not prove the service exited successfully. Include a failure after receipt publication in the exit-parity criterion. No receipt-schema change is required by this finding.

Evidence tier: inspected code and control-flow inference, 2026-10-27. `src/verify.ts:runOnce` rewrites the receipt inside finally, then awaits `sendMainRedNotice` and `git worktree remove`, and only afterward returns to `reportRun`. `src/shell.ts:command` throws on a nonzero command result. `src/land.ts:launchLand` supplies the proposed `CollectMode=inactive-or-failed` behavior.

Other changed parts: none. C1–C3 are resolved by the revised shape. No runtime tests were run.
