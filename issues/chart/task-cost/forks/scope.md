# Scope

## Question
Q1. Does this chart change only the chart-issues door, or also lifecycle defaults (seat effort, implement mode, retry counting, phase-skill prose)?

### Carries
Operator note says "charting process system" and lists lifecycle principles (retries, escalation, subagents, tests).

## Findings
- (A, C) Whole lifecycle. The big levers (seat effort `config.yaml`, `implement: subagents`, the fix loops) exist only in dispatched seats. The chart door runs in the operator's own session and has no configured effort.
- (B) Chart first, with lifecycle changes approved separately. A global config change affects every registered repo.
- Every lifecycle change here is still decided fork by fork, so choosing "whole" does not pre-approve any change.

## Taken
2026-09-27, operator: "I dont think we need to tocuh the lifecycle, just the charting door. Look it up if we need to change anything there according to the article to make it more wlegant and cheaper."
Chart door only (1-B). Foreclosed: seat effort, implement mode, the retry cap and escalation, and phase-skill prose.
