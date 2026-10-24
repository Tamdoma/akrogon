# Intake: host-run-load

## Scope

Full test suites from several registered repos run on the host at once with no host-wide bound, so framework's timing-sensitive tests pass their timeouts and every merge verify goes red. Destination: akrogon (src/admission.ts withAdmission, its caller src/run-check.ts checkedRun, verify runs in src/verify.ts).

## Provenance

- Seed: issues/seeds/118-cross-repo-full-suites-run-together-with.md (Tamdoma/akrogon#118, origin Tamdoma/tamdoma-framework), unverified intake, imported by operator request 2026-10-24.
- Operator: 2026-10-24 door message.

## Source: Tamdoma/akrogon#118

````text
# Cross-repo full suites run together with no host-wide bound: framework timing tests pass their timeouts and every merge verify goes red (suspected: admission limits dropped 2026-10-14)

Source: Tamdoma/akrogon#118
URL: https://github.com/Tamdoma/akrogon/issues/118

Origin repo: Tamdoma/tamdoma-framework

Unverified intake.

## Observation

On 2026-10-24 framework merges stalled. No framework leaf merged after about 13:00 CEST. At 17:03 CEST the host load average was 113 / 76 / 62 on 32 threads (`uptime`, `nproc`).

Framework full `verify` results from `issues/verify-runs.jsonl` (framework):

| Day | Runs | Green | Median duration |
|---|---|---|---|
| 2026-10-21 | 77 | 44 | 3.5 min |
| 2026-10-22 | 18 | 11 | 4.8 min |
| 2026-10-23 | 37 | 20 | 5.5 min |
| 2026-10-24 | 21 | 4 | 8.2 min |

All four merge-scope base runs on main today were red (89cec7291 twice, aed2348e2 twice). The failing tests are old. They are not in any leaf's diff:
- `.claude/hooks/tests/capture-failure-mode.test.ts` "a failing second prepareRun still removes the first scratch root" (last changed 10-15)
- "a failed new-entries check still removes prepared roots"
- `.claude/hooks/tests/effort-guard-export.test.ts` "effort runner receipts remain checkable…" (last changed 10-11)
- phase-capture captureStage, emdash-kit, cf-workers-deploy join prep
- satellite-network-plan criteria 3/5a/5b
- runParity (Chromium SIGSEGV)

Durations of the same tests in green runs and in today's red runs:

| Test | 10-23 green | 10-24 13:44 green | 10-24 red |
|---|---|---|---|
| prepareRun | 68–82 s | 99 s | 147–352 s |
| effort runner | 37–45 s | 66 s | 142–148 s |
| new-entries | — | — | 120 s (timeout) |

Verify minutes per repo per day, summed from each registered repo's `issues/verify-runs.jsonl`:
- 10-22: framework 108, akrogon 23, lingua-relay 7
- 10-23: framework 240, akrogon 38, lingua-relay 21
- 10-24: framework 201, akrogon 17, lingua-relay 94

Seat-run checks outside merge verify are not counted here, for example lingua-relay `isporuka-verzija` vitest bisects.

Snapshot at 17:03 CEST (`ps --sort=-pcpu`), all running at once:
- framework: audit-ledger-seed merge verify, update-cycle-seed seat suite (render.js, playwright, chromium)
- lingua-relay: verify `vitest run` plus three `workerd serve`, `isporuka-verzija` vitest
- akrogon: `next` runs from its verify worktree
- CPU by group: framework ~560%, chrome ~650%, lingua-relay ~630%, other ~1000%

Per-repo serialization alone does not help. Framework verify records never overlapped each other on any day since 10-14. The operator also serialized seat suites by instruction from about 16:00. Runs stayed red.

The load also exposed a latent test-order bug in framework's `validate-handoff-schema.test.ts`. A 5 s registry TTL lapsed mid-test and 15 route tests failed. It was fixed on leaf cover-image-sizes in 56f8cf26e.

## Location

- akrogon run admission: `src/admission.ts` `withAdmission` (comment at line ~140: "the memory reading, the 48 GiB limit, per-run reservations and the 30 s start spacing were dropped by the operator on 2026-10-14").
- Its caller: `src/run-check.ts:220`.
- Seat placement limit: `src/next.ts` `activeCount` / `max_active` (config `max_active: 24`).
- Workflow: merge-scope `verify` and its base comparison run, for framework leaves in merge and check.fix.

## Reproduction

Run framework full `verify` while lingua-relay and akrogon suites, Chromium recordings or another framework suite run on the same host. Seen across all 17 non-base framework verify runs on 2026-10-24, 13 of them red. Not reproduced in isolation today.

## Expected behavior

A framework full suite's result does not depend on which other repos' suites happen to run on the host at the same moment. Targeted and cheap checks still start without long waits, which was the #89 cost.

## Urgency

High for framework. Every leaf that reaches merge cycles: red verify, rerun, red base comparison, back to check.fix. That is about 30 minutes of suite time per attempt.
- Blocked now: audit-ledger-seed, rubric-scrim-pass, update-cycle-seed, satellite-renderer-1-11-2, undersized-photo-hold.
- cover-image-sizes ended failed after two unproductive recoveries.
- Workaround in use: the operator is pausing lingua-relay and akrogon heavy runs by hand while the framework merge queue drains.

## Suspected cause

Main condition (agent view, supported): akrogon admits every check at once. Since 2026-10-14 nothing bounds heavy work host-wide. Framework's full suite holds timing-sensitive tests: 120 s per-test timeouts, real subprocess cleanup, Chromium. Those tests pass alone and time out when other repos' suites share the CPU.

Contributing condition: today's cross-repo load is new. lingua-relay verify time rose from 7 to 21 to 94 minutes over 10-22..10-24, on top of seat-run vitest/workerd bisects and Chromium paid recordings. Until 10-23 framework was mostly alone on the host, so the missing bound had no visible cost.

Reporter view (operator): everything merged well until today.

History: #88 (2026-10-13 overload, load 235) led to the run permit. #89 (unordered permit, a leaf waited 55 minutes) led to the 10-14 removal of all admission limits. That removal also removed the protection from #88.

Files read: `src/admission.ts:1-183`, `src/run-check.ts:190-260`, `src/next.ts:345-405`. Also framework `issues/verify-runs.jsonl` and the red base logs under `issues/open/*/implementation/check-verify-*.log`.

Not inspected:
- Host load history before today (no sar data).
- Whether lingua-relay or akrogon suites themselves went red today.
- Framework suite results on a quiet host today. A green full suite on main with nothing else running would confirm the load cause. A red one would disprove it.

Related reports:
- Tamdoma/akrogon#88 (the earlier overload this bound prevented).
- Tamdoma/akrogon#89 (the cost that led to removing the bound).
- Tamdoma/akrogon#98 (base turns red without a commit, same symptom from a different cause).
- Searched Tamdoma/akrogon all states: author @me created since 2026-10-22 (limit 40), "admission concurrent" (limit 10).
````

## Source: operator 2026-10-24

I pulled another issue that just came up. Everything stopped because of it. We need to resolve it now. Do it on autopilot, consult with both consultants, and do it yourself here.

## Agent findings

- Confirmed in code: withAdmission (src/admission.ts:139-183) writes a run record and starts at once. No count, memory or ordering bound exists. Comment at src/admission.ts:139-141 names the 2026-10-14 operator removal (commit 81196b3b).
- Every checkedRun goes through withAdmission (src/run-check.ts:220), both seat run-checks and verify's setup and checks commands (src/verify.ts:326,339). verify runs know their scope (leaf or merge) and command name; run-check knows only `--name`.
- Run records already live host-wide in ~/.akrogon/runs/*.yaml with repo, leaf, check and live state (src/admission.ts:23-37, liveRuns at :93-103).
- Live now (2026-10-24 17:19 CEST): load 55/57/61 on 32 threads. ~/.akrogon/paused.yaml holds `akrogon: true` and `lingua-relay: true`, the operator's manual workaround named in the seed. That pause is what "everything stopped" refers to for those two repos.
- "do it yourself here" chooses the direct route under autopilot, as "o1 on autopilot" did for host-reconcile-session.
