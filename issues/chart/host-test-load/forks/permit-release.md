# Permit release

## Question
Q1. When is a run permit released: when the run-check/base-run process exits (killed run frees capacity while browsers live) or when the run's owned workload is empty (one leaked browser holds the only permit until stop)?

### Carries
- Depends on limit-boundary.
- Rebuttal: ../slots/limit-boundary-rebuttal-C.md 1.

## Findings
Round 2026-10-13, notes slots/permit-release-{A,B,C}.md, merge slots/permit-release-merged.md, rebuttals slots/permit-release-rebuttal-{B,C}.md.
- All seats pick release at process exit. Workload-empty has nothing to read emptiness from under per-pane scopes and needs per-run units plus a recovery protocol.
- Permit: one exclusive flock(2) taken by the Bun run-check/base-run process through bun:ffi on libc, close-on-exec fd, never passed to children. Kernel frees it on any death. Strictly one, no slot loop or count key (A,B,C).
- One helper wraps spawnLogged at src/run-check.ts:173 and src/base-run.ts:164. check_start moves inside the permit. base-run worktree prep stays outside.
- Nested runs: a run token carried through constructedEnv plus a sidecar holder record verified by PID, kernel start time and boot id. A bare env flag is rejected because sibling shells in one pane could export it (B,C, A concurs).
- Lock path: under akrogon home (A,C), so AKROGON_HOME scenario runs do not contend with live seats. B holds out for per-UID /run/user/<uid>/akrogon-runs.lock as the only truly host-wide path. Carried to leaf design.
- No process-group kill at run exit (B,C, A withdrew): spawnFiles makes no group, setsid children escape, and it would move the child out of the seat's group that a pi abort kills.
- Leftovers stay in the pane box and end with the leaf stop, for dispatched seats only. Standalone `run-check --holder` shares admission but its leftovers are outside any box (B).
- Fog: suites that keep a server alive across separate run-check calls, trace for a SIGKILLed holder.

## Taken
1a, operator 2026-10-13. Reason: simple, and the queue can never jam on a stuck process.
- The permit is released when the run-check/base-run process exits, any cause. One exclusive flock(2) held by that Bun process through bun:ffi on a close-on-exec fd, strictly one permit.
- Nested runs reuse admission through a run token in constructedEnv plus a sidecar holder record verified by PID, kernel start time and boot id.
- No per-run units, no process-group kill. Leftovers of a killed run stay in the pane box and end with the leaf stop.
- Accepted residual: leftovers of a killed run can overlap the next run.
- Lock path (akrogon home vs /run/user/<uid>) carried to leaf design.
- Foreclosed: 1b workload-empty release, per-run units, flock(1) or helper-held locks, PID files.
