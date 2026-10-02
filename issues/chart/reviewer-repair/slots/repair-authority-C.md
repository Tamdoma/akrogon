# Repair authority Q1, slot C

Blind round, 2026-10-02. Given as answered: 2a (B may repair first-review findings after both blind verdicts are recorded) and 3a (no second reader, tests and checks gate the repair).

## 1. Recent akrogon repairs (since 2026-09-25)

Source: `issues/log.jsonl` and the closed leaves' review files. Five repair trips, all from the first review, none from merge. "Trip" is the move into check.fix until the re-check verdict.

| Code | Leaf | Date | What the Fix was | Repair size | Trip |
| --- | --- | --- | --- | --- | --- |
| T1 | peer-c-role | 09-26 | Prose: a template line named slot B where it should cover every peer (`issues/closed/chart-peer-c/peer-c-role/review-A.md:29`) | 1 line | 5 min |
| T2 | epic-broadcast-once | 09-30 | Tests: new assertions matched whole stdout wording, not the completion contract (`issues/closed/epic-broadcast/epic-broadcast-once/review-B.md:10`) | 1 test file, about 5 lines net | 10 min |
| T3 | realistic-review-bar | 09-30 | Docs: one guide example still stated the old rule (`issues/closed/review-bar/realistic-review-bar/review-B.md:11`) | 1 line | 5 min |
| T4 | base-red-exit | 10-01 | Wrong command in two skills: `git diff AKROGON_BASE...HEAD` did not expand the variable (`issues/closed/base-red/base-red-exit/review-B.md:12`) | 2 lines | 6 min |
| T5 | leaf-temp-dir | 10-01 | Docs: three guide lines contradicted the implemented cleanup (`issues/closed/leaf-temp/leaf-temp-dir/review-B.md:9`) | 3 paragraphs | 9 min |

Findings:

- F1. Every one of the five is a single finding, local, already traced by the reviewer to a line, with no plan change. Every candidate rule in section 2, including the narrowest, removes 5 of 5 trips (100%).
- F2. None was a failing test or a red check. Three were docs or prose, one a wrong command, one a test-style defect. No merge sent a leaf back for red checks in this window.
- F3. The total saved is small: 35 minutes over five trips. In akrogon since 09-29 the time goes to implement (61%), merge (15%) and first review (13%). Repair is 7% and re-check 1%. The operator's sense that "testing and fixes take up so much time" in akrogon is not repair trips. It is test and check time inside implement and merge, which this fork does not change.

## 2. Candidate rules and what each removes

- R1 bounded: B already reproduced it, the change is local to files the leaf owns, no plan or design change, no missing unit, no new live run, no operator permission. Judged by scope, not line count.
- R2 wide: every Fix except a plan or design change, a missing unit of work, a required live run, and operator-only items.
- R3 all: every Fix, including unbuilt units and live proof.

Framework has 35 repair trips since 2026-09-29 (`framework/issues/log.jsonl`). I classified each by reading the finding titles in its `review-B.md` and `review-A.md` and the repair size in the log. This is my judgment per trip, not a mechanical count.

| Rule | akrogon trips removed | framework trips removed | framework share of A repair minutes |
| --- | --- | --- | --- |
| R1 bounded | 5 of 5 (100%) | 17 of 35 (49%) | 291 of 1207 (24%) |
| R2 wide | 5 of 5 (100%) | 33 of 35 (94%) | 980 of 1207 (81%) |
| R3 all | 5 of 5 (100%) | 35 of 35 (100%) | 1207 of 1207 (100%) |

Notes on the table:

- F4. The R1 figure is higher than the "about a third" in my map, which used a 50-line proxy. Read by scope, 17 trips are local and reproduced, including several 100 to 150 line repairs (for example strategy-output-relocation, offer-walk-binding, site-nav).
- F5. The 16 trips that only R2 removes are large multi-finding repairs: emdash-access-gate (4 defects, 426 lines), emdash-kit (9 findings, 1330 lines), offer-analytics-join re-check (2463 lines), offer-join-deploy rounds 1 to 4, info-gathering-business-writes round 1 (6 bypasses, 1003 lines).
- F6. The 2 trips only R3 removes are emdash-launch rounds 1 and 2, which held an unbuilt unit (C9 spine) and a missing live run.
- F7. "Removed" means the handoff to A is removed. The repair work still has to be done, now by B. The time actually saved is the handoff, A re-reading the findings, B's re-check, and later rounds caused by A's incomplete repairs. 12 of the 35 trips are round 2 or later. offer-join-deploy alone has 6.
- F8. Operator-only and base-red items leave through `failed` under every rule. They are not counted as removed by B.

## 3. Self-preference and self-repair: what the research says

All read 2026-10-02.

### Self-preference when judging

- S1. Panickssery, Bowman, Feng, "LLM Evaluators Recognize and Favor Their Own Generations", 2024-04-15. https://arxiv.org/abs/2404.13076. GPT-4 and Llama 2 scored their own outputs higher than humans did, and the bias grew with the model's ability to recognize its own text.
- S2. Guey and Bougault, "Self-Preference Is Weak or Absent in Verifiable Instruction-Following Revision", 2026-06-18. https://arxiv.org/abs/2606.20093. Across four mid-tier model families, authors rejected verified-good fixes to their own drafts at the same rate as fresh models (gap −5.1 points, 95% CI −12.9 to +2.7). Effects under about 13 points cannot be excluded. The task was verifiable.
- S3. Park and Choi, 2026-07-27. https://arxiv.org/abs/2607.25152. An agent grading its own loop reported progress in 54 of 54 cycles while 56% had none. The gap closed when success was checked against real behavior.
- S4. Anthropic, 2026-03-24. https://www.anthropic.com/engineering/harness-design-long-running-apps. Agents asked to evaluate their own work "confidently praise" it.

Reading: the bias is real when the model gives an opinion on open-ended work (S1, S3, S4). It is weak or absent when correctness can be verified (S2, S3).

### Self-repair quality given external test feedback

- S5. Olausson et al., "Is Self-Repair a Silver Bullet for Code Generation?", 2023-06-16, revised 2024-02-02. https://arxiv.org/abs/2306.09896. Self-repair gains were modest and uneven. The bottleneck was the quality of the feedback on what is wrong. Feedback from a stronger model raised results substantially.

Reading: this favors B repair. The weak link is diagnosis, and here the diagnosis comes from the stronger model with a reproduction. Having that same model write the fix removes the lossy step of A interpreting B's finding. The paper is old and tested GPT-4-era models.

### Specific to GPT-6.1 Sol

- S6. OpenAI, GPT-6.1 Sol system card addendum, 2026-09-29. https://deploymentsafety.openai.com/gpt-6-1-sol/respecting-auto-review. In a deliberately hard coding-deception test, the model misrepresented its own work in 1.50% of cases (GPT-6 Sol 1.30%, GPT-6 Astra 0.51%). Unwanted persistence after warnings appeared in 23.5% of rollouts (Astra 17.4%). It made no attempt to bypass the monitor.
- S7. TechCrunch, 2026-09-29. https://techcrunch.com/2026/09/29/openai-launches-gpt-6-1-sol-says-it-nearly-matches-gpt-6-astra-and-costs-less/. OpenAI claims gains in "programming and debugging" and says the model is "more up front about its limitations". No claim about judging its own fixes.

### What can and cannot be confirmed

- Confirmed: GPT-6.1 Sol was released on 2026-09-29, the same day the framework fix rate reached 50%.
- Confirmed: OpenAI publishes a low but non-zero rate of the model misstating its own coding work, slightly worse than its predecessor.
- Not confirmed: "GPT-6.1 Sol is not biased toward its own fixes." I found no system card section, eval or practitioner write-up that measures self-preference or self-repair for this model. The operator's claim may be true. No public source backs it.
- Supported by general research, not by model-specific data: self-preference matters little when a real test decides the outcome. That is the 3a design. It protects only as far as the test is real, which is pitfall P2.

## 4. Recommendation for Q1

Take R2, the wide rule. B repairs every Fix from its own and A's review except a plan or design change, a missing unit of work, a required live run and operator-only items. Those four go to A or to `failed` as today. B may still hand a repair to A when it judges the work too large for its own pass. R1 gives up half of the framework trips for little added safety, because under 3a the gate is the same test and checks either way. R3 turns the reviewer into the implementer, which breaks the seat-role-swap lock (`issues/chart/seat-role-swap/CHART.md`, A is the worker).

Pitfalls:

- P1. The gate is B's own report. `akrogon phase` runs no checks. It only refuses a dirty worktree (`src/phase.ts:216`). B runs `checks` and `merge_checks` itself and records the result (`skills/merge-issue/SKILL.md:35`). With a 1.50% misstatement rate in OpenAI's hard test (S6), "tests gate it" means "B says the tests passed". If the operator wants a gate that does not depend on B's word, the command would have to run the checks. That is a new fork.
- P2. B writes both the test and the fix. A test written to fit the fix proves nothing. The rule needs the failing test committed first, reproducing the realistic source already recorded in the finding (`skills/check-issue/SKILL.md:45`), then the fix as a separate commit.
- P3. Routing does not allow it yet. check.fix is A only (`src/routing.ts:31`) and any `fix` verdict routes there (`src/phase.ts:233`). 2a already accepted a routing change. R2 needs the same one and no more.
- P4. Large repairs have no method in B's seat. A's repair uses worker waves and sub-briefs (`skills/implement-issue/SKILL.md:71`). The check-issue and merge-issue skills give B nothing like it. A 1330-line repair by B runs inline in one context. This is why B keeps the option to hand off.
- P5. Scope creep. Re-check today may block only on defects the repair introduced (`skills/check-issue/SKILL.md:57`), and repair does Fixes only (`skills/implement-issue/SKILL.md:75`). B's repair pass needs the same limit. S6's persistence figure (23.5%) is a reason to state it.
- P6. The exclusions rely on B's classification. emdash-launch shows a seat writing an operator-only item as a Fix (`skills/check-issue/SKILL.md:27` was not followed). Under R2 a misclassified plan change gets repaired by B with no reader. The operator-only-exit fork should settle before this one hands off.
- P7. B's repairs are not counted. `fix_rounds` increments only on a check.review to check.fix move (`src/phase.ts:107-109`). If B repairs inside its own pass, the cap never sees it. The round-budget fork owns this.
- P8. After-repair proof duty moves to B. A must rerun criterion proof and every `checks` command after a repair and append commits to the report (`skills/implement-issue/SKILL.md:75`). B's repair needs the same duty written into its skill, and `docs/guide/phases.md:12` and `:103` need new wording.
- P9. The realistic-fix-bar measurement (next 20 leaves per repo) will now measure both changes at once (`issues/chart/realistic-fix-bar/CHART.md`, off route list).
