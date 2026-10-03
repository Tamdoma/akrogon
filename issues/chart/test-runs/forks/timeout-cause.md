# Timeout cause

## Question
Q1. What made the #53 browser-capture tests time out: machine load (CPU, memory, IO), or concurrent runs sharing something (fixed ports, fixed temp paths or sockets, shared browser or wrangler state), or something else? The answer decides whether a heavy-run slot is needed, how many runs it allows, and what the base-red rule must compare.

### Carries
- Operator 2026-10-02, verbatim: "this is a very strong computer, so please look into it if maybe thats not the core issue. Because I don't think running three or four tests at the same time on this machine is actually causing problems, but you can double check it. I'm not challenging you, I just want to figure out what's true. Consult with slot B"
- F5 (B, map): overload likely but unproven; idle 320/320 passes are operator observations.
- Related: [heavy run slot](heavy-run-slot.md), [base red rule](base-red-rule.md), chart [framework-temp-owners](../../framework-temp-owners/CHART.md) (hardcoded `/tmp/bc-*` tests, browser socket path), chart [temp-release](../../temp-release/CHART.md).

## Findings
A (independent of B), 2026-10-02:
- better-than-training · framework commit 2cb00d537 (2026-10-02 16:06 UTC), message and diff · cause: resizing to the next width starts a responsive image load, the next `goto` cuts it off, Chromium sends neither loadingFinished nor loadingFailed, so `response().body()` never settles and gate-wiring tests hit 300 s "at random". Fixed by reading bodies on `requestfinished` only. The fix landed about 3 h after the #53 incident (12:25-13:18 UTC).
- better-than-training · framework chart capture-hang, slots/capture-bounds-merged.md:6-11 · protocol trace at the pre-fix base ab700d4cc, three parallel whole-file runs: one hung on `/hero-1400.png` with responseReceived and dataReceived but no terminal event, every CDP command answered, the `setViewportSize ... closed` tail printed only after Bun kills the browser. After the fix, six whole-file runs, three parallel at a time, twice: 239 pass, 0 fail, about 182 s each, the same as the operator's idle runs (181-183 s). Pre-fix runs with a hang took 476-478 s.
- Interpretation (A): the timeouts were a race bug in capture code, present on base too, not machine load. The failing test varied per run because the race hits at random. Three parallel heavy runs on this host show no slowdown. The 2026-10-02 "red on base ab700d4cc" verdict was true: base did carry the hang. Load may change how often the race fires, but nothing shows load alone fails a test here.
- better-than-training · live host 2026-10-02 21:56 local · AMD 9950X3D, 32 threads, 123 GB RAM, PSI cpu/memory/io avg300 0.00 at load 1.7.

B and merge, 2026-10-02: exchange in slots/timeout-cause-B.md, slots/timeout-cause-merged.md, slots/timeout-cause-rebuttal-B.md.
- (A,B) Cause is the capture request-lifecycle race fixed by 2cb00d537, high confidence. (B) Noon runs untraced; each ~478 s run holds exactly one 300 s wait; failing fixtures 01, 04, 07, 13 all carry the srcset image.
- (A,B) Three parallel post-fix runs match idle time (~182 s). (B) Not a measured maximum and not three full `framework:verify` runs.
- (B) No collision: port 0, `mkdtemp` profiles, fresh browser per capture, no Wrangler/Miniflare/browser-core socket on this path. Journald 12:00-14:30 UTC: no OOM, IO error or hung task; no sysstat history.
- (A,B, B rebuttal wording) Base contained the defect, but the first base run was killed after ~25 min without final counts, so it did not establish a valid completed base-red verdict. Later completed whole-file base and leaf runs support the upstream-defect attribution.
- Disagreement D1: (A) drop the heavy-run slot, no load failure traced on this host. (B) keep the agent-run slot, count from a measured workload.
## Taken
Operator 2026-10-02, verbatim: "1a | 2a |"
- Q1 1a: #53's timeouts were the capture request-lifecycle race fixed by framework 2cb00d537, recorded with high confidence and the limit that the noon runs were not traced. Reason: same-revision trace, identical capture code on base and leaf, matching srcset fixtures, one exact 300 s wait per run, and three parallel post-fix runs at idle speed. Foreclosed: 1b, holding for a 15-20 min measurement.
- Q2 2a: the heavy-run slot is not built and moves to Off route, to be reopened only by a traced load failure. Reason: the cause is fixed and no load failure is traced on this host. Foreclosed: 2b (B), slot with a measured count.
