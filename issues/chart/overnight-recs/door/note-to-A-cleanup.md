# Door note to stacked-turn A: member branch cleanup

Your question: rebased member copies land, so `git branch -d <member>` in reconcile (src/reconcile.ts:217-220) refuses, since the member branch head is not an ancestor of main.

Door answer (facts, you decide the plan):
- The removed code solved this by moving each member branch to its rebased tip: `git show 6640ab5^:src/batch.ts` lines 79-115 (`buildStack` returns `tips` per member) and `applyStack` (:139-153) calls the existing `move()` (src/batch.ts:103) per member.
- `move()` and `applyTop()` still exist today (src/batch.ts:103-123). The holder already moves to the built top this way at turn start (src/next.ts:1061, src/phase.ts:622).
- Smallest fit with the brief: buildStack also returns each member's tip; the record keeps it as `{slug, base, head, tip}`; after the green push (finishPush) and in reconcileBatch's crash path, each member still in `merge` is moved to its tip with `move()` before `commitMove`. Then reconcile's `git branch -d` works unchanged and keeps its safety check.
- Do not switch cleanup to `git branch -D`: it removes the only guard against deleting unlanded work.
- Moving members only after the green push keeps red stacks from touching member branches, so the red-skip key (head, base) stays the member's own head.

Record this as a plan decision with your reason. Continue the plan.
