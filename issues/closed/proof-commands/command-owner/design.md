# Design: command-owner

## Binding decisions, verbatim

### proof-command-owner (chart issues/chart/criterion-outcomes/forks/proof-command-owner.md)

Operator 2026-10-19: "1a | 2a | 3a" (after "elid").

1. 1a: a done-criterion locks only the observable result; `plan.md` owns the proof command. A replaces a wrong command with one observing the same result, preferring the repo's configured runner (B), and records old command, new command, reason and evidence. B judges in review that the same tests and cases run and a deliberate break still fails. B in check.repair and merge hands a command correction to A. A runner command already written inside a criterion is proof, judged by that guard (C). An invocation that is itself the product behavior stays locked. A correction never widens a live or paid action.
2. 2a: the rule is written once, in `plan-issue`, and the `test-proof-rules` citations in implement-issue, check-issue and merge-issue point to it. Correction after the round: the 2026-10-16 lesson is not retired, because `skills/lesson-rule.md` Retire needs a removal, loud refusal or running guard, and a written rule is none; the lesson line stays.
3. 3a: no mechanical check against commands in criteria.

Binding avoidance mechanisms (slots/notes-merged.md): a correction keeps the same named tests and cases and a deliberate break still red (A,B,C); the criterion's own result must still be shown passing, and configured `checks` keep the existing known-red path and stay repo-owned (A,B,C); a correction never widens a live or paid action (B,C); old stop wording is replaced at each point that states it, not stacked on (B).

Foreclosed: operator amends each time, known-red waiving a criterion, running criterion commands on base at handoff, any seat swapping the command, a command registry or matcher, a mechanical lint, fixing an unowned base-red cause inside the leaf.

Exclusions: `skills/chart-issues/assets/shapes.md` audit wording stays (it already requires outcome-only criteria). The direct route is covered by criterion 5: `check-issue` `Standalone review` today substitutes the chart's brief and design wherever review names `plan.md`, so it needs explicit text (B,C). `learnings/LESSONS.md` and the 2026-10-16 history file are not changed.

### Standing design

Installed path: /home/ivan/.claude/skills/chart-issues/assets/standing-design.md.

Interpretation for this leaf: the product is skill text, so no test exists for criteria 1-3 and 5 (a test asserting prose would be a vanity test that keeps a copy of the text); their proof is B's review reading each changed section against the criterion. Criterion 4 is proven by a repository search for `test-proof-rules` returning nothing. No machinery, no live run.

## Leaf architecture

Owned surfaces: `skills/plan-issue/SKILL.md` (`plan.synthesis`), `skills/implement-issue/SKILL.md` (Shared context failure ending and known-red paragraph, the `implement` test-writing paragraph (C), `check.fix` including the merge-returned reproducing-command paragraph (B), `Direct form` (B,C)), `skills/check-issue/SKILL.md` (`check.review` known-red paragraph and criterion judging, `check.repair` exceptions and `Handed to A`, `Standalone review` (B,C)), `skills/merge-issue/SKILL.md` (red verify paragraph and repair exceptions), and any `docs/` or `README.md` line matching criterion 4.

Interface: the rule, including its equivalence guard, lives in one paragraph of `plan.synthesis`; the other skills name that section instead of restating it (C).

Consumers: seats reading the four skills; the installed skill copies under `~/.claude/skills` follow from the release, outside this leaf.
