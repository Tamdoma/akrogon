# stack-fate: blind notes, slot B

Read 2026-10-19. Position developed from the supplied intake and locks, source, attempt log and independent outside research. No other slot's fork notes read. Source checkout: `e522c1865538294dc1f65a90c7bcb5309a667513`.

## 1. Pick, reason and cost

**D1. Remove member stacking. Keep one holder, its existing integration checks, attempt identity, fast-forward push and publication recovery.** This removes the source of unrelated leaves sharing a failed attempt, rather than retaining the machinery and changing which leaves it excludes.

The measured benefit of stacking is five extra leaf completions across four successful stacks. Its red attempts cost 210.25 minutes in the brief's snapshot and 480.04 minutes in the expanded log. Removing it sacrifices throughput when several leaves could pass together. It does not shorten the holder's own checks, and the log cannot prove that removal would outperform the proposed head-only exclusion.

This reopens the 2026-10-15 **all-or-holder batching decision itself**, including its promise to land waiting leaves together. It supersedes the red-skip key because members no longer exist. It introduces no cap, batch-fill delay, bisection, culprit command or speculative train. The operator's wish to avoid slowdowns remains a requirement to assess, not a claim that every all-green workload gets faster with solo turns.

## 2. Rejected options

- **O1. Keep stacking, skip unchanged red member heads across base changes.** This is the strongest alternative and the smallest edit: remove the base condition and corresponding argument from `redMemberHeads`, update `pickMembers` and the skill contract, and change the moved-base test. Holder eligibility remains unchanged. All three hashed members of successful historical stacks had no earlier recorded red membership, so this rule does not directly exclude those successful heads. However, a red combined tree proves no individual member guilty. The rule makes every innocent member wait for its own holder turn or a changed head, even when a new base or different companions would have passed. It also retains member construction, branch rollback, drift checks, multi-leaf publication and crash recovery. I prefer deleting those mechanisms to retaining an optimization that often reduces to solo operation after the first failure.
- **O2. Keep the current `(head, base)` exclusion.** Rejected on direct measurement: identical member heads repeatedly enter red attempts as the recorded base changes. This is the accepted one-extra-verify cost recurring on successive bases, not a violation of the current lock.
- **O3. Add batch caps, bisection, culprit discovery, parallel trains or fill waits.** Still foreclosed. Outside systems explain why these mechanisms can make batching effective. Their success does not authorize importing them here.

O1 reopens only the **base-sensitive red-skip decision**, preserving all-or-holder and unlimited membership. D1 reopens the larger batching decision.

## 3. Evidence, tier, source and date

**F1. Operator evidence.** `INTAKE.md`, `CHART.md`, opening-map section “#104 merge stacks”, and `issues/closed/merge-batch/stacked-turn/design.md` section “Binding decisions, verbatim”, read 2026-10-19. The operator asks to remove redundancy and complexity first. The prior design deliberately allowed innocent heads to re-enter after main moved. Neither option is merely implementing an already-approved correction.

**F2. Measured operating history, operator-supplied source.** `/home/ivan/Work/infra/tamdoma/framework/issues/merge-attempts.jsonl`, read 2026-10-19. The file now has 333 complete records, SHA-256 `038256419dd838b1e5eba0387171e8a15e8324bcb1bac976eea260adaf303971`. The first 267 reproduce the brief's 51 member-bearing attempts exactly, ending `2026-10-18T12:37:46.829Z`. The expanded sample ends `2026-10-19T03:00:36.719Z`. Both begin `2026-10-10T13:37:26.626Z`.

Here “stack” means any attempt with nonempty `members`, including one member plus its holder. Minutes are the sum of `(end - start) / 60`, including agent and coordination time inside the recorded attempt. They are not isolated verify-runtime or CPU measurements.

| Measure | Brief snapshot, first 267 | Expanded sample, 333 |
| --- | ---: | ---: |
| M1. Member-bearing attempts | 51 | 77 |
| M2. Stack outcomes: merged / red / ejected | 4 / 46 / 1 | 4 / 72 / 1 |
| M3. Total stack attempt minutes | 275.95 | 545.74 |
| M4. Red stack minutes | 210.25 | 480.04 |
| M5. Successful stack minutes | 54.92 | 54.92 |
| M6. Leaf completions from successful stacks | 9 | 9 |
| M7. Extra completions beyond the four holders | 5 | 5 |
| M8. Total stack minutes per stack-landed leaf, M3 / M6 | 30.66 | 60.64 |
| M9. Solo attempts / solo merged outcomes | 216 / 150 | 256 / 173 |
| M10. Solo attempt minutes per solo-landed leaf, including failed attempts | 17.52 | 18.59 |
| M11. All leaf completions, including stack members | 159 | 182 |
| M12. Red stack minutes per all-landed leaf, M4 / M11 | 1.32 | 2.64 |

The successful stacks are independently identifiable:

| Attempt | Holder | Members | Minutes |
| --- | --- | --- | ---: |
| S1. `ab8e6a2a-c0a2-40fb-b6f4-55502e30a772` | pass-two-review-notes | test-port-per-check | 8.86 |
| S2. `3b9d71b6-8250-4aea-a57b-986dfeff00c3` | technical-pack-selection | favicon-audit | 18.60 |
| S3. `c6f3c9f9-3ccd-4776-82e2-43731edbee07` | fork-terminal-stop | gate-input-sources, manual-phase-close | 13.96 |
| S4. `281c83c1-5a7b-4192-b98f-48802b5650c5` | schema-guide-types | retry-ownership | 13.51 |

Those nine completions occupy four successful holder turns. With member stacking removed, they would require nine successful holder turns **if each could pass independently**, a difference of five turns. Combined-top success does not prove each prefix would pass. The first two stacks record member names without heads, further limiting historical reconstruction.

For scale only, the expanded sample's median successful solo span is 12.6935 minutes. Nine such turns would cost 114.24 minutes against 545.74 minutes spent on all stack attempts, a 431.49-minute illustrative difference. This is an estimate, not a replay or causal speedup measurement. Different releases, load, retries and changed integration trees prevent an exact solo counterfactual.

Every red stack is immediately followed in the log by a memberless attempt for the same holder. In the first 267 records those 46 solo attempts yield 35 merged and 11 red outcomes. In the expanded sample the 72 yield 51 merged and 21 red. Thus many holders land immediately after paying for a failed combined attempt, but solo checks also remain a substantial cost.

**F3. Repeated unchanged heads, same source and date as F2.** Scan records in file order. For each red member object, compare `(slug, head)` with its latest prior red membership and compare the two `built_on` values. Exclude legacy name-only members from head comparisons.

| Measure | First 267 | Expanded 333 |
| --- | ---: | ---: |
| H1. Red attempts containing an unchanged previously-red member on a different base | 39 / 46 | 61 / 72 |
| H2. Such repeated member appearances | 470 | 571 |
| H3. Distinct `(slug, head)` pairs repeated across bases | 47 | 62 |
| H4. Total minutes of attempts counted in H1 | 159.31 | 358.41 |
| H5. Red attempts whose every member head had prior red membership | 18 | 30 |
| H6. Total minutes of attempts counted in H5 | 70.41 | 159.83 |

No hashed head repeats red on the same base in either sample. For example, `upgrade-replay` head `374be842e72cc3eb5cc2a1b17f913067c2df84c6` appears red on 21 distinct bases. `dilutor-liveness` and `cadence-inputs` each also have a head appearing red on 21 bases.

H4 is **not** a head-only exclusion savings estimate. In the expanded sample, 31 of the 61 attempts mix old red heads with new heads. They could still form smaller failing stacks. Thirty contain only previously-red members, but even deleting those historical attempts changes later evidence and queue state. A history scan cannot prove the alternative execution. This is why current failure rate alone does not settle O1 versus D1.

**F4. Implementation evidence, better-than-training tier.** Inspected the requested code and full merge-issue skill at the checkout above, plus the member-dependent phase functions, read 2026-10-19. `src/batch.ts:143` skips a conflicting member after aborting its rebase. A member conflict by itself does not make the whole attempt red. Holder build failure or dirty application already takes the memberless path.

Removal has this concrete boundary:

| Code | Delete or simplify | Preserve |
| --- | --- | --- |
| C1. `src/batch.ts:85`, `buildStack` at 110 | Delete `pickMembers`. Remove member input, member rebase loop, `stacked`, member retirement inputs and returned `tips` map. | Holder integration, disposable worktree cleanup, lesson retirement, `attemptId`, `memberBase`, `isAncestor`, `branchSha`, `move`, `applyTop`, `removeEmptyUntrackedDirs`. These still serve solo turns. Do not delete the file wholesale. |
| C2. `src/attempts.ts:50` | Delete `redMemberHeads` and its now-unused exported `readAttempts`. Stop emitting members on new attempts. | Attempt records, outcomes, timing, pressure and tool evidence. Keep historical member parsing used by the log schema and timing-report reader. |
| C3. `src/next.ts:918`, `mergeTurn` at 1008, `mergeContext` at 1153 | Delete member selection, member drift/rebuild loop, tip recording, prompt `members=`, reconciliation member moves, member tab/dependent follow-up. | Holder selection, locks, dispatch, candidate ancestry recovery, exactly-once recording and holder completion. |
| C4. `src/phase.ts:515`, `batchCheck`, `batchPush`, `restack`, `finishPush`, `phaseCommand` | Delete member-only equality rule, member range checks, member drift refusals, member push/recovery loops, re-selection on restack and red-stack rollback/restart branch. | Holder descendant rule for mechanical repairs, checks and receipts, test-change citations, retirement checks, push refusal reruns, transport-error recovery and solo `check.fix`. These functions do not disappear wholesale. |
| C5. `src/state.ts:40`, `batchSchema:49` | Delete `batchMemberSchema`, `BatchMember`, and `batch.members` with its `{slug, base, head, tip}` entries. | `state.batch` and its other attempt, holder, publication and verification fields. They coordinate solo turns too. No broad state rename. |
| C6. `src/turn.ts:82` | No member code to delete. | Existing merge ordering, dependency eligibility, active-attempt priority and stopped-holder behavior. |
| C7. `skills/merge-issue/SKILL.md`, prompt, “merge”, “attempt top”, “Shared endings” | Remove member snapshots and red-head exclusion, multi-leaf top restrictions, all-owner gathering, member drift/restack instructions and red-stack-to-holder restart. | Single-holder applied/solo instructions, repair rules, `--attempt`, verify receipts, owner completion, broadcasts and failure handling. |
| C8. `src/timing.ts`, existing batch/dispatch/merge/attempt tests | Stop producing live member timing metadata. Replace member-behavior assertions with two-waiting-leaves-stay-independent assertions. | Historical timing parsing and tests of solo safety, dirty worktrees, retirement, stale attempts, refused/lost pushes and restart recovery. Use existing bun:test helpers. |

**F5. Outside research, practitioners first.** All links below were read 2026-10-19. These are sources about queue design, not proposed dependencies or live service actions.

| Source | Tier and reason to hear it | Batching and failed work | Effect on this decision |
| --- | --- | --- | --- |
| E1. Will Smythe and Lawrence Gripper, [GitHub's operating account](https://github.blog/engineering/engineering-principles/how-github-uses-merge-queue-to-ship-hundreds-of-changes-every-day/), published 2024-03-06 | Practitioner. GitHub's own rollout and operation, including 30,000+ PRs before public availability. | Their older large trains caused long waits. The replacement forms groups and removes incompatible PRs. | Evidence against treating a whole queue as one failure domain, while also showing that deleting all grouping sacrifices useful throughput. |
| E2. [GitHub queue mechanics](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue), current documentation | Better-than-training, primary mechanics supplementing E1. | Tests cumulative prefixes. A failed PR is removed and later combinations rebuilt without it. Merge limits govern landing groups, not combining CI builds. | GitHub grouping is not proof that one all-or-holder verify is sufficient for efficient failure isolation. |
| E3. Rust project integration maintainers, [Rollup Procedure](https://forge.rust-lang.org/release/rollups.html), undated current practice | Practitioner team. Maintains compiler integration with a documented roughly 3.5-hour CI cycle. | Selects rollups by risk. On real failures, identify and remove the offending PR, then rebuild. Suspect work can run standalone. | Strong reason to batch when independent verification is extremely expensive, coupled with active failure isolation that this fork forbids. |
| E4. bors-ng maintainers, [How it works](https://github.com/bors-ng/bors-ng#how-it-works), undated implementation account | Better-than-training, primary source. Distinguish bors-ng from Rust's current bors rollup workflow in E3. | Accumulates waiting reviewed PRs, tests a staging batch, fast-forwards on green. On red, recursively splits; a failing singleton returns to its author. Its stated premise is that reviewed PRs usually pass. | Unlimited opportunistic batching is workable with a recovery algorithm. The source does not endorse repeatedly retrying an unidentified red set after every base advance. |
| E5. James E. Blair, [OpenStack gating presentation](https://docs.openstack.org/infra/publications/zuul/), undated; supplemented by [current Zuul gating documentation](https://zuul-ci.org/docs/zuul/latest/gating.html) | Practitioner creator/operator account, plus better-than-training mechanics. | Runs speculative cumulative prefixes in parallel. Drops failed changes, retests affected successors. Current windows shrink on failure because repeated speculation wastes resources. | Useful when CI has parallel capacity. It is not a free optimization for this host, and speculative trains remain foreclosed. |
| E6. Julien Danjou, Mergify co-founder, [batching and bisection guide](https://mergify.com/guides/cut-ci-costs-batching-bisection), updated 2026-07-29 | Practitioner, describing the queue his team builds and operates. | Tests bounded groups, bisects failures and removes the culprit. Explicitly makes savings depend on queue failure frequency. | Contradicts unconditional removal in a mostly-green workload, but supports costing failure recovery rather than counting only green-run savings. |
| E7. Julian Maurin, [Mergify's own dynamic-batching rollout](https://mergify.com/blog/dynamic-merge-queue-batch-size), published 2026-07-06 | Practitioner, first-hand production observations on a fixed runner pool. | Uses individual checks normally and pairs under backlog, with a ceiling of two. Burst capacity improved, while observed daily merge volume did not. | A reminder that batching can help bursts without proving a daily throughput win. Its caps and parallel checks are outside this fork's locks. |

The practitioners agree on testing the actual integration state and preventing failed work from repeatedly blocking unrelated work. They differ on where they spend resources: GitHub and Zuul test prefixes, bors-ng and Mergify split failed batches, and Rust operators select and reconstruct rollups. Their advice favors batching when checks are long, integration failures uncommon, or isolation/concurrency available. Those conditions can reverse my pick. Under the present locks, the available choices are a broad head blacklist with all the existing stack machinery, or deleting membership. I choose deletion for its smaller continuing state and recovery surface, accepting the lost all-green batching benefit.

## 4. Pitfalls and what removes them

- **R1. Removing too much breaks solo safety.** Remove membership only, using C1-C8. Preserve attempt ownership, verified-head/receipt checks, non-fast-forward handling and lost-push reconciliation. A test with two eligible leaves must prove only the holder's commits and phase move land.
- **R2. A new schema can strand an applied or already-pushed stack.** Before dropping `batch.members`, finish or reconcile every old in-flight batch with the old release, including memberless records serialized with `members: []` and failed publication-recovery records. Confirm no old batch state remains. Clearing a record is unsafe when the holder still contains member commits or a candidate may already be remote. Do not silently discard those fields on read.
- **R3. Solo turns can drain a healthy backlog more slowly.** This is D1's accepted cost, not something another guard removes. Preserve automatic next-holder dispatch and all existing solo behavior. Do not claim the 431.49-minute illustration proves every future workload improves, or that this fixes long individual checks.
- **R4. Head-only exclusion can suppress innocent members after their environment heals.** If O1 wins, exclude only from membership, never holder eligibility, and keep a changed head eligible again. That prevents permanent merge blockage, but does not recover lost batch opportunities for an unchanged head. The fork must accept that cost explicitly.
- **R5. Historical red outcomes do not identify a culprit or exact avoidable runtime.** Preserve the measurement definitions and limits in F2-F3. New members could still fail under O1. A changed base can heal a prior combined failure. Neither “all repeated-head minutes disappear” nor “all nine leaves would have passed solo” follows from this log.
- **R6. Member deletion can accidentally erase history or coverage.** Retain legacy attempt/timing readers and existing solo recovery tests. Remove member-specific production paths and assertions, not the whole test files. Verify independent waiting leaves, red holder repair, refused/lost push, stale attempt, dirty worktree and retirement behavior with the existing runner.

## 5. Question missing from the fork

**Q1. Does “without slowing solo merges” mean preserving the holder's current behavior, or preserving throughput for a future mostly-green backlog as well?** D1 meets the first and cannot promise the second. O1 preserves the possibility of batching new heads, at the cost of retaining the full member lifecycle. That is the material choice behind the smaller code edit versus the smaller continuing system.
