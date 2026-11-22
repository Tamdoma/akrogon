# Design: slow-alarm-baseline

## Binding decisions, verbatim

### forks/signposts.md `## Taken` (issues/chart/merge-lanes)

Operator, 2026-11-21T17:48Z, door t2z2, verbatim: "1a | 2a - test it but it was slower before, I don't think it's worth it | 3a | 4b | 5a | 6a | What did Fable and Neon come up with?"

Account: the session ranks merge speed first, counted from a leaf's first entry into merge to landed with failed rounds included, under three hard limits: no leaf adds a new test failure to main, the PC stays inside its limits, token cost does not grow. Each leaf is still tested alone (no batching). A framework chart that brings the merge suite back toward its early-November ~5 min is taken first (4b, the operator's yes to that chart), then merge-lanes. In merge-lanes a failed merge leaves the line at once and is retested or repaired off the line (5a), and leaves waiting to merge stop counting against max_active (6a). Two suites at once is measured with the N2 probe after the suite fix lands, and is allowed only if neither run is more than 1.25x slower and no new test fails; the operator expects it not to pay off. Given up: batching, red-then-revert landing, any extra PC load without a passing measurement.

Order: 1. suite-regrowth (framework, /home/ivan/Work/infra/tamdoma/framework/issues/chart/suite-regrowth), 2. merge-lanes (akrogon). Nothing dropped.

### forks/extras.md `## Taken` (issues/chart/merge-lanes)

A's pick under autopilot, 2026-11-21 (signpost 1a speed from first entry, hard limits, and the operator's values simplicity and removing over adding decided it):

2. D3 is its own small leaf with no dependency on the others, in `src/verify.ts` `decideSlow`:
   a. With no open episode the normal is the carried normal, lowered to the rolling 20-run median whenever that is lower; it rises only at an `accepted` close. The carried normal is the latest stored `slow.normal_ms`; the run after an `accepted` close takes that window's median instead (the closing row stores the old normal). Ledgers with no stored value start as today (rolling median once 5 eligible runs exist). No replay of old runs; framework starts from its stored normal, and suite-regrowth is the response to today's regrowth.
   b. An open episode closes `recovered` only when the median of its last 20 eligible runs (at least 5) is back under the threshold (1.5x and 2 min unchanged), tested on an eligible run.
   c. It closes `accepted` only when it is at least 14 days old and its last 20 eligible runs all lie inside it. The accepted close sends a notice naming the old and new normal, under its own notice id, retried by the next checked run when the send failed.
   d. Eligibility unchanged (red runs still count, per merge-slow-alarm Q1).
   Consumers: `src/verify.ts` `decideSlow` and its notice send; `src/status.ts` slow line (episodes stay open longer); `docs/reference/checks.md` slow section. Rejected: A's min rule alone (23 episodes in three weeks); C's 14-day floor drift check (closes silently as the floor creeps, misses growth under 1.5x per 14 days); a longer window alone; its own chart. Standing dissent (C): green-only eligibility and the 14-day floor drift check with 3-run hysteresis.

- Excluded here: forks/extras.md Taken 1, owned by leaf merge-red-exit.
- Excluded here: forks/extras.md Taken 3, owned by not taken.
- Excluded here: forks/extras.md Taken 4, owned by CHART.md Off route.


/home/ivan/.akrogon/releases/4f5e3fd2ae13439c7fd8d8507c18ec524c0f9444/skills/chart-issues/assets/standing-design.md

How it applies here: the alarm is mechanical arithmetic over the ledger, proven by own tests in `bun test` over hand-written `verify-runs.jsonl` rows; criterion 1 is the proven bug (creeping growth with no alarm), shown failing on the base and passing after; each other behavior shows one deliberate break turning its test red. The threshold and the 14-day and 20-run bounds are the chart's decided literals (forks/extras.md Taken 2). forks/red-exit.md Taken and forks/waiting-seats.md Taken are excluded here, owned by the other merge-lanes leaves.

## Held disagreements

- Not a decision, the decision stands. Against forks/extras.md Taken 2. Fact: fast-fail red runs under 60 s (11 since 10-28 in framework) count as eligible and can lower the median; a 14-day floor drift check showed 0 false alarms before 11-12 in framework and akrogon. Consequence claimed: early recovered closes and slower catch of drift. Raised by slot C (slots/extras-rebuttal-C.md). Slot B's replay found no stored close caused by a fast-fail run (slots/extras-rebuttal-B.md E6). State: unanswered by the operator.

## Leaf architecture

- Owned surfaces: `src/verify.ts` `decideSlow`, the `slow` row schema and its notice send (`noticeId`, `noticeCovers`, `foldShown` for the new accepted notice); docs `docs/reference/checks.md` slow section; `src/AREA.md` verify line.
- Literal interfaces: the accepted notice has its own id, distinct from the episode's open notice; the closing row's `normal_ms` keeps the old normal. `slow` is a strict object, so any new key means a ledger holding it does not parse under an older akrogon, as `docs/reference/files.md` already states for `failures`.
- Consumers of changed state: `src/status.ts` slow line and `--json` slow block (episodes stay open longer; format unchanged); `akrogon notice` files.
- Exclusions: eligibility (unchanged, decided); per-command `duration_ms` (Off route); the framework suite (suite-regrowth chart).
- Open for the plan: where the accepted notice's send state lives so a retry by the next checked run does not touch `foldShown`'s `first.run` read or reopen the episode in `src/status.ts` (for example updating the closing row in place inside the locked ledger rewrite); whether the run after an `accepted` close recomputes the closing window's median or reads a new stored field; the notice id form.
