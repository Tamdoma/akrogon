# Repair-loop fixes

## Question
Q2: Which repair-loop fixes land now: 2a the three contradiction and placement fixes, or 2b those plus B making mechanical golden and debt-list syncs?

### Carries
- Operator 2026-10-15 overnight-recs D1: a missing case on existing tools goes back to A.

## Findings
- M3 (B): skills/check-issue/SKILL.md:79 closing clause contradicted the repair split in the same paragraph.
- implement-issue :82 replay target contradicted :80 (A).
- M5 (E): skills:scan and sections:scan ran only at merge in framework:verify:rest-a.
- M4 (E): B syncing goldens blurs "any correction of a test expectation stays with A".

## Taken
Operator 2026-10-15: "2a". 2b foreclosed: test expectation changes stay with A. Landed akrogon 23abf2f, d063067 and framework 176e96f2d, B reviewed (slots/review-2a-B.md), verify green (direct/).
