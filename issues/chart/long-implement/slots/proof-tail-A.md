# proof-tail, slot A

## Where the time goes (emdash-launch implementation/report.md:29-103, plan.md:102-152)
- The plan sized C8 "live run + evidence ... hours" (plan.md:111). The tail is C8 plus C10 reruns.
- Launch ran 7 attempts of about 8 min, with 4 stranded-gate recoveries. Convert took about 15 min and static bringup about 10 min. Nine in-branch fixes, each fail-first. framework:verify ran 3 times, each red on a different first failure (run 1 browser policy, run 2 secret-env index).
- Most cycles stop at the first defect. Each defect costs one fix plus one rerun from its restart boundary, so time = defects found x rerun cost, discovered one at a time.
- check.fix notes already say "Exactly one full attempt; new failures are recorded, not chased" (plan.md:151). Seat A chose B's bound itself, and the pass still runs 2h+ because the single attempt is hours of live chain plus repair waves.

## Questions
Q1 Collect every failure per slow run instead of stopping at the first. A slow proof (sized minutes or more in plan.md) runs every independent step and stage to completion where the next step's inputs stay valid, records all failures, and they are repaired as one wave (wave-plan 2a) before one rerun from the earliest changed restart boundary. Recommend yes. It cuts the number of live cycles without a count. Same move as red-criterion Q3 amended ("run every step separately to list all reds at once").
Q2 Bound the cycles? Options: (a) no new bound, Q1 plus the existing fix_rounds cap; (b) B's one repair and one rerun per pass, then `failed`. Recommend (a): a count fails a pass finding real different defects (C), and the fix_rounds cap (src/config.ts) already ends unproductive loops across passes.
Q3 Poll overhead: A sleeps on one command (104m). With wave-plan 2a, A starts independent units while the slow run proceeds (C's idea). Recommend folding it into the wave rule as one clause: a running slow proof does not block units that do not consume its result.

## Pitfalls
- Continuing past a failure on live infra can strand state (4 stranded-gate recoveries). Continue only where the plan's restart boundaries say the next stage's input is still valid.
- A brief that requires an hours-sized live criterion makes the leaf hours long by design. That is a charting choice (standing-design end-to-end rule), not a seat defect.
