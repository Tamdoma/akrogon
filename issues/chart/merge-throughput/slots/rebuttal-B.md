# Slot B disagreement-only rebuttal

Code citations resolve against the supplied `scratchpad/ref` checkout at `083264e`.

- F1: The drift loop incorrectly connects conflict-solo marking directly to the back of the queue. `src/next.ts:1179-1187` marks the follower solo and removes it from the batch without changing its phase or merge stamp. `src/phase.ts:152` resets the stamp on entry/re-entry to merge. Correct the loop to conflict → fewer carried leaves → longer wait. Back-of-queue follows a repair/re-entry, not the conflict itself.

- F2: “On a red gate, run … on fetched main. Red there: leaf stays” omits causal comparison. Both candidates can fail for different causes, or the leaf can introduce an additional defect. The locked rule requires a judgment that the base failure explains the leaf failure, with matching material conditions, not merely two red exits (`skills/check-issue/SKILL.md:61`). Keep that requirement in the hold proposal and its recovery proof.

- F3: Completed comparable base runs do not remove “hold stuck on flaky main.” A flake can produce a completed red result. The comparison rule establishes evidence quality, not deterministic health (`skills/check-issue/SKILL.md:61`). The fork still needs a recovery owner and an explicit route for retrying health proof when the same SHA's external conditions recover. Do not claim this pitfall is already removed.

- F4: “Freeze it at merge entry” is not a sufficient holder rule. Static entry scores can still let a newly admitted high-priority leaf overtake a running holder. Phase calls currently authorize whichever leaf is first in the recomputed queue (`src/phase.ts:770-783`). Preserve the active holder/attempt until release, then apply priority to the next selection.

- F5: Item 4 does not supply the evidence needed to reopen #69. Attempt membership, gate wall time and outcomes omit other seats' test-process overlap and host resource pressure. Active capacity counts leaves rather than test processes (`src/next.ts:331-343`). The lock requires a traced load failure (`issues/chart/test-runs/CHART.md:17`), so a separate measured trace remains necessary.

- F6: B did not propose “defer until DEFECT is the top remaining class” as the threshold for initial full-gate admission. My pick is repair-specific proof plus fast checks for verified recurring defect classes. Moving every full suite earlier needs evidence of net throughput benefit under resource limits, not just a ranking of failure classes. Rachel Tannenbaum explicitly discusses exhaustive-presubmit cost, concurrent-run resources and stale runs: https://abseil.io/resources/swe-book/html/ch23.html (read 2026-10-09).

- F7: “One prose line” understates repair-proof contract work. A rejecting merge_check is forbidden before merge by `skills/implement-issue/SKILL.md:84`, and plans exclude added whole-suite requirements unless named in the brief (`skills/plan-issue/SKILL.md:63`). Explicitly reopen the repair-specific scheduling boundary and reconcile applicable instructions. The repair must retain rejected command, arguments, material conditions and base/head evidence so a weaker rerun cannot satisfy it accidentally (`skills/check-issue/SKILL.md:61` provides the existing comparison standard).
