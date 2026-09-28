# Chart: cross-repo intake reaches the chart and closes with delivery

## Destination
`akrogon pull --all` pulls every registered repo from any cwd, including the herdr startup hook run from `plugin/`, while plain `akrogon pull` stays current-repo. The chart-issues door checks each handoff destination's open reports, and a matching report closes when the delivering issue completes.

## Forks taken
- [Destination intake](forks/destination-intake.md): check source plus each destination, at selection and again before handoff review; full unowned matches go into intake and every leaf's `sources`.

## Open forks

## Fog
None.

## Off route
- `pull --all` scope is not a fork: #38 expected behavior and the recorded contract (`issues/closed/akrogon-loop/github/pull-close/plan.md:18`) both require every registered repo. Making only `plugin/pull.sh` cd out of the repo was withdrawn because `--all` would stay cwd-dependent.
- Checking every registered repo on each chart. Ruled out by destination-intake Q1-A.
- Duplicate-closing undelivered destination reports during charting. Ruled out by destination-intake Q3-A.
- Changes to completion closure, `next --all`, seed-issue routing or pi-extensions#5 (already closed).
Handed off 2026-09-28
