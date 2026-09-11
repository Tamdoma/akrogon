# Review B: tree-preflight

Verdict: ready

Base: `a6b53fdceca8e54b7618f59cffd0beb53c2d882b`
Reviewed head: `0e63cba4095b27d14ba5787c1b989061e0016781`

The head is one committed change ahead of the configured base, which is its ancestor. The worktree is clean. No issue artifacts are in the branch diff. Reviewed the whole initial diff against the plan, implementation brief/report, affected chart instructions, and live discovery/caller contracts. No peer review was used.

## Findings

No Fixes or Nits. The implementation meets C1–C6 and stays within D1–D7.

The shared validator uses area-relative depth and is wired into all three discovery walkers. Every leavesUnder call retains explicit area context, including parking and completion subtree scans. Ordinary next selection happens before the global lock, while dispatch still rediscovers under the repo lock. Existing per-repo and per-leaf failure isolation remains intact. Parked hints do not parse dormant state or add parked leaves to dispatch. Both chart instructions refuse occupied closed top-level owner destinations before writes and distinguish epic owners from their child issues.

The new tests exercise the real filesystem and CLI. They replace external process boundaries, not the discovery or selection code under test. No prose-snapshot tests were added. Literal parked diagnostics are explicitly required by the brief, and path, exit, lock, state and dispatch assertions test behavior.

## Verification evidence

Existing evidence applies to the unchanged reviewed head, so the full suite and other successful checks were not repeated:

- `implementation/full-test.txt`: `bun test`, 166 pass, 0 fail, exit 0.
- `implementation/typecheck.txt` and `implementation/format.txt`: both configured commands exited 0.
- `implementation/worker-3-green.txt`: configured changed-test command against the recorded base, 161 pass, 0 fail, exit 0.
- `verification-tree-preflight.txt`: 89 integration tests passed, with actual invalid-depth and parked diagnostics. The changed discovery loaded all 29 authoritative open/closed records.
- Worker red/green reports demonstrate the bugs before implementation and passing tests afterward. Two source-excerpt assertion errors are disclosed separately from the behavioral failures.

Additional review verification: `review-B-race.txt` records a temporary-repo real CLI invocation where a flock boundary shim moves a valid selected leaf to depth four at repo-lock acquisition. The command exits 1 naming the new state path. Only the global and repo locks were requested, no leaf lock or Herdr invocation occurred, and no lifecycle log was written. This independently verifies the retained locked recheck after the newly unlocked preflight. The reproduction exited 0 and cleaned its temporary fixture.

Manually checked chart semantics for standalone-owner collision, epic-owner collision, empty closed-owner folder, free destination, and equal nested child name under another owner. All match the plan. All required evidence exists, and there are no unverified acceptance criteria.

## Limits

The stated R1–R3 limits remain: chart preflight can be bypassed or invalidated concurrently, filesystem changes after preflight are rejected at locked rediscovery, and traversal stops at state-bearing leaves. These are explicit plan limits, not defects introduced by this change.
