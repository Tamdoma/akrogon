# Can initial reviewers ask each other questions during check.review?

## Question
How is the mutual wait between two concurrent reviewers removed?

### Carries
`skills/check-issue/SKILL.md:21`. Function over form: no word-matching tests of skill prose.

## Findings
(both) both slots review concurrently and both may wait for the other to go idle; a cycle. (B) a generic timeout would mask it.

## Resolution
Operator 2026-09-11: `8a` after explanation. No peer questions during `check.review`; each reviewer records unresolved points in its verdict. Peer questions remain allowed in `check.fix`. Foreclosed: an ordered question turn.
