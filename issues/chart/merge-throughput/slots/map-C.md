# Territory map C: merge throughput at equal quality

Code lines cite the origin/main checkout at HEAD 083264e (`ref/`). Skill lines cite `ref/skills/*/SKILL.md`. Consumer numbers come from `tamdoma/framework/issues/log.jsonl`, records since 2026-10-07, computed in this pass (primary data), plus seed-reported classifications (unverified intake).

## 0. The constraint in one paragraph

One merge turn per repo (`src/phase.ts:770-778`, `src/turn.ts:55-74`) is the only serial resource. Since 10-07 it produced 100 merge exits: 54 `merged`, 46 `merge -> check.fix` bounces. A leaf's median stay in `merge` is 3.3 h (p90 5.6 h), the same for leaves that merged and leaves that bounced, so almost all of that stay is queue wait behind other holders. A bounce costs the leaf only 0.34 h median to come back to `merge` (check.fix plus B-only re-review), but it costs the turn one full run and puts the leaf at the back of the queue with a fresh `merge_stamp` (`src/phase.ts:152`). Merged throughput = turn rate x green rate x effective batch size. Turn rate is locked at one (merge-turn chart). The levers that remain are green rate at the turn and batch yield.

## 1. Stock and flow

Stocks (per repo): leaves per phase (`src/routing.ts:2-13`); the merge queue (leaves in `merge`, ordered by `merge_stamp`, `src/turn.ts:62-73`); the holder (queue[0], `src/next.ts:972-973`); the batch record on the holder (`src/state.ts:42-55`); main health (no stock: nothing records "main red at sha X"); the `solo` and `batch_limit` marks on leaves (`src/state.ts:84-85`); lessons (`learnings/LESSONS.md`, 141 active lines on framework today, counted in this pass).

Flows and the rule that sets each:

| Flow | Rule |
|---|---|
| Dispatch into the pipeline | cap `max_active` counts leaves with a live pane, not running checks (`src/config.ts:25`, `src/next.ts:331-344`, `361-362`); order is merged-first then inventory order (`src/next.ts:773-775`), dependents are swept only after a completion (`src/next.ts:1255-1266`) |
| review -> merge | aggregate verdict, any `fix` goes to check.repair (`src/phase.ts:295-300`); re-review after a repair is B-only when `fix_rounds > 0` (`src/routing.ts:54`) |
| merge entry | `merge_stamp` set on every move to `merge`, including a return after a bounce (`src/phase.ts:152`); `solo` and `batch_limit` survive only while the leaf stays in `merge` (`src/phase.ts:153-154`) |
| holder selection | earliest stamp (`src/turn.ts:55-74`); batch = every queued leaf after the holder, minus `solo` ones, cut at `batch_limit` which is undefined on a fresh holder, so the first batch is the whole queue (`src/next.ts:1017-1020`) |
| stack build | members rebased in turn order onto fetched main, then the holder (`src/batch.ts:42-76`); a conflicting member is restored and marked `solo: true` permanently (`src/next.ts:1179-1181`), a conflicting holder goes solo and B rebases by hand (`src/next.ts:1152-1171`, merge-issue:49-55) |
| gate | B runs `checks` not in `merge_covers`, then `merge_checks`, on HEAD in the leaf's long-lived worktree (merge-issue:41, 51); nothing runs `merge_checks` before this point (plan-issue:63, implement-issue:63, 84, check-issue:85) |
| green | push fast-forward, members then holder to `merged` (`src/phase.ts:470-478`); a non-fast-forward restacks and reuses the run only when main moved inside `issues/` and `learnings/` (`src/phase.ts:527-532`) |
| red with members | members restored, holder keeps the turn with `floor(n/2)` members, no transition, no log record (`src/phase.ts:788-798`) |
| red without members | holder -> `check.fix`, no cause comparison (merge-issue:65); `fix_rounds` unchanged because the increment keys on `check.repair` (`src/phase.ts:151`); the cap keys on the same (`src/phase.ts:302`) |
| check.fix after a bounce | A starts at B's rebased head, treats the red output as the finding, proves with `checks` only (implement-issue:78-84); a red with no cause in the diff runs the base rule and ends `failed` when base is red too (implement-issue:38) |
| red main | not a state; the next holder is dispatched as usual; only `pause` exists and it freezes the whole repo by operator hand (`src/pause.ts:58-64`, `src/next.ts:962`) |
| lessons | written by B before `merge` (check-issue:59, 89); excluded from implement and review input (implement-issue:31, check-issue:45); drained only by operator-run learn-issues, which prints seed lines and files nothing (learn-issues:24-31) |

## 2. Loops

Reinforcing (each one makes the queue longer, and a longer queue feeds it):

- R1 queue drift. Wait time -> main moves under waiting leaves -> conflicts at stack build -> permanent `solo` (`src/next.ts:1179-1181`) or DRIFT bounce -> bounce re-enters at the back (`src/phase.ts:152`) -> more turns spent -> longer wait. Seeds 62, 65.
- R2 red-main cascade. Main red -> holder red -> `check.fix` regardless of cause (merge-issue:65) -> next holder runs the full gate on the same red main -> same. Each bounced leaf then runs the base rule in check.fix and ends `failed` (implement-issue:38), so the operator must move it. Seeds 63, 64, 67. The framework log shows the 10-09 case exactly: three holders red on `2ccc39534`, two `check.fix -> failed` with reason "hooks:selftest red on base 2ccc3953...".
- R3 batch multiplier. First batch = whole queue (`src/next.ts:1020`), green probability p^n at p 0.62-0.86, red costs a full run and halves, the halved limit dies with the holder (`src/phase.ts:154`). Longer queue -> bigger first batch -> more red runs -> longer queue. Seed 68.
- R4 late gate. The gate runs first at the serial turn (the four skill lines in section 1), the repair after a bounce is proved only by `checks` (implement-issue:84), so repeat bounces run at the first-attempt rate (seed 71: 42%). No cap closes it (`src/phase.ts:151, 302`). Seeds 71, 72. The log shows 46 bounces for 54 merges, one leaf bounced 5 times, six bounced 3 times, and 12 of 46 bounces had `fix_rounds: 0`.
- R5 lesson stock. Lessons written at every review, read by no seat, drained by hand -> classes recur -> more lessons. Seed 73. Independent of the merge loops except that merge bounces are where the recurrence is paid.
- R6 load. 20 seats run suites on one host, the cap counts leaves not runs (`src/next.ts:335-338`) -> flakes at the gate -> bounce -> rerun. Seed 69. The test-runs chart ruled a heavy-run slot off route until a load failure is traced, and seed 69 says the link is inferred from timing, so R6 stays unproven.

Balancing:

- B1 `max_active` limits leaves in flight (`src/next.ts:361-362`). It limits the whole pipeline, not entry into `merge`.
- B2 `fix_rounds` cap (`src/phase.ts:302`). Closes the review-repair loop only.
- B3 batch split halving (`src/phase.ts:795`). Per holder, downward only.
- B4 reuse on restack (`src/phase.ts:527-532`). Saves reruns only for `issues/` and `learnings/` moves.
- B5 the single turn itself. It is the bottleneck and the quality gate at once, so every wasted run is paid twice.
- B6 the base-red stop in check (check-issue:61, implement-issue:38). Stops wasted repair, but ends in `failed` and needs the operator.

## 3. Leverage, ranked

Numbers use the seed classification of 34 bounces (DEFECT 12, DRIFT 10, BASE 9, INFRA 3). DRIFT and BASE together are 56%. DEFECT is 35%.

L1. Red-main latch at the merge exit. When the holder's gate is red, B runs the one failing command on a detached worktree of fetched main (the existing base rule, check-issue:61, same material conditions). Red on main: the leaf stays in `merge` at its place, B records base sha and both logs, and the command records "merge turn waits on main at `<sha>`" in a repo-local state file like `paused.yaml` (`src/pause.ts:18-20`). `mergeTurn` (`src/next.ts:956-962`) skips the repo while the fetched tracking ref equals that sha; the latch clears itself when main moves; explicit `akrogon phase <slug> merge` and `unpause`-style operator verbs still run, as the repo-pause chart already decided for pause. The holder is then re-prompted on the new main through the normal restack (`rerun`, `src/phase.ts:644`).
   Removes: R2 whole, the operator moves in seed 64, the three-holder cascades in 67, the BASE class in 62. Also the `check.fix -> failed` dead end after a base-red bounce, because the leaf never leaves `merge`.
   Cost: one state file, one check in `mergeTurn`, one ending in merge-issue:65. Base run adds one command's time per red exit (framework: 12 min), paid once per red-main episode instead of once per holder.
   Breaks later: a flaky suite that fails on main marks main red and holds the turn until main moves. Mitigation is already decided by test-runs chart: latch only on a completed comparable run with recorded shared cause; a killed run never latches. A fix for main that lands as a leaf must merge through the latched turn: the latch must let the operator-named leaf through, same shape as pause's explicit-command exception.

L2. A merge-bounce repair proves itself against the command that bounced it. One sentence at implement-issue:84 (and 78): after repairing a red merge finding, A runs the same failing command (whether `checks` or `merge_checks`) on its head and records green before `check.review`. Nothing else changes: the deferral rule stays for first attempts, the check-reruns lock ("merge_checks run only at merge") is reopened only for this one command after a bounce.
   Removes: the 42% repeat rate in seed 71, the lint-after-repair case, most of seed 72's 3-5 bounce leaves. Each extra run happens in the leaf's own seat, parallel, not on the turn.
   Cost: one prose line, 46 extra runs over three days on framework (one per bounce), 12 min each.
   Breaks later: more concurrent heavy runs (R6) at the moment of a bounce wave. If R6 is ever traced, this is the first place to revisit.

L3. Batch limit becomes repo state with additive increase, multiplicative decrease. Move `batch_limit` from the leaf (`src/state.ts:85`, `src/phase.ts:154`, `796`) to one repo-level number: start at a floor (2), add 1 on every green batch, halve on red, never below the floor. `src/next.ts:1020` reads it. Zuul's dependent pipeline window does exactly this (zuul-ci.org/docs/zuul/latest/gating.html, read 2026-10-09: "increases by one with each successful merge and halves with each failure", with floor and ceiling); the rule is TCP congestion avoidance (RFC 5681 s3.1, read 2026-10-09). GitHub's merge queue bounds groups with min/max size and removes only the failing PR then re-tests the rest (docs.github.com, managing-a-merge-queue, read 2026-10-09).
   Removes: R3's whole-queue first batch and the reset per holder (seed 68). With p 0.62 the expected green per run is maximized at batch 2-3, which the floor delivers while the rate is low and growth finds when it rises.
   Cost: one state file or one key in a repo-local record, three small edits. Removing `batch_limit` from the leaf schema is a state migration (readState already drops old keys, `src/state.ts:104`).
   Breaks later: the holder is always in the batch, so a holder that is the culprit keeps halving around itself. Today's code already has that; L2 makes the culprit rarer. Culprit ejection (GitHub style) is a bigger change and not needed while red at the turn is mostly base or drift.

L4. Merge bounces count toward the repair cap. `src/phase.ts:151`: increment when `to === 'check.fix'` from `merge` as well as from `check.repair`; `src/phase.ts:302`: cap applies to the merge origin too. Side effect for free: `requiredSlots` (`src/routing.ts:54`) then gives B-only re-review after the first bounce, which is the second half of seed 72.
   Removes: unbounded cycles (seed 72). Depends on L1: without the latch, a base-red bounce would burn a round the leaf did not earn. Order: L1, then L4.
   Cost: two lines plus tests.
   Breaks later: a DRIFT bounce still burns a round. Acceptable while drift is handled by the solo rebase; revisit if drift stays the top class after L1 and L3.

L5. Attempt records in the log. `logMove` (`src/log.ts:32-58`) is called only on transitions; the batch split (`src/phase.ts:788-798`) and the green run with members produce no record of attempt id, members, outcome or duration. Append optional fields on the merge-origin records and one record for a split: `attempt`, `members`, `outcome: green|red|split|reuse`, and the B-recorded command wall time. The schema is non-strict (`src/log.ts:9-22`, `failure` is already optional), so old readers keep working.
   Removes: seed 66's transcript scraping, and it is the only way to see whether L1-L4 moved the number.
   Cost: small. Breaks later: nothing, additive.

L6. Dependents-first ordering. Dispatch (`src/next.ts:773-775`): add a second sort key, count of unmerged leaves whose `blocked-by` names the slug, descending. Safe, because dispatch order has no holder semantics. Merge queue (`src/turn.ts:62-73`): not safe as a live key, because the holder is recomputed from the queue on every phase call (`src/phase.ts:771`) and a new dependent registered mid-run would change the holder under a running B and refuse its `merged`. If wanted, the key must be frozen into state at `merge` entry next to `merge_stamp`. Seeds 65 and 70. Low now (cap not binding on 10-09, turn idle after 04:10), high only on 20-seat nights. Rank last of the code changes.

Not ranked: L7 clean-checkout gate (seed 63). Seen once, caused by a framework test that needs untracked empty folders; fixed forward on framework main. A clean detached worktree per merge run would add a `setup` install per run on the serial turn, the wrong place to pay. Off route with a reopen condition.

## 4. Forks the operator must decide

Q1. Reopen "merge_checks only at merge" and how far.
   O1 Keep the lock, no change. O2 L2 only: the bounce repair reruns the one failing command. O3 Every leaf runs `merge_checks` once in its own seat before `check.review` (the merge turn confirms, never discovers). O4 Full speculative merge queue: each queued leaf tests on the predicted main (stack ahead of it) in its own seat, the turn only pushes (Zuul model).
   Pick O2. It removes the repeat rate with one sentence and no new load pattern. O3 catches the 12/34 DEFECT bounces earlier at the cost of 54 extra full runs per three days and a confirmed reversal of the check-reruns chart; defer until L1 and L5 show DEFECT as the top remaining class. O4 is the practitioner end state and the right shape if 20 seats stay the norm, but it replaces the batch model, and R6 (host load) becomes the limit immediately. The small changes above do not foreclose it: a latch, a repo-level window and attempt records are the same primitives Zuul uses.

Q2. What does a red-on-main merge exit do with the leaf.
   O1 Stay in `merge`, latch the turn on the main sha, auto-clear on main move (L1). O2 Move to `check.fix` as today but exempt it from the cap. O3 Run `akrogon pause` for the repo.
   Pick O1. O2 keeps the dead end at check.fix (seed 64). O3 freezes dispatch of unrelated leaves and nothing unpauses.

Q3. Who repairs red main.
   O1 Operator, as today (direct push, the latch clears). O2 The holder's B fixes forward in the leaf (merge-issue:55 already allows "a broken default branch discovered by this leaf is fixed forward"). O3 A fix leaf through failed-leaf-routing.
   Pick O1 plus O2 when the fix is a one-commit test scaffold defect like 10-09; B already has the permission and the worktree. O3 for anything larger, and that leaf must pass the latch by operator name.

Q4. Batch window scope and floor.
   O1 Repo-level AIMD, floor 2, ceiling the queue (L3). O2 Keep per-holder halving, only persist the limit across holders. O3 Fixed config `batch_size`.
   Pick O1. O2 keeps the whole-queue first batch. O3 needs the operator to tune it by hand every time the green rate changes, which is what seed 66 shows is impossible to measure today.

Q5. Does a merge bounce count as a repair round (L4).
   O1 Yes, after L1. O2 No, separate `merge_bounces` counter with its own cap. O3 No cap.
   Pick O1. O2 adds a second counter and a second cap to configure for the same behavior.

Q6. Lessons drain (seed 73).
   O1 Leave operator-invoked, out of this chart. O2 Run learn-issues as a step of each chart door (chart-issues already reads LESSONS, skills/chart-issues:31). O3 Feed LESSONS into review input.
   Pick O2 if touched at all, otherwise O1. O3 was rejected for noise (135 untriaged lines) and the seed agrees. This fork is independent of merge throughput and should not share a chart with L1-L5.

## 5. Seeds grouped

Same cause, "red at the turn is not the leaf's defect, and the system reacts as if it were":
- 62 (DRIFT and BASE classes), 63 (one way main goes red), 64 (recovery after red main), 67 (the cascade). L1 covers 64 and 67 whole and the BASE part of 62. 63 is the framework defect behind one episode, off route.

Same cause, "the gate is met only at the serial turn and failures there do not accumulate":
- 71, 72, and the DEFECT part of 62. L2 and L4.

Same cause, "batch policy is per holder and starts unbounded": 68, and the batching paragraph of 62. L3.

Independent:
- 65 and 70 (ordering, no loop, binds only when the cap binds). L6.
- 66 (observability). L5.
- 69 (load). Unmeasured, ruled off route by test-runs until traced. Keep off route, L5 gives the data to trace it.
- 73 (lessons). Different subsystem. Q6.

Off route and why: 63 (framework test fixed forward, reopen on recurrence), 69 (no traced load failure, existing lock), 73 (not a merge loop, separate chart if the operator wants the drain automated), anything that makes the merge turn parallel or lets seats push (merge-turn lock, merge-issue:67).

## 6. Pitfalls over the work's lifetime

P1. Latch stuck on a flaky main. Removed by latching only on a completed comparable base run with a recorded shared cause (test-runs base-red rule), and by auto-clear on any main move.

P2. Holder changes under a running B. Removed by never adding a live sort key to `mergeQueue`; any priority is frozen at `merge` entry.

P3. L4 before L1 fails innocent leaves. Removed by landing order: L1 first, L4 after, both with a log check that no `merge -> failed` record cites a base-red reason.

P4. A long-running `phase` or `next` process keeps old code after a fix lands (seed 62 saw this with `solo` marks). Removed by restarting the herdr-driven processes after each akrogon deploy, operator step, named in the handoff.

P5. Permanent `solo` marks keep leaves out of every batch (`src/next.ts:1179-1181`, cleared only when the leaf leaves `merge`, `src/phase.ts:153`). With L3 a solo leaf costs a whole turn. Removed by clearing `solo` on a successful restack of that leaf, or by making the conflict mark attempt-scoped like the dirty-restore fix in `914988c`. Small, belongs with L3.

P6. L2 raises concurrent heavy runs during a bounce wave. Removed, if it ever shows up, by the heavy-run slot the test-runs chart parked, which L5's attempt records would justify with real timings.

P7. Tuning by transcript. Removed by L5 landing first or together with L3, so the batch window's effect is visible in `log.jsonl` within a day.

P8. Skill prose drift. L1 and L2 are prose rules in merge-issue and implement-issue; seats already violate the deferral rule 166 times (seed 71). Removed for L1 by having the command, not B, own the latch state and the turn skip; B only supplies the base-run evidence. L2 cannot be mechanized without declared check inputs (check-reruns off route), so it stays prose and L5 shows whether it is followed.

## Evidence tiers used

Practitioner: GitHub Docs, managing a merge queue (docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue, read 2026-10-09); Zuul gating docs (zuul-ci.org/docs/zuul/latest/gating.html, read 2026-10-09); RFC 5681 s3.1 (rfc-editor.org/rfc/rfc5681, read 2026-10-09).
Primary: file:line cites above; framework `issues/log.jsonl` counts computed in this pass (100 merge exits, 54 merged, 46 bounces, merge stay median 3.3 h, bounce-to-return median 0.34 h, 12 bounces at `fix_rounds: 0`, 141 active lesson lines).
Model knowledge only: the p^n batch yield arithmetic and the claim that batch 2-3 maximizes expected green at p around 0.6; no better source searched beyond the three above.
