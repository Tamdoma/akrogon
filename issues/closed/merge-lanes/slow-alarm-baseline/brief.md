# Brief: slow-alarm-baseline

## What

The merge slow alarm (`src/verify.ts` `decideSlow`) stops letting its normal climb with a creeping suite. With no open episode the normal is the carried normal (the latest stored `slow.normal_ms`), lowered to the rolling 20-run median whenever that is lower, and it rises only at an `accepted` close. An open episode closes `recovered` only on an eligible run, when the median of the episode's own last 20 eligible runs (at least 5, the run under test included) is back under the threshold, and `accepted` only when it is at least 14 days old, measured from its first flagged run's `end` to this run's `end` in the ledger, and its last 20 eligible runs all lie inside it. An accepted close sends a notice naming the old and new normal under its own notice id, retried by the next checked run when the send failed, and the run after it takes that window's median as the normal. The threshold (1.5x and 2 min) and eligibility are unchanged. `docs/reference/checks.md` and `src/AREA.md` describe the new rule.

## Why

Verify is 91% of framework's merge line time, and the alarm is its only sensor. It opened four times (11-08, 11-12 three times), each episode closed `recovered` within 41 min on one run still 1.33 to 1.46 times the normal, and each close let the normal step up: the median went from 9.0 to 13.4 min after 11-12 with no alarm (forks/extras.md Findings). framework suite-regrowth handed this sensor to this chart (its forks/suite-cuts.md Q5).

## Done-criteria

1. Red first: a ledger whose eligible run times rise in steps each under 1.5 times the rolling median, with no open episode, opens an episode once a run passes 1.5 times and 2 min over the carried normal; today's code opens none on the same ledger. Proof: own test in `bun test`.
2. A ledger whose rolling median falls below the carried normal uses the lower value as the normal on the next run. Proof: own test in `bun test`.
3. An open episode does not close `recovered` on one run under the threshold while the median of the episode's own last 20 eligible runs is over it, and closes `recovered` on an eligible run once that median (at least 5 runs) is under it; runs from before the episode never enter that median. Proof: own tests in `bun test`.
4. An episode whose first flagged run ended less than 14 days before the run under test (both read from the ledger) does not close `accepted`; one at least 14 days old whose last 20 eligible runs all lie inside it closes `accepted`, sends one notice naming the old and new normal, the next checked run retries a failed send, and the run after the close uses the window median as its normal. Proof: own tests in `bun test`.
5. A ledger with no stored normal starts as today (rolling median once 5 eligible runs exist), and existing ledgers parse unchanged. Proof: own test in `bun test`.
6. The slow section of `docs/reference/checks.md` and the verify line of `src/AREA.md` state the rule above. Proof: the reviewing seat reads them against forks/extras.md Taken 2 as copied in this leaf's design.
