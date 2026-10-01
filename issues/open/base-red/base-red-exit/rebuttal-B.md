# Rebuttal B: base-red-exit

## Agreement

There is no substantive behavioral fork. A's C1-C7 and B's D1-D3 implement the same locked outcomes: one judgment-triggered base comparison, immediate failed exit when base is also red, existing repair when base is green, and no planner-added whole-suite or merge-check requirement absent from the brief. Both positions keep the work to the same five documentation files with no source change, new test, runner, or dependency on leaf-temp-dir.

The earlier live inspection remains applicable: the worktree has no diff, and the current lifecycle state is plan.rebuttal. This pass did not read the peer rebuttal.

## Resolutions for synthesis

1. D1. Keep A's C1/C2 structure: the complete implementation rule in Shared context with explicit references at implement end and check.fix, and a complete equivalent review rule in check.review. A's C3 correctly treats the base comparison as a specific concern under the existing rerun rule. Do not repeat the whole rule in every implementation paragraph.
2. D2. Keep the original red-criterion sentence unchanged. A's phrase “except through this exit” needs clarification: declaring failed is a stop, never a handoff of a red criterion. The new rule belongs beside the existing gate and does not create an exception allowing check.review or merge. This is a wording correction, not a new outcome.
3. D3. Accept A's C4 placement in plan.synthesis. My preference for Shared context is not an acceptance requirement. What matters is that the final plan applies the locked limit and preserves a whole run explicitly named by the brief. This leaf therefore retains criterion 5's `bun test`.
4. D4. A's C1 “same cwd” means the corresponding working directory within the detached base checkout, with the same command, arguments, and whole-folder or single-file scope. Using the original absolute working directory would execute the leaf again instead of base. State this meaning without adding a helper or new interface.
5. D5. Retain A's explicit base SHA in the report/review, correcting my A4's incomplete field list. Both artifacts must contain base SHA, both log paths, and failing names and tails from both runs. Save raw logs outside the removable worktree and capture the exit result and durable evidence before forced removal, then take the red or green path. The literal commands and seat-specific failed exit remain as designed.
6. D6. Keep the implementation skill's existing `merge_checks` sentence if its behavior remains consistent with the new planner limit. In the guide's planning paragraph state the complete limit, including `merge_checks`, rather than only “no whole-suite requirement.” In `docs/guide/phases.md:91`, qualify the whole-run exception as one named by the brief. A's C6 can include this small correction within its existing three-section edit. This removes the ambiguity identified in B's F2 without changing merge behavior.

## Concrete check

For the content-only whole-folder failure described in A's scenario, the seat finds no cause in the leaf diff, runs that same whole-folder command once in the detached base checkout with leaf-equivalent dependencies, and records both executions. Base red leads to forced cleanup and failed with the actual SHA and current seat. Base green leads to cleanup and the existing repair path. A failure caused by the leaf does not trigger an automatic base run. An unrelated red never becomes a ready/nits verdict or a pre-existing-failure handoff.

## Proof and remaining limitation

Use the semantic rule review and both exact grep sweeps required by criterion 4, then the three configured checks required by criterion 5. Preserve the existing docs-links and command-reference tests unchanged. The design already supplies the operation proofs, so another test harness or runtime experiment is unnecessary for this prose-only leaf.

B's R3 remains: an identical whole-folder base command can still be slow, and outside inputs can differ between runs. The locked design pays for one comparison to bound investigation. It does not introduce cached evidence or a hermetic causality guarantee. No blocker or dependency was found.
