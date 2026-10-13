# Slot B: implementation speed territory map

**Recommendation:** remove mandatory serial worker splitting, deduplicate validation, and improve merge batching before turning every unit into a leaf. The biggest measured problem is framework integration waiting. Smaller leaves alone do not remove it.

## Sources and measurement

Root aliases: **FW** `/home/ivan/Work/infra/tamdoma/framework`, **AK** `/home/ivan/Work/infra/akrogon`, **LN** `/home/ivan/Work/infra/tamdoma/lens`, **BL** `/home/ivan/Work/infra/blepsis`.

- **S1:** each root's `issues/log.jsonl`. Cohort: leaves whose `to: merged` timestamp falls in September 21–October 12 UTC. For each leaf, sort transitions and sum elapsed time from the preceding transition to each exit, grouped by exited phase. Includes retries and waiting, excludes time in `failed` from check+merge. Uses the entire recorded lifecycle of that delivery, including any earlier start. Size is insertions+deletions in the last nonempty pre-merge diff. One FW leaf has no size evidence. Median is ordinary median, p90 is nearest rank. Missing phase visits contribute zero, missing initial planning time does not.
- **S2:** resolve S1 session paths/UUIDs against `~/.pi/agent/sessions`, `~/.codex/sessions`, `~/.claude/projects`. All referenced nonempty session identifiers resolved, 746 unique parent transcripts. Planning uses received phase prompt to phase exit. Dispatch wait uses phase entry to first matching received prompt before exit. This is an observed lower bound, not complete seat accounting.
- **S3:** archived `issues/closed/**/<slug>/implementation/check-<name>-<milliseconds>-<pid>.log`. Count each timestamped file as one completed wrapper invocation. Full-verify runtime sums its sequential `verify-stage ... wall_time` records. Does not include install/lock time. Older/manual/background runs are not exhaustively counted.
- **S4:** S2 implementation `subagent_spawn` calls naming `implementation/brief*.md`, plus their actual worker transcripts. Runs, not necessarily distinct planned units. Worker interval ends at its last assistant message. Union intervals measure time with at least one worker active. Includes worker checking/context and possible retirement delay.

## F1. Phase time per delivered leaf

Minutes, **median/p90**. P = observed planning, I = implement, R = check.review, B = check.repair, A = check.fix, M = merge, W = observed dispatch waits. W is already inside the phase durations and must not be added again. Sources S1/S2.

| Repo / lines | n | P | I | R | B | A | M | W |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| FW <200 | 47 | 4.2/7.3 | 19.7/77.0 | 3.8/10.3 | 0/6.8 | 0/68.6 | 17.8/178.9 | 0.5/29.5 |
| FW 200–599 | 38 | 5.4/16.6 | 26.6/74.0 | 5.1/14.0 | 0/13.8 | 0/30.9 | 18.2/114.3 | 0.5/46.1 |
| FW 600–1499 | 37 | 8.8/17.3 | 42.5/133.8 | 7.0/16.6 | 3.8/11.5 | 5.4/75.7 | 16.0/315.3 | 0.8/289.3 |
| FW ≥1500 | 116 | 8.2/24.7 | 129.1/282.7 | 12.8/25.4 | 2.0/16.9 | 29.2/191.1 | 25.2/567.6 | 0.9/394.8 |
| AK <200 | 69 | 2.6/6.2 | 8.0/19.2 | 1.9/5.3 | 0/2.2 | 0/4.2 | 2.5/6.0 | 0.3/0.8 |
| AK 200–599 | 18 | 5.8/15.1 | 24.5/54.3 | 3.4/9.0 | 0.8/3.1 | 0/25.3 | 2.2/7.8 | 0.4/1.8 |
| AK 600–1499 | 16 | 7.0/15.4 | 35.0/59.6 | 3.4/7.3 | 3.5/10.1 | 0/22.9 | 2.5/7.7 | 0.4/0.9 |
| AK ≥1500 | 3 | 8.4/22.6 | 56.2/74.8 | 5.0/7.5 | 3.6/18.8 | 3.5/23.1 | 2.6/3.4 | 0.5/0.6 |
| LN 200–599 | 1 | 4.4/4.4 | 28.6/28.6 | 3.3/3.3 | 0/0 | 0/0 | 1.0/1.0 | 0.3/0.3 |
| LN 600–1499 | 2 | 3.8/6.1 | 28.6/38.5 | 2.9/3.4 | 1.4/2.9 | 0/0 | 0.9/0.9 | 0.3/0.4 |
| LN ≥1500 | 1 | 1.4/1.4 | 99.9/99.9 | 6.2/6.2 | 0/0 | 17.1/17.1 | 1.5/1.5 | 0.4/0.4 |
| BL 200–599 | 4 | 3.9/4.1 | 13.6/26.6 | 2.3/2.4 | 0/2.9 | 0/0 | 2.8/4.8 | 0.3/0.4 |
| BL 600–1499 | 2 | unavailable | 9.3/13.0 | 4.2/5.9 | 0/0 | 1.1/2.2 | 2.9/3.3 | 0.3/0.3 |
| BL ≥1500 | 1 | 6.8/6.8 | 30.4/30.4 | 12.9/12.9 | 0/0 | 14.5/14.5 | 4.8/4.8 | 1.1/1.1 |

Planning coverage is FW 226/239, AK 97/106, LN 4/4, BL 5/7. FW planning bucket counts are 47,38,36,104. Initial planning and time from chart creation/dependency readiness to first prompt are not recoverable from transition logs alone. Small LN/BL samples are low confidence.

## F2. Waiting dominates the integration tail

FW observed merge dispatch waits total **245.0 hours**, against **435.8 hours** of merge-phase residence across 239 deliveries. Normal dispatch gap median/p90 is implement **0.08/0.17 minutes**, review **0.11/0.24**, fix **0.14/0.33**. Merge is **0.15/211.3**, measured over 318 matched merge entries. The long tail is specific to merge, not ordinary phase dispatch. S1/S2.

These are leaf-hours, overlapping across seats. They are not 245 hours recoverable from calendar time. Waiting after a received prompt, model thinking and active command time remain mixed. Worker waits are productive delegated work, not idle seats.

FW `issues/merge-attempts.jsonl` contains only 41 window records, starting October 10: 27 merged, 1 reuse, 7 ejected, 1 red, 5 held. Only one record carries a member. Attempt start/end median/p90 is **11.7/18.7 minutes**, not a test timer. Current batching exists but rarely combined work in this small observed sample. S1 plus attempt records, count records and `members.length`.

## F3. Test rounds and repair causes

S3 finds **52 full-verify invocations across 21 FW leaves**, median/p90 **2/5 per covered leaf**. Distribution by phase: merge 37, check.fix 14, implement 1. Runtime median/p90: merge **7.8/13.3 minutes**, check.fix **8.3/11.8**, implement one **8.7-minute** run.

S3 per-leaf completed verify runs below. Each entry is one run’s minutes, sorted by duration. Counts exclude manual logs and base-run counterparts.

| Leaf | Verify minutes |
|---|---|
| audit-phase-inputs | 5.36 |
| backlink-run-identity | 5.34, 5.34, 5.39, 5.45 |
| check-scratch | 5.36, 5.67, 6.76, 7.08, 10.34, 11.79, 13.33 |
| checkout-sensor | 10.07 |
| copy-rules | 9.90 |
| copyfile-install | 7.76, 8.11 |
| formspark-build-wiring | 3.08, 8.30, 10.48, 11.95, 13.65, 13.65 |
| host-reminder-delivery | 5.66 |
| motion-probe-lane | 10.19 |
| parallel-selftest | 1.58, 5.60, 5.66 |
| playback-to-core | 8.72, 9.60 |
| prereq-fails | 11.06 |
| probe-waits | 6.38, 8.23, 8.31, 9.33, 10.09 |
| promotion-without-git | 5.56 |
| recording-consumers | 1.69, 1.69, 8.12, 8.21, 9.22 |
| rejects-assert | 6.10, 7.33, 13.36 |
| root-influence | 9.17, 9.19 |
| skip-advances-phase | 5.44 |
| source-fields | 8.51, 10.05 |
| spec-restore | 12.81 |
| step-commit-baseline | 5.39, 5.46 |

S3 also counts 274 ordinary gate invocations: implement 136, B repair 80, A fix 29, planning 18, review 11. By name: test_changed 76, selftest 62, cheap 41, contracts 36, parity 32, test 27. These are **commands, not 274 whole validation rounds**. Ordinary gates lack uniform persisted start/duration records. There is no defensible exhaustive per-leaf test-round total for the full window from this audit. Transcript tools include background launches and generated orchestration scripts, so counting text occurrences would fabricate runs.

FW has **93 merge exits on 68 leaves**, 90 to check.fix and 3 to failed. AK has 3 exits on 3/106 leaves. LN 0/4 and BL 0/7. FW entries into A fix median/p90 are **1/3 per leaf**, B repair **0/2**. By increasing size bucket, A-fix entries are **0/1, 0/1, 1/3, 1/4**. S1, count destination transitions. Final `fix_rounds` is not the complete repair count: B's repairs need not increment it, and five historical leaves show counter decreases.

Audited causes for the eight exits among the 30 FW deliveries since October 10, from each leaf's `review-B.md` merge section:

| Primary cause | Count | Leaves / evidence |
|---|---:|---|
| Real leaf/test defects | 5 | root-influence: missed dependent fixtures. copyfile-install: copied runner import. parallel-selftest: shared-file race. probe-waits: new playback regression cannot start. backlink-run-identity: verifier expectations/wiring. |
| Integration with newer base | 2 | formspark-build-wiring: new dispose contract plus lint errors. check-scratch: scratch fixtures violate newly landed root contract. |
| Unattributed timing failure | 1 | fail-fast: Wrangler timeout, base has a different sentinel failure. Suspected flake, not proven leaf causation. |

No confirmed machine-environment or known-red-main primary cause in this eight-exit sample. Fixture bugs are code/test defects even when the error concerns an environment variable. **The other 85 historical exits remain unclassified**, not attributed to #87. FW base-runs contains five runs and red-records four opened units, both recent and insufficient for historical classification.

## F4. Actual worker splitting

S4 identifies **1,041 implementation worker runs on 226 FW leaves**, median/p90 **4/9 runs per covered leaf**. Size-bucket medians are **2,3,4,6**. Among multi-worker leaves, **66 ran serially and 137 had overlapping workers**. Serial execution does not prove dependency. This contradicts extrapolating “most leaves are chained” from a few examples.

Worker runtime median/p90 is **9.4/37.5 minutes**. Nonoverlapping return-to-next-spawn gaps are **0.9/14.2 minutes**, over 493 gaps. Implement time outside the union of worker intervals is **17.8/77.2 minutes per covered leaf**. That includes necessary final proof, author edits and repairs, so it is not removable chunk overhead. S1/S4.

October 12 case study, actual worker transcripts and archived plans/reports:

| Leaf | Worker runs / execution | Worker minutes | Between-worker gaps | After last worker | Implement |
|---|---|---|---|---:|---:|
| step-commit-baseline | 3 serial | 49.1,27.6,22.5 | 8.9,1.4 | 30.5 | 142.3 |
| promotion-without-git | 3 serial | 36.4,39.7,13.6 | 1.1,3.6 | 9.2 | 105.8 |
| skip-advances-phase | 2 parallel | 18.7,9.9 | overlapping | 24.3 | 47.6 |
| host-reminder-delivery | 1 | 1.1 | none | 7.2 | 9.5 |

The promotion worker's reported 27-minute duration does not match its actual transcript interval. Its parent also records a retirement warning. Worker time is a proxy, not CPU work.

Both serial leaves have explicit dependencies in `plan.md`. Plans also count planning-owned test units and inline docs, so counting “U” headings overstates implementation workers. Review found defects in the three multi-worker leaves, but only skip's validator/phase-field omission is a plausible boundary defect. Causation is low confidence. The other findings concern baseline handling, locking, missing proofs and stale-gate identity, not clearly worker boundaries.

## F5. Recent fixes and watch claims

FW `issues/config.yaml` now invokes real `test:changed`. Its mtime is **October 12 12:54:43 UTC** and `git diff -- issues/config.yaml` shows it remains uncommitted. Mtime corroborates the boundary, not an independently proven activation event. AK `src/config.ts:readRepo` reads the root working copy.

After that boundary, four leaves reached merge: **zero ejections**, but **five full verifies**, 5.4–5.7 minutes each. step-commit-baseline's first full run failed playback and the identical retry passed (`review-B.md`, “First merge verify result” and “Merge verify retry result”). Zero ejections is not zero failed tests.

Before/after parallel-selftest's October 11 19:26:55 merge, S3 verifies have median/p90 **8.62/12.81 minutes (n=42)** versus **5.41/5.56 (n=10)**. This improvement predates #87. Overlapping changes and different workloads prevent causal attribution. selected-check, cheap-checks and fail-fast also landed October 10, per S1.

The watch's October cohort count **143**, merge exits **92**, and **89** returns to check.fix reproduce. Only **67 distinct leaves** had those exits. The watch's small-leaf **132-minute** median does not reproduce: final-size <200 cohort is **n=28**, check+merge **102.4 minutes**. Whole-window small-leaf median is **33.2 minutes**. Different size snapshots and inclusion of failed time change results. Neither a fixed two-hour leaf tax nor a 15–30-minute dechunk saving is established.

## Material forks

- **D1: work granularity.** Options: mandatory units, whole-leaf execution, or each unit becoming a leaf. Pick whole-leaf execution for coupled/serial work and retain independent parallel waves. Existing inline mode is the smallest starting point. Removing all waves loses measured overlap. Promoting every unit multiplies planning/review/integration and prevents child dispatch until prerequisites merge (`docs/guide/limits.md`). No measured saving should be promised.
- **D2: proof ownership.** Options: every seat repeats gates, reuse equivalent evidence, or drop checks. Pick one evidence owner per integrated revision and rerun only affected proof after edits. `worker-protocol.md` currently requires changed tests after each pick and final checks. FW config also repeats parity/contracts through `test` and `cheap`. Remove redundant execution, retain fail-first and integrated-head proof. Evidence must cover dependencies, fixtures, runner and environment, not merely an unchanged test file.
- **D3: integration.** Options: solo leaves, current ready-leaf batches, or dependent stacks before main. Pick better use of ready-leaf batches first. Existing batch support already gives one top check for several leaves. Dependent stacks could remove per-child merge waits but change prerequisite semantics and failure ownership substantially. Audit conflicts/ejection isolation before that revamp.
- **D4: selection.** Options: current folder ownership, explicit affected-consumer sets, or dependency-aware impact analysis. Pick explicit consumer coverage for shared-hook changes first. `run-test-changed.ts` selects all candidates for an unowned path and runs core when everything is selected. Renaming chunks cannot change that. Narrow selection without consumer coverage invites missed regressions.

## Practitioner questions and lifetime pitfalls

- **Q1:** Is each smaller leaf independently usable and safe on main? Martin Fowler's [Continuous Integration](https://www.martinfowler.com/articles/continuousIntegration.html), January 18, 2024, emphasizes frequent integration and rapid feedback. Small internal tasks do not automatically become independent deliverables.
- **Q2:** Can several reviewed changes share one check on their combined current-base revision? [GitHub merge-queue documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue), accessed October 12, 2026, checks the base plus preceding queued changes. This supports D3's integration target, not a speed estimate.
- **Q3:** Which shared inputs invalidate proof? Require evidence of consumer coverage before changing selection or reuse. The root-influence and check-scratch failures show why file-local reasoning misses integration contracts.
- **R1:** Shared-state tests create repeated work under parallelism. Remove live-checkout mutation with private fixtures rather than retrying indefinitely. parallel-selftest proves the mechanism.
- **R2:** Repair replay on an old base causes another review round. Preserve the rejected integrated base and execute proof on the refreshed repair. probe-waits F4 proves this gap.
- **R3:** Config improvements disappear on reset. Persist the selector change. Avoid attributing simultaneous suite/queue changes to that single line.

**Inputs read:** S1–S4, configs from all four roots, watch excerpt and targeted full-dialog searches, relevant lifecycle docs/skills, log/config/attempt/run-check/next code, prior parallel-units and long-implement briefs/reports/chart intake, verify-speed/merge-gate intake, selector/ownership, lessons, token-ledger header, all ejected-leaf B artifacts loaded and recent causes inspected.

**Skipped/incomplete:** other registered repositories, exhaustive historical cause adjudication, complete shell-script/background command reconstruction, full token-cost analysis, pre-dispatch capacity/dependency history. No peer map read, repository edit, lifecycle mutation or test execution. Scratch analysis helpers removed.

**Priority: reduce repeated proof and merge waiting, then change leaf granularity using measured critical-path delivery time.**
