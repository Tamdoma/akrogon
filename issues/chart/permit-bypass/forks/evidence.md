# Evidence

## Question
Q1. Does output from a test run outside the printed `checks` command count as proof for a done-criterion or `checks` result?

### Carries
- slots/map-merged.md M3, M5; check-issue SKILL.md:55,61; run-check constructedEnv src/run-check.ts:44-58.

## Findings
- Output outside the printed checks command never replaces a required checks result; targeted output can prove the specific done outcome it exercises (B rebuttal F2, A,C accept).

## Taken
Operator 2026-10-13, verbatim "1a, 2a, 3a, 4a, 5a". Round notes slots/ship-{A,B,C}.md, merge slots/ship-merged.md, rebuttals slots/ship-rebuttal-{B,C}.md.
Taken: close with one sentence in check-issue SKILL.md:55,61 as above. No validator.
