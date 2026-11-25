# Leaf worktree kept at a stale base

## Case

Framework leaf mockup-content-syncs-every-string was handed off on 2026-11-24 (state.yaml `created: 2026-11-24`, attempts A 0). Its worktree `~/.akrogon/worktrees/framework/mockup-content-syncs-every-string` already existed from an earlier start of the same slug on 2026-11-19, whose handoff was withdrawn. The plan.synthesis seat found HEAD at 6e5e758549 (2026-11-19), 1271 commits behind origin/main 4055186fd7, so `akrogon config` printed `AKROGON_BASE: 6e5e7585…`. The design said the dependency leaf mockup-content-closes had merged and its two-root resolve was on the default branch. Its commits (e772b56faa and the `--content-dir` connector docs) were on main but not in the worktree. Four files held uncommitted test edits dated 2026-11-19 from the earlier attempt.

## Evidence

- `git merge-base --is-ancestor 6e5e758549 main` true; `git log --oneline 6e5e758549..main | wc -l` 1271; `git grep -n content-dir main -- integrations/lens` hit, the worktree did not.
- akrogon src/next.ts `ensureWorktree`: when the path exists it only checks it is a worktree root of the same repo; when the slug branch exists it checks that branch out; only a missing branch starts from `trackingRef(repo)`.
- `base()` in src/config.ts is `git merge-base HEAD <trackingRef>`, so the stale HEAD became the leaf's base.
- The seat recovered by saving the stale diff, fast-forwarding the commit-free branch to origin/main and re-applying the diff (one file conflicted and was rewritten).

## Learning

Reusing a worktree or branch keeps its old base. A leaf that has no commits of its own yet can move to the current tracking ref at no cost, while planning on the old base plans against code the design says is gone. Leftover uncommitted files from an abandoned attempt then sit in the new attempt's tree without any record.

Report: https://github.com/Tamdoma/akrogon/issues/156

Applied 2026-11-25 by src/next.ts:315: the first-allocation gate replaces a commit-free leftover from the tracking ref and refuses one worth keeping, so no seat opens on a stale base.
