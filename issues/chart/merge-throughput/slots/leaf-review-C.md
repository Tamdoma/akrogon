# Leaf draft review, slot C

Code cites are origin/main at 2e78945. Disagreements only.

## batch-limit-repo

- Done-criterion 4 cannot be met as written and the mechanism in design.md ("the solo clear at the solo-attempt build, src/next.ts:1152-1187") is wrong against code. A holder with `solo: true` never builds: `applied: fresh.state.solo === true` (src/next.ts:1037) and the solo dispatch at 1044-1053 return before `buildStack`; 1152-1187 is where marks are set, not where a solo attempt builds. A solo attempt ends either merged (leaves merge) or `check.fix` (mark dropped at src/phase.ts:153). No command event matches "builds without conflict and stays in merge". The leaf must name the clear event. Candidates inside its ownership: clear the member's mark when the attempt that set it ends (the mark becomes per attempt, stored as an excluded-slug list on the batch record), or retry solo members at the next build once main moved. Until the event is named, the first-package solo-clear decision has no mechanism and criterion 4 has no test.

## bounce-repair-proof

- Criterion 2 reruns "on the repaired head in the leaf's own worktree" but names no base. The rejected run happened on a stack top or a rebased head on main X (merge-issue:41, 51); a member ejected or split is restored to its saved pre-rebase head (src/phase.ts:790-794). Rerunning there reproduces neither a DRIFT nor a merge_checks failure that depends on main. first-package 1a keeps "base and head as evidence", so the brief must say the rerun happens after rebasing onto the recorded rebase target or current `<remote>/<default_branch>`, and that the recorded base is compared to the rerun base in the evidence.
- No blocked-by, but it rewrites merge-issue:65, the same paragraph red-main-hold (base-first order) and red-batch-culprit (culprit order, evidence copy) rewrite. Whichever lands last must carry all three. Either block it on red-batch-culprit (it only adds what is recorded, so it can land last) or give one leaf the final paragraph.

## dependents-first

No disagreement.

## hold-fix-leaf

- Selection override location: `holder` is fixed at src/next.ts:972-973 and the applied-record re-dispatch at 976-985 runs before the fetch and before the hold guard (996). If the override is applied only at the guard, F's attempt is created once but any later pass computes holder = queue[0] ≠ F and never reaches 976 for F, so a dead pane is never re-prompted. The override must read the hold and replace `holder` before 975.
- Missing binding decision: the hold clears while F's attempt is in flight (`akrogon unhold`, or someone else's push moves main). "The override ends when the hold clears" then makes src/phase.ts:770-777 refuse F's `merged`, and F's batch record is orphaned for `reconcileBatch` (src/next.ts:964-971). Either F stays authorized while it holds a batch record (consistent with queue-order "active holder never displaced") or the clear restores F. This also depends on landing order against dependents-first, which puts a leaf with a batch record first; hold-fix-leaf has no blocked-by on it, so behaviour differs by which lands first.

## merge-attempt-records

- Criterion 2 writes outcome `reuse` for a reused green result, which hides that those leaves landed. A reader counting merges per attempt must then treat `reuse` as `merged`. The Taken enum binds the value, so the brief should at least state that `reuse` is a landed outcome, or the line carries `decision: reuse` beside outcome `merged` if the door accepts that as a restatement.

## merge-bounce-rounds

- Criterion 2: the cap failure record hardcodes `phase: 'check.repair'` (src/phase.ts:312). With a merge origin the failure must say `merge`, or `akrogon status` and the log misreport where the leaf failed. Inside ownership, but the brief does not mention it.

## red-batch-culprit

- Ordered after merge-bounce-rounds and red-main-hold through blocked-by, but not after bounce-repair-proof, whose rerun rule is what makes the ejected culprit's `check.fix` useful (design.md:9 "so its check.fix can rerun the rejected command"). If bounce-repair-proof lands later the evidence copy has no consumer yet. Not a hard dependency, but the merge-issue:65 paragraph conflict above applies.

## red-main-hold

- design.md:28 says the notification's "real call is proven at charting (readiness proofs)", but readiness.yaml has `proofs: []`. Either add the proof or drop the claim. The honest line is that `mergeNotice` (src/next.ts:827-864) already makes this call in production and the fake herdr pins the shape (criterion 7).

## ISSUE.md

- Three leaves edit merge-issue:65 with no single owner of the final red-ending text (see bounce-repair-proof). One leaf should own the paragraph's final order, or the last one by blocked-by should be the one that writes it.
