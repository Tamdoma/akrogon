# Changed-tests duplicate

## Question
Q1 Keep `test_changed` as the workers' landing proof but drop its separate run at implement end and merge, where the full suite runs on the same tree?

### Carries
- `skills/implement-issue/SKILL.md:51,59,75` require changed tests as work lands, at implement end and after repair; removing the config entry alone breaks those rules and the workers' only test command. (C)

## Findings
- Selects nearly everything when a leaf touches src (leaf-temp-dir merge: 81.85 s changed vs 83.40 s full, back to back); near 0 s on prose-only leaves (C: median 0 s over 41 runs, 5 runs 76-132 s). (A,B,C)

## Taken
Operator 2026-10-02, verbatim: "1a | 2a" (Q2 2a of the implement-mode round). Moved off route: the duplicate run now costs about 10 s.
