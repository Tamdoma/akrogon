# Success measure: independent round B

The locked Fix and test bars stand. This round makes their evidence reviewable and proposes a small before/after measurement. Operator: "1a | 2a | 3a - but how will you qualify and quantify this?" No slot A files were read.

### 1 · What evidence makes each application of the rules checkable?

Research: operator · Taken sections in `forks/fix-bar.md` and `forks/test-bar.md`; code · `skills/check-issue/SKILL.md:41,49` and `skills/implement-issue/SKILL.md:46-48`, inspected 2026-09-30. Reviews already hold findings/evidence and reports hold criteria, commands, results and limitations. Extend those contents rather than create another form.

- **1a (recommended):** A's report links required outcomes and important bug repairs to existing/new tests and before/after evidence, explaining only nonobvious test-level choices or evidence reuse. Each ordinary Fix links its realistic source, consequence and evidence; a failed check or explicitly named acceptance scenario cites that binding requirement instead. A missing-test Fix identifies the required scenario or realistic defect and what existing tests fail to catch. Nits state why deferred. The reviewing agent judges whether those claims hold against code and results, by content, regardless of headings or wording.
- **1b:** Require a numeric risk score, fixed fields and phrase checks. Adds apparent precision without establishing that the path or test matters.

Pitfalls: a checked box is not proof. Mechanical checks may validate files exist, content is present, states/numbers are valid and costs are recorded; they cannot judge plausibility or test usefulness. Do not add one narrative per assertion. Existing plan/report references can establish several outcomes. The hypothetical rename in `issues/open/epic-broadcast/epic-broadcast-once/review-B.md:10-16` illustrates why a thinking agent must distinguish current consequence from imagined maintenance.

### 2 · How should we measure whether the policy helps?

Research: primary repository evidence · both `issues/log.jsonl` files, computed 2026-09-30 around 16:03 UTC; `src/log.ts:19-29` records transitions, timestamps, verdicts, repair count and aggregate diff. Reports contain selected command durations, not standardized total test time (`issues/open/epic-broadcast/epic-broadcast-once/implementation/report.md:26-28,47`; framework's `offer-join-deploy/implementation/report.md:126-128`).

Baseline: latest 20 distinct completed leaves per repository, using first logged implementation entry, first initial-review entry, and first merged event per `(repo, slug)`. Durations include waits. P90 uses nearest rank. Count review repair entries from transitions, not the resettable counter.

| Repository | Implementation→merged median / P90 | Initial review→merged median / P90 | Leaves entering review repair | Review repair entries |
| --- | --- | --- | --- | --- |
| akrogon | 24.4 / 51.8 min | 8.3 / 14.6 min | 1/20 (5%) | 1 |
| framework | 57.5 / 353.6 min | 13.8 / 81.1 min | 12/20 (60%) | 14 |

Completion windows: akrogon Sept 21–29; framework Sept 29–30. The complete observed cohorts contain 74 and 225 distinct completed leaves respectively; akrogon has two earlier repeated merge identities, counted once. Both recent cohorts have zero merge→repair entries, which are distinct from review repairs.

Survivorship warning: unfinished leaves are excluded from these duration medians. At inspection, akrogon has one and framework two leaves with initial review logged but no merge. Framework's unfinished `offer-join-deploy` already spans **8.11 hours** from initial review to its latest event, with **six review→repair entries plus one review→failed event**; its latest `fix_rounds` is only three. Do not hide ongoing outliers.

- **2a (recommended):** After the policy lands, compare the next 20 leaves per repo with this baseline, reporting completed durations, repair entries, still-open ages and failures. Audit the artifacts with a thinking agent for comparable scope and correct classifications. Use recorded test durations where available, marking missing totals unknown. At an attended follow-up, examine each pre/post cohort leaf's first 14 days after merge for confirmed attributable escaped bugs, report count/observed-leaf denominator and consequence, and link the report or intake evidence. Before comparison, audit the same window for the baseline cohort too. Faster time/fewer unnecessary repairs with no observed increase in escape rate or consequence is encouraging evidence, not proof of equal safety. Twenty leaves and 14 days are proposed sampling choices, not scientific thresholds.
- **2b:** Build permanent telemetry, automated severity scoring and dashboards now. More implementation scope and measurement overhead before knowing whether existing artifacts suffice.

Pitfalls: escaped-bug baseline is **unknown**, not zero; transition logs record no production usage, bug attribution or severity. Unreported bugs cannot be counted as absent. `diff` is an aggregate against the configured base, not test count or task complexity. Keep repositories separate and inspect task mix, concurrency and operator waits before attributing changes to the policy. These measurements do not authorize removing configured checks or reducing the locked safety bar.

Reply `1a 2a`, or give numbered answers in plain text.

Challenge check: logs support elapsed-time and repair baselines today, but not a safety conclusion or total test-cost claim. An artifact audit and matched post-merge observation are necessary for that comparison. No new state fields, wording validator, dashboard or scheduled automation is required by the recommendation; an attended audit has to be explicitly dispatched.
