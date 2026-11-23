# Brief: remove the shared-runtime ownership race (paid-budget, D round 11)

Read: slots/review-D-paid-11.md (F21-F23), worktree /home/ivan/.akrogon/worktrees/akrogon/paid-budget at aefec9d6: tests/e2e/watch-consults.e2e.ts (judge), tests/e2e/watch-tier.ts:13-60 (session, coreRuntime, coreState, claimCoreRuntime, absent). Design: forks/design.md last block "Contain, then kill".

Problem: rounds 9-11 keep finding races at one seam. The judge claims a fixed path (`$XDG_RUNTIME_DIR/akr-e2e-watch`, non-recursive mkdir), removes coreState and coreRuntime in teardown, then checks absence of both. F22: a failure between claim and the try/finally strands the claim, and the next run is refused. F23: after the judge removes the runtime, a second judge can claim it before the first one's absence check, which then reports the second run's runtime as a leftover. F21 (separate, simple): the report is copied over a previous report in <out> instead of replacing it.

Constraint: the session name `akr-e2e-watch` is fixed by an operator-approved readiness grant (herdr-app readiness.yaml "naming: akr-e2e-watch", operator answer 2026-11-08 "the existing e2e tests keep their built-in throwaway session names"). Renaming it needs the operator.

Options (A's view, challenge it):
- O1. The runtime dir is the lock for the whole judge life. Claim it first, cover everything after the claim with teardown (F22), remove coreState and the leaf folders, check absence of everything except coreRuntime, and remove coreRuntime last as the release (F23). A successor cannot claim until the first judge is fully done. <out> is removed then written as a set (F21).
- O2. A per-run session name (`akr-e2e-watch-<pid>`), so nothing is shared and there is no claim. Needs an operator grant change.
- O3. Something else simpler.

Answer in at most 15 lines: pick one, name any race it still leaves (with the exact interleaving), and say what you would delete.
