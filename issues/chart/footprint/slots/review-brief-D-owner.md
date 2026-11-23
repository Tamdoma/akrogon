# Review brief D: owner roots (footprint O1-O4)

You are slot D. Decision: issues/chart/footprint/forks/owner-roots.md (designs: slots/owner-B.md, owner-C.md). Three branches, each based on origin/main, review each separately:

1. /home/ivan/.akrogon/worktrees/akrogon/owner-locks, branch owner-locks (d29ba661): per-slice admission lock files gone; stopSlice takes admission.lock exclusive; sweep removes non-line-* lock files. Implementer risks: admissions on every repo pause during a slice stop (R2); mixed release window where an old reconcile and a new admission do not exclude (R3); first sweep scans 12,690 files (R5).
2. /home/ivan/.akrogon/worktrees/akrogon/owner-workers, branch owner-workers (a5b8829a): transition refuses a move out of a non-failed, non-merge phase while a registered <slug>-u<N> worktree exists. merge is skipped because the slot-less merged move goes through transition after the push. registeredWorktrees moved out of reconcile for reuse.
3. /home/ivan/.akrogon/worktrees/akrogon/owner-skills, branch owner-skills (270f7150 consults close verb; 62622ad4 sparse unlocked direct-route worktrees, docs only). Note U1: status `resumed` is no longer hand-written; match still reads old `resumed` as closed.

Concrete defects only (a race, a refusal that blocks a legitimate path, a land going red, data loss, a broken skill step). Run only the touched test files, `bun test --timeout=120000 --max-concurrency=5 <files>`.

Write slots/review-D-owner-1.md: one section per branch with `Verdict ready|fix`, base and head, numbered findings with file:line and a scenario. Then run: hc send t126 "done D: <path>"
