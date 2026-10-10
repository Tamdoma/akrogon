# Brief: bounce-repair-proof

## What
Skill text only. When a leaf is in check.fix because the merge turn bounced it (red `checks`/`merge_checks` recorded in `review-B.md` by merge-issue), the repair seat rebases the repaired head onto the current `<remote>/<default_branch>`, reruns the exact rejected command, same command, arguments and scope, in its own worktree before handing to re-review, and records command, arguments, the rejected run's base and head, the rerun's base and head and the result as evidence (A,C). merge-issue's red ending records the exact command, arguments, rebase target and tested head so the repair can rerun it. plan-issue:63 and implement-issue:63/84 ("run `merge_checks` only at merge") gain the one exception for this case. check-issue's re-review confirms the evidence exists.

## Why
42% of merge bounces repeat (#71): repairs are proven with the leaf's own tests, not the command that rejected them, so the same red comes back on the serial merge turn.

## Done-criteria
1. `skills/merge-issue/SKILL.md` red ending requires recording the exact command, arguments, rebase target and tested head in `review-B.md`.
2. `skills/implement-issue/SKILL.md` check.fix after a merge bounce requires rebasing onto the current `<remote>/<default_branch>`, rerunning that exact command in the leaf's own worktree and recording command, arguments, rejected and rerun base and head and result before `check.review` (A,C); a red rerun is repaired, not handed on.
3. `skills/plan-issue/SKILL.md:63`, `skills/implement-issue/SKILL.md:63` and `:84` and `skills/check-issue/SKILL.md:85` state this as the only exception to running `merge_checks` only at merge, with no wording that contradicts it.
4. `skills/check-issue/SKILL.md` re-review after a merge bounce treats missing rerun evidence as a Fix.
5. The blocking `checks` pass.
