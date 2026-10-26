# Cross-repo dependency

## Question

Q1. After a yes, when the new chart's leaves land in a different repo than the waiting chart's dependent leaf, what does the waiting chart wait for and what resumes it?

### Carries

- forks/no.md Taken (yes path).
- `src/next.ts` `discover(repo, ...)` in the dependents sweep: `blocked-by` resolves only within one repo.
- issues/chart/autopilot/CHART.md Off route: new timers, daemons or polling.

## Findings

- X1 (A; B agrees): the waiting chart waits on the other repo's leaves and hands off later.
- X2: hand off now with the dependency only in brief prose; nothing orders the leaf after its dependency.
- X3: cross-repo `blocked-by` in the command; new code beyond the handed work.
- C D4 (slots/rebuttal-C.md): rejected A's first shape (a `pending step:` and "later door"); B FC1 and C FC1-FC3 (slots/final-check-*.md) corrected it to the shape below; slots/final-check2-*.md no disagreement.

## Taken

A's pick (autopilot, 2026-10-26): X1, corrected.
- Compare against the waiting chart's dependent leaf's destination repo, not the chart folder's repo.
- Same destination repo: the waiting chart hands off with `blocked-by` on <X>'s leaves, no wait.
- Different destination repo: after <X> is handed off, the waiting chart stays unhanded with one ordinary `wait:` line naming every needed <repo>/<leaf> of <X> and its landed check: each named leaf folder is under that repo's `issues/closed/`. No `pending step:` line.
- Resume: the operator's next message in the same door, by the existing waiting-chart rule; the mode stays on meanwhile. No cross-repo `blocked-by`, no timer.
- Reason: no code, existing records only; the cost falls on a rare case.
- Rejected: X2 (leaf may run before its dependency); X3 (new machinery beyond the handed work).
- Standing dissent: C D4 point 1, the mode stays tied to another repo's progress, which autopilot does not watch.
