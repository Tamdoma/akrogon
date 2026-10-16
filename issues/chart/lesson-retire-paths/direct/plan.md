# Direct plan: lesson-retire-paths

Base 4088a91. Worktree /home/ivan/.akrogon/worktrees/akrogon/lesson-retire-paths. Binding decisions: forks/retire-rule.md Taken 1a, 2a, 3a.

## Read first
INTAKE.md Agent findings; forks/retire-rule.md Taken; src/lessons.ts:11-25 (Applied prefix is the only machine-read marker).

## Unit 1 (serial-solo, one wave, one unit)
Restate the retire rule once in skills/lesson-rule.md and point the other sites at it rather than repeating it.
- skills/lesson-rule.md Retire: three exits on every reachable path (removal; reader or writer refusing loudly at the point of use before the lesson's harmful effect; running guard); a deleted cited file is not enough while the pattern is reachable elsewhere; `Applied <YYYY-MM-DD> by <file:line or commit>: <what stops it>`. Add Transfer: Stays lessons only, root learn-issues pass only, same repo only, operator approval of the uncommitted diff, `Transferred <YYYY-MM-DD> to <file:line>, approved by <who>`; leaves never transfer; Checkable never transfers; an unreached step keeps the lesson; another repo's step keeps the lesson and names that repo and step.
- skills/learn-issues/SKILL.md: Guarded -> Stopped (three exits); Checkable = mechanically detectable, still reachable and unstopped; Stays default; Transfer outcome as above; Apply lines; footer counts.
- skills/implement-issue/SKILL.md lesson paragraph: "lands what stops the mechanism on every reachable path (removal, loud refusal, or running guard)" with the new Applied form.
- skills/check-issue/SKILL.md:61: accept a removal when the diff stops the mechanism on every reachable path by one of the three exits; a transfer in a leaf diff is a Fix.
- skills/chart-issues/assets/shapes.md:289 and skills/chart-issues/SKILL.md:75: "complete guard" -> "complete stop" (removal, loud refusal or guard).
- Prose: learnings/LESSONS.md:5, docs/guide/learn.md:18, skills/AREA.md:15, README.md:222, docs/guide/cheat.md:149.
- grep the worktree for "mechanical guard", "Guarded", "guarded lines" and fix stale hits in docs.

## Proof
No new tests: prose-only change; check-issue rejects exact-wording tests. Proof is grep showing no stale single-exit wording, plus `akrogon verify --holder <chart>/direct`.
