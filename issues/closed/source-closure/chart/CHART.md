# Chart: source-closure

## Destination
Every GitHub identity that enters the mirror ends either closed on GitHub by the command with a comment naming what delivered it, or carried in the `sources` of an open leaf. A report the chart door finds already delivered or duplicate is closed at intake time, and the door names any charted identity that is still open on GitHub instead of skipping it silently.

## Forks taken
- [close-path](forks/close-path.md): `akrogon close <owner/repo#n> --by <text>` posts `delivered by <text>` via `closeSource`; the door runs it for delivered or duplicate identities (2026-09-21).
- [pull-warning](forks/pull-warning.md): the door names skipped identities still open on GitHub at open and offers `akrogon close`; pull unchanged (2026-09-21).

## Open forks
none

## Fog
none

## Off route
- Changing `closeSources` or `completeOwner` for merged leaves; that path works and stays.
- Any automatic close during `pull` or `next` without an operator-driven pass (operator lock: no automated program runs things without the operator pushing the command).
- Re-mirroring behavior of pull for genuinely open reports.

Handed off 2026-09-21
