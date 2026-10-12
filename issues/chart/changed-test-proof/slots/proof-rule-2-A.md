# Fork notes round 2: slot A

## Q4 how many runs
- Pick: two counts tied to known risk. One run beside the merge neighbours for a new or changed risky test; five runs for a test being fixed after it already failed under load. Cost: about 5 min for a new risky test, about 20-25 min only after a test has already failed.
- Why: the first probe-waits version failed on its first merge-gate run (framework log.jsonl, probe-waits merge -> check.fix; review-B.md:162-173), so one busy run before review would have caught it. Before review it never ran under load: framework puts playback in `framework:verify:core`, a merge_checks command (framework package.json:165, akrogon config merge_checks.verify), and the reviewer ran it standalone (review-B.md:139). The rewrite failed about 1 time in 10 replays later; a test that already failed under load has shown it is fragile, so its fix needs more than the single replay that admitted it (review-B.md:243-245).
- Rejected: one fixed floor for every risky test (5 runs = 20-25 min on every such job, mostly spent on tests that never failed); planner-set (the #86 rewrite was admitted on a one-run judgment); one run everywhere (repeats gap b).
- Evidence: better-than-training, framework records above, read 2026-10-11. Model-knowledge only for detection math `1-(1-p)^N` with independent runs; hypothetical p (B D3).
- Pitfalls: five runs is not a guarantee (catches a hypothetical 1-in-10 failure about 4 times in 10); stated in the report, never claimed as stability.
- Extra question: none.

## Q6 should the rule exist
- Pick: the rule as answered with the Q4 two-count shape. It adds one step for risky changed tests only; the akrogon command, the merge gate and the check schedule do not change.
- Why: today a risky test in framework never runs under load before merge, because the only command that runs it under load is the merge gate. Every new fragile browser test therefore meets load first inside the merge turn, where it can bounce its own leaf or a later one. Similar merge failures under load were filed before (#69 host load; framework#207 named load flakes in merge-load-flakes Off route), and the operator patched this one by hand.
- Rejected: reviewer-only version (fixes the stale-proof reuse but a new fragile test still meets load first at merge); no change (one case, already fixed, but nothing stops the next and the class already cost about 1 hour of replays, fix rounds and operator time).
- Evidence: seed #86 Urgency; issues/chart/merge-load-flakes/CHART.md Off route; framework issues/config.yaml merge_covers.
- Pitfalls: testing-rule churn (fifth testing chart since 2026-10-01). Removed by keeping the change inside existing plan/implement/check steps and changing no lock.
- Extra question: none.
