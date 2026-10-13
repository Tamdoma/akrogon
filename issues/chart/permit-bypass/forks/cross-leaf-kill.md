# Cross-leaf kill

## Question
Q1. How does a seat stop its own stuck or duplicate test run without a host-wide `pkill -f` that kills every other leaf's runs, and who cleans up browsers a killed run leaves behind?

### Carries
- Evidence 2026-10-13 (pi sessions): pass-two-review-notes ran `pkill -f 'akrogon run-check --name test_changed'` at 13:47:29Z; technical-pack-selection ran `pkill -f 'run-test-changed.ts'` at 14:04:09Z, which killed all four sweep runs (slots/sweep-results.md) and matches every leaf's test:changed. Both pkills also killed the seat's own shell.
- A killed test:changed left 155 Chrome processes alive in its scope (slots/sweep-results.md).
- Seats run in per-leaf scopes (src/scope.ts). guarantee Taken (no line); load-guard Taken.

## Findings
Round 2026-10-13, notes slots/kill-{A,B,C}.md, merge slots/kill-merged.md, rebuttals slots/kill-rebuttal-{B,C}.md.
- Per-leaf slice and per-pane scope bound resources, not signals; same-UID pkill reaches every leaf (A,B,C). No run handle exists to stop just one run (B,C). A killed runner leaves lanes and system-Chromium browsers alive; run-check has no signal handlers (A,B,C).
- Pick (A,B,C): each run-check run in its own unit under the leaf slice; a "stop my run" command whose target comes from the caller's own cgroup; skill rule against pattern kills. Deny-pkill rejected.
- Bus settled: systemctl --user stop works under the seat bus cut (host-test-load proofs.md:65-73); unit creation sets the bus per subprocess (scope.ts:88) (B,C).
- pkill --cgroup needs the full cgroup v2 path, not the unit name (C read-only check: 89 vs 0 matches). Still hits sibling runs in the same pane (B).
- Differ, unit type: B wants independent lifetime supervision (a SIGKILLed wrapper runs no cleanup; a scope lives while any member lives). C wants a scope stopped on every exit path plus a stale sweep at the next run-check and allocate; a service changes run-check's exec model (env, cwd, IO, exit status) and needs its own proof. B accepts scope plus independent supervision.
- Workers (B): own handles and may cancel only those; C: workers signal nothing. Cleanup on normal exit too (B); no shared-server case found.

## Taken
1a 2a, operator 2026-10-13 (verbatim "1a 2a |").
- 1a: each run-check and base-run run gets its own unit under the leaf slice, stopped on every exit path, with a stale sweep for a killed wrapper; `akrogon stop-run` takes its target from the caller's own cgroup and cannot reach another leaf or seat. Unit type (scope or supervised service) is settled by the leaf's proofs: SIGTERM and SIGKILL of the wrapper both end with zero descendants, a sibling run survives a stop. B's supervision dissent carried to the leaf design.
- 2a: stopgap rule committed 873db4e (implement-issue, check-issue, worker-protocol): no pattern kills; stop only by recorded PID; stopped only when no started process remains. stop-run replaces the PID wording when 1a lands.
- Foreclosed: deny-pkill wrappers, pkill --cgroup by unit name.

## Proof 2026-10-13: guard service stops a run scope when its wrapper dies
Identity: ivan uid 1000, systemd 262 (262-1-arch). Shell env DBUS_SESSION_BUS_ADDRESS=unix:path=/nonexistent; each systemd-run call set DBUS_SESSION_BUS_ADDRESS=unix:path=$XDG_RUNTIME_DIR/bus for itself.
Command per pair n=1,2: wrapper W = `bash -c "systemd-run --user --scope --unit=akrogon-proof-run-<n> --slice=akrogon-proof-run.slice -p TimeoutStopSec=5 sh -c 'sleep 900 & sleep 900' & wait"`; guard = `systemd-run --user --unit=akrogon-proof-guard-<n> --slice=akrogon-proof-run.slice -p TimeoutStopSec=5 sh -c "tail --pid=$W -f /dev/null; systemctl --user stop akrogon-proof-run-<n>.scope"`.
Observed: all four units active. `kill -9 W1`: after 3 s run-1.scope and guard-1 inactive, 0 processes in the run-1 cgroup; run-2.scope and guard-2 still active with their sleeps. `kill -TERM W2`: after 3 s run-2.scope and guard-2 inactive.
Cleanup: `systemctl --user stop akrogon-proof.slice`; `systemctl --user list-units --all 'akrogon-proof*'` empty; no sleep 900 left.
Limits: stand-in wrapper (bash), not run-check; no stdio or exit-status passing through the scope; same-uid seat env only.
