# Report: nits-before-merge

Base: 923c6c98fac3f051a54ac27168ea024215652602
Head: acba808 (lane), cherry-picked from worker commit 3280b16

## Changed files and reasons

- `skills/check-issue/SKILL.md` — check.review: added sentence requiring B to record each held reusable Nit before a non-`fix` verdict (criterion 1). check.repair: added rule before the `merge`/`check.fix` phase call requiring recording of held reusable Nits before the move to `merge`, skipping Nits already written for this leaf per `review-B.md` (criterion 1). Both name the registered checkout's `learnings/LESSONS.md` line and a `learnings/history/` file with case/evidence/learning, left for the operator to commit.
- `skills/merge-issue/SKILL.md` — deleted the `## merge` first paragraph (the Nit-to-LESSONS step); the section now opens with "Before pushing, commit scoped outstanding changes" (criterion 2).
- `docs/guide/learn.md` — line 9 now names the check skill recording the nit-to-lesson before moving the leaf to merge instead of the merge skill (criterion 3). The `learnings/LESSONS.md` / `learnings/history/` listing is unchanged.

Executed by one delegated worker (brief-1, worktree `nits-before-merge-u1`); return report at `implementation/return-1.md`.

## Commands and results

- `AKROGON_BASE=923c6c98fac3f051a54ac27168ea024215652602 bun test --changed="$AKROGON_BASE" --timeout=30000` → "3 changed files, but no test files are affected", 0 pass / 0 fail. Prose-only diff; no test asserts skill wording.
- `bun run format` → all files unchanged.
- `bun run typecheck` (`tsc --noEmit`) → clean.
- `grep -n -i 'nit' skills/merge-issue/SKILL.md` → only the pre-existing "advisory failures as Nits" phrase at line 35; the Nit step is gone (criterion 2).
- `grep -rn -i 'merge skill|merge pass|merge seat' docs/` → no page assigns the lesson step to merge; remaining hits describe rebase/checks and the broadcast (criterion 3).

## Known limitations

- A lesson can be written for a leaf that later fails — accepted cost named in the brief.
- B's post-`check.fix` re-check has no recording trigger: a re-check ending ready/nits moves to `merge` without a lesson step, so Nits first raised there go unrecorded. Recorded in plan.md's open limitation; left for review.

## Unverified criteria

None. All three done-criteria verified by the committed diff and the greps above.
