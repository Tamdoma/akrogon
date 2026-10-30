# Filing rule

## Question

Q1. Who files a red that is also red on base as a bug, and on what trigger?
Q2. What does one filing hold?
Q3. What counts as already filed?
Q4. What happens when filing fails?

### Carries

- Locks: known reds pass inside `akrogon verify`; nothing waits or is marked failed for a base red (`../base-red/forks/red-base-policy.md` `## Taken`, 2026-10-17). Done-criteria proofs stay blocking. No classifier model API (jev-classifier). No new timers or polling (autopilot, seat-stall-detection).
- Related: `../red-base-wait/CHART.md` (earlier exclusion of seed filing, line 27), `../killed-check-log/CHART.md` (#120).
- Operator corrections: none.

## Findings

Merged notes: [slots/filing-rule-merged.md](../slots/filing-rule-merged.md) (A: map-A.md, B: map-B.md). B rebuttal: [slots/filing-rule-rebuttal-B.md](../slots/filing-rule-rebuttal-B.md).

- Research, better-than-training, inspected 2026-10-27: verify's notice (`src/verify.ts` `sendMainRedNotice`, `newRedUnits`) runs in verify's finally block before the seat's causal judgment and sees only configured `checks`/`merge_checks`; the #121 suite `test:emdash-conversion` (framework `package.json:61`) is outside them. (A,B)
- `skills/seed-issue/SKILL.md` already routes by `akrogon.yaml` `issues_repo` or origin with an akrogon owner test, dedupes by two read-only lookups judged by mechanism, and is linked into claude, codex and pi skill folders. It ends with `Next: none` and stops. (A,B)
- No lifecycle seat skill calls seed-issue today (`skills/learn-issues/SKILL.md:31` only prints a line). (A)
- seed-issue treats any covering report, open or closed, as covering, so a recurrence after a delivered fix can be suppressed. (B)
- B rebuttal: closure time alone does not prove recurrence (closed as duplicate); check.review files from either slot, so records go to `review-<slot>.md`. Both adopted.

Round 1 as written in A's pane 2026-10-27: 1a seat files via seed-issue on every route / 1b verify calls gh; 2a one report per supported cause / 2b per test; 3a semantic coverage with closed-report recurrence rule / 3b today's rule; 4a record and continue / 4b block until filed. Challenge check: best-effort dedupe, concurrent seats can duplicate.

## Taken

Autopilot pick by A, 2026-10-27 (not operator words; mode record in CHART.md): `1a 2a 3a 4a`, matching the round recommendation.

1. Trigger and filer: on every route the seat that judged a red also red on base with no cause in the diff files it through the `seed-issue` skill inside its pass: implement end and check.fix (implement-issue Shared context known-red rule), check.review and check.repair (check-issue known-red rule, either slot), merge red verify (merge-issue), and the door's direct landing (chart-issues `## Direct route` landing step 3). It fires for a configured command after a `verify --known-red` pass whose judgment agrees, and for a command outside `checks` (done-criterion proof or ad-hoc suite) when the seat's own completed base run of the same command fails the same tests. A green retry (`inconsistent`), a disagreeing judgment, or a killed or incomplete base run is not filed as a base red.
2. Filing never changes a verification status: a red done-criterion stays blocking, a known-red pass stays a pass. The filing reuses the evidence the pass already holds and starts no extra verification. seed-issue's `Next: none` footer becomes a line in the pass record and the pass continues to its own phase action and footer. A `gh` failure while filing is not an operator blocker for the leaf.
3. Content: one report per observed defect, grouping commands and failing tests together only when evidence supports a common cause, otherwise filing them separately rather than delaying intake or inventing a cause (B final check); it names the exact command and scope, the head and compared base SHAs, the retry result, a short failing excerpt, kept log paths and the leaf, and claims nothing about main beyond the compared SHA.
4. Already filed: seed-issue's existing lookups judge coverage by mechanism. An open covering report suppresses the filing and its URL is recorded. In seed-issue, a closed report covers only through an open report it names (closed as duplicate) that covers the failure; a supported recurrence of a defect whose closed report's fix was delivered, or a current defect with no open covering report, posts fresh with the closed report on its Related line, never reopening or commenting. Best-effort, not exactly-once.
5. Failure: the created or found URL, or the failing command and its error, is recorded in that seat's own pass record (`implementation/report.md`, `review-<slot>.md`, `review-B.md` at merge, or `<chart>/direct/report.md`); the leaf continues; no retry queue, timer or wait; a later encounter files through the ordinary lookup. No eventual-delivery guarantee.

Reason: the seat's existing judgment gate is the only place that both knows the red is main's and sees commands outside `checks`; seed-issue already owns routing and dedupe, so the change is skill text with no new code path, store or outside call in akrogon code.

Rejected: verify calling `gh` (misses the #121 case, runs before judgment, duplicates routing); a local record under `issues/` (leaf branches cannot write it, not a bug filing); one report per test (38 for one cause); keeping today's closed-report rule (a closed report hides a returned red); blocking until filed (reintroduces the foreclosed base-red wait).

Final-shape check: [slots/filing-rule-final-check-B.md](../slots/filing-rule-final-check-B.md), item 3 wording adopted; no other disagreement.

Standing dissent: none.
