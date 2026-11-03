# Blind notes B: repair-verify

Read 2026-11-01. No other seat's repair-verify notes or fork Findings were read. No implementation, phase moves or tests were run. Only this return file was written. The fork defines Q1 and Q2.

## Q1. Which verification belongs before the handoff?

**Pick.** Remove the mandatory final verify when B hands remaining Fixes to A in check.fix. Keep it when B moves directly to merge. No routing or gate change is needed.

Keep the done-criterion proof rerun rule. B must still demonstrate its own repairs with the required red/green evidence and a passing planned proof B did not write. Rerun affected criterion proofs under the existing changed-input rule and preserve valid earlier evidence. A's remaining proof/test corrections stay named in Handed to A.

This removes the automatic tail verify, not an explicitly required proof invocation. If a locked criterion itself needs a full-suite observation, handing work to A does not silently waive it.

| Destination | Required work before B's move | Existing receipt gate |
|---|---|---|
| merge | Repair evidence, affected criterion proofs, verify on the committed head | Leaf receipt, src/phase.ts:431 |
| check.fix | Repair evidence, affected criterion proofs, precise Handed to A items | No receipt requirement |

A retains its normal check.fix verification before returning to check.review. That transition requires a receipt for the resulting head at src/phase.ts:427. The merge gate still verifies the integration tree.

**Measured cost.** Python stdin queries joined repair-to-fix log moves to their latest repair visit, then selected verify ledger rows started within that visit. Command logs were joined to timing check_end records. B's and A's exit heads were resolved with git cat-file --batch-check='%(objectname) %(objecttype)' using HEAD^{tree} expressions.

Window starts at the first verify ledger record, 2026-10-14T22:13:14.577Z, and ends with the recorded October 29 data. Split is October 26 UTC.

| Measure | Before October 26 | October 26 onward |
|---|---:|---:|
| Repair-to-fix handoffs | 32 | 7 |
| Visits with new verify rows | 17 | 5 |
| New verify rows during those visits | 20 | 9 |
| All fresh verify command-seconds | 3,242.731 | 727.916 |
| Last recorded verify per such visit, command-seconds | 2,804.695 | 358.607 |
| A returns to review with a different tree | 26 of 31 | 6 of 7 |
| Visits with new verify rows where A changes the tree | 15 of 17 | 5 of 5 |

One earlier A pass ended failed rather than returning to review. Every tree object needed for comparison was available. No selected verify row was a known-red base comparison, and all selected command timings were present.

The recent final passes contain five test executions totaling 333.672 seconds, plus 24.935 seconds of other configured commands. That is about six minutes of identifiable tail verification across five handoffs. All five were followed by A changing the tree.

Do not claim all nine recent verify runs are guaranteed savings: some occurred before further B repairs. Cached verify invocations write no new ledger row, so zero rows does not establish zero invocations. If A keeps the tree unchanged, omitting B's fresh run can merely move the required execution to A.

**Rejected options.**

- O1: Remove every repair verify, including direct moves to merge. This repeats the October 14 removal that October 15 restored. The gate needs the receipt before the leaf reaches merge.
- O2: Keep the unconditional tail verify on the A handoff. It proves an intermediate head without satisfying an immediate transition gate. The recent measured final runs all precede another tree change.
- O3: Defer all criterion proofs to A too. That weakens B's repair-acceptance contract and can hand over an unproven product repair. It is a separate quality decision, not implied by removing the broad check set.
- O4: Add a route from repair back to implement or predict whether A will change the tree. Existing check.fix routing and final-head proof are enough.

**Evidence.** Tier operator: INTAKE.md, “Scope,” X3; repair-verify fork, “Question / Carries”; the November 1 removal and reasonable-testing instructions. Tier better-than-training, inspected/measured 2026-11-01: src/phase.ts:427 and :431; src/routing.ts:38 and :39; the three JSONL files and git tree lookup described above.

History inspected with git show 278d5499 and git show fb236ec0: the first removed repair verify for both destinations; the second restored it because repair-to-merge requires a leaf receipt. The narrowed rule preserves that reason. system-speed CHART.md, “Decisions taken overnight,” D3, rejects the route/test-ownership bounce. The brief's issues/chart/green-rate path is absent in this checkout, but the restoration commit is available.

**Pitfalls and removal.**

- R1: A conditional placed around the whole “After repairs” paragraph would accidentally defer B's criterion proofs. Apply the condition to the automatic final verify only. Keep the earlier repair-acceptance and changed-proof rules.
- R2: Once Handed to A empties, B's destination becomes merge and verification becomes mandatory again. Choose work from the actual destination and remaining findings, not from how the pass began.
- R3: A's proof and receipt must describe its final committed head. Preserve A's check.fix verification and the phase gate. An intermediate B proof remains usable only when its inputs remain unchanged.
- R4: A failing required repair proof stays a real failure. Do not relabel it as pending merely because the leaf will hand another item to A. Existing ownership exceptions identify what A must fix.
- R5: X1 and X2 savings overlap with this cut. Cached calls do not spend suite CPU, and quick-red may already remove an earlier failed pass's test. Report the measured tail separately instead of adding every historical verification duration.

**Missing question.** Does any planned criterion explicitly require a full-suite observation during B's own repair? If so, retain that proof and exclude its cost from the promised tail saving.

## Q2. What proof is enough for a process-text change?

**Pick.** Use an agent review of the revised skill against three concrete branch scenarios and the existing transition gates. Do not create tests that assert exact prose or launch new agents merely to read the skill.

- A1: Pure A handoff. Replay fewer-repeat-calls, review-B.md, “2026-10-26 check.repair, second pass.” B made no changes and handed over a proof/capture correction. The revised rule should direct no final verify and keep the precise handoff. No changed proof input means no additional criterion rerun.
- A2: Mixed repairs. Replay abandoned-capture-stop, review-B.md, “2026-10-28 check.repair,” “Repaired findings” and “Handed to A.” B must still prove its race repairs with the planned proof, then hand A the missing real-unit case without a mandatory broad tail verify.
- A3: Direct merge. B finishes all owned repairs with nothing handed to A. It must verify the committed head before merge. tests/receipt-gates.test.ts:43 already demonstrates refusal without a receipt and acceptance with one. A's later return to review remains gated at src/phase.ts:427.

For A1/A2, trace A's unchanged check.fix end rule through its receipt-gated return to review. For A3, confirm the revised conditional cannot reproduce the earlier blanket removal.

Use the implementation leaf's normal configured verification. No extra full-suite repetition is justified by this skill-only condition. These scenarios and code were inspected here; no revised behavior has been executed or claimed passing.

**Rejected options.**

- O5: Exact-string tests for “only when merge.” They validate wording rather than whether the seat follows the correct branch.
- O6: New state, a command guard or a synthetic receipt for check.fix. There is no missing runtime gate to repair.
- O7: A fresh live leaf or several benchmark runs. Existing closed cases and receipt-gate tests cover the decision without additional process machinery.

**Evidence.** Tier operator: the reasonable-testing instruction in repair-verify “Question / Carries.” Tier better-than-training, inspected 2026-11-01: check-issue “check.repair” contains both B's planned-proof acceptance condition and the current unconditional tail verify; implement-issue “check.fix” retains final proof and verify; src/phase.ts:427 and :431 enforce the two required receipt boundaries. The closed review sections above supply actual handoff cases rather than invented inputs.

**Pitfalls and removal.** R6: A green suite cannot prove the new prose is actionable. The reviewer must walk both destinations and preserve the proof obligations separately. R7: Removing the tail must not change repair ownership, fix-round counting or routing. Leave src/routing.ts:38 and the existing phase machinery unchanged.

**Missing question.** Can a fresh reviewer determine the mandatory actions for both destinations from the changed paragraph alone, without inferring that all verification was deferred?

