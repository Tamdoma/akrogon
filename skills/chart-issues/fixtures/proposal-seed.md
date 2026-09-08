# Seeded Issue

Chart skill version: 3

## Observed Behavior

The chart was run outside an operator-attended materializing session.

## Expected Behavior

The chart emits portable proposal intake and does not create issue leaves.

## Where It Happened

The chart handoff boundary.

## Reproduction Context

The ground or live operator attendance was absent.

## Urgency

No materialized issue may be created until import.

## Recommended Direction

Import the proposal in an attended create-issue session.

## Constraints And Exclusions

- Chart decision `# Fixture decision` — proposal: use the direct handoff shape; reason: the chart already settled the route.
- Do not create a leaf folder or a series index at proposal time.

## Acceptance Criteria

1. The seed is portable and state-free.
2. Import rules every proposal and all four machinery locks.

## Grounding Anchors

- `issues/config.yaml` — configured repository keys.
