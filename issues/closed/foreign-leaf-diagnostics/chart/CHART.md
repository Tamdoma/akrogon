# Chart: next reports a foreign issue tree once per pass

## Destination
A registered repo whose issue tree holds leaves keyed to another registered repo produces one actionable message per `akrogon next` pass naming both keys and the count, not one error line per leaf.

## Forks taken
- [Foreign leaves: what next reports and whether the repo keeps dispatching](forks/mismatch-reporting.md): one summary line per repo per pass, valid leaves keep dispatching and foreign leaves do not count toward max_active, walk-time detection only.

## Forks open
None.

## Fog
None.

## Off route
- The framework merge that copied `issues/` into clinique-la-roya. Owned by the framework repo's update workflow, not akrogon; exact command untraced (INTAKE.md).
- Deleting the remaining foreign `issues/chart/`, `log.jsonl`, `continuity/`, `history/`, `token-ledger.yaml` in the consumer. Operator step on that repo's main.
- Remembered "already reported" state across passes. Requires persistent machinery the operator has ruled out for stall detection and is not asked for here.

Handed off 2026-09-19 into `../../open/foreign-leaf-diagnostics/`.
