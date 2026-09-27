# Chart: next-dispatch-scope

## Destination
A leaf starts only when the operator released it with a manual `akrogon next` in its scope. A completion, a hook event or Herdr startup never starts a leaf in another registered repo, or an unrelated leaf in the same repo.

## Forks taken
- [dispatch-scope](forks/dispatch-scope.md): completion starts only same-repo dependents of the completed leaf; Herdr startup resumes allocated leaves and starts none

## Open forks

## Fog

## Off route
- Capacity reservation for targeted leaves. The report does not ask for it.

Handed off 2026-09-26
