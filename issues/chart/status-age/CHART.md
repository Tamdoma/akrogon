# Chart: status-age

## Destination
`akrogon status` shows how long each leaf took from start to end, and the value stops changing once the leaf is finished.

Route: direct

## Forks taken
- [red-main-date-test](forks/red-main-date-test.md): drop the expired age-range asserts, keep the test, own commit on this branch
- [age-meaning](forks/age-meaning.md): total time per leaf, first delivered prompt to merged/failed (frozen) or now, `17h28m`, header `TIME`

## Open forks
- none

## Fog

## Off route
- Chart list (`status --charts`) AGE column, based on CHART.md file time: not raised by the operator.

## Pending steps
- none

## Direct attempt
- branch: total-time-column
- worktree: /home/ivan/.akrogon/worktrees/akrogon/total-time-column
- base: 23bce8b7533aaa4992fb4bf44c7a398c4bce47df, then 0dfae200ae84fc46f10e0d07973c78721cf5d7c9
- head: bc0ab32 (d94e128 dropped, superseded by main 0dfae20)
- rounds used / fix_rounds: 1 / 8
- push attempts: 2 / 2 (1 rejected, main moved to 0dfae20; 2 pushed)
- done: criteria 1-6 (akrogon verify green on bc0ab32, 994 pass), B reviews ready
- not done: none
- trigger: second outcome. tests/timing-report.test.ts:534 expects the oldest uncarried fixture issue (filed 2026-10-11) at most 5 days old, and on 2026-10-17 it is 6. Red on retry (check-retry-flow-report). Main is red for every branch from today.
- review files: slots/review-B-1.md, slots/review-B-2.md, slots/review-B-3.md (all ready)
- landed SHA: bc0ab32625c92f713e66fdde7f15cdd545e0cecc
Closed 2026-10-17
