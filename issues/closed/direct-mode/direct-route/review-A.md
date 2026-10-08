# Review A: direct-route check.review

Base `d17029e2b0a8c369ee366a91bf12346141fc508a`, reviewed head `3bb3fdf785057d3032d79d2b7305f05c33f2f1f1`. The worktree is clean
(`git status --porcelain` empty), and the head is 4 commits ahead of base.

## Verification

- Guard script on a real branch. The live leaf branch was the source:
  `bun skills/chart-issues/scripts/direct-guards.ts <worktree> akrogon issues/chart/direct-mode` printed
  `direct guards passed`, exit 0. This branch is clean, has no `issues/` diff, adds test files only and is non-empty.
- A detached worktree at base `d17029e` gave `Empty leaf branch: no changes against origin/main`, exit 1. The same
  worktree with one untracked file gave `Uncommitted work in ...`. Both are the guards' own messages from `src/phase.ts:321,373`.
- Unregistered key `nosuch` threw `Unknown repo key: nosuch`.
- `tests/direct-guards.test.ts` has one CLI-boundary case per refusal and one passing case, in isolated `fixture()` repos.
  The script under test is real, with no mocks. Report records a deliberate break per guard.
- Implementation checks (report, same head): format, typecheck, `bun test --timeout=30000` (539 pass), and test_changed
  all exit 0. Not rerun: the code is unchanged since then and there is no specific concern.
- No `AREA.md` is in the diff. There are no `Test-Change:` trailers, and none are needed because both test files are new.

## Criteria

1. Met. chart-issues `SKILL.md:69` adds the route question or unavailable notice. The `## Direct route` paragraphs 1 and 3
   cover the one-line unavailable notice, the combined three-way question with recommendation, session authorization, the
   `Route:` record and that a later setting change doesn't apply.
2. Met. Five refusal bullets match eligibility 1a, including that charting proofs do not count.
3. Met. Protocol step 5 sub-steps 1–9 follow landing 1a/2a and growth 2a in order. They use the literal push form, never
   force, at most 2 attempts, `--by "<chart> direct <sha>"`, `git worktree list` and `git branch --list` checks, and `Closed`
   last.
4. Met. They cover the repair round definition, `fix_rounds` bound kept in `Direct attempt`, exhaustion choices, growth
   triggers, partial commit, the two continuations, and the one-live-branch rule. shapes.md defines `## Direct attempt`.
5. Met. Shown by tests and by the real-branch runs above.
6. Met. implement-issue `### Direct form`, check-issue `## Standalone review`, broadcast-issue sender clauses and
   chart.md `## Direct route` exist. Each refers to the owning rules instead of restating them.

Documented behavior: `docs/guide/chart.md` now describes the route, and `docs/guide/setup.md:58` already did. See N1 for
merge.md.

## Fixes

None.

## Nits

- N1. `docs/guide/merge.md:64,97` describe broadcast only for issue or epic completion. Both lines are on the merge page
  and stay true for the merge seat, so a reader is not misled about merge. A reader looking for every broadcast trigger
  misses the direct one. Deferred because the file is outside this leaf's ownership. Evidence that would promote it: a
  guide page that claims merge is the only broadcast path.
- N2. implement-issue `### Direct form` does not say that A commits its work or adds `Test-Change:` trailers before
  returning. chart-issues gets both indirectly: B reviews a `head=<sha>`, and the guard script refuses a dirty tree or an
  uncited test change at landing. The cost is at most one wasted repair round. Evidence that would promote it: a direct
  attempt whose B review ran on uncommitted work.
- N3. check-issue `## Standalone review` says B "reads no `akrogon config` leaf state". The phrase is unclear. B still
  needs `akrogon config` for `checks` when it reruns a check. Deferred because the base-run and Fix/Nit rules it
  references already name those commands. Evidence that would promote it: a B seat skipping checks on a direct review.
- N4. broadcast-issue `SKILL.md:43` reads "The sender (...) does not repeat the sender". It names the sender twice and
  is awkward but correct.

## Verdict

nits
