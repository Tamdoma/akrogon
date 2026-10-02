# Operator-only exit

## Question
Q1 When a review finding needs something only the operator can do (a token scope, a live-run permission), does the seat stop once with `failed` and the exact operator action, instead of writing it as a Fix that routes to A?

### Carries
- `skills/check-issue/SKILL.md:27` already requires the failed stop; emdash-launch review-A.md listed the stray repo as Fix F2 anyway.
- Related: `repair-authority.md`.

## Findings
- emdash-launch: F2 needs `delete_repo` scope; A had four failed/recover flaps in 4 minutes on 2026-10-01 (framework log). (B,C)

Round 1 (2026-10-02): blind `../slots/last-forks-{A,B,C}.md`, merged `../slots/last-forks-merged.md`, rebuttals `../slots/last-forks-rebuttal-{B,C}.md`.
- The 18:47/18:48 failed/recovery was a seat-start "agent name taken" race, not an operator item (B).
- 20:10 B stopped correctly, its `--reason` led with base-red and the scope item second (C). Three recoveries followed by A re-failing after 17, 7 and 6 s with nothing changed (B,C). The aide recovered before the authorization reached A (B). The fourth recovery followed A acknowledging authorization and led to a 547 min repair (B,C).
- After recovery reset fix_rounds, A reviewed again and wrote the stray repo as Fix F2 "operator action only", telling check.fix not to fail on it (`review-A.md:152-156,176`) (A,B,C).
- The 403 blocker was not permanent: B later deleted the repo with existing credentials (`implementation/report.md:315,322`) (B). So the error alone does not prove an item is operator-only; the item must say what the seat tried and which credential it used (C).
- The stop rules (`skills/check-issue/SKILL.md:27`, `skills/merge-issue/SKILL.md:27`, `skills/implement-issue/SKILL.md:33`) cover the seat's own step, not a finding (C). A's instruction overrode the skill in practice (B).
- Agreed (A,B,C): an operator-only item is never routed to A as a repair; if it gates a criterion, merge waits; no command refusal, since the command cannot tell whether a blocker is resolved; recovery follows resolution (`docs/guide/phases.md:73`, `skills/watch-issues/SKILL.md:38`), and delivering a message is enough only for an authorization blocker (B). The operator action leads the `--reason` (C).
- Held: B stops immediately even in a mixed batch; C repairs the doable Fixes first, then one stop naming every operator action, which also gives a second look at whether the item is truly operator-only (C).
- Severity: B declines changing the Fix bar (`skills/check-issue/SKILL.md:51`); the item keeps its criterion and only its disposition changes.

## Taken
Operator 2026-10-02, verbatim: "1a | 2a | 3a |"

- Q1 1a: a confirmed operator-only item is never routed to A as a repair. B repairs the doable Fixes first under repair-authority 1a, then makes one `failed` stop naming every open operator action, the action first in `--reason`, with what the seat tried and which credential it used. If the item gates a criterion, merge waits. Recovery follows resolution. Reason: fewer turns and a second look at whether the item is truly operator-only (emdash-launch repo turned out deletable). Foreclosed: immediate stop in a mixed batch (B), command refusal, Fix-bar severity change.
