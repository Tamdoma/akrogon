# Proof rule

## Question
Q1. Which added or changed tests need a stability proof: every test the leaf adds or changes; only tests whose pass depends on time, a browser, other processes or shared resources, plus any test the leaf repairs after it failed in an integrated run; or only tests repaired after they failed at merge?
Q2. What counts as one proof run: the changed case run while the stages that affect it at merge run beside it, using existing runners; the case run alone under injected CPU load; or the test file alone rerun (`bun test --rerun-each`)?
Q3. When existing runners can reproduce those conditions only through the full merge command, does the leaf stop for the operator, run the merge command before review as a named exception to the check-reruns lock, or accept a smaller run with the gap stated?
Q4. How many proof runs: a fixed floor, and which, or a count the planner sets per test with reason and run time?
Q5. When the proof shows a failure caused by the leaf's own changed test or helper, does the leaf repair it on its own branch with failure logs kept and rerun the whole declared count, never counting `--retry`, quarantine or a later green run of the unchanged version, while the single retry for unattributed red stays?

### Carries
- proof-owner.md Taken 1a (operator `1a |`, 2026-10-11): skill steps only, no new command code. The planner names the proof, the implementer runs it and records command, test version and result, slot B rejects proof taken before the latest change to that test or its helper.
- Locks: check-reruns (checks before review and after repair; merge_checks only at merge; check.fix after a red merge replays the exact rejected command once); agent-test-rules 10a/11a/12a; test-runs and merge-load-flakes (no heavy-run slot, no capacity change).
- Existing red handling: skills/implement-issue/SKILL.md:38, skills/merge-issue/SKILL.md:75, docs/guide/merge.md:31.
- Folded 2026-10-11 from proof-trigger, proof-evidence and failure-ending: the three describe one rule and are decided together; staleness was settled by proof-owner 1a.

## Findings
Exchange: slots/proof-rule-A.md, slots/proof-rule-B.md, merged slots/proof-rule-merged.md, B rebuttal slots/proof-rule-rebuttal-B.md (D1-D4 accepted).

- Measured 2026-10-11 (framework parallel-selftest implementation/*.log `verify-stage` lines): `framework:verify:core` 241-291 s over 9 runs; `framework:verify:fast` 90-382 s; `test:playback-probe` 54.37 s inside core, 30.77 s standalone (probe-waits review-B.md:139). Core runs playback in parallel with 7 heavy stages (framework package.json:165). (A)
- Q1: timing/browser/process/shared-resource tests plus tests repaired after an integrated failure, including new cases in existing files and helper changes; selection by behavior, not path; planner gives a short reason for each excluded changed case in the existing proof mapping. (A,B)
- Q2: each counted run must reach the case on its current version while the stages affecting it are running; rerunning the case N times beside one sibling run does not count the later, solo iterations (B D1, A accepts). So one counted run costs about one lane run, 4-5 min for framework playback. Stress-only and file-only reruns rejected as sole proof (A,B); stress-ng not installed here (A). Runs skipped by an earlier failed stage do not count (B).
- Q3: collision raised by B (D2): plan-issue SKILL.md:63 forbids adding merge_checks before review, and check-reruns locks the schedule. A recommends stopping the leaf for the operator through the existing failed ending; B asks only that the contract settle it.
- Q4: A fixed floor; B planner-set count with reason and runtime. Both: declared before the runs, never lowered after red, never a guarantee. Detection math `1-(1-p)^N` holds only for independent runs at a constant p; the #86 replays are not such trials, so any p is hypothetical (B D3).
- Q5: repair applies to failures caused by the leaf's changed test or helper or its own criterion, judged by plausible cause, not by a changed filename in red output (B D4); unattributed red keeps the single retry (skills/implement-issue/SKILL.md:38). A run lost to unrelated infrastructure does not count; an interrupted run is incomplete. (A,B)

### Partial operator answers
Operator 2026-10-11, verbatim: `1a | 2a | 3a | 4- I don't understand this, why do we need a minimum. We just need a minimum of minimums that will suffice. | 5a | Question: why do we even need to run this chart? What was the trigger point? Are we again changing how the testing works?`

- Q1 -> 1a, Q2 -> 2a, Q3 -> 3a, Q5 -> 5a (explicit choices).
- Q4 open: the answer asks why a minimum is needed and asks for the smallest sufficient count; no option chosen.
- New material question from the operator's challenge: whether the rule should exist at all and how big it is. Added as Q6.

Q6. Should akrogon add this rule at all: the rule as answered, a reviewer-only version with no new runs for new tests, or no change with #86 closed as not planned?

### Round 2 exchange
slots/proof-rule-2-A.md, slots/proof-rule-2-B.md, merged slots/proof-rule-2-merged.md, B rebuttal slots/proof-rule-2-rebuttal-B.md (D1, D2 accepted).
- Q6: reviewer-only version, pick (B), pick (A revised from the full rule). Stale proof does not count; a test changed after it failed in an integrated run needs more than one 2a run before it merges again; no new step for new tests. Reason (B): proportional to the two demonstrated gaps. Cost (B D1): a new intermittent test can pass its own first merge and still break a later leaf, so this does not fully prevent the #86 outcome. (A,B)
- Q4 under Q6 reviewer-only: B 2 runs, the rejected-command replay counting as one, about 10 min; A 10 runs, about 45-50 min, paid only after a test already failed under load. Probabilities are illustrations assuming independent runs at constant p=0.1, not an estimate for #86 (B D2): 2 runs about 2 in 10, 5 about 4, 10 about 6-7.
- Prior answers under Q6 reviewer-only: 1a narrows to tests repaired after an integrated failure; 2a, 3a, 5a carry.

### Operator challenge 2026-10-11, verbatim
`this is all so convoluted and starting to become complicated. Why is it all so complicated with these tests? Can't we just use the simplest path possible, that is the most effective, that takes the least time and tokens while not sacrificing quality?`

No option chosen. A re-presents Q6 and Q4 as one question: (a) reviewer-only with 2 runs, the replay counting as one (B's round-2 pick); (b) reviewer-only with 10 runs (A's round-2 position); (c) no change, close #86. Picking (a) or (b) replaces the broader partial answers 1a, 2a, 3a, 5a. Every option was already exchanged with B, so no focused check is needed for a restatement.

### Operator answer 2026-10-11, verbatim
`1a`

Correction found while recording (A, 2026-10-11): 1a's run count rested on A's wrong claim that the rewrite landed after one run. The fixed test passed the refreshed replay of the full rejected merge command (framework probe-waits review-B.md:221, VERIFY_EXIT=0, 3671 pass) and then the merge gate itself on 349c15739 (:239, exit 0), after an earlier old-base replay (:191). The current flow already runs the merge check twice after a fix (check.fix replay, then the merge phase run, skills/implement-issue/SKILL.md:86, skills/merge-issue/SKILL.md:41), so 1a part (2) adds nothing and would not have changed #86. Not recorded as Taken; re-asked as a confirm round. Full merge check per run: framework:verify runs verify:fast then verify:core (framework package.json:168), 90-382 s plus 241-291 s, about 6-11 min.

## Taken
Operator 2026-10-11, verbatim: `1a |` (answer to the corrected round after `1a` was found to rest on A's wrong run-count claim).

Q6 -> reviewer-only, and Q4 -> no rerun count: the rule is proof-owner 1a alone. Proof for an added or changed test counts only when run on that test's current version, after the latest change to the test or its helper; the planner names that proof in the existing proof mapping, the implementer records command, test version and result, and slot B rejects older proof. No new command code, no new step, no load-run campaign, no change to the check-reruns schedule.

Reason: the flow already runs the full merge check twice after a fix (check.fix replay, then the merge phase run), and in #86 the fixed test passed both and still failed later, so a small count adds nothing; a count that might catch it costs about 60-110 min per own-test merge failure. The stale-proof rule fixes the gap a reviewer can see, at no extra run time.

Accepted cost: a fixed test that fails rarely can still land and break a later leaf, as in #86 (B D1).

Foreclosed: the broader partial answers Q1 1a, Q2 2a, Q3 3a, Q5 5a (load runs for timing, browser and process tests before review); 10 full merge-check runs after a fix; no change with #86 closed.
