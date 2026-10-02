# Check lifetime

## Question
Q1 Do seats run known minute-scale checks with a deadline long enough to finish and await their real exit, instead of a 120 s tool limit that kills and restarts them?

### Carries
- Independent of suite speed: base-red reruns run the old suite at `AKROGON_BASE` (`skills/implement-issue/SKILL.md:38`). (B)

## Findings
- Four merge test commands killed at 120 s and restarted, about 8 min (worker-path, base-preflight, chart-destination-intake, round-labels). (B)

## Taken
Operator 2026-10-02, verbatim: "1a | 2a" (Q2 2a of the implement-mode round). Moved off route: the new suite takes 9-10 s alone and 25-27 s with 4 suites at once, far under the 120 s tool limit; base reruns gain the speed once the suite leaf merges.
