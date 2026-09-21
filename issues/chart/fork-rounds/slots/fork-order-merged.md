# fork-order · merged round

Each round now takes one fork. This round settles how the agent chooses the next one, without rebuilding the old status and dependency system. (both)

### Q1 · How is the next fork chosen? (both)

The old decision files had `blocked-by` and `Status`, and the agent picked the open one that unblocked the most others. Today's fork files have no such field, and CHART.md lists taken forks only. (A) The next fork should be answerable from what is already taken; among those, prefer the one whose answer reshapes the most remaining work. (B)

Research: better-than-training · `git show c547564:skills/chart-issues/SKILL.md:228-236`, read 2026-09-21 · the old pick rule was a preference, not a field the command read · the order can live in prose. (both) better-than-training · `skills/chart-issues/assets/shapes.md:77`, read 2026-09-21 · "A fork file with no operator answer under `## Taken` is open, and CHART.md lists none" · option A must change this sentence and the CHART.md example together. (B)

- **A (recommended)** CHART.md keeps an ordered "Open forks" list, next answerable fork first, preferring the one whose answer reshapes the most others, re-sorted after each Taken. Prerequisite explanations stay in the fork's Carries. No new field. (both)
- **B** Each fork file records the forks it waits on under Carries, and the agent asks only forks with nothing pending. Cost: links across files to keep true, and the command never reads them. (both)
- **C** CHART.md records only the selected next fork and its reason. Smallest write, but the remaining order is invisible on resume. (B)

Pitfalls: the list is a current judgment, re-sorted after each answer, or it goes stale. (both) It is not evidence that an earlier item is a prerequisite, and an empty list is not permission to hand off while fog remains (`shapes.md:163`). (B)

Challenge check: a practitioner could prefer B where many forks have real prerequisites; that does not justify a dependency system for an attended one-fork-at-a-time door. (B) "Reshapes the most" is a judgment, not a count; two equally useful forks may go in either order without a question. (B) A is what this chart already does by habit, so shapes.md needs the sentence or it stays a habit. (A)
