# Focused final-shape check for peer B: union-rollout

Operator answer, verbatim: "1a | 2a | 3a | 4a - but you will do it for all repos. No time for me to do anything manually | 5a |"

The correction adds a mechanism: A (the door) runs the backfill for every repo instead of the operator. Proposed final shape for the backfill, per repo without a tracked rule (akrogon, pi-extensions, mdcny-ghl-data-pulls, boulevard-automation, clinique-la-roya, lens, Himne, lingua-relay):
1. `git fetch origin main`. Build the commit with plumbing on top of `origin/main`, never touching the checkout, index or local branch: a temporary `GIT_INDEX_FILE`, `read-tree origin/main`, the blob = origin/main's `.gitattributes` (if any) plus `learnings/LESSONS.md merge=union` with a trailing newline, `update-index --cacheinfo`, `write-tree`, `commit-tree -p origin/main`, then `git push origin <commit>:refs/heads/main` (fast-forward only, retry from fetch once on rejection).
2. Because the rule now sits on the rebase target, the operator's next gacp/sync rebase onto it applies union to any unpushed local lesson commits, with no local `.git/info/attributes` (2a). Local main is fast-forwarded with `git merge --ff-only origin/main` only when it has no unpushed commits; otherwise it is left for the next gacp/sync.
3. Framework: remove the `learnings/LESSONS.md merge=union` line from its `.git/info/attributes` (2a cleanup, it is the only line).
4. Verify per repo: `git show origin/main:.gitattributes` contains the line, `$(git rev-parse --git-path info/attributes)` lacks it, and `git check-attr --source=origin/main merge -- learnings/LESSONS.md` reports union. Report any repo that fails as incomplete.
The akrogon code leaf (init writes the tracked line idempotently, tests, skills/init-akrogon/SKILL.md:76, docs/guide/setup.md:31) is unchanged.

Return only defects in this shape with evidence (for example a way it pushes unrelated work, fails the bootstrap, or verifies falsely), or "no defects". Read-only, no pushes. Write to exactly:
/home/ivan/Work/infra/akrogon/issues/chart/lessons-merge-conflicts/slots/union-rollout-final-check-B.md
