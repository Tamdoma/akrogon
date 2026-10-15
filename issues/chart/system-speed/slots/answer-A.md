# Answer A (written before reading peer answers)

## Outside sources found

- S1. Reinertsen, Principles of Product Development Flow, via SAFe summary (https://v5.scaledagileframework.com/?p=22083) and QCon 2011 slides (https://qconsf.com/sf2011/dl/qcon-sanfran-2011/slides/DonReinertsen_UnderstandingTheMagicOfLeanProductDevelopment.pdf): wait time = queue length / processing rate (Little's law); the fastest way to cut wait is to cut queue length; small batches give faster feedback until fixed per-batch cost dominates.
- S2. GitHub stacked pull requests, public preview 2026-07-30 (https://privatedevops.com/news/github-stacked-pull-requests-public-preview); agent guide (https://agentpedia.codes/blog/github-stacked-pull-requests-gh-stack-agent-guide): each layer must leave the repo valid on its own, and merge-queue support for stacks lagged the feature. Secondary only, GitHub primary docs not read.
- S3. MSR 2026 study of 33,580 agent PRs (https://2026.msrconf.org/details/msr-2026-mining-challenge/27/): revert causes led by unintended side effects and overengineering (22%), functional incorrectness (22%). Supports scope discipline over more review rounds. Read via search summary only.
- Search for a study on agent self-review before code review found nothing direct (query: "AI coding agent first-pass review rework rate self-review before code review study 2025 2026").

## View

A1. The binding constraint is serial wall time inside one leaf, not capacity (M3: 5.6 of 24 active). Within a leaf, most wall time is waiting: on prerequisites (M4), on checks (M6, 70% of implement/fix wall), and on review round trips (M5). Model work is under 10% of wall.

A2. Check-wait is the cheapest to remove. A fixed 9-minute sleep loses about half an interval per check (~4.5 min). With roughly 6-10 background checks per leaf that is ~30-45 min per leaf of pure latency, plus the 121 tool timeouts. Removing it needs a blocking wait on a run's exit, not more rules (implement-issue :45 already forbids fixed sleeps and is ignored because the harness tool times out at ~600 s).

A3. Rework: a third of first-round findings (a 18, f 7 of 76) are a missing proof or a missing required result, which are visible to A before review. The other big class (b 33) is real defects tests missed, which is what review is for. Raising first-pass yield on (a, f) removes about one review round for ~half the leaves.

A4. B correcting test expectations: allowing it when the brief or design states the expected behavior would remove ~9 of 30 A round trips (~1.5 h each). The guard against weakening tests already exists (Test-Change trailers cite a source; B's own red-before/green-after evidence). Risk: the reviewer grades its own change. I lean yes with the source citation required, but this is the operator's quality call.

A5. Dependencies: the dependent waits for the prerequisite's full review/repair/merge tail (median ~5 h per edge). Stacking (S2) cuts that but brings rebase churn when the prerequisite changes during repair or merge, and needs ordered merges. With chain depth ≤3 and batching coming, I would not build stacking now. Cheaper: chart fewer edges (3 of 25 were shared-file only, which chart-issues already says must not order work) and start dependents as soon as the prerequisite merges (already ~0.6 h).

A6. Whole-suite reruns in leaf phases (M7: 31 runs since 10-14 12:00, ~50% red) feed the reinforcing loop. L2b (narrowest reproducing command) landed today and should cut these. Measure before adding anything.

## Ranked top 3

1. Blocking wait on a run (remove poll latency and timeouts) — small code, removes a problem class.
2. Pre-review self-check of done-criteria proofs and required results by A (no new step: it is the existing report.md requirement, enforced at the implement→check.review move the way the receipt is) — needs care to stay function-over-form.
3. Merge batching O1 (already approved).

## Would not do

- Stacked branches now (complexity, rebase churn, merge order coupling).
- Raising max_active (capacity is idle).
- Any CPU caps or admission gates (operator ruled out).
- More review seats or extra review rounds.
