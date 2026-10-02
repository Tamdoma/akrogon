# Intake: akrogon-slow-phases

## Scope
akrogon repo leaves: find where wall time goes inside implement and merge (test and check runs, model work, waiting) and cut the slow part. One chart, destination akrogon.

## Provenance
- Operator: chart-issues door 2026-10-02, reply to reviewer-repair round 1
- Operator: same session, reply to reviewer-repair round 2

## Source: operator 2026-10-02 reply to reviewer-repair round 1 (excerpt relevant here)
I just want to avoid constant back and forthing for failed tests, it just doesn't make sense. In fact, this testing and fixes take up so much time, look at the recent fixes for akrogon.

## Source: operator 2026-10-02 reply to reviewer-repair round 2
1a | let's also look into the slow part in akrogon you had mentioned.

## Agent findings
From `issues/chart/reviewer-repair/slots/repair-authority-*.md`: akrogon leaves since 2026-09-29 spend about 61% of logged phase time in implement, 15% in merge, 13% in first review, 7% in repair. The log records phase moves only, so it cannot say how much of implement or merge is test and check runs (B).
