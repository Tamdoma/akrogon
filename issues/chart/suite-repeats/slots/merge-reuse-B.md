# Blind notes B: merge-reuse

Read 2026-11-01. No other seat's fork notes or fork Findings were read. No implementation or tests were run. Only this return file was written.

## Q1. Accept the leaf's completed green evidence at merge?

**Pick.** Yes, when the integration tree and required command identities are covered by completed setup-green evidence. Scope determines which commands merge requires. It should not independently invalidate a green result for an identical command on an identical tree. Keep scope on execution records.

Measured from issues/verify-runs.jsonl, excluding compares records, since 2026-10-26: 17 merge head runs, 13 with an earlier completed all-green leaf run on the same tree and identical ordered name/command list. Those 13 runs cover 11 distinct leaves, total 937.108 seconds, median 70.513 seconds. Median across all 17 is 69.935 seconds. This is about one minute saved on an eligible merge, not one minute on every leaf or a measured future throughput improvement. The total includes later retries that might disappear if their first run disappeared.

**Rejected options.**

- O1: Always rerun by scope. The scope word adds no code or command coverage in the measured same-tree cases. Its useful extra effect is another opportunity to detect nondeterminism, which must be named as a separate purpose.
- O2: Delete the merge gate, or accept any green leaf receipt regardless of merge's command set. This permits untested integration changes or missing merge-only checks.
- O3: Add a reuse age, operator switch or periodic mandatory rerun. None is requested or supported by a measured expiration requirement. It adds policy instead of removing the duplicate lookup restriction.

**Evidence.** Tier operator: INTAKE.md, “Scope” and “Source: operator 2026-11-01 w8:pNP,” especially Messages 5–6. Tier better-than-training: the JSONL comparison above, measured 2026-11-01; src/verify.ts:113, :127, :134 and :157. History inspected with git show c00246dd, git show 5d0b505f and git show 9aaed138: the October 14 implementation originally shared greenRun between verify and the gate. The October 25 repair restored scope restrictions after the later gate implementation no longer shared that rule. This is evidence of divergent eligibility logic, not evidence that a same-tree green result itself is invalid.

**Pitfalls and removal.**

- R1: Two eligible second executions were red, on slow-merge-notice and peer-pane-anchor, then green again on the same tree. Reuse removes those additional observations. Accept that tradeoff explicitly. Do not promise identical flake detection.
- R2: Rebasing can produce a new integration tree even when the leaf's own commits did not change. Continue resolving the requested HEAD tree at the gate. Commit ancestry or “no leaf edits” cannot substitute for tree equality. Sources: src/phase.ts:677, :749.
- R3: Tree and command text do not describe changes in secrets, external services, time or AKROGON_BASE. That assumption already exists in same-scope reuse. This change should not claim to solve it or introduce an unrelated cache-key redesign.
- R4: Framework has cheap in checks, verify in merge_checks, and merge_covers: [cheap]. A green cheap result must not cover verify. Require the destination command identities, as src/verify.ts:113 already constructs them. Source: framework/issues/config.yaml, read 2026-11-01.

**Missing question.** Is the second same-tree execution intended as a flake sample? If yes, its cost buys an explicit quality outcome. If no, reuse is the consistent choice.

## Q2. What single rule prevents lookup/gate disagreement?

**Pick.** One green-coverage rule, consumed by both the reuse fast path and the gate:

For the requested tree, every required command must have an exit-0 entry with the exact name and command text in completed evidence whose setup passed. Green source selection does not filter execution scope. An empty required-command list still needs completed setup-green evidence, rather than passing by an empty every().

With today's per-command reuse retained, generalize the existing reuseSource lookup and use it for the green decision in verify, requireGreenReceipt, the runOnce loops, and the green shortcuts inside knownRedReceipt. Delete greenRun's separate whole-run green predicate and the gate's separate onTree/green-entry scan. This removes competing definitions instead of adding another receipt mechanism. The fast path can cite its actual source run IDs. It does not need to manufacture a merge-scope receipt.

Keep redRun and the red head/base pairing in knownRedReceipt scope-bound. A green source is positive evidence. A red result is not a pass without the existing linked, same-failure comparison against the actual merge-base. Removing every scope comparison in the file would wrongly widen this change.

X2b is a real dependency: if quick-red decides to remove per-command reuse, use one shared whole-receipt matcher instead, with exact required commands and all exits green. Do not retain a member-aggregation subsystem solely for X1. Choose the shared rule once after X2b settles, without a runtime mode switch.

**Rejected options.**

- O4: Remove scope only from greenRun. This recreates the October 25 failure directly.
- O5: Copy the same revised conditions into the gate and reuse path. The conditions can diverge again when member receipts or command selection changes.
- O6: Write a synthetic merge receipt whenever a leaf receipt is reused. It adds a write and an artificial execution record to satisfy a label-based gate.
- O7: Unscope known-red comparisons too. The requested saving needs no broader permission to waive red checks.

**Evidence.** Tier better-than-training, inspected 2026-11-01: src/verify.ts:157 currently matches a single full green run, while :459 accepts green commands distributed across runs. The existing aggregation contract is tested at tests/verify.test.ts:1271. reuseSource at src/verify.ts:203 already implements per-command source selection and is called at :549 and :578. knownRedReceipt at :214 has both green shortcuts and stricter linked red evidence.

The historical regression is in tests/verify.test.ts:1487, introduced by 5d0b505f and repaired by 9aaed138 on October 25. Its green and known-red portions should be separated in meaning: change the green reuse expectation, retain the red comparison's isolation.

**Pitfalls and removal.**

- R5: Empty checks can otherwise pass without setup ever succeeding. Preserve the completed-evidence requirement. Existing tests/verify.test.ts:319 and :335 cover failed setup with no checks.
- R6: Verify is not the last gate. check.review and repair-to-merge call requireGreenReceipt at src/phase.ts:429 and :432. recordTested and push call it at :678 and :749. Direct guards call it at skills/chart-issues/scripts/direct-guards.ts:20. Fix the shared function, not those callers individually.
- R7: Removing scope from recorded execution context would break unrelated consumers. slowChecked/slowEligible at src/verify.ts:178 and :184 select real merge measurements and exclude reused entries from the normal. flips at src/flaky.ts:26 ignores reused entries. Full reuse should create no fresh timing sample or synthetic red-to-green flip. Fewer new measurements can leave a slow episode open longer. A reused result is not evidence that the host recovered.
- R8: Command-owned land expects an actual merge receipt after a nonzero verify result, src/land.ts:55 and :84. Keeping red selection scoped preserves that path. A green reuse returns zero and proceeds through the same shared gate, so it needs no new merge receipt.

**Missing question.** Does X2b retain per-command aggregation? The shared implementation must follow that answer. Otherwise X1 can accidentally preserve code that the adjacent fork is trying to remove.

## Q3. What proof is enough?

**Pick.** Extend existing fixture tests around the public verify-to-merge boundary. Use cheap marker commands, existing bare Git remotes and current helpers. No live framework suite, repeated load benchmark, new test harness or test-count target is needed.

A1. Reproduce the exact old failure with a real leaf verify, then merge verify on the same tree, then the real merge gate. Assert that merge verify succeeds, the marker/setup counters do not increase, and merged --check stamps tested_top. An empty/trailer commit can demonstrate tree rather than commit identity. This case must fail before the change and pass afterward.

A2. Extend the existing changed-tree, changed-command and missing-evidence cases to the cross-scope path. Include a framework-shaped config where cheap leaf evidence cannot cover the missing verify merge command. Observe the actual command marker and gate refusal before that command completes. Existing incomplete/setup-failed evidence cases remain blocking.

A3. If X2b keeps aggregation, adjust the existing split-green-evidence test so its source runs span scopes. Verify and the gate must agree when all required entries are covered and both must reject an uncovered command. If X2b removes aggregation, update that contract explicitly instead of adding this case.

Retain the existing known-red linked-pair tests, flaky reuse exclusion tests and slow-run eligibility tests. Split tests/verify.test.ts:1487 so changing green scope eligibility does not silently delete its known-red assertions.

Suggested focused implementation check, using the configured runner semantics:

    bun test tests/verify.test.ts tests/receipt-gates.test.ts tests/slow-merge.test.ts tests/flaky.test.ts --timeout=30000 --parallel=4 --no-isolate

The normal leaf verification remains the required full-suite run. Do not add multiple full-suite runs as proof of this receipt policy. This consultant pass is read-only, so this command was not executed and no changed behavior is claimed tested.

**Rejected options.**

- O8: Only test a private matcher or seed a green receipt and call the gate. That misses the historical public mismatch between verify's success and the later gate.
- O9: Require two leaf/merge executions and assert both scopes appear. That preserves the old implementation shape rather than the new behavior.
- O10: Run large before/after suite batches. Marker counts prove that execution was removed. The live ledger already supplies the cost estimate.

**Evidence.** Tier operator: INTAKE.md, “Source: operator 2026-11-01 w8:pNP,” Message 6 requests reasonable testing. Tier better-than-training, inspected 2026-11-01: tests/receipt-gates.test.ts:61 already exercises tested_top and :157 direct guards; tests/verify.test.ts:352, :372, :388 and :1170 cover same-tree reuse and refusal boundaries. tests/slow-merge.test.ts:160 covers eligible measurement rows. src/land.ts:84 calls verify before landGates, which identifies the actual end-to-end contract to preserve.

**Pitfalls and removal.** R9: Shared eligibility code prevents this particular predicate drift, but cannot guarantee that future command requirements are correct. Keep the public workflow regression that checks both success and the gate. Assert execution counts and state, not reuse message wording. R10: A cross-scope success test alone can pass after accidentally weakening the gate. Pair it with changed-tree and missing-merge-command refusals.

**Missing question.** Will acceptance exercise command-owned land's gate, or stop at verify returning zero? At minimum, prove the real gate stamps tested_top. A successful verify alone repeats the evidence gap that caused the revert.

