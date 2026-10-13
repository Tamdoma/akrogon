# Heavy runs

## Question
Q1. Does every run-check and base-run execution take a permit, or can repo config name light checks that skip it?

### Carries
- Depends on limit-boundary.
- B: all, no exemptions. C: default heavy, per-name light list.

## Findings

## Taken
See Findings: settled by limit-boundary 1a, every run-check and base-run execution holds the permit.
Settled by limit-boundary 1a, 2026-10-13. The round text the operator answered "1a" to said "One ticket for the whole PC. Every test run started through `run-check` or `base-run` must hold it." So every run-check and base-run execution takes the permit, with no light list. Foreclosed: per-name light list (C). A later need for exemptions is new intake.
