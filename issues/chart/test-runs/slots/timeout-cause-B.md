# Timeout cause: independent slot B round

2026-10-02. Read-only investigation. No tests, load probes, lifecycle commands, refreshes, or source edits were run. This return file is the only write. The current timeout-cause Findings and other test-runs slot returns were not read. Related framework capture-hang evidence was read as requested.

## Conclusion

**F1. High confidence: the browser-capture implementation had a request-lifecycle defect.** It queued `Response.body()` as soon as response headers arrived, then awaited all queued bodies. Changing viewport starts a responsive image request. The following navigation can cut that request off without a terminal Chromium network event, leaving its body promise unresolved forever. Concurrent execution can change how often this race occurs, but insufficient host capacity and cross-run resource collisions are not the supported root cause.

The exact original noon executions lack protocol traces. Attribution of every historical timeout to this mechanism is therefore high-confidence inference, not a direct trace of each failure. A later trace on the same base revision, matching fixtures, failure duration and output identifies the stalled operation. The operator's repair and successful parallel reruns strengthen the inference.

## Source keys

Paths beginning `F/` are relative to `/home/ivan/Work/infra/tamdoma/framework`. `A/` means `/home/ivan/Work/infra/akrogon`. Historical code citations include their Git revision because current source has changed.

- `E/` = `F/issues/open/emdash-cms/emdash-operations/emdash-fleet-backup/implementation/evidence/f9/`.
- `U` = `F/.claude/skills/dev-cf-workers-deploy/scripts/libraries/unchanged-output.ts`.
- `T` = `F/.claude/skills/dev-cf-workers-deploy/test/deploy-core.test.ts`.
- `C` = `F/issues/chart/capture-hang/slots/capture-bounds-merged.md`.

## Evidence and limits

**F2. The incident code contains the precise indefinite wait.** Inspected with `git show ab700d4cc:<path> | nl -ba`: `U:507-522` subscribes to response events and immediately starts `body()`, `U:526-529` resizes then navigates at widths 390 and 1440 (`U:83`), and `U:534` awaits `Promise.all(pending)`. The navigation has a 30-second timeout, but that does not bound this separate body await. `git diff ab700d4cc..1b95a0cfc -- <U> <T>` is empty. These capture/test implementations are identical on incident base and leaf.

**F3. A recorded protocol trace identifies the body await, not viewport starvation.** `C:6-11` records three parallel whole-file runs on `ab700d4cc`, Bun 1.4.2, Playwright 1.63.0 and Chromium headless shell 1243. Two passed. One timed out on fixture 01. Request `3205325.11`, `/hero-1400.png`, received `responseReceived` and `dataReceived` but no `loadingFinished` or `loadingFailed` after navigation. Every CDP command had a reply, including the 1440 viewport command. No further command was sent for 300 seconds. The body promise was pending in the Bun process. Browser exit 143 and the closed-page viewport error followed timeout termination (`C:8`).

This is a saved measurement report, not a raw trace I independently replayed. That report does not identify a retained raw protocol-log path, so request/event details remain attributed to it. The earlier B interpretation that viewport setup itself hung was explicitly corrected there. Do not diagnose the first stalled operation from the last cleanup error.

**F4. The fix targets this mechanism and parallel runs reportedly pass.** Operator commit `2cb00d537847d1851753275c7770db466301e51f`, authored 2026-10-02 18:06:45 +0200 = 16:06:45 UTC, changes body collection from `response` to `requestfinished`. Inspected commit diff and `U@2cb00d537:507-538` confirm this. `C:11` records six whole-file runs on `87fd5dbf1`, three concurrently twice, all 239 pass / 0 fail, roughly 182 seconds each. This supports three concurrent runs of this workload on this host. It is not a measured maximum and does not certify three simultaneous entire framework verifies. The framework chart accepted #113 as delivered by this commit (`F/issues/chart/capture-hang/forks/capture-bounds.md:38-43`). The later capture-asset-bytes leaf addresses separate byte-evidence gaps, not the original hang (`F/issues/open/capture-hang/capture-asset-bytes/design.md:27-30`).

**F5. The failure is intermittent and matches the race's fixtures.** `E/cf-workers-deploy-leaf-2c5c2e691.log:44-70` records URL-equality timeout, 319 pass / 1 fail, 475.15 seconds. `E/cf-workers-deploy-leaf-1b95a0cfc-rerun.log:44-69` records fixture 13 timeout, 319 / 1, 478.04 seconds. Completed whole-file reruns have fixture 07 on leaf (`E/cf-workers-deploy-leaf-1b95a0cfc-file-rerun2.log:259-271,302-310`) and fixture 13 on base (`E/cf-workers-deploy-base-ab700d4cc-file-rerun2.log:269-281,304-312`), 238 / 1 and 478.26 / 475.80 seconds. Fixture 04 alone passes in 5.49 seconds (`E/leaf-single-04-1b95a0cfc.log:6-10`). The live `index.html:4` in fixtures 01, 04, 07 and 13 has the responsive `/hero-400.png` and `/hero-1400.png` srcset. The ~478-second totals contain one exact 300-second wait plus otherwise normal work, rather than showing a uniform manyfold slowdown.

**F6. The initial base run was incomplete, and later idle-pass observations did not end the failures.** The implementation report `F/issues/open/emdash-cms/emdash-operations/emdash-fleet-backup/implementation/report.md:183-186` records the detached base killed after about 25 minutes without final counts. Its log ends with a partial 219026 ms failure (`E/cf-workers-deploy-base-ab700d4cc.log:144`), after four 300-second failures (`:38-39,65-66,86-87,108-109`). The lifecycle log records merge 12:25:24 UTC, repair 12:44:27, failed 13:18:21, resume 14:14:54 and failed again 14:23:16 (`F/issues/log.jsonl:1294-1298`). The report records the later single-file failures at `:194-210`. The intake's idle 320/320 passes are operator observations, not preserved passing logs in this evidence folder. Intermittent passes cannot establish overload as the cause.

**F7. The relevant capture path isolates its resources.** Historical `U@ab700d4cc:130-135` listens on port 0 at loopback, not a fixed port. `U:593-597` launches a fresh Chromium browser and context directly through Playwright. There is no browser-core daemon, shared CDP attachment, named Unix socket, Wrangler or Miniflare on this capture path. Installed Playwright source `F/node_modules/playwright-core/lib/coreBundle.js:39760-39768` creates unique artifact/profile directories with `mkdtemp`; `:43320` uses the debugging pipe. Historical `T:648` makes fixture roots from name, PID and timestamp. `T:6763-6776` reads committed live/candidate fixture dist files and captures them in sequence. These files are shared inputs within a checkout, but the gate loop does not write them. Global fetch stubs are process-local. This argues against cross-process collisions for these failing cases, without asserting that every other framework test is isolated. The fixed `/tmp/bc-*` and socket-length problems in `A/issues/chart/framework-temp-owners/CHART.md:3-12` and `A/issues/chart/temp-release/CHART.md:15-18` concern another runtime path.

**F8. Journald supplies activity evidence, not historical capacity measurements.** Queried `journalctl --utc --since '2026-10-02 12:00:00 UTC' --until '2026-10-02 14:30:00 UTC'`. In its kernel output, 1223 lines contained no matches for OOM, out-of-memory, killed-process, segfault, coredump, I/O error, blocked-task, no-space or hung-task signatures. It did contain 754 bus-lock warnings for `CHTTPClientThre` PIDs 887714/889990, including:

```text
2026-10-02T12:00:02+00:00 omarchy kernel: x86/split lock detection: #DB: CHTTPClientThre/887714 took a bus_lock trap at address: 0xeeb40cf4
2026-10-02T12:41:43+00:00 omarchy systemd[2506]: app-org.chromium.Chromium-1178233.scope: Consumed 1.190s CPU time over 4.422s wall clock time, 44.3M memory peak.
```

All-service journal output records 681 Chromium scope starts in the window, first at 12:05:20 and last at 14:29:58 UTC. Starts are cumulative, not simultaneous process counts, and cannot be assigned to these tests without process ancestry. Bus-lock messages do not establish capture starvation. No saved sysstat/atop directories exist at `/var/log/sa`, `/var/log/sysstat` or `/var/log/atop`. No per-second incident CPU, memory or I/O history was found. Absence of kernel errors does not prove absence of pressure.

**F9. Live capacity is substantial but not a historical verdict or concurrency formula.** At 19:58 UTC, read-only `lscpu`, `free -h`, `/proc/pressure/{cpu,memory,io}`, `df -h /tmp /dev/shm`, and `uptime` showed AMD Ryzen 9 9950X3D, 16 cores / 32 threads, 123 GiB RAM, about 74 GiB available, load 1.56/1.62/1.77, all current PSI averages 0.00. `/tmp` had 49 GiB free of 62 GiB and `/dev/shm` about 62 GiB free. Swap had 6.9 GiB used, which alone does not show current swap activity. This snapshot agrees with a lightly loaded capable host now. It says nothing exact about noon pressure or each run's peak demand.

## Competing hypotheses

| Hypothesis | For | Against | Assessment |
|---|---|---|---|
| H1. CPU/memory/I/O exhaustion | Overlapping seats, many cumulative browser launches, earlier busy-seat observations. Scheduling can widen a race window. | No incident resource telemetry establishes saturation. No kernel OOM/I/O fault. Normal case durations, exact isolated 300-second waits. Repaired code reportedly succeeds three at a time. | Possible trigger/amplifier, unsupported as primary cause. |
| H2. Concurrent runs collide on ports, paths, sockets, browser or Wrangler state | Other framework runtimes have known temp/socket issues. Entire verify covers many systems. | This failing path uses ephemeral ports, unique fixture/browser folders and fresh browsers, bypasses browser-core/Wrangler/Miniflare. Recorded trace shows a request lifecycle hole inside one capture. | Low support for this incident. No evidence of collision. |
| H3. Capture request-lifecycle defect | Exact indefinite await in incident code, matching responsive fixtures, recorded missing terminal request event, answered CDP commands, targeted fix and parallel passes. | Original noon runs were not traced. Raw later protocol log was not located from its report. | Best-supported cause, high confidence. |
| H4. Chromium crash or Bun transport stall | Closed-page viewport errors appear in failure tails. | Trace says viewport command answered and browser killed after test timeout. Bun and Node 400-capture single-route loops did not hang (`C:9`). | Tail alone is misleading. No independent evidence for this incident. |

## Smallest later measurement

**A1. No new reproduction is required to change the causal recommendation.** The existing trace and fix already distinguish a lifecycle defect from a blanket overload claim. If the operator wants independently retained proof plus a capacity result, run only after explicit approval and no active leaves. Estimate 15-20 minutes including setup and cleanup, not an unattended retry-until-green loop.

Use disposable checkouts of incident base `ab700d4cc` and that base plus only `2cb00d537`, identical frozen dependencies and pinned browser. Run one pre-fix whole deploy-core file, then a matched three-way pre-fix batch, then a three-way fixed batch. The whole file is needed because the isolated fixture usually passes. Capture process-tree stage/request events and `DEBUG=pw:protocol,pw:browser`, without DOM snapshot tracing. Record request IDs, viewport/navigation replies, response/body start/end and terminal events. Independently sample CPU use, runnable count, available memory, swap activity, CPU/memory/I/O PSI, disk throughput/latency and descendant resource usage every second. Give each run separate worktree, TMPDIR and retained log paths. Reap only owned descendants and verify they exited before removing scratch. Stop and report at the agreed experiment limit if anything stalls. Do not classify a killed experiment as a completed check.

A hang with answered commands, missing terminal request event and low pressure establishes H3 directly. A bind/path/profile failure would promote H2. Pressure plus general slowing of otherwise correct fixed captures would support H1 as a capacity constraint. No hang in this finite pre-fix sample is inconclusive, not evidence the original bug never existed. A three-way fixed batch measures demand at three, not the host maximum. If four slots are wanted, add one fixed four-way batch, about 3-5 minutes. Preserve raw traces and telemetry with source revision and launch times so this round's evidence-retention gap disappears.

## Heavy-run slot and base-red implications

**D1. Keep the authorized agent-run admission/ownership mechanism, but do not sell one slot as the cure for #53.** The operator selected automatic ownership and cleanup (`A/issues/chart/test-runs/forks/heavy-run-slot.md:23`, verbatim answer). A mutex cannot remove a race inside a single capture. Fixing the capture removes the fragile wait. Three concurrent whole-file runs already have recorded successful evidence after that fix. A fixed count of one is not justified by this incident or live host specs.

**D2. Do not invent a maximum count from 32 threads and 123 GiB.** Live capacity requires available CPU under affinity/cgroup limits, available memory and tmp space, and measured demand of the admitted workload including descendants. Disk contention is not captured by a RAM/thread division. This round supports three for the tested fixed capture workload, not a universal three for full `framework:verify`. Historical `F/package.json@ab700d4cc:94-95` chains whole-repo stages and includes an internally parallel typecheck/lint stage. Different heavy commands need their own demand evidence. The smallest capacity measurement above can settle three versus four on this host. If a lower temporary count is chosen before measuring, record it as an operator policy, not a discovered machine limit.

**D3. Base-red needs completed comparable runs plus causal judgment, and timeouts remain evidence of possible defects.** The killed initial base execution cannot establish a completed red-on-base verdict. The later completed single-file leaf/base runs do supply real common-mechanism evidence even though fixture names differ. Requiring identical names would miss this lifecycle bug. Compare revision, command/arguments/scope, dependencies/browser, environment and workload conditions, then examine first stalled stage or failure mechanism. Neither timeout-only nor different-test-name-only warrants dismissing a run as overload. Neither equal final cleanup errors nor one green idle retry proves causality. Here the unchanged capture code and later causal trace justify treating this as an upstream capture defect requiring repair, rather than leaf repair. Failed required checks still block until repaired or an explicitly accepted execution can complete. Do not retry blindly until green or use the base failure to assert every leaf change is harmless.

## Full operator round

This round settles the cause behind #53 and prevents choosing a host limit to compensate for a capture bug.

### 1 · Should we record the capture lifecycle defect as the cause of these timeouts?

The incident code waits on response bodies that can never finish after viewport-triggered image loading is interrupted by navigation. A later matching trace identifies that wait, and the targeted fix reportedly passed six whole-file runs at concurrency three.

Research: operator-placed local evidence and inspected primary code, read 2026-10-02 · `C:6-11`, `U@ab700d4cc:507-534`, commit `2cb00d537` · this changes the recommendation from serialization as a remedy to fixing the request lifecycle, with host capacity judged separately.

- **1a (recommended)** Record H3 with high confidence and its evidence limits. Keep slot count open for workload capacity measurement. Use completed comparable base runs and causal judgment.
- **1b** Hold causal acceptance for the later 15-20-minute matched measurement, only with operator approval and no leaves active. Preserve the current evidence without asserting overload or collision.

Pitfalls: the closed-page viewport message is post-timeout fallout. A powerful host can expose a race, and an idle pass can miss one. Three passing concurrent capture suites do not certify three entire framework verifies.

Reply `1a` or `1b`, or a free-text answer.

Challenge check: the original noon runs lack protocol/pressure traces, and the later raw trace path is not retained in the cited report. That limits per-run certainty, but the same-revision trace, matching code and fixtures, targeted fix and parallel success make H3 substantially stronger than H1/H2. No supported exact maximum host slot count can be given yet.
