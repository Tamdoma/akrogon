# Intake: ai-budgets

## Scope

One destination in akrogon: the charting door and the lifecycle seats set paid and live test budgets themselves, conservatively, raise them when needed inside a limit the operator never has to re-approve per leaf, and judge "enough proof" by evidence instead of a fixed run count, so the operator stops being the approval bottleneck without any budget being blown.

## Provenance

- Operator: door t126, 2026-11-22, /chart-issues arguments

## Source: operator door t126 2026-11-22

In fact, we probably need a new chart that will deal with this. Right now, a lot of the stops are coming from me having to approve the budgets. But I think that the charting process itself should determine the budgets because you are smart and the consultants are smart. So let's chart something that will create the optimal budgets inside of this skill that is determined by the AI, and then it can also be flexible if something doesn't work. The whole intent of this chart and upgrade is to not let the human become the approval bottleneck while still not blowing any of the budgets. So be conservative, use what you think is the best, and then increase if needed. But you can always ask yourself if that way is actually the best way to test it. For example, today, if you see that the tests are passing, you don't have to be so strict and legal when it comes to testing, You don't have to be so strict and legal so that there is a deterministic number of tests. If something failed, but there is enough proof already that it will pass, and it only failed because of the budget restraint, then just make it pass. Is that clear?Consult both consultants: slot b (claude code fable 5.2 high) and slot c (agy neon high). Full autopilot mode, including the signposts. Make sure the mental model and the code cleanliness stays clean or even cleaner. Always lean more towards removing redundancies than just stacking code on top of each other. Simplicity, clarity, and elegance.

Earlier the same day in this door, about the watch-consults leaf: "I approve it, please make them pass and not get stuck in the cerermony, this is not feasible for me to be guessing how many runs they have. When it's good enough, it's good enoug. Don't make the prose stop the merge!" and earlier "I just want to merge this. I don't want many sessions for the sake of session ceremony."

## Agent findings

- Case that triggered this (watch-consultants/watch-consults, 2026-11-21/22): readiness.yaml grants[0..3] were four separate operator approvals (6, 4, 2, then 6 sessions). Stops came from (1) the chart grant needing operator words per leaf, (2) each renewal needing operator words, (3) A's own conservative "one try" readings, (4) review-B raising a fresh live run as an `Operator actions` item after check.fix changed model-facing inputs, (5) this session's auto-mode classifier refusing grant writes not backed by the operator's own words.
- skills/*/lifecycle-rules.md `## Grant reuse and count lines`: a run past a paid repeat-count bound already only warns and continues; stops come from operation, target, identity, effects, expiry, spend caps and stop_line clauses, and from a needed run that no grant covers.
- src/readiness.ts `grantSchema`: `approved {by, date, answer}`, free-text `bounds` and `stop_line`; no machine-level budget exists in `~/.akrogon/config.yaml`.
- standing-design.md: a fresh paid call is made only when a model-facing input changed or the criterion names fresh/live behavior; a fresh call runs only under a covering grant.
