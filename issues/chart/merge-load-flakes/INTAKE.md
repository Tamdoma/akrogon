# Intake: merge-load-flakes

## Scope
A merge run fails only because of the code under test, not because of host load or test-run races.

## Provenance
- GitHub: Tamdoma/akrogon#69. Also in merge-throughput intake, parked there by first-package Q3 3a; operator reopened 2026-10-10, so ownership is here.

## Operator note, verbatim (2026-10-10)
"Reopen everything that needs to be sold. If we need to chart it, let's chart it out.We have to clear the whole backlog."

## Source: Tamdoma/akrogon#69
# Heavy check runs from all seats share one host with no concurrency limit; load flakes bounce leaves at merge

Source: Tamdoma/akrogon#69
URL: https://github.com/Tamdoma/akrogon/issues/69

Unverified intake.

## Observation
Up to `max_active: 20` seats run full test suites on one host at the same time: leaf `checks`, review reruns, and the merge turn's `merge_checks`. Nothing limits how many heavy runs overlap. Consumer `Tamdoma/tamdoma-framework` 2026-10-07..08: 7 merge bounces were load flakes in the full gate (deploy EPIPE x2, 5 s timeouts x3, a cache miss, a nested `bun test --isolate` zombie stall), plus 2 runtime-record failures, out of 34 classified bounces.

## Location
akrogon seat dispatch and check execution: `src/config.ts:25` (`max_active`), `src/next.ts:323-336` (`activeCount` counts leaves, not running checks), merge turn `merge_checks`.

## Reproduction
Run 10+ active seats that each start full suites while the merge turn runs `merge_checks`. Timeouts and EPIPE failures in the merge run increase. Frequency on framework: about 7 bounces in 36 h.

## Expected behavior
A merge run fails only because of the code under test, not because other seats saturate the host.

## Urgency
Medium. Each flake bounce costs a full gate run plus a check.fix round and a re-queue. Workaround: lower `max_active` by hand, which slows all phases.

## Suspected cause
Agent and Codex/Fable consult view: the only capacity control is the count of active leaves. Heavy check processes are not counted or queued, so peak load follows how many seats happen to test at once. The link from seat load to flake rate is inferred from timing, not measured.
Files read: `src/config.ts`, `src/next.ts` (`activeCount`).
Not inspected: host CPU/memory at the failing timestamps. Would disprove: flake bounces at times with few concurrent check processes.
Related reports: Tamdoma/tamdoma-framework#207 (lists the load flakes), Tamdoma/tamdoma-framework#208 (lane race on shared files, a separate isolation defect), Tamdoma/akrogon#53 (closed, merge_checks timeouts under seat load). Searched Tamdoma/akrogon all states: "concurrent verify load" (none).

## Agent findings
Opening map: slots/map-merged.md (A,B,C) and rebuttals slots/map-rebuttal-B.md, -C.md.
