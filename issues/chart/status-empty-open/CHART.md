# Chart: status reads a missing issues/open as zero leaves and says so

## Destination
`akrogon status` with a missing `issues/open` treats the repo as having zero leaves, and a registered repo with no open leaves prints a line saying it has no open leaves instead of only its name.

## Decisions So Far
- [Missing open folder is zero leaves](decisions/missing-open-is-zero.md): zero leaves, name plus indented `no open leaves` line, exit 0.

## Open Decisions
None.

## Not Yet Specified
None.

## Out Of Scope
- Any other unreadable-repo path (missing repo dir, bad config.yaml) keeps today's `unreadable` JSON line and exit 1.

Handed off 2026-09-11 into `../../open/status-empty-open/`.
