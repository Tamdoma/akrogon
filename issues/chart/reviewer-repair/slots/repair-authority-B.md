# Repair authority Q1: independent position B

Recommend O3: B repairs every executable Fix that preserves the locked plan and acceptance criteria. This includes multi-file code, test and documentation repairs. Missing planned units, changed design decisions and operator-only actions stay outside this authority. Honor the settled answers: both initial blind verdicts must be recorded before B changes code, and no second reader reviews B's repair. Tests, configured checks and merge checks gate it.

Wider authority cannot increase the measured recent akrogon coverage beyond 100%. Its five recent repair trips already fit the bounded class. Framework offers a larger possible cut, but the evidence does not justify promising that every apparently eligible trip disappears. Nor can I confirm that GPT-6.1 Sol is unbiased toward its own fixes.

## Measurement

Reads and research: 2026-10-02. Window starts 2026-09-25 00:00 UTC and ends at each log's last record. A repair trip means a `check.review -> check.fix` transition. Repeated trips for the same leaf count separately. Merge-origin fixes and failed-recovery entries are separate events, not additional review trips.

Elapsed repair time is entry into `check.fix` to its next exit. Recheck time is the following review's residence until its next exit. These are wall-clock phase times, including waiting, not active work or model cost. Removing a handoff does not remove the necessary repair, testing or merge work.

Akrogon has 5 trips across 5 leaves. Framework has 60 across 44 leaves. Framework also has 1 merge-origin fix and 6 failed-recovery entries into fix. Three of its 60 review-origin trips exit fix into failed rather than review, so their paired recheck times are censored. Framework's immediate fix residence totals 1,701.68 minutes, with 275.09 minutes of completed immediate rechecks. This excludes later recovery residence. Evidence: `issues/log.jsonl:283,363,369,400,405`; framework `issues/log.jsonl:785-1259` (framework paths below are rooted at `/home/ivan/Work/infra/tamdoma/framework`).

Historical seat letters remain historical. The September 26 akrogon trip predates the September 29 role swap. This measures the old repair-and-return path, not five trips under today's A/B assignments. Four trips follow the swap.

## Recent akrogon repairs

Size is files touched and added plus deleted lines between the repair-entry head and the repair-exit head. It includes test and prose changes. Times are minutes.

| Leaf and entry date | Blocking Fix and kind | Size | Repair | Recheck | Trip total |
| --- | --- | ---: | ---: | ---: | ---: |
| peer-c-role, Sep 26 | Challenge template says B's disagreements and omits the newly supported peer C. Documentation/template correction. | 1 file, 2 lines | 4.22 | 0.66 | 4.88 |
| epic-broadcast-once, Sep 30 | Tests pin incidental full stdout and ordering, and dropped an exit-code assertion. Test correction. | 1 file, 19 lines | 7.91 | 1.94 | 9.85 |
| realistic-review-bar, Sep 30 | Guide example does not meet the newly locked source/consequence/criterion Fix bar. Documentation example. | 1 file, 2 lines | 4.16 | 0.63 | 4.79 |
| base-red-exit, Oct 1 | Literal `AKROGON_BASE...HEAD` is an invalid git revision. Use the environment variable expansion in two skills. Wrong command. | 2 files, 4 lines | 5.05 | 1.09 | 6.14 |
| leaf-temp-dir, Oct 1 | Three guides incorrectly say only sweeps delete leaf temp directories, despite the tab-closed hook. Documentation correction. | 3 files, 6 lines | 8.53 | 0.80 | 9.33 |

Finding evidence, respectively:

- `issues/closed/chart-peer-c/peer-c-role/review-A.md:29`. The other blind reviewer returned ready at `review-B.md:25-31`. This predates the seat swap.
- `issues/closed/epic-broadcast/epic-broadcast-once/review-B.md:10-21`. All 37 tests already passed.
- `issues/closed/review-bar/realistic-review-bar/review-B.md:11-18,42-44`.
- `issues/closed/base-red/base-red-exit/review-B.md:12-33,55-61`. The invalid command was reproduced, rather than inferred from its wording.
- `issues/closed/leaf-temp/leaf-temp-dir/review-B.md:9-41`. The 15 targeted tests already passed.

Repair commit pairs: `ffd7be074..1a21e22e0`, `6ea82d107..14e045cf4`, `f47f5254b..c8162fcdb`, `6c296391e..2e340cb57`, `5b31956d6..9b3e1c99b`. Entry timestamps and heads are recorded at the log lines cited above.

Combined residence is 35.01 minutes: 29.87 repairing and 5.13 rechecking. No batch required a new planned unit, design change, live run or operator permission. All five fit O1 and O2 below. These were not five red-test failures. Four were command or documentation defects, and one corrected tests that already passed. B authority removes five transfers to another seat and back. It does not establish a 35-minute saving.

## Candidate rules and coverage

A whole trip counts as removable only when B can resolve every blocking finding in that batch. Fixing one local bug does not remove a trip whose remaining finding needs an operator action.

| Option | Authority | Akrogon trips | Framework trips |
| --- | --- | ---: | ---: |
| O1 | Command, documentation and test corrections within the existing contract. No production behavior change or live operation. | 5/5, 100% | 12/60 confirmed, 20% minimum |
| O2 | Any bounded, reproduced local repair. No plan change, missing planned unit, live run or operator permission. Size alone is not the boundary. | 5/5, 100% | 23/60 confirmed, 38.33% minimum |
| O3 | Every executable Fix except plan/design changes, missing planned units and operator-only items. Live work only when already authorized. | 5/5, 100% | 23–50/60, 38.33–83.33% evidence-supported range |
| O4 | Every Fix, including missing units and changed decisions. | 5/5 nominal, 100% | 60/60 nominal ownership, 100%. Not a realizable guarantee of completed repairs. |

The framework percentages are coverage of classified historical batches, not an experiment with B doing the work. The narrow counts are confirmed floors. The remaining batches contain larger or mixed work whose compliance with the proposed boundaries is not established merely by a log transition or passing check. Reporting all 50 as definitely removable would overstate the evidence.

### Framework classification audit

O1's 12 confirmed trips are `file-ownership` (log line 796), `legacy-scoped-style` (802), `satellite-review` (868), `repair-shutdown-deploy` (923), `page-records` (947), `prose-variance` (986), `operator-photos` (1012), `contact-page` (1050), `kit-canonical-helper` (1085), `write-destination-inputs` (1091), `canonical-gates` (1098), and `sonnet-slot-group` (1111). Their blocking findings concern stale or wrong instructions, payload documentation, token regeneration guidance, test setup, or missing coordination instructions. Nonblocking nits do not enlarge repair authority.

O2 adds 11 trips: `batch-lane-module` twice (785,787), `root-files` (815), `batch-lane-trace` (842), `cadence-apply` (885), `readable-outbound-links` (957), `appended-page-records` (983), `page-map` (1008), `chrome-peer-dedupe` (1123), `offer-walk-binding` (1132), and `strategy-output-relocation` (1222). These correct existing index, provenance, receipt binding, sitemap, fact classification, collision, route, counting or path-binding behavior. The two batch-lane trips count separately because the first repair introduced another defect.

The O3 ceiling excludes 10 trips across six leaves:

| Excluded batches | Why the full batch lies outside O3 | Evidence in framework |
| --- | --- | --- |
| gate-repairs, 1 | Planned repair-envelope module absent. | `issues/closed/batch-and-bash-lane/gate-repairs/review-A.md:20` |
| satellite-build, 1 | Planned production carrier-repair caller not wired. | `issues/closed/satellite-network-simplify/satellite-render/satellite-build/review-A.md:49` |
| live-replay, 1 | Required labeled live receipt absent, upstream dependency and ordered stop. | `issues/closed/satellite-network-simplify/satellite-route/live-replay/review-A.md:25,40-42` |
| emdash-kit, 2 | Mandatory framework verification remains red and needs explicit criterion/policy settlement. B cannot waive it. | `issues/open/emdash-cms/emdash-build/emdash-kit/review-B.md:129,201-205` |
| emdash-conversion, 2 | Red required checks include upstream/dependency failures needing an authorized repair or criterion-owner decision. Whole-batch authority is not established. | `issues/open/emdash-cms/emdash-build/emdash-conversion/review-B.md:22-26` |
| emdash-launch, 3 | Cleanup/live permission barrier and missing acceptance runner unit remain alongside local defects. | `issues/open/emdash-cms/emdash-build/emdash-launch/review-B.md:21-35,134-140,192-194` |

The O1 confirmed trips occupied 70.42 minutes of repair plus recheck residence. O2's confirmed set occupied 227.92 minutes. The O3 ceiling's 50 trips occupied 1,321.48 minutes. None is a forecast of time saved. O3 may save context transfers across larger batches while retaining their repair and verification costs.

For a sensitivity check starting September 29 UTC, framework has 35 trips. O1 confirms 5/35 (14.29%), O2 confirms 8/35 (22.86%), and O3 has an upper bound of 27/35 (77.14%). This calendar cutoff is not the exact role-swap moment and does not show that a model or seat change caused the difference.

## Research: judgment bias and repair quality

All sources below were read on 2026-10-02. These are distinct questions: preferring one's own answer when judging quality, and successfully changing code after receiving external failure evidence. Better performance at the second does not prove absence of the first.

1. **E1, self-preference in judgment.** Panickssery, Bowman and Feng, *LLM Evaluators Recognize and Favor Their Own Generations* (2024), found recognition and preference for own generations in GPT-4 and Llama 2 evaluators, including comparisons controlling human-assessed quality. This concerns evaluation of generated text, not measured GPT-6.1 Sol code repair. [Primary paper](https://arxiv.org/abs/2404.13076).
2. **E2, newer judgment evidence.** Yang et al., *Quantifying and Mitigating Self-Preference Bias of LLM Judges* (2026, revised June 2), studies 20 models. Greater capability does not reliably imply lower self-preference. Structured evaluation mitigates bias on average. It predates Sol's September release and cannot confirm its behavior. [Primary paper](https://arxiv.org/abs/2604.22891).
3. **E3, repair with feedback.** Olausson et al., *Is Self-Repair a Silver Bullet for Code Generation?* (ICLR 2024), finds modest, variable gains once inference cost is considered, with feedback quality a major bottleneck. Stronger or human feedback helps. The tested model generations are older. This supports using concrete failure evidence, not assuming every self-repair improves correctness. [Primary paper](https://arxiv.org/abs/2306.09896).
4. **E4, self-generated tests.** Chen et al., *Revisit Self-Debugging with Self-Generated Tests for Code Generation* (ACL 2025), distinguishes misleading feedback from self-generated tests from more useful runtime evidence. A model can write a test that reinforces its mistaken interpretation. [Primary paper](https://aclanthology.org/2025.acl-long.881/).
5. **E5, realistic external verification.** Choi et al., *Anchored Self-Play for Code Repair* (ICML 2026), uses unit tests as verifiers and finds generated-task drift can worsen performance on real bugs. Anchoring training to real bug examples improves real repair. This is a training study, not a measurement of today's reviewer workflow. [Primary paper](https://proceedings.mlr.press/v306/choi26f.html).
6. **E6, newer self-reflection evidence.** Liu et al., *Do LLMs Catch Their Own Mistakes?* (ACL 2026), evaluates 12 models over 968 dialogues and 88 APIs. Performance drops from critique to self-reflection, especially for assistant-origin errors. It does not establish a Sol-specific result. [Primary paper](https://aclanthology.org/2026.findings-acl.86/).
7. **E7, official Sol evidence.** OpenAI's [GPT-6.1 Sol model documentation](https://developers.openai.com/api/docs/models/gpt-6.1-sol) describes strong coding capability and recommends task-specific comparison. Its [September 29 system card](https://deploymentsafety.openai.com/gpt-6-1-sol), including the [coding-deception evaluation](https://deploymentsafety.openai.com/gpt-6-1-sol/coding-deception), reports 28 severity-3-or-higher flags over 49,650 matched internal Codex tasks, or 0.056%. It also reports lower-severity flags and limitations of deployment simulations. These are different measures from controlled self-preference or repair correctness. Neither source confirms zero self-preference.
8. **E8, practitioner evidence.** Google's [production review-comment repair report](https://research.google/blog/resolving-code-review-comments-with-ml/) (May 23, 2023) reports authors applying roughly 40–50% of suggested edits. Meta's [review-repair study](https://arxiv.org/html/2507.13499v1) (July 2025) finds reviewer-visible suggestions can add review time, while author-side suggestions avoid that significant regression. These support reducing coordination overhead, but involve human review and do not prove autonomous self-judgment is unbiased. Anthropic's [long-running harness report](https://www.anthropic.com/engineering/harness-design-long-running-apps) (March 2026) describes lenient self-evaluation and benefits from separate evaluation in its setting. That is a tradeoff relevant to the already selected no-second-reader option, not a reason to reopen it.

Searches included `"GPT-6.1 Sol" "self-repair"`, `"GPT-6.1 Sol" "self-preference"`, `"GPT-6.1 Sol" "system card"`, official-domain searches for Sol bias and coding benchmarks, `"GPT-5" "self-preference" study`, and `LLM self repair external feedback GPT-5 GPT-5.4 benchmark 2026 study`. They found no stronger verified Sol-specific study of self-preference during repair. Search absence is not proof of absence of bias. No claim here relies solely on recalled model knowledge.

Can confirm: external execution feedback can improve repair, strong models still have evaluation failure modes, and handoff overhead can be reduced. Cannot confirm: Sol has no self-preference, its own green tests independently establish correctness, or wider authority will save the full historical phase residence.

## Recommendation and pitfalls

**D1. Select O3.** Let B resolve contract-preserving executable defects from both recorded blind verdicts, using the smallest repair and concrete before/after evidence. Permit larger code/test repairs and already authorized live validation. Keep the missing-unit and decision boundaries explicit rather than using a line-count cap. O2 already covers every recent akrogon trip. O3 offers a plausible larger framework cut without assigning B authority it does not possess.

**R1. Green checks leave uncovered defects.** Framework's deploy-profile repair passed 11 tests, but the recheck found pagination silently truncating beyond 5,000 resources and a relative export path resolving from the wrong working directory. New probes exposed both. Evidence: framework `issues/open/emdash-cms/emdash-runtime/emdash-deploy-profile/review-B.md:104-131`. With no second reader, B must explicitly test the failed behavior and affected boundary cases. Existing checks remain mandatory, and a new test must assert the criterion rather than mirror the patch. Akrogon's own five trips show that existing green checks miss command and documentation defects.

**R2. Authority does not resolve blocked batches.** Stop once with the exact needed operator action instead of repeatedly sending a permission problem to either seat. The existing rule already requires this: `skills/check-issue/SKILL.md:27`; `issues/chart/reviewer-repair/forks/operator-only-exit.md:3-11`. O4's 100% is an assignment percentage, not an execution result. Changing a required check or implementing a missing planned unit must not be disguised as a routine repair. Existing locked-decision and criterion boundaries are in `skills/implement-issue/SKILL.md:33-38,71`.

**R3. Preserve blind verdicts and bound repair attempts.** Today's route sends fix to A (`src/routing.ts:31-33`). Both initial verdicts must be recorded before any B repair (`src/phase.ts:226-235`), as already selected. An inline B repair otherwise bypasses the current counter, which increments only on review-to-fix and resets on failed recovery (`src/phase.ts:107-112`). Count B repair attempts against the agreed cap and retain authorship across recovery when settling the related round-budget fork. Do not silently let B loop until green. Evidence: `issues/chart/reviewer-repair/forks/round-budget.md:3-12`; current cap `src/phase.ts:237-249`.

**D2. Keep the agreed validation gate.** Record each B repair as its own commit with before/after evidence, run configured checks after repair and the merge checks at merge. These are already the selected Q3 terms (`issues/chart/reviewer-repair/forks/repair-authority.md:16-17`), supported by `skills/implement-issue/SKILL.md:53,59,75` and `skills/merge-issue/SKILL.md:35`. Research supports this evidence-driven approach. It does not turn B's judgment into an independent review or guarantee complete test coverage.
