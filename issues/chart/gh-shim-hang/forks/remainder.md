# Fork: remainder of #110

## Question

Q1. What resolves the part of #110 left open after bd996a7a (mise `gh` shim stall under run-check, no run-check deadline)?
- O1 no code: close #110 by bd996a7a; record the stall as host-side with root cause unknown on the reporter's host.
- O2 repair the reporter's launcher, then close on a passing reproduction.
- O3 general run-check deadline.
- O4 special-case gh/mise or rewrite PATH inside akrogon.

## Findings

- No remaining akrogon defect found (A,B). Cut bus is deliberate (src/run-check.ts:67, src/scope.ts:43); gh credential remedy in docs/guide/setup.md pass_env bullet (bd996a7a) (A,B).
- The stall reproduces outside akrogon on the reporter's host (`timeout 25 ~/.local/bin/gh --version` exit 124), so it lives in the host launcher (A,B). The live process was `mise x`, so `mise use -g` alone is not proven the cause (B).
- Not reproduced on this host: mise 2026.10.15, minimal env, `mise x gh -- gh --version` 0.04 s exit 0; scratch-config `mise use -g --quiet gh` fast exit 0, 2026-10-23 (A). Cannot disprove the reporter's observation (B).
- Cancellation exists: `akrogon stop-run` (src/stop-run.ts:9-29) stops an owned run; startRunGuard (src/scope.ts:65-80) stops the scope when the wrapper dies (A,B).
- No deadline: spawnCaptured awaits exit (src/run-check.ts:79, src/shell.ts:56); no duration contract exists; callers keep their own limits (A,B).
- mise docs read 2026-10-23: shims resolve the selected tool; `mise use` installs and writes config; `mise exec` may auto-install (B).

## Options

- O1 (A,B): no limit, knob or tool rule enters akrogon. Cost: the reporter's host may still stall until its launcher is fixed.
- O2 (B): needs access to /home/rudi; not this repo's work.
- O3 (A,B): a limit with no agreed value kills valid long checks; nested runs stay unbounded unless also covered.
- O4 (B): tool detection and version rules for an outside failure; checks diverge from normal shells.

## Pitfalls avoided

- Claiming repair from another host's probe: the close note states the host root cause stays unknown (B).
- Diagnosing with real global mise state: probes use scratch config only (A,B).
- #110 left open forever as a partial match: closed with what delivered its akrogon part (A).

## Taken

- 2026-10-23, A's pick under autopilot (not operator words): O1. Reason: no akrogon defect remains; the stall reproduces outside akrogon in the host launcher, cancellation already exists, and a deadline or tool rule adds code with no agreed contract (removing over adding). Rejected: O2 (other host, not this repo), O3 (no agreed limit, kills valid long checks), O4 (tool rules for an outside failure). Consultant dissent: none (B rebuttal "none").
