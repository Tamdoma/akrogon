# Chart: akrogon

## Destination
This host's machine state lives in `~/.akrogon`: the one-time move from the tool root runs on the next akrogon command, waiting only for live run records and the locks it already holds. Registered repo: akrogon.

## Forks taken
- [Writer gate](forks/writer-gate.md): delete the process scan; move waits for live run records and locks (A on autopilot, 1a).

## Open forks
none

## Fog
None.

## Pitfalls avoided
- A write can land in the old home during the copy: an akrogon process older than state-home, `init`, or an admission on a new slice lock (B final F1). Removed by a shared `admission.lock` every admission holds and the move takes exclusively (B review F1), plus the attended rollout in forks/writer-gate.md: hold the gate with a live run record, deploy, drain every pre-deploy akrogon process, release, read back (owner: door, done 2026-10-16 03:44 local: hold live, deployed 568556b, no pre-deploy akrogon process left, released, `moved state home`, status works, repos match, no tool-root write after the move).
- release-deploy must not ship before the move: `~/.akrogon/config.yaml` present and `akrogon status` working before release-deploy left implement (owner: door, done 2026-10-16).

## Off route
- Leaked test helpers `sh -c touch /tmp/akrogon-*/marks/...` alive since 2026-10-13 (22 processes): a test fixture leak, not a writer.

Route: direct, A on operator autopilot delegation. Eligible: no inputs, grants, produces or retained; unit tests only; one outcome; B named. Usage at review: see `chart-usage.ts` output, outcome partial.

## Direct attempt
- branch: state-cutover-gate
- worktree: /home/ivan/.akrogon/worktrees/akrogon/state-cutover-gate
- base: 83b9279
- head: 568556b
- rounds used / fix_rounds: 4 / 8
- push attempts: 1 / 2
- done: 1, 2, 3; verify green on 568556b; guards passed
- not done: none
- trigger: none
- review files: slots/review-B-1.md, slots/review-B-2.md, slots/review-B-3.md, slots/review-B-4.md, slots/review-B-5.md
- landed SHA: 568556b

Closed 2026-10-16
