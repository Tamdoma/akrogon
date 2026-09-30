# Success measure

## Question
Q1. How does each review and report show that the fix-bar and test-bar rules were applied?

Q2. How do we measure whether leaves move faster without more escaped bugs?

### Carries
- Operator: "1a | 2a | 3a - but how will you qualify and quantify this?"
- Locks: [fix-bar](fix-bar.md), [test-bar](test-bar.md).
- Operator principle (CLAUDE.md, function over form): mechanical checks validate function only; quality judgment belongs to a thinking agent.

## Findings
Research: better-than-training · `issues/log.jsonl` in akrogon and framework, `src/log.ts:19-29` (transition, timestamp, verdict, repair count, aggregate diff), review and report files, computed 2026-09-30. Reports hold some command durations but no standard total test time. No record of escaped bugs exists, so that baseline is unknown, not zero. (A,B)

Baseline, latest 20 completed leaves per repo (B), whole history (A):

| Repo | Implement→merged median / P90 | Review→merged median / P90 | Leaves with a repair round (last 20) | All-time repair rounds per completed leaf (completed leaves only, corrected by B) |
| --- | --- | --- | --- | --- |
| akrogon | 24 / 52 min | 8 / 15 min | 1/20 (5%) | 8/74 (0.11) |
| framework | 58 / 354 min | 14 / 81 min | 12/20 (60%) | 87/225 (0.39) |

Unfinished leaves are outside the medians: framework `offer-join-deploy` is at 8.1 h since review, six repair rounds and one failure. (B)

Q1 options:
- 1a Each Fix states its realistic input source, its consequence today, and the criterion, check or gap it hits; a failed check or named criterion cites that instead. A missing-test Fix names the scenario and what existing tests miss. Each Nit states why it is deferred. The report links each done-criterion and each real bug fix to the tests or evidence proving it. The reviewing agent judges the content; no parser, fixed fields or scores. (A,B)
- 1b A command parses review files or a numeric risk score gates the verdict. Checks wording, not whether the path matters. (A,B reject)

Q2 options:
- 2a No new code. After the rules land, compare the next 20 leaves per repo with this baseline: durations, repair rounds, still-open ages, failures. A thinking agent audits whether Fix/Nit calls were correct. Escaped bugs: confirmed defects attributable to a leaf within 14 days of its merge (seeds are unverified until confirmed), counted with consequence over equally observed baseline and new cohorts. Run at an attended chart door. 20 leaves and 14 days are sampling choices, not thresholds. (A,B)
- 2b Build an `akrogon stats` command, telemetry or dashboards now. Scope beyond the request. (A,B reject)

Pitfalls: compare each repo with itself, since task mix differs. An increase in confirmed escapes is investigated, not assumed to prove the bar is too loose. (B rebuttal) The measurement never authorizes removing configured checks. (A,B)

## Taken
Operator 2026-09-30: `1a | 2a` (after a plain restatement at the operator's request)

Q1 → 1a. Each Fix states its realistic input source, its consequence today, and the criterion, check or gap it hits; a failed check or named criterion cites that instead. A missing-test Fix names the scenario and what existing tests miss. Each Nit states why it is deferred. The implementation report links each done-criterion and each real bug fix to the tests or evidence proving it. The reviewing agent judges content; no parser, fixed fields or scores.

Q2 → 2a. No new code. After the rules land, an attended chart door compares the next 20 completed leaves per repo with the recorded baseline (durations, repair rounds, still-open ages, failures), audits Fix/Nit calls, and counts confirmed escapes attributable to a leaf within 14 days of merge for both cohorts.

Reason: judgment stays with agents per the operator's function-over-form rule; existing logs already give the speed baseline.

Foreclosed: 1b parsed fields or risk scores, 2b stats command or dashboard.
