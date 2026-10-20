# Chart: paid-proof-bounds

## Destination

A fresh paid model run happens only where model behavior itself is under test; code repairs are proven against saved real output, and no seat skill authorizes paid reruns without asking.

Route: direct

## Forks taken

- [limit-mechanism](forks/limit-mechanism.md): shrunk to wording only: drop "reruns ... without asking again" and the "live-change"/"before mutating" scope so paid launches fall under the existing grant; no counting; 2a no provider-side hard stop (operator 2026-10-19).
- [fresh-run-need](forks/fresh-run-need.md): 1a recorded-output rule for every proof, fresh call only on model-facing change, missing recording or whole-run property; 2a open framework leaves not swept, they stop at their next paid launch (operator 2026-10-19).

## Open forks

none

## Fog

none

## Off route

- [bound-unit](forks/bound-unit.md) session counting: operator 2026-10-19, "I don't want to overcomplicate the system".
- Framework replay stage resume: operator 4a (2026-10-18), not now; revisit only if spend stays high after this chart.
- The two flaky tests from `akrogon flaky`: operator 3a (2026-10-18).

## Pending steps

none

## Direct attempt

- branch: paid-proof-bounds
- worktree: /home/ivan/.akrogon/worktrees/akrogon/paid-proof-bounds
- base: b5a877c1c21d952e7ef86579e8eacecbd582aa5f
- head: e522c1865538294dc1f65a90c7bcb5309a667513
- rounds used / fix_rounds: 0 / 3
- push attempts: 1 / 2
- done: brief criteria 1-5 (B review-B-1 ready; verify green; direct guards passed)
- not done: none
- trigger: none
- review files: slots/review-B-1.md
- landed SHA: e522c1865538294dc1f65a90c7bcb5309a667513

Closed 2026-10-19
