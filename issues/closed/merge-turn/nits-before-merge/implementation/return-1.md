# Brief 1 return report

Commit: 3280b16cb313b32c783622594904b4155bd41954

Changed files and reasons:
- skills/check-issue/SKILL.md — AC1/AC3: added a sentence to the check.review lesson paragraph requiring B to record each held reusable Nit before a non-`fix` verdict, with the LESSONS.md line plus learnings/history/ file shape; AC2/AC3: added the same recording rule before the `akrogon phase <slug> merge --slot B` call in check.repair with the skip clause for Nits already written for this leaf.
- skills/merge-issue/SKILL.md — AC4: deleted the `## merge` first paragraph; the section now opens with "Before pushing, commit scoped outstanding changes".
- docs/guide/learn.md — AC5: line 9's lesson sentence now names the check skill recording before the move to merge instead of the merge skill; the learnings/LESSONS.md and learnings/history/ listing is unchanged.

Tests run:
- bun install (in worktree): 9 packages installed.
- AKROGON_BASE=923c6c98fac3f051a54ac27168ea024215652602 bun test --changed="$AKROGON_BASE" --timeout=30000 → "3 changed files, but no test files are affected", 0 pass / 0 fail. Clean; prose-only change.

Verification greps (brief step 5):
- grep -rn -i 'nit|lesson' docs/ → no page assigns the nit-to-lesson step to the merge pass. learn.md:9 now reads "The check skill can turn that nit into a short entry and a supporting history file before moving the leaf to merge". Other hits are unrelated (verdict names, learn-issues triage, lesson file locations).
- grep -n -i 'nit' skills/merge-issue/SKILL.md → one hit, line 35, the pre-existing "advisory failures as Nits" phrase in the pre-push paragraph; the Nit-to-lesson paragraph is gone.

Known limitations: none known. The post-`check.fix` re-check path has no recording trigger, per plan.md's recorded open limitation (brief section 5).

Unverified criteria: none. AC1–AC6 verified by the committed diff and the greps above.
