# Brief: nits-before-merge

## What
Move the Nit-to-LESSONS step out of the merge pass and into `skills/check-issue/SKILL.md` (A,B,C):
- In check.review, before B records a verdict that is not `fix`, B records its held reusable Nits.
- In check.repair, before B's move to `merge`, B records its held reusable Nits, skipping Nits it already wrote for this leaf.

Each Nit becomes one mechanism/date/history line in the registered checkout's `learnings/LESSONS.md` plus a history file with case, evidence and learning, left for the operator to commit. Remove the step from `skills/merge-issue/SKILL.md` `## merge`, and update any doc that describes where the step runs.

## Why
With batching (leaf merge-batch), only the holder's B runs a merge pass. Carried leaves never run one, so their held Nits would be lost. In check.review, B cannot see the move into `merge` itself, because the command picks the destination from both seats' verdicts (`src/phase.ts:241-250`). So B records before its non-`fix` verdict (A,B,C). Accepted cost: a lesson can be written for a leaf that later fails.

## Done-criteria
1. `skills/check-issue/SKILL.md` tells B to record held reusable Nits in check.review before recording a verdict that is not `fix`, and in check.repair before its move to `merge`, skipping Nits already written for this leaf. Both write to the registered checkout's `learnings/LESSONS.md` with a history file, left for the operator to commit. (A,B,C)
2. `skills/merge-issue/SKILL.md` no longer has a Nit-to-LESSONS step.
3. No doc under `docs/` still places the step in the merge pass.
