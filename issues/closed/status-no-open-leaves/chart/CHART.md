# Chart: status-no-open-leaves

## Destination
`akrogon status` with a missing `issues/open` treats the repo as having zero leaves, and a registered repo with no open leaves prints an indented `no open leaves` line under its name, exit 0.

Single issue `status-no-open-leaves`, single leaf `status-empty-open-fix`. Owns #1.

## Forks taken
- [Missing open folder is zero leaves](forks/missing-open-is-zero.md): copied from the prior chart, still valid.
- Re-intake: operator 2026-09-11 `14a`, fix rather than drop; prior leaf was deleted outside akrogon.

## Forks open
None.

## Fog
None.

## Off route
- Other unreadable-repo paths keep the `unreadable` JSON line and exit 1.

Handed off 2026-09-11 into `../../open/status-no-open-leaves/`.
