# Readability enforced by code or by rules

## Question
Q3 · Should the sender reject bullets that contain code markers, or leave readability to the writing rules?

### Carries
- Operator core principle: mechanical checks validate function only; quality judgment belongs to a thinking agent.
- Sender runs after completion with no operator present.

## Findings
- A guard on backticks, slash paths and dash-flags catches the common leak but needs exceptions and can lose a broadcast over a wording nit.

## Taken
Operator 2026-09-14: `1a`. Rules only; the skill text carries the plain-reader rule and the agent judges it. Reason: no new failure mode, no rule a legitimate sentence trips over. Foreclosed: a mechanical readability guard in the sender.
