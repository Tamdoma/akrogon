# Review A — stacked-turn

Base: f412697 (origin/main). Reviewed head: c181814 (work branch; code head 7f2ee05 + empty citation commit).
Evidence: `bun test` full suite 836/836 on 7f2ee05; `akrogon verify` green on 7f2ee05 (run 980c86c3); `tsc --noEmit` clean; prettier clean. AREA.md path listing: all named paths exist. Test-Change trailers on the branch were re-checked against their cited sources while writing the repair commit.

## Verdict: nits

The diff implements the plan's D1–D12 as designed: members rebase onto the tip (no merge commits), one verify + one fast-forward push lands the stack, red stacks record member heads and restart the holder alone, red-skip keys on (head, base), member branches move to `tip` only after the push lands, and no foreclosed machinery (cap/split/culprit/batch_limit) exists anywhere in the diff.

## Findings

### N1 — reconcile skips a member already sitting at its recorded tip

`reconcileBatch`'s landed path and `finishPush`'s landed-verify branch skip the member whenever `branchSha !== member.head`. A process killed between `move()` and `commitMove` in `batchPush`'s green path leaves the branch at `tip` and the leaf in `merge`; the next pass then skips the `commitMove` (sha ≠ head), and the member waits a whole extra turn until its own no-op push lands it. Realistic source: SIGKILL/crash mid-move in the merged call. Consequence today: one leaf delayed a turn, completion-owner prompt late — outcome still correct, self-healing, no data loss. Deferred because the window is one process boundary and the safe alternative (skipping only on a genuinely drifted sha) preserves the drift protection. Promotion evidence: a test that kills the move loop mid-way and asserts the next pass completes the member.

### N2 — a red attempt can record `head == built_on`, which then skips all degenerate members on that base

A member with no commits (head == built_on) can be recorded on a red attempt line; `redMemberHeads` then skips every later degenerate candidate on the same base, not just that leaf. Consequence: such a leaf waits one extra turn. Deferred because the skip is keyed exactly as designed (head, not slug) and the cost is a delayed no-op landing. Promotion evidence: a criterion naming slug-level skip semantics, or a real case where the delay matters.

## Test-Change trailers in f412697..HEAD

- `672d07a`: batch-dispatch.test.ts + batch.test.ts — plan-era red tests, cited to plan/design; correct.
- `7f2ee05` and `c181814`: batch-dispatch, batch, batch-merge, dependents-first, helpers, merge-attempts, next, phase, receipt-gates, reconcile, state, timing, verify — citations for the required-`members` type, the rebase assertion correction, the new moved-base case and `mergeText`/`expectedPrompt` member context. Each names the source (design decision or code contract) and reason.
