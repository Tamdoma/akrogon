# Cross-leaf kill, merged (kill-{A,B,C}.md)

## Agreed
- Seats sit in per-pane scopes under a per-leaf slice (src/scope.ts:13-19, :53-88). That bounds resources, not signals: same-UID pkill reaches every leaf (A,B,C).
- No run handle exists: run UUID only in timings, .owner in a temp dir deleted on exit, permit sidecar host-wide and going away (src/run-check.ts:152-177; src/permit.ts) (B,C). `akrogon stop` stops a whole leaf (src/stop.ts:51-64) (B,C).
- Orphans: a killed runner leaves its lane and its browsers running; page-measure spawns system Chromium directly and cleans up only in JS (page-measure.mjs:309-313); run-check has no signal handlers (A,B,C). Only stopping the cgroup kills them all (sweep-results.md) (A,B,C).
- Pick: every run-check run gets its own unit under the leaf slice, plus a scoped "stop my run" command whose target comes from the caller's own identity, plus a skill rule: never pkill/killall by command pattern (A,B,C). Deny-pkill in tools rejected: easy to get around, blocks owned cleanup (A,B,C).
- Workload must be inside the unit before it spawns anything; probe needed (B,C). Nested, worker and base runs must not stop parents or siblings (B,C). A cancelled run is incomplete, never proof (B,C).
- Skill lines: implement-issue, worker-protocol, check-issue (A,B,C). C: workers signal nothing; only A stops runs.

## Found (C)
- Usable today with no code: `pkill --cgroup <own scope>` and `-A` (ignore ancestors; would have stopped both seats killing their own shell).

## Differ
- Unit type: B a transient service with a supervised main process (ExitType=main, KillMode=control-group), because a scope stays alive while any member lives and a SIGKILLed wrapper runs no cleanup. C a scope stopped by run-check on every exit path plus a stale sweep at run-check start and allocate for dead owners.
- Bus: B says seats have a dead bus, so seat-side systemctl cannot be assumed and needs a narrow control path. C says systemctl --user works under the bus cut (host-test-load seat-scope proof T7) and run-check sets the bus per subprocess (scope.ts:88).
- C: per-run kill at every exit breaks suites that keep a server alive across separate run-check calls; accept or kill only on abnormal exit.
