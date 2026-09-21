# Fork order

## Question

### Q1 · How is the next fork chosen: the agent picks the one whose answer reshapes the most remaining forks and lists the open forks in that order in CHART.md, or each fork file records which fork it waits on?

### Carries
- Blocked on forks/round-granularity.md: moot if all forks stay in one round.
- Old mechanism: decision files carried `blocked-by` and `Status`, and the work lane preferred "the one that unblocks the most others" (c547564 SKILL.md line 228).
- Lock: no new state fields unless necessary.

## Findings
- better-than-training · `assets/shapes.md` fork section, read 2026-09-21 · fork files have Question, Carries, Findings, Taken and no ordering field; CHART.md lists taken forks only · an ordered open-fork list in CHART.md is the smallest addition, and the resume rule already points at "the selected fork".

- better-than-training (B) · `skills/chart-issues/assets/shapes.md:77`, read 2026-09-21 · "A fork file with no operator answer under `## Taken` is open, and CHART.md lists none" · the ordered list needs this sentence and the CHART.md example changed together.
- B rebuttal 2026-09-21: merged round lacked the reply key and the operator-tier research line; both applied before presentation. No held disagreement. Full exchange in slots/fork-order-*.md.

## Taken
Operator 2026-09-21: 1-A. CHART.md keeps an ordered "Open forks" list, next answerable fork first, preferring the one whose answer reshapes the most remaining forks, re-sorted after each Taken. Prerequisite notes stay in the fork's Carries. No new field. Reason: one editable place to see what comes next, on resume too, without a dependency system.

Forecloses: a `blocked-by` or status field on fork files (B); naming only the next fork in CHART.md (C).
