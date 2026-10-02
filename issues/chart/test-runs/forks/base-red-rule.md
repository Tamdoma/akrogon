# Base red rule

## Question
Q1. When does "red on base" justify stopping a leaf: any red base run (today), or only completed, comparable runs (same command and scope, same conditions) whose failures plausibly share a cause, with killed runs and load timeouts left as an unresolved execution failure?

### Carries
- F2: one base run, stop on any red, no comparison (skills/implement-issue/SKILL.md:38, skills/check-issue/SKILL.md:57).
- B rebuttal: a timeout can expose a real defect; require completed comparable execution and causal judgment, not an assertion-only rule. No retry-until-green.

## Findings

## Taken
