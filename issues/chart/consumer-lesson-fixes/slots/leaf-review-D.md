# Leaf review, slot D

## worker-stash-rule: two defects

D1. The creation commit has no stated fill time, and the obvious one is wrong.
- Evidence: implement-issue SKILL.md writes "one sub-brief per unit from the template" before any wave runs. worker-protocol "Launch and return" creates each worker worktree "at the leaf's committed HEAD" at its wave, after earlier waves' cherry-picks. A value written when the sub-brief is written is stale for every wave after the first, and `git reset --soft <stale commit>` then folds earlier waves' commits into the unit's returned commit.
- Smallest correction: brief What says "section 4 records the commit A created the worker worktree at, filled by A when it creates that worktree". Add it to criterion 1 the same way.

D2. Criterion 3 names a test file.
- Evidence: shapes "Leaf files": a done-criterion is "never a test file, assertion or test count". The repo's blocking `test` check runs the whole `bun test`, which includes the link test.
- Smallest correction: "Links in the changed files resolve on the leaf head (the `test` check)".

Small: design "Leaf architecture" cites worker-protocol "Failure ownership" for the cherry-pick. The integration rule is in "Launch and return". Fix the cite.

## trailer-rule-refusal: one defect

D3. Criteria 1 and 2 name a test file, a case count and an assertion.
- Evidence: criterion 1, "Proven by one case on the existing citation fixture in `tests/phase.test.ts`, red before the fix on the one-line phrase". Criterion 2, "the existing tests asserting \"final trailer block\" stay green unchanged". Shapes "Preflight and validation": "the audit refuses a criterion naming a test file, assertion or test count".
- Smallest correction: criterion 1 ends "Proven by the leaf's own test." Criterion 2 becomes "The frozen-citation refusal prints the same shared text, and no existing test is edited (the `test` check passes)". The file, the fixture and the "one line" phrase already sit in the design's Taken copy, which is their home.

Rest holds. The refusal text, the builder, the unchanged readers and the done record match the fork and `src/phase.ts`.

## installed-step-transfer: one defect

D4. Criterion 3 names a test file. Same evidence and correction as D2.

Rest holds. Checked against live files: six `lesson-rule.md` copies exist (`skills/lesson-rule.md` plus five), `docs/use/learn-from-work.md` has the Transfer bullet, and no other skill or doc restates the same-repo limit, so the owned-file list is complete. Criterion 1 allows every outcome per lesson, which is right for a model's choice. Its observable part is the report's walk naming the deciding sentence.
