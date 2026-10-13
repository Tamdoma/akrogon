# Guarantee

## Question
Q1. What must "one heavy test run at a time on this host" mean after this incident, and where is it enforced?
- 1a Keep the current boundary and say it plainly: the permit serializes only `akrogon run-check` and `base-run`; anything else a seat starts is bounded by the akrogon.slice ceiling and stoppable, never queued. The patch is seat instructions plus the long-run path (fork long-run-path), and the host-test-load limit-boundary residual is written down.
- 1b Gate the heavy entry points themselves: each registered repo's heavy test scripts (framework `test:changed` = .claude/workflow/scripts/run-test-changed.ts, package.json:11) re-enter through `akrogon run-check` when AKROGON_RUN is absent, using the existing nested path (src/permit.ts:94-98). Adds a framework destination.
- 1c Per-run scope plus throttled panes: run-check moves its admitted child into its own scope with the full quota; pane scopes get a small CPUQuota so raw runs crawl. Reopens permit-release (per-run units foreclosed).

### Carries
- Intake: ../INTAKE.md. Map: ../slots/map-merged.md.
- Locks: ../../host-test-load/forks/limit-boundary.md Taken (revised 1a; 1b "direct runs bypass, known limit" foreclosed), permit-release.md, heavy-runs.md (every run-check takes the permit, no light list), queue-order.md (no waiter registry, no priority), ceiling-values.md (CPUQuota 1600%, "half the PC stays free").
- Related forks: long-run-path.md, evidence.md, queue-visibility.md, ceiling-trigger.md.

## Findings
Notes: ../slots/guarantee-A.md, -B.md, -C.md; merged ../slots/guarantee-merged.md; rebuttals ../slots/guarantee-rebuttal-B.md, -C.md. Systems context: ../slots/system-merged.md.
- Picks: B,C 1b; A 1a. All keep 1a's wording work as a component. 1c rejected (A,B,C): a quota throttles, it does not queue.
- Gate form: B refuse with the full permitted command; C re-enter through run-check. C R2: refuse breaks every in-flight raw caller (2 workers + 1 seat live) and needs the long-run path first; re-enter needs a root-checkout behavior (src/run-check.ts:134).
- Token (C R1): a presence check in the script trusts AKROGON_RUN, which any same-UID process can copy from /proc/<pid>/environ. The safe form always calls akrogon and lets src/permit.ts:93-97 decide, with a loop break for the inner call.
- Guarantee wording (B R2): one admitted top-level run at a time through covered entry points while its holder lives; killed-owner leftovers stay the permit-release residual.
- Coverage (B R3, C R4): needs a named inventory; C proposes deriving it from the repo's `checks` inner commands. No akrogon (CI, fresh clone): B never silently ungated, C run free.
- Workers (B R5): their raw runs are an undefined-term failure (worker-protocol.md:25, brief-template.md:37), not a protocol that prescribes raw (C R3); whether workers should run test:changed at all is fork worker-duty.
- B R1: the seat's first raw call came before any timeout (session :47), so the cause is not only timeout pressure.

## Taken
2026-10-13, operator, verbatim (after asking "what if we remove the serial limits altogether, but just cap to 16 cores and that's it?" and the door's answer): "I don't want the line to even be there, but we need to optimize everything else, too. I just don't want the PC to blow up, but we need to make sure there's no clogging and everything's going fast, and the tests don't take up so much time."
Decision: remove the run permit (the host-wide line) entirely. The akrogon.slice ceiling (CPUQuota 1600%, MemoryHigh 64G, MemoryMax 96G, no swap) is the host limit. Round 1 options 1a, 1b, 1c and questions 2 and 3 are moot.
Reason: the slice already keeps the PC safe; the line made the clog (queue, timeouts, bypass) and caps throughput at one run while most runs use 2-4 of 16 cores.
Reopens (host-test-load): limit-boundary revised 1a (permit part only; seat containment and the bus cut stay), heavy-runs, permit-release, queue-order. Foreclosed: gating entry points, refuse/re-enter, permit count 2, queue visibility for the permit.
Carried risks into fork load-guard: memory (one full run ~16 GB, 409 Chrome) and timeout flakes when many runs share 16 cores.
