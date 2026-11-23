# Rebut B: paid-budget design

Read forks/design.md at main 814a2387. (H) marks what I checked on this host on 2026-11-23. No disagreement with picks 1, 6 and 8. Four things break and two are left open.

## Breaks

- B1. Pick 3, the seat cannot read `issues/timings.jsonl` from its worktree. Leaf worktrees are sparse and exclude `issues/` (`src/next.ts:265`, `'/*', '!/issues/'`). A live worktree has no `issues` folder (H). Rows are written to the main checkout (`src/timing.ts:88`, `repo.root`).
  - Consequence: the grep finds no file, the seat has no history and every first guess is a blind one.
  - Fix: the rule names the file in the main checkout, beside the leaf folder the seat already gets as `leaf=`.

- B2. Picks 2 and 4 only fit akrogon's own tests. The two names are read by four akrogon e2e files and nothing else (`tests/e2e/tier.ts:43`, `watch-consults.e2e.ts:153`). No framework code reads either name (H). #152 came from the framework.
  - Consequence: there the `env` values do nothing. A framework paid run that stops on its own limit is not "the test's session refusal or its minute deadline", so it is a red under `skills/lifecycle-rules.md:9` and the rerun is blocked again.
  - Fix: word both picks by function. The budget is whatever limit the test takes as a parameter, passed in the command. A stop on that limit is the budget stop. The two names are akrogon's convention for its own e2e tests.

- B3. Pick 4 reruns when no rerun is needed. `skills/lifecycle-rules.md:11` already says a run cut short by a time limit passes when the recorded evidence meets the floor. That is the operator's own rule from ai-budgets (`issues/chart/ai-budgets/forks/signposts.md:24`).
  - Consequence: read alone, pick 4 buys a second paid run for proof the first run already gave.
  - Fix: one clause. Raise and rerun only when the floor at :11 is not met.

- B4. Pick 7 needs an order. The schema is strict (`src/config.ts:23-24`), so the new build with the stanza still present fails every akrogon command, live seats' `akrogon phase` calls included. The old build with the stanza gone only refuses `--sessions` (`src/budget.ts:57`).
  - Fix: delete the stanza first, then switch the build. No open or parked leaf in akrogon or the framework records `--sessions` (H), so nothing in flight uses the flag.

## Left open

- G1. The door's paid probe. The design does not say what happens to the `paid_budget` needs row (`skills/chart-issues/SKILL.md:12, :49, :71, :73`, `assets/autopilot.md:9`, `docs/use/autopilot.md:21, :37`, `docs/use/plan-work.md:32`). `:49` makes that row "answered only by the operator".
  - Consequence if left: a chart that needs a paid probe waits on a row for a key that no longer exists.
  - Fix: delete the row and the wait. The door sizes its probe like a seat (3b).

- G2. The standing grant entry. It takes its date and answer from the key: `date: <paid_budget.approved.date, "pending" while the key is absent>`, `answer: '~/.akrogon/config.yaml paid_budget'`, `bounds: sessions under paid_budget` (`skills/chart-issues/SKILL.md:75`, `assets/shapes.md:367, :371-372, :382`). `approved` and `bounds` are required text (`src/readiness.ts:38, :46`).
  - Consequence if left: every new paid leaf is written with `date: pending` and an answer that points at a deleted key. A seat comparing the launch with its grant (`skills/lifecycle-rules.md:7`) can read that as not approved and stop for the operator.
  - Fix: date 2026-11-23, answer the operator's 3b words from `forks/signposts.md`, bounds "none" when there is no non-count limit. `lifecycle-rules.md:7` "never widens it" then needs "except count and spend bounds" for pick 5.
