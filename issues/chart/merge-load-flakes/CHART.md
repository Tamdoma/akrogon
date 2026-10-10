# Chart: merge-load-flakes

## Destination
A merge run fails only because of the code under test, not because of host load or test-run races.

## Forks taken
- [flake-cause](forks/flake-cause.md): flakes to framework merge-gate chart; command records PSI totals per merge attempt

## Open forks

## Fog
None.

## Off route
- Named framework flakes: framework chart merge-gate, fork forks/load-flakes.md (relayed 2026-10-10, flake-cause 1a).
- #69 closure: stays open until PSI records show load or rule it out.
- Heavy-run slot and lower max_active: rejected by A,B,C until load is traced (test-runs Off route still holds).

Route: lifecycle (debate no)
Handed off 2026-10-10
