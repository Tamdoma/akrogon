# stack-fate: blind notes, slot C

Question: delete member stacking (holder-only merge turns), or keep it and stop re-stacking an unchanged red head after main moves?

## 1. Pick

**Delete member stacking. Holder-only turns.**

Reason: stacking is net-negative in every measured cut, and the parts that make batching pay in other merge queues (parallel speculative CI, removing or splitting out the culprit after a failure) do not exist here: verify is serial on one host, and splitting, a culprit command and a size cap were all foreclosed on 2026-10-15. What is left is an unlimited-size serial bet that 8-18 leaves are all green together. It landed 0 times in 39 tries at that size.

Cost of the pick: queue throughput is capped at one leaf per solo verify (median 12.2 minutes of verify wall per landed leaf in the data below), even in a future state where leaves arrive at merge almost always green. If that state ever arrives, stacking would pay and would have to be re-added. The closed stacked-turn design and git history keep that re-add a known design, and merge-attempts keeps recording the solo red rate that would justify it.

Lock re-opened: the core of the 2026-10-15 decision, all-or-holder batching itself. The holder half of that decision becomes the only path. The same lock carries the operator's "Simplest systemic solution, always work towards simplicity, even removing code if necessary", which this pick follows.

## 2. Rejected options

**Keep stacking, make the red-skip per head instead of per (head, base).** Rejected because it fixes only the repeat waste, which is the smaller part, and keeps all the machinery. Simulated over the historical stacks it firmly saves only the stacks it empties: 70.4 of 210.3 red minutes. The other 21 stacks it merely shrinks still run, and whether they turn green is unknowable from the data. Every new bad head still gets one free red stack, stacks still land members whose own prefix was never verified, one push still moves many leaves and owners, and a red stack still names no culprit. It also drifts toward holder-only in practice: after the first red stack in a busy period, most waiting heads are excluded as members until they change, so the system keeps the full member code for holder-plus-newcomers stacks only. Lock part re-opened: not the size cap the chart names (a skip is not a size cap), but the red-skip key sub-decision, per (head, base), whose stated purpose was letting innocent members re-stack after main moves. The data says that purpose earned nothing: 470 same-head re-stacks on a new base, 0 landed. But paying a lock re-open for at most a third of the waste is worse than re-opening the main decision and deleting the waste whole.

**Status quo (keep per-(head, base) skip).** Rejected on the intake numbers alone: after every merge the base moves, the skip resets, and the same red members are stacked again. 39 of the later red stacks contain at least one head already proven red on an earlier base.

## 3. Evidence

### Measured, framework merge-attempts (better-than-training: measured result)

Source: `/home/ivan/Work/infra/tamdoma/framework/issues/merge-attempts.jsonl`, read 2026-10-19, cut at end ≤ 2026-10-18T12:40Z to match the brief snapshot. 267 attempts, 51 with members: 46 red, 4 merged, 1 ejected. Solo: 216 attempts, 150 merged. Durations are end minus start.

- Stack wall time: 275.9 minutes total. Red stacks 210.3 (median 2.6 each, 38 of them 2-3 minutes, 8 at 13-16 minutes), merged stacks 54.9, ejected 10.8.
- Leaves landed by stacks: 9 (4 holders + 5 extra members). That is 30.7 stack minutes per leaf a stack landed, and 55.2 stack minutes per extra member leaf. A solo merged turn has median 12.2 minutes, mean 11.2 (n=150). Stacking paid about 4.5 times the solo cost for each member leaf it saved.
- Net against the solo counterfactual: the 5 extra members saved about 5 × 12.2 = 60.9 minutes of solo verify. Against that, 210.3 minutes of red stacks (pure waste, the solo fallback still runs after each) plus the merged stacks costing 54.9 where 4 holder solos would have cost about 48.7. Net about −156 minutes.
- By size: stacks of 1-2 members, 12 tries, 4 merged, 117.1 minutes, roughly break-even by the same arithmetic (about +3 minutes). Stacks of 8-18 members, 39 tries, 0 merged, 158.8 minutes, all waste. No stacks of 3-7 members exist in the sample; the queue is either small or 8+. Even the best subset only breaks even, which does not cover keeping the member machinery.
- Solo red rate is 47 of 197 merged-or-red solo attempts, about 24%. Even with no integration failures at all, an 11-leaf stack at that rate is all-green at most 5% of the time. The stack size `pickMembers` builds cannot win at the current red rate.
- Re-stacking after main moved: 522 member appearances in red stacks (object-form records), 52 distinct heads. 470 later appearances are the same head on a different `built_on`, 47 distinct heads, and all 470 sit in stacks that went red again. No unchanged head ever landed as a member after being in a red stack. 32 of 44 red-member slugs later landed as solo holder. The 2 slugs that later landed as members (gate-input-sources, manual-phase-close, 2026-10-17) did so only after their heads changed.
- Head-only skip simulated on the same data (48 object-form stacks): 18 would be emptied (all red, 70.4 minutes), 21 shrunk, 9 unchanged, and both object-form merged stacks unaffected. Shrunk-stack outcomes are unknowable, so 70.4 minutes is the only firm saving under the keep option.
- The file has grown since the cutoff and the direction held: at read time 333 attempts, 77 stacks, still 4 merged, red stack wall 480.0 minutes.

### Inspected code (better-than-training: this repo)

Read in full 2026-10-19: `src/batch.ts`, `src/attempts.ts`, the merge turn in `src/next.ts` (`reconcileBatch`, `mergeTurn`, `mergeContext`), `src/turn.ts`, batch fields in `src/state.ts`, member paths in `src/phase.ts` (`batchCheck`, `batchPush`, `restack`, `finishPush`, the `check.fix` branch in `phaseCommand`), `skills/merge-issue/SKILL.md`.

- The holder path does not depend on members. `buildStack` rebases the holder onto the base in a disposable worktree and removes retired lesson lines; members are one loop inside it. `batchPush`, `restack`, `reconcileBatch` and the solo skill form already carry a complete holder-only flow (today's fallback after every red stack, and the only form that lands anything).
- One combined verify proves the final tree only, not each member prefix. Holder-only turns verify every landed leaf against its actual base, which is a stronger per-leaf guarantee and keeps main bisectable per leaf. Removal loses no safety; it gains this.
- Two leaves that are green alone and red together are still caught under removal, at the second leaf's holder turn, one turn later and with a clear owner instead of an anonymous stack.

### What removal deletes (inspected)

Deleted outright:

- `src/batch.ts`: `pickMembers` whole; the member loop and `tips` map in `buildStack` (`StackResult` loses `tips`); the now-unused imports of `redMemberHeads`, `mergeQueue`, `readLog`, `BatchMember`.
- `src/attempts.ts`: `redMemberHeads` whole; the members mapping in `appendAttempt`. The `members` field on `attemptRecordSchema` can go too, since that schema is a plain `z.object` and strips the field on old lines.
- `src/state.ts`: `batchMemberSchema`, the `BatchMember` type, and `batchSchema.members`. See P1: live state files are strict-parsed, so this one needs the in-flight handling below, not a bare delete.
- `src/next.ts`: the `pickMembers` call and members in the new batch record and timing event; the post-build member drift loop, which is the only reason `mergeTurn` loops with a `rebuild` outcome, so the loop collapses to build once, apply, dispatch; the member loops and closable scan in `reconcileBatch`; the `members=` suffix in `mergeContext`.
- `src/phase.ts`: the per-member checks in `batchCheck` and member ranges in the retired-lesson scan; `requireBatchTop` collapses to the descend rule (holder may carry repair commits); member drift refusal and member moves in `batchPush` and `finishPush`; the membered branch of `restack`; and the whole membered `check.fix` special case in `phaseCommand`, including the literal `stack red; holder turn restarts alone` output, so `check.fix` always moves the leaf.
- `src/timing.ts`: writer side only. The schema is `z.strictObject` inside a discriminated union, so the optional `members` field must stay readable for old timing lines or be stripped in the reader; the leaf picks, a bare schema delete breaks history parsing.
- `skills/merge-issue/SKILL.md`: the `members=` prompt form and the stacking paragraph in `## merge`; "one verify lands every member"; the memberless-repair and trailer-refusal conditionals become unconditional; gathering briefs for every stacked leaf's owner reduces to the holder's owner; member drift and member-skip-on-restack lines; the membered `check.fix` ending in Shared endings.
- `src/AREA.md` buildStack line updated. Tests: member cases in `tests/batch-dispatch.test.ts`, member schema cases in `tests/batch.test.ts`, the members prompt helper in `tests/next.test.ts`, deleted or rewritten to holder-only equivalents.

Kept: `src/batch.ts` and the `Batch` record themselves (attempt id, `built_on`, holder, `top`, `tested_top`, `candidate`, pressure, tools), `buildStack`'s holder rebase and retired-lesson fixup, `applyTop`/`move`, reconcile and restack holder paths, merge-attempts recording. "Batch" becomes the single-leaf attempt record; renaming it is out of scope.

Under the keep option, by contrast, the whole change is dropping `record.built_on === builtOn` from `redMemberHeads`, its now-unused parameter, one skill sentence, and tests. Nothing is deleted.

### Outside the repo (read 2026-10-19)

- Practitioner: Zuul project gating, documented by the Zuul/OpenStack operators who run it at scale: https://zuul-ci.org/docs/zuul/latest/gating.html. Speculative parallel testing assumes success; on a failure, dependent results are discarded and testing restarts without the failing change. The pipeline window that bounds speculation halves on each failure and grows by one on each success, because, in their words, frequent failures make speculation use large resources for little gain. At this repo's failure rate their algorithm drives the window to its floor, which is serial testing.
- Better-than-training: GitHub merge queue docs: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue. Merge groups are tested combined, group size has min/max limits, groups run with build concurrency, and on failing CI the failing pull request is removed from the queue and later groups are rebuilt without it. The queue never retries the same failing combination unchanged.
- Better-than-training: Mergify merge queue batches: https://docs.mergify.com/merge-queue/batches/. Batches are small (examples 3-5, dynamic sizing from min 1) and on failure Mergify splits the batch in parallel to isolate the culprit and removes it. Splitting is exactly what the 2026-10-15 lock forecloses here, and parallel splits need parallel CI this host does not have.
- Better-than-training: bors-ng getting started: https://bors.tech/documentation/getting-started/. Reviewed pull requests are merged together into a staging branch, one CI run, main fast-forwarded on green; a maximum batch size setting was added later (bors.tech homepage newsletter index, read same day). Bors is the closest match to this design and still grew a size cap.

Synthesis: every system that makes batching pay pairs it with parallel CI capacity and a culprit-removal or splitting step after failure. Akrogon has neither, and two of the three remedies (split, culprit, cap) are foreclosed by lock. Batching without them is the part that does not transfer.

## 4. Pitfalls

- P1: a leaf mid-merge in some repo holds `batch.members` in its state.yaml when the new release lands; `batchSchema` is strict, so the bare field delete makes that leaf unreadable everywhere. Removed by: a leaf done-criterion with a fixture state carrying members; the parse must discard members (one-release tolerance in the state reader, as `readState` already strips legacy top-level keys) and the holder must continue solo or have its record cleared, never throw.
- P2: code and skill skew. The merge seat reads `merge-issue` from the installed release and the prompt loses `members=`. Removed by: the leaf ships `src` and the skill text together and the batch-dispatch tests pin the two remaining prompt forms (`top=`, `solo`).
- P3: holder branch position on the not-landed reconcile path. Today the restore to `holder.head` runs only when members exist, because a solo applied top is the holder's own rebase. Removed by: existing holder-only batch tests staying green plus one explicit criterion that a red solo top leaves the holder branch where `check.fix` expects it.
- P4: old history lines with members (merge-attempts, timing) must still parse in every repo that has them. Removed by: a leaf test over legacy-line fixtures; attempts schema strips the field, timing keeps a readable field or strips in its reader (named in the deletion list, not left to chance).
- P5: throughput ceiling if the solo red rate later collapses. Nothing in the leaf removes this; it is the stated cost of the pick. What keeps it recoverable: merge-attempts keeps measuring the solo red rate, and the stacked-turn design stays in `issues/closed/merge-batch/`.
- Under the keep option the standing pitfalls are different: innocent heads lose member rides until they change (they still land as holder, so delay, not starvation); a combination healed by a later base is missed as a member (measured cost so far: zero, 0 of 470); and the pressure to add splitting, a culprit command or a cap returns every time the queue grows, since the red stack still explains nothing.

## 5. Questions the fork does not ask

- Q1: why is the solo turn itself 12 minutes at median and red 24% of the time, when every leaf already passed check before reaching merge? Deleting stacking removes the wasted 2-16 minutes before each solo attempt but leaves an 11-leaf queue at roughly 2+ hours of verify wall. The fork settles stack fate; the queue drain problem in the intake mostly sits in solo verify cost and merge-time red causes, which no open fork owns.
- Q2: the data points at a third option the fork excludes: stack only when 1-2 leaves are waiting, the only sizes that ever landed. That is a stack-size cap, foreclosed in 2026-10-15. My count says even that subset only breaks even (about +3 minutes over the whole sample), so I do not recommend it, but if the operator would rather re-open the cap foreclosure than the batching decision, that is a different fork than the one written.
- Q3: should merge-attempts record which check command went red? Today a red stack and a red solo are both unexplained in the data, which is why this fork argues from wall time instead of causes. One field at record time is not a culprit command, and it is what a future revisit of either this decision or Q1 would need.

Most important: delete stacking; it cost about 156 net minutes in the snapshot window, landed 5 extra leaves ever, and the solo path it falls back to is already the only path that lands anything.
