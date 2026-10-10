# Leaf draft review, Slot B

Draft paths below resolve against /tmp/claude-1000/-home-ivan-Work-infra-akrogon/78c4491c-31d3-4545-8910-84c9e1f29556/scratchpad/drafts/merge-throughput/. Code paths resolve against /home/ivan/Work/infra/akrogon.

## ISSUE.md

No disagreement.

## bounce-repair-proof

No disagreement.

## batch-limit-repo

- F1: brief.md:4,13 and design.md:35 weaken the binding “solo mark clears after that leaf's clean run” into a conflict-free build. A solo-marked holder currently skips buildStack entirely and is prompted to rebase manually (src/next.ts:1043-1053). The named “solo-attempt build” clear location therefore never observes its successful rebase/check run. Specify the real successful solo-run boundary that clears the mark while still in merge, and include that boundary in ownership. Do not clear it merely because a stack builds: rebase success is not a green check run. Binding evidence: design.md:17 retains first-package's clean-run rule.

## dependents-first

No disagreement.

## merge-attempt-records

- F2: brief.md:4 requires setting started at batch creation, but design.md:27 omits the src/next.ts creation write from ownership. More materially, “every merge attempt end” has no owner for recovery paths in src/next.ts:895-940, which can finish landed members/holder or discard an unlanded batch outside phase.ts. Scope the start write and terminal reconciliation hooks explicitly, with one record per attempt when a lost push reply is recovered. Phase-only hooks cannot fulfill the promised coverage.
- F3: brief.md:10-13 does not settle when a reuse attempt ends. A non-fast-forward refusal/restack keeps the same attempt alive and merely sets decision=reuse (src/phase.ts:480-492,622-644). Writing a terminal reuse line at restack would violate the no-line-on-refused-call criterion and risk another merged line at eventual push. State that reuse is recorded once on eventual successful landing of that attempt, or supply another explicit terminal definition consistent with the one-line contract. Include a refused push → reuse → successful push case.

## red-main-hold

- F4: design.md:28 promises a real notification proof “at charting (readiness proofs),” while readiness.yaml:5 is empty. The named external operation is herdr notification show (brief.md:16; existing call shape src/next.ts:827-837). Record the actual charting call and identity/version/result/cleanup/limits in readiness proof records before handoff. The fake-herdr done-criterion does not satisfy that promised real-call proof.
- F5: brief.md:4 and design.md:9 require the command to persist command and B's evidence fields, but the only defined input is --red-on-base <sha>. No artifact/input interface tells the implementer how to obtain the exact invocation, completed results and causal finding. Define the evidence source and boundary schema or structured argument. This is necessary to implement the record, not permission for the command to infer causality from test names. The causal-comparison standard is skills/check-issue/SKILL.md:61; the new command owns storage, so its input cannot remain unspecified.

## hold-fix-leaf

No disagreement.

## merge-bounce-rounds

No disagreement.

## red-batch-culprit

- F6: brief.md:10-11 unconditionally promise check.fix, and :10 promises one higher fix_rounds, but the dependency's cap sends a capped merge-origin repair to failed (merge-bounce-rounds/brief.md:11; existing cap pattern src/phase.ts:301-313). State that those success cases start below the cap, and include a capped-culprit case retaining the shared cap outcome. Wrong nominations do not get a cap bypass under design.md:19-21.
- F7: design.md:37 cites check-only transition as a whole-call preflight, but src/phase.ts:281-283 returns before the cap disposition, and validates the CURRENT applied head. After restoring saved heads, the real transition re-runs branch checks (src/phase.ts:274-277), which can differ because the restored culprit no longer includes the earlier stack's changes. The proposed no-write refusal promise (brief.md:12) needs preflight of the target saved head and all required restore/transition checks, not only transition(checkOnly) on the applied tip. Explicitly own that preflight boundary so a late rejection cannot leave restored branches and a cleared batch after a supposedly refused call.
- F8: brief.md:4 says B copies repair evidence but does not place that copy before the phase call. That call moves the culprit and triggers dispatch, so the repair can start before its input exists. Require the culprit's finding to be present in its authoritative review before invoking --culprit, with the restored starting head derived from the saved batch member head (or actual solo holder HEAD). This fulfills the required evidence transfer without racing dispatch. Evidence: skills/implement-issue/SKILL.md:78-80 reads the leaf's latest review for repair input; design.md:9 binds the copy requirement.
