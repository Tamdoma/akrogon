# Chart door read a stale local checkout

## Case
Chart `task-cost` read `skills/chart-issues/SKILL.md` and `assets/questions.md` from local main, which was 5 commits behind origin/main. The operator asked whether peers B and C would both follow a new rule. A opened a fork for it. Peer C found that `ffd7be0` and `1a21e22` on origin/main had already settled it (closed chart `chart-peer-c`, operator 2026-09-26).

## Evidence
`git log main..origin/main` listed 5 commits, including `ffd7be0 peer-c-role: generalize charting peer role to optional C`. `akrogon pull` refreshes GitHub issue mirrors only, not the Git branch.

## Learning
`akrogon pull` succeeding says nothing about the checkout. Compare `main` with `origin/main` before citing file lines in a round. A fork already taken in a closed chart is a lock, not a new question.
