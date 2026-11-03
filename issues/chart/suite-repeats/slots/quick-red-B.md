# Blind notes B: quick-red

Read 2026-11-01. No other seat's quick-red notes or fork Findings were read. No implementation or tests were run. Only this return file was written.

## Q1. Skip the slow check after a quick failure?

**Pick.** Yes. Run every quick check, then skip checks named in full when a quick check failed. For akrogon, explicitly reorder config to format, typecheck, test. Preserve the generic runner's configured order rather than silently moving arbitrary commands across dependencies. In its sequential loop, continue running quick checks after a quick failure and record each skipped full check with the existing blocked field, naming the actual failed quick check.

This needs no duration threshold, new configuration key or new limiter. full already identifies test in akrogon. Keep the existing parallel merge_checks stage and its all-members-finish behavior. A full check failing must not become a reason to cancel other full checks or sibling merge members inside their existing stage.

**Measured cost and loss.** The following query used completed setup-green head runs, excluding compares records. It joined each test entry's log to check_end.duration_ms in issues/timings.jsonl.

| Window | Completed head runs | Quick red, test still executed | Test execution-seconds | Those tests also red |
|---|---:|---:|---:|---:|
| Before 2026-10-26 | 243 | 47 | 7,070.919 | 11 |
| Since 2026-10-26 | 50 | 4 | 402.913 | 2 |

There are another 24 earlier head records with no completed command set. They are excluded from 243, not silently counted as passing.

The recent four are fewer-repeat-calls (82.050 s), cost-rules (171.249 s), durable-check-capture (76.365 s) and peer-pane-anchor (73.249 s). All are leaf-scope passes. For each, the next completed all-green head run for that leaf had a different tree. The earlier window has 46 cases with a later all-green run, also all on different trees; one has no later green run in the window.

Thus these four recent tests cost 6.72 execution-minutes on trees that could not subsequently supply a whole-green receipt. This is an observed upper bound on removed execution, not a guaranteed net latency saving. Skipping also delays two observed test failures until after quick repairs. Those delayed diagnostics could otherwise help a seat repair multiple problems in one turn.

**Rejected options.**

- O1: Stop the sequential stage at its first red. This skips another quick check, contradicting the intake's requirement that every quick check still runs.
- O2: Keep running everything. The October 24 rationale relies on retaining green work on the same tree. Every observed recent quick repair instead led to a different tree.
- O3: Add quick/slow timing thresholds, a separate quick-check configuration or a new runner. Existing names, order, full and blocked suffice.

**Evidence.** Tier operator: INTAKE.md, “Scope,” X2; quick-red fork, “Question / Carries”; verify-waste/forks/receipts.md, “Refined at draft review,” October 24 decision and explicit re-measure requirement. Tier better-than-training, inspected/measured 2026-11-01: the JSONL join above; issues/config.yaml currently orders format, test, typecheck and has full: [test]; src/verify.ts:543 executes that sequence and :568 already finds a blocking result for merge members. src/config.ts:49 declares full, and :99 validates its names. src/admission.ts:147 uses the classification for queueing. The new skip meaning must be explicit because full is currently an admission label.

**Pitfalls and removal.**

- R1: Treating a blocked test as a real test failure invites the seat to rerun it or base-compare it, recreating the expense. Keep the existing blocked metadata/output convention and state in the red-disposition rules that a blocked command did not execute: repair its named blocker first. Relevant process sections: implement-issue “Shared context” and “check.fix,” check-issue “check.review” and “check.repair,” merge-issue “Shared endings.”
- R2: Never record skipped work as green or known-red. The existing blocked exclusions at src/verify.ts:228 and :235 and src/flaky.ts:33 are the right mechanism. A quick failure plus an unrun required test cannot authorize a merge, including through a base comparison.
- R3: Automatically partitioning all registered repos' commands can break dependencies expressed by their order. Reorder akrogon's explicit config and preserve runner order. Do not infer that every non-full command is universally cheap or independent.
- R4: The older “every failure shown” lock is narrowed across stages, not within them. The result now means every quick failure is shown, and the full stage is visibly unrun when blocked. Record this reopening explicitly rather than claiming equal diagnostics.

**Missing question.** Must a base-known quick failure still permit a merge while full checks remain unrun? My pick says no. That would lack required test evidence, even if the quick failure itself predates the leaf.

## Q2. Keep or delete per-command reuse?

**Pick.** Delete generation of new per-command reused entries. Keep the agreed whole-row same-tree reuse. Remove reuseSource and its two execution branches, plus greenEntry if no consumer remains after the merge-reuse work. A red pass reruns its required commands on retry. A whole-green pass is reused without another checkout.

The measured current saving is too small to justify retaining this second evidence mechanism solely for the deployed command sets. This explicitly reopens verify-waste Q1. It is not a refactor with unchanged behavior.

| Current evidence, since October 26 | Entries reused | Recorded source execution-seconds |
|---|---:|---:|
| akrogon head runs | 6 of 150 | 17.621 |
| Of those, cost-rules leaf retry | 2 | 8.805 |
| Of those, two merge retries | 4 | 8.816 |
| framework head runs | 0 of 502 | 0 |

The source durations are estimates of avoided work, not measurements of a counterfactual rerun. The four merge entries belong to slow-merge-notice and peer-pane-anchor. Their merge runs fall within the same-tree whole-green leaf cases already removed by X1. Do not add their saving to X1 again.

Framework has 502 completed head runs since October 26: 285 cheap and 217 verify. Every row contains one command. Before that date it has 1,179 completed head runs, also one command each, with zero reused entries. In that deployed shape, successful-command reuse is already whole-row reuse.

**Rejected options.**

- O4: Keep per-command reuse because future members could be expensive. There is an approved pending framework split, so this is a real competing commitment, but no deployed multi-member saving was measured. Preserve it only if that commitment is reaffirmed with its tradeoff.
- O5: Keep it only for full checks or merge_checks. This adds a special policy boundary while retaining the same branching and provenance mechanism.
- O6: Delete the reused schema field and historical consumer exclusions too. Existing ledger rows still contain it, and old copied evidence must not become a fresh flake observation or a fresh slow-alarm sample.

**Evidence.** Tier operator: quick-red “Question / Carries,” the removal preference and X2b decision scope. Tier better-than-training, read 2026-11-01: src/verify.ts:203, :549, :578 implement the two source branches; :79 parses old reused fields; src/flaky.ts:33 and src/verify.ts:184 preserve their historical meaning. git show fbac86c6 attributes this capability to the October 25 member-receipts implementation. git show 6a054950 shows its later packed-log fix. JSONL measurements above read akrogon through October 29 and framework through November 1.

**Pitfalls and removal.**

- R5: verify-waste CHART.md, “Pending steps,” explicitly plans cheap plus 14 framework merge members. Removing partial retry reuse changes that approved step's economics: its parallel members can still run, but a retry repays green siblings. Record the withdrawn promise and resolve that owner's expectation before handoff. Do not silently present the pending work as retaining its original savings.
- R6: Slow-alarm and flaky readers must still recognize historical reused entries. Delete production of new copies, retain compatibility. The same applies to fresh-observation checks in the main-red notice code at src/verify.ts:293 and :302.
- R7: Skills currently promise base-side per-command reuse. If it is removed, amend those promises in implement-issue “Shared context,” check-issue “check.review,” and merge-issue “Shared endings.” Whole-green base receipt reuse and skipping individual green base commands are different behaviors.
- R8: Multiple-command expensive retries would reverse this recommendation's economics. If the pending framework split remains a firm requirement to retry only red members, keep the existing feature and state that this fork declines the deletion. Do not implement both policies behind a switch.

**Missing question.** Does the operator still want the pending framework split's partial-retry saving? This is the material reason to reject deletion. The current flat framework ledger cannot answer its future saving.

## Q3. What proof is enough?

**Pick.** Extend the existing cheap fixture tests, using marker files and the current gate. No load benchmark or new proof machinery.

- A1: A quick check fails, another quick check still executes, and the full command's marker is absent. Check the actual red entry plus blocked full entry, nonzero verify result and gate refusal. Exercise a typecheck failure as well, so configuration order cannot hide it.
- A2: Quick checks pass and full executes. Retain the existing test that all parallel merge members finish after a sibling fails, tests/verify.test.ts:956. This prevents an accidental general fail-fast change.
- A3: Repair the quick failure on a new tree and verify that full now runs and can produce an accepted receipt. A blocked earlier row must not count as green, known-red cover or a flaky observation. Extend the existing blocked-evidence scenario at tests/verify.test.ts:1432 rather than building a second harness.
- A4: If Q2 deletes partial reuse, an unchanged-tree retry after a red full check executes the previously green quick commands again. Once that retry is whole-green, another verify reuses the whole row and executes no commands. Update tests/verify.test.ts:1084 and :1122 to the chosen contract.
- A5: Keep tests for reading historical reused entries and excluding them from fresh observations. tests/verify.test.ts:1243, tests/flaky.test.ts:171 and tests/slow-merge.test.ts:160 already cover those concerns.

Suggested focused implementation check:

    bun test tests/verify.test.ts tests/receipt-gates.test.ts tests/flaky.test.ts tests/slow-merge.test.ts --timeout=30000 --parallel=4 --no-isolate

Then use the leaf's normal verify for its required full-suite evidence. These commands were not run in this read-only consultant pass.

**Rejected options.**

- O7: Timing assertions proving the slow check was skipped. An absent invocation marker proves it directly.
- O8: Tests of exact explanatory output wording. Assert exit, blocked metadata, command execution and gate behavior.
- O9: Several whole-suite before/after samples. No suite speed is being changed. The ledger establishes the cost, and marker counts prove the removed execution.

**Evidence.** Tier operator: INTAKE.md, “Source: operator 2026-11-01 w8:pNP,” Message 6 asks for reasonable testing. Tier better-than-training, inspected 2026-11-01: tests/verify.test.ts:105 and :145 exercise sequential commands/setup; :993 covers blocked merge members; :1432 covers their rejection by known-red/flaky consumers. src/verify.ts:567 already supplies the blocked-entry mechanism to extend.

**Pitfalls and removal.** R9: The existing “runs every leaf check” test encodes the old scheduling behavior and must be updated deliberately, not deleted wholesale. R10: A green exit alone can conceal an incorrectly cleared blocked check. The acceptance proof must exercise requireGreenReceipt as well as verify, using the shared receipt rule settled in merge-reuse.

**Missing question.** Will the leaf's acceptance criteria include the seat's disposition of blocked output? Correct runner skipping is insufficient if the subsequent repair turn immediately reruns the blocked suite.

