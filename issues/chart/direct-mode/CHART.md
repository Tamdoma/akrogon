# Chart: direct-mode

## Destination
In a repo that opts in through `issues/config.yaml`, the chart door can end a fully gated single-item chart by
implementing it itself (A) on a branch worktree, with the chart's B pane reviewing under the check-issue bar, instead of
handing off a leaf. The door recommends direct or full lifecycle at the handoff review; the operator chooses.

## Forks taken
- [Container](forks/container.md): no leaf record; the chart folder holds the work and closes with `Closed <date>` naming the commit
- [Eligibility and setting](forks/eligibility.md): code only (no inputs, grants, produces, retained, live-run criteria); setting off by default, on means offer with recommendation
- [Landing and completion](forks/landing.md): door rebases, checks, pushes exact SHA; B re-checks conflict fixes; closes sources and broadcasts after push; branch code only
- [Growth and repair bound](forks/growth.md): stop, commit partial, `Direct attempt` section, lifecycle adopts the branch or abandon; rounds = `fix_rounds`; 2 push attempts
- [Hand-built removal](forks/hand-built-removal.md): delete `hand_built`; park is the one way to keep work from agents

## Open forks

## Fog

## Off route
- C as a second reviewer: the intake names A and B only.
- Size thresholds in config (lines, files): not observable before implementation.
Handed off 2026-10-08
