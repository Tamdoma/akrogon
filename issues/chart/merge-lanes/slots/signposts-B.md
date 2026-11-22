# Signposts angles: slot B

## Findings that change the draft

Source: framework `issues/verify-runs.jsonl` and `issues/merge-attempts.jsonl` since 2026-11-14.

- F1 Suite time regrew. Green merge verify median per day: 4.4-5.0 min on 11-02 to 11-06, 9.1 on 11-12, 12.9 on 11-21. The reshape landed and was lost.
- F2 Failed runs take 44% of merge run time: 161 of 359 full runs exit 1 (29.9 h of 68.4 h). 40 of 198 merged attempts are red then green on the same tree. One test red on main 11-15 to 11-17 failed 60 runs (`skills-typecheck-switch`).
- F3 No host-wide line exists. 861d0e4e was reverted the same day (20455420). 6a29a6db restored it per repo, and only akrogon sets `full` (src/admission.ts `lineLock`). Framework's only serializer is the merge turn.
- F4 One merge run barely loads the PC: PSI stall per attempt is CPU 3%, memory 0.1%, IO 7% (median, `pressure`). On 2026-10-24 load average hit 113 on 32 threads and verify green fell to 4 of 21 (host-run-load INTAKE.md).
- F5 A red leaf re-queues at the back: `merge_stamp` resets on each entry (src/phase.ts:230). checker-command went red at 13:56 and 16:43 inside its wait (framework issues/log.jsonl).

## Draft questions

1. Change. "Main never red" is not today's bar. A leaf lands when it adds no new red against main (src/verify.ts `newRedUnits`), and 13 attempts merged over main-red runs (F2). State the limit as "no leaf adds a new red". Add token cost to the ranking: operator 2026-10-19 "speed as well as accuracy. As well as the cost reductions" (merge-stacks stack-fate.md `### Carries`).
2. Change. Ask for the limit, not the count. The operator defines overload ("I just don't want the PC to blow up", 2026-10-13, permit-bypass forks/guarantee.md) and measurement picks the count. Recommend a cap on recorded host pressure across all repos and seats, because nothing else bounds it (F3, F4).
3. Change the recommendation to "each leaf alone". Batching was built and removed twice (6640ab5f, 6e7a33ff). A 4-batch was green about 15% (merge-throughput INTAKE.md) and first-run green is 55% now (134 of 245). Parallel next-leaf testing keeps per-leaf proof (stack-fate.md `## Findings`). Split-in-half was foreclosed 2026-10-05 (merge-turn forks/merge-order.md).
4. Change. F1 and F2 are framework-side and larger than any lane gain: at 4.6 min the line clears 2.5x more leaves with no extra load. Options: akrogon only, akrogon plus a framework chart that runs first (recommended), or one chart for both.
5. Keep, with the metric named (M2).
6. Drop. Answered 2026-10-18: "Always better to remove redundancies and complicated code first" (stack-fate.md `### Carries`).

Question 5 in the live signposts.md (full run before the line) reopens three operator choices: 2026-10-09 foreclosed "every leaf runs merge_checks before merge" (merge-throughput forks/first-package.md), 2026-10-19 "that just doubles the amount of time" (stack-fate.md), 2026-10-24 "only the merge turn runs merge checks" (verify-waste forks/receipts.md).

## Missed signposts

- M1 Failed-run bar (F2). A full run fails and the same tree then passes. O1 today: rerun the whole suite, about 11 min. O2 rerun only the failed tests and count green (recommended, same bar as today's rerun). O3 listed flaky tests stop blocking, a precision change.
- M2 Which wait counts. O1 leaves merged per day. O2 time from first entering merge to merged, red rounds included (recommended, F5). O3 the worst single wait.
- M3 Order against the 2026-10-19 trigger. Parallel testing waits on the suite reshape and a two-suite probe (merge-stacks CHART.md `## Off route`). F1 shows the reshape regressed. O1 restore suite time, then probe (recommended). O2 probe now on the 12-min suite. O3 waive the trigger.
