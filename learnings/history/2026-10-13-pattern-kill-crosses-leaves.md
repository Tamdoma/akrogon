# Pattern kill crosses leaves

## Case
Two framework seats stopped their own stuck test runs with host-wide pattern kills: pass-two-review-notes ran `pkill -f 'akrogon run-check --name test_changed'` at 13:47:29Z and technical-pack-selection ran `pkill -f 'run-test-changed.ts'` at 14:04:09Z (their pi sessions, 2026-10-13). Both killed their own shell too.

## Evidence
The second pkill ended all four runs of the door's concurrency sweep at 14:04:08Z with SIGTERM, 741 s in (issues/chart/permit-bypass/slots/sweep-results.md). Per-leaf slices and per-pane scopes (src/scope.ts) bound resources, not signals. The killed runs left 155 Chrome processes alive in their scopes until the scopes were stopped.

## Learning
Cgroup boxing does not stop a same-UID pattern kill from reaching other leaves, and killing a runner does not take its browsers down. Seats need a run handle scoped to their own cgroup; until then the skills forbid pattern kills (chart permit-bypass, fork cross-leaf-kill).
