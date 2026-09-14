# Fork: who resolves

## Question
When the rebase onto the default branch stops with conflicts during merge, who resolves them?

## Carries
merge-issue:33-35, implement-issue:49, check-issue:43, phases.html:64, problems.html:64, in-practice.html:129, merge.html:63.

## Findings
- practitioner, kernel maintainer handbook: the integrator resolves, submitters only warn; the integrator is "often better than the developers involved". Changes: A resolving is an established integrator practice, not a shortcut.
- better-than-training, GitHub merge queue and GitLab merge trains: conflicts go back to the author. Changes: the author-fixes rule exists for human authors holding context; B here holds no more context than A once the plan and review are read.
- repo, akrogon log: all ten merge → check.fix rows were conflicts and every recorded resolution was a both-true union. Changes: no case so far needed the implementer.

## Taken
Operator answer (2026-09-14): `12a`. A resolves every rebase conflict in the merge phase, reruns every `checks` command, pushes. Foreclosed: a mechanical-versus-semantic rule; routing conflicts to check.fix. Note: framework leaf locked-state-mutations already shows A resolving a conflict itself because `akrogon phase` requires a clean worktree.
