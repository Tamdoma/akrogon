# Chart: base-red

## Destination
A red main that no commit caused is found once, gets one repair owner, and does not stop each leaf on its own; stopped work resumes without a manual move per leaf.

Route: undecided

## Forks taken
- none

## Open forks
- [red-base-policy](forks/red-base-policy.md): when a leaf meets a red it did not cause, does it wait on one shared incident, pass known reds through, or keep failing as today?

## Fog
- Incident identity (base sha plus command set, configuration and failing unit) and how a fresh base run is kept from reusing an old green receipt. Sharp once red-base-policy is taken.
- Resume trigger and repair owner. Shape depends on red-base-policy.
- Clock prevention: fix only concrete date-rotting assertions, or add a test rule or a clock seam.

## Off route
- Repeating the 10-17 timing-report fix: delivered on main in 0dfae20.
- Operator direct commits to main as a decay source: not shown by the evidence (23bce8b touched only issues/).

## Pending steps
- none
