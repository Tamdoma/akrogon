# B leaf review

Draft root: /tmp/claude-1000/-home-ivan-Work-infra-akrogon/6fae401d-8a9c-4738-8769-5fa2827e9f67/scratchpad/leaves/suite-repeats/

F1. **quick-red-skip criterion 4 contradicts stage blocking and whole-row reuse.**

Evidence: quick-red-skip/brief.md, “Done-criteria,” 4 requires every expected command to execute whenever a red row already exists. Criterion 1 requires full commands to remain unexecuted after a quick failure. Existing merge-stage blocking also skips members after a red checks entry, demonstrated at tests/verify.test.ts:1084 and implemented at src/verify.ts:568. A tree may additionally have a valid whole-green receipt, which correctly prevents another pass altogether.

Exact change: replace the first clause of criterion 4 with: “On a same-tree retry with no eligible whole-green receipt, commands whose stages are unblocked execute again rather than copying prior green entries, and any new row contains no reused entries.” Keep its historical-row compatibility requirement. This preserves the Taken decisions without demanding execution of blocked work.

F2. **quick-red-skip does not own the slow-alarm tests that depend on the removed producer.**

Evidence: quick-red-skip/design.md, “Leaf architecture,” owns tests/verify.test.ts but omits tests/slow-merge.test.ts. The scenarios at tests/slow-merge.test.ts:230 and :421 invoke verify and require newly produced reused entries at :256 and :440. Deleting reuseSource makes those assertions fail. The second scenario also depends on a newly partial run being ineligible for recovery. These are not fixed merely by retaining the reused schema field.

Exact change: add tests/slow-merge.test.ts to quick-red-skip's owned surfaces. Allow those producer-dependent scenarios to be updated to the new fresh/blocked behavior, while preserving historical reused-row exclusion coverage already present at tests/slow-merge.test.ts:160. Existing seedRun at tests/helpers.ts:223 supplies historical fixtures. No other leaf currently owns this necessary test adaptation.

F3. **merge-receipt-reuse criterion 2 needs the accepted known-red exception.**

Evidence: merge-receipt-reuse/brief.md, “Done-criteria,” 2 requires gate refusal until an all-green row exists, while criterion 4 explicitly requires acceptance of a qualifying red head/base pair. The gate accepts green OR known-red evidence at src/verify.ts:466. The current unconditional wording makes a valid known-red landing appear to violate criterion 2.

Exact change: state criterion 2 as: “With no passing merge evidence already available, a merge-only command missing from the leaf row runs. If no qualifying known-red comparison exists, the gate refuses until an eligible whole-green row exists.” Keep criterion 4 unchanged.

