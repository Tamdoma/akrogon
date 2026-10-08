# Chart: merge-covers

## Destination
A repo can name which `checks` its `merge_checks` already cover, so merge runs those once. Repos without the key merge as today. Check and implement passes are unchanged.

## Forks taken
- [Merge covers](forks/merge-covers.md) (2026-10-08): optional `merge_covers` key, refused when a name is unknown or `merge_checks` is empty; charted in the framework chart `issues/chart/verify-speed`, round 4 Q3.

## Open forks

## Fog

## Off route
- `merge_checks` replacing `checks` whenever defined: rejected, changes every repo that sets `merge_checks`.
- Adding `merge_covers` to framework `issues/config.yaml`: operator step on framework main after this leaf lands.

Handed off 2026-10-08
