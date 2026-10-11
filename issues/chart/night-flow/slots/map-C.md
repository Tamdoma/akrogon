# Night map, slot C (2026-10-11, window 2026-10-10T16:00Z to 2026-10-11T05:40Z)

Read-only. Times UTC from `issues/log.jsonl` (`ts`), `issues/merge-attempts.jsonl`, `akrogon status` at 05:39Z. Low-confidence claims marked LC.

## 1. Ledger by cause class

Framework merged nothing after `fail-fast` at 18:35Z (merge-attempts: last merged attempt 612d5e56 end 18:34Z; last `held` 45faa16c end 22:21:44Z; no attempt after). Akrogon merged 7 leaves between 21:49Z and 23:02Z, then nothing.

C1 Repo hold deadlock (framework). `held.yaml` entry framework sha `caa617ec`, holder `recording-consumers`, at 22:21:44Z, no `fix` field (`/home/ivan/Work/infra/akrogon/held.yaml`). Cause of the hold: merge verify red on top (`playback-probe.test.ts`, 1 fail of 3527, `recording-consumers/review-B.md:175`) and red on base for a different reason, `[root-state-guard] Root activation sentinel preservation violation ... was absent and was materialized` in the detached base checkout (`review-B.md:192-203`). B applied the base-red rule (`merge-issue/SKILL.md:73`) and wrote the hold. The hold clears only when main moves outside record folders (`src/next.ts:1101`, `dropHeld`) or by `akrogon unhold` (`src/hold.ts:104-111`). Main cannot move while the hold stops every merge, so it never clears. Waiting at `merge`: recording-consumers 22:07Z to now (7h33m), root-influence 22:20Z (7h20m), check-scratch 01:46Z (3h54m), formspark-build-wiring 05:24Z. About 19 leaf-hours, and B wrote "did not run the merge command" at each of eight phase moves of check-scratch (`check-scratch/review-B.md:206,246,310,350,403,466,516,556`).

C2 Fix-round cap ends a converging leaf in `failed`. `src/phase.ts:308-313` routes `check.repair`→`check.fix` to `failed` when `fix_rounds >= 3`, reason "fix rounds exhausted"; recovery keeps the count, so `failed`→`check.repair` fails again at the next handoff (`log.jsonl` 05:19:36Z then 05:20:04Z, seed 85), while `docs/guide/phases.md:76` promises one more repair. Leaves: formspark-build-wiring 22:51:24Z to 05:24:27Z (6h33m, operator accepted F3 unproven); leaf-env-file (akrogon) 22:56:46Z to 05:19:36Z (6h23m), re-failed 05:20:04Z, moving again at 05:29Z only after `fix_rounds` was raised to 4 by hand (uncommitted `issues/config.yaml:5`); blocked behind it: base-run, worktree-reconciler, then known-red-leaf and known-red-merge. Rounds were spent on defects the repair itself introduced (check-scratch F6, F7, F8 at `review-B.md:276,379,493`) or on a false plan rule patched three times (leaf-env-file D3, `review-B.md:22,222`, seed 83). frozen-test-guard used all three rounds in 29 minutes (21:59Z to 22:28Z) and merged: the cap counts handoffs, not progress.

C3 Locked decision that the tool ignores. copyfile-install `check.fix`→`failed` blocked 22:12:14Z to 05:30:28Z (7h18m): bunfig `[install] backend` key unsupported by bun 1.4.2, proofs P5/P7 had only exercised the CLI flag (seed 81). Operator reconciled design, brief and `setup` by hand.

C4 Deployed guard refuses every framework worktree. akrogon 1191e8c (merged 22:59Z) makes `withSetup` prefix every check with `akrogon guard ancestors` (`src/config.ts:276-292`), which exits 1 when any ancestor of the git toplevel holds `node_modules` or `package.json` (`src/guard.ts:5-16,27-32`). Framework keeps `worktree_root: issues/worktrees` (`framework/issues/config.yaml:3`), so every leaf worktree and the batch worktree (`src/batch.ts:96`) sit under a root with `package.json`. Live since the operator's pull at 05:28:08Z (akrogon reflog `main@{2026-10-11 07:28:08 +0200}`). First casualty 05:35:19Z: copyfile-install `check.review`→`failed` "akrogon guard ancestors red on base 35bd4ce" (`copyfile-install/review-B.md:102-114`, B's base checkout was also under `issues/worktrees`). Every framework check from now on fails before it runs, in every leaf and at every merge turn. This is the item that keeps this morning stopped.

C5 Self-update skip. Local commit c2fb9a9 at 21:12Z (reflog) made the akrogon checkout `1 ahead, 26 behind`; `src/self-update.ts:46-47` skips any `ahead > 0`, so 26 commits (test-proof-rules, frozen-test-guard, check-env, worktree-store) were not deployed until 05:28Z (8h16m, seed 80). Night effect: framework seats ran old skills. Side effect: the guard in C4 was not live overnight, which is why checks passed until 05:28Z.

C6 Failed leaf unnoticed. One `herdr notification show` at failure (`src/phase.ts:87-119`), `next` returns `waiting` for a failed leaf (`src/next.ts:704-707`), no re-notice; the watch cron was deleted by its stop rule on an empty tree (`skills/watch-issues/SKILL.md:45`) before the handoffs. Three leaves sat 6.4h to 7.3h (C2, C3).

C7 Live rig rounds. formspark-build-wiring check.fix round 3 19:02:20Z to 22:44:30Z (3h42m seat A) on rig defects, then C2 (seed 79). Owned by pre-written-tests, already handed off.

C8 Merge bounces. root-influence `merge`→`check.fix` ejected 22:04:48Z, back at `merge` 22:20:36Z (16m, one fix round consumed by `src/phase.ts:154-157`); fail-fast red attempt 17:36Z to 17:59Z then merged 18:35Z (59m). Small this night.

Context (already charted): #76/#77 base-red stops, red-base-wait. Not in the window: audit-errors hold 13:37Z to 14:02Z on 5cb74c3 cleared when page-measure-full-id merged at 16:50Z, the one case where the hold cleared itself, because a leaf already in the queue happened to be green and ahead.

## 2. System structure

Stocks: leaves at `merge` behind the holder (4, framework); leaves in `failed` waiting for the operator (3 overnight); leaves blocked behind a failed leaf (4 akrogon); undeployed akrogon commits (26); fix rounds consumed per leaf (counter only goes up); seat-hours in live rig rounds.

Flows in: chart handoffs (framework 4 leaves at 21:18Z to 21:27Z, akrogon 5 at 21:18Z to 22:11Z). Flows out: merge push (framework 0 since 18:35Z), operator recovery (05:19Z to 05:35Z, all by hand).

Loops.
- R1 hold deadlock (dominant last night, about 19 leaf-hours): hold stops merges → main does not move → `dropHeld` never fires → hold stands. Archetype: fixes that fail. The hold was built on 2026-10-10 to stop innocent leaves burning base-red runs (merge-throughput chart CHART.md:6-12), and it stopped all leaves instead. Chromium's tree closure works only because a sheriff reverts or reopens; akrogon has no sheriff, so a closed tree is a deadlock.
- R2 repair introduces the next finding: each check.fix adds code without a frozen test, B finds the new defect, the round counter rises, the cap fires. Sensor is a count; nothing measures whether the open Fix set shrinks (check-scratch 5→4→1→0 open while the counter read 1,2,3).
- R3 plan rule defended by code: a false plan rule (D3) produces findings that look like code defects; repair follows the plan; the rule is only questioned when B probes the emitter in round 3 (`leaf-env-file/review-B.md:212-222`).
- R4 undeployed tool: every chart handoff commits locally → checkout ahead → self-update skips → seats run old skills → the next handoff still commits locally.
- B1 review→repair (intended, works when findings are in the product; 7 akrogon leaves merged in 73 minutes).
- B2 the cap (intended to stop endless loops) converts a converging leaf into a stop that needs the operator; its counter-loop (recovery grants one more repair) is documented but not implemented (C2).
- B3 failure notice (intended to summon the operator) fires once, then `delivery: shown` counts as handled.

Delays: operator reaction overnight 6.4h to 7.3h; base verify 5 to 25 minutes per run (merge-attempts durations); live proof case 15 to 30 minutes (seed 79).

Sensors and targets: measured are fix_rounds, busy minutes per seat (one notice at 60m), hold sha equality, PSI per attempt. Not measured: age of the merge queue, time since main last moved, time a failed leaf has waited, leaves blocked behind a failed one, undeployed commit count, whether a base red is environment (sentinel violation, guard) or product. No target exists for merge latency or queue age. The system aims at "no bad merge" and nothing aims at "work keeps moving", so every ambiguity resolves toward stop.

## 3. The 48-hour question

Made it worse:
- 0d0e001 (10-10 07:26Z) hold module and `--red-on-base`, 800dda6 (07:32Z) hold gate in mergeTurn, 210efa5 (08:13Z) hold-fix. Mechanism: `src/next.ts:1074-1103` refuses every merge batch while `held.sha` equals the base; clear path is only base movement or `unhold`. Observed: C1, framework merges 0 for 11 hours, 4 leaves waiting. red-base-wait already locked their retirement (forks/merge-gate.md Taken Q2 2a) but the leaf that does it (`known-red-merge`) is behind known-red-leaf, base-run, worktree-reconciler, leaf-env-file. Until it lands the deadlock recurs every time a base run is red.
- 2595d71 (07:47Z) merge bounces count toward `fix_rounds`. Observed: root-influence lost a round to an eject (C8); with the hold it would have been the night's second cap failure in one more bounce. Minor.
- 1191e8c (22:59Z) guard composition. Observed: C4, from 05:28Z every framework check is refused. The repo-level `worktree_root` override was kept optional in the same commit, so the guard and the registered layout contradict each other for both registered repos (akrogon's own committed `worktree_root` is also `issues/worktrees`; its worktrees survive only because `ensureWorktree` reuses an existing path, `src/next.ts:285`, LC).
- 3f27689 (12:26Z) self-update. In design it helps; its `ahead > 0` skip (C5) made the deploy stop for 8 hours after the first handoff. Neutral for the night, since the stale tool kept the guard off, and it fed R4.

Helped: 26e0ddb dependents-first merge order; 7d1012b empty-folder removal before merge prompts; test-proof-rules and frozen-test-guard (21:40Z to 22:32Z) target R2 but were not deployed until 05:28Z, so no effect yet. The framework product commits in the window (322) touched no akrogon rule; 77ad6b990 `merge_covers` cut merge work to one `framework:verify` run.

Not a cause: red-base-wait (not landed), pre-written-tests leaves (not deployed), repo-pause.

## 4. Leverage

L1 Delete the hold now, ahead of `known-red-merge`. Removes R1 whole. Deletes: hold gate `src/next.ts:1074-1103`, `--red-on-base` ending `src/phase.ts:904-998`, `src/hold.ts`, `hold-fix`, `unhold`, status/unpause lines, `held.yaml`. Interim merge rule until known-red-merge: a merge red with no cause in the stack and red on base is recorded in review-B and the leaf stays at `merge`, retried on the next turn (the existing `reuse`/`rerun` path). Could invite: repeated 25-minute verify runs on a red main (bounded by the merge turn cadence, one at a time, cheaper than 19 leaf-hours). Relation to locks: this is merge-gate Taken Q2 2a executed early, as a 1-day leaf with no dependency on base-run or the comparison record, so `known-red-merge` shrinks to the comparison binding. Reorder `known-red-merge` out from behind `base-run`.

L2 Replace the count cap with a progress rule in the skills and delete the cap from code. Removes C2, seeds 82 and 85, and the recovery contradiction at `docs/guide/phases.md:76`. Deletes `fix_rounds` from config, `src/phase.ts:154-157,308-313`, the `attempts` failure cause. Rule for B at check.repair (text, no code): a round that reports only defects introduced by the previous repair, or a finding that contradicts a plan rule or a locked decision, hands the plan rule to A by name (seed 83); a round whose open Fix set did not shrink ends the pass with `failed --reason` naming the repeated finding. Could invite: a leaf that loops forever on alternating findings; bounded by the busy notice and `akrogon status` fix-round display (keep the counter as information, drop the stop). Operator preference satisfied: no failed leaf in the morning for a converging leaf.

L3 One worktree layout. Remove `worktree_root` from both repos' `issues/config.yaml` and move the live worktrees into `~/.akrogon/worktrees/<repo>/<slug>` (`git worktree move`, update `state.worktree`), which is what `worktree-reconciler` plans. Removes C4 for good and the "ancestor holds node_modules" class the guard exists for. Deletes nothing in code, deletes two config lines. Alternative with fewer parts: delete the guard prefix from `withSetup` and keep only `checkLocation` at creation (`src/next.ts:284`), since a worktree created in a clean location stays clean; the per-check guard then has nothing to catch. Could invite: an operator who sets `worktree_root` again; refuse the key at config parse. Relation to locks: worktree-location Taken delegates the store and migration to worktree-isolation; this is the migration pulled forward.

L4 Self-update does what `sync` does. Removes C5 and R4. Change `src/self-update.ts:46-47`: when the ahead commits touch only `issues/`, run the sync sequence (`src/sync.ts:109-136`: commit, rebase, push) instead of skipping; refuse only when ahead commits touch code. Deletes the documented manual step at `docs/guide/install.md:40`. Could invite: an auto-push of issue records at trigger time, which `sync` already does on demand.

L5 Fewer failures instead of louder notices. With L1 to L3 the overnight `failed` class is only human prerequisites (credentials, locked-decision errors like C3), which do need the operator. For those: the watch cron stops only by operator command (delete the stop rule at `watch-issues/SKILL.md:45`, one fewer rule). Do not add a repeating notifier.

C3 (unproven locked decision) is a charting rule: a Taken decision that names a third-party setting is proven in that exact form once (one proof row) before it locks. One line in chart-issues; no code.

## 5. Right now (operator actions, in order)

A1 Framework guard: move the four live framework worktrees (`recording-consumers`, `root-influence`, `check-scratch`, `formspark-build-wiring`, plus `copyfile-install`) to `~/.akrogon/worktrees/framework/<slug>` with `git worktree move`, set `worktree:` in each `state.yaml`, delete `worktree_root` from `framework/issues/config.yaml:3`. Without this every check fails at the guard and every merge turn ends held again. Faster alternative: temporarily revert 1191e8c's `withSetup` prefix in the deployed checkout (hand edit of the tool, not recommended).
A2 Framework hold: `akrogon unhold` in the framework repo, then `akrogon next`. recording-consumers reruns `framework:verify` (about 25 minutes); if the playback-probe test is red on top again it is a real finding for that leaf (it passed on base, `review-B.md:192-203`); the sentinel violation on base is an environment defect of detached checkouts in the framework repo (LC, no commit found), file it as a framework seed so the next base run does not hold again.
A3 Framework copyfile-install: after A1, `akrogon phase copyfile-install check.review` (F3 still open, fix round 1).
A4 Akrogon: leaf-env-file is moving (check.fix round 4, A busy 9m). Nothing to do. If it caps again, raise `fix_rounds` once more rather than recover to `check.repair` (C2 mechanism).
A5 Akrogon: commit or discard the uncommitted `fix_rounds: 4` and the tracked `held.yaml` (it is in git at the akrogon root, 525161d committed the framework hold into history).

## 6. Forks

Q1 Hold: O1 delete now as its own 1-day leaf (L1, recommended); O2 wait for known-red-merge behind base-run (days, deadlock recurs on every red base run); O3 `hold-fix` by hand each time (manual, rejected by preference).
Q2 Cap: O1 delete the cap, progress rule in skills (L2, recommended); O2 cap → operator question with the open Fix list, leaf stays in check.repair; O3 keep and fix the recovery allowance (seed 85).
Q3 Worktree layout: O1 migrate now by hand (A1, 15 minutes); O2 drop the per-check guard, keep creation-time `checkLocation` (code change in akrogon, one leaf); O3 wait for worktree-reconciler (framework stays stopped).
Q4 Self-update: O1 issue-only ahead commits are synced automatically (L4, recommended); O2 keep the skip and document `akrogon sync` as a handoff step (manual).
Q5 Watch: O1 cron never self-deletes (L5); O2 in-akrogon re-notice on every `next` for a failed leaf (adds a notifier).

## 7. Sources

Practitioner tier.
- Chromium tree sheriffs (https://chromium.googlesource.com/playground/chromium-org-site/+/refs/heads/main/developers/tree-sheriffs/index.md, read 2026-10-11): a closed tree is paired with a sheriff whose bias is to revert first and reopen. Changes: a closure without a reopener is a deadlock, which is R1. The red-base-wait choice to judge per test instead of closing is the right replacement here.
- Chromium CQ (https://chromium.googlesource.com/infra/infra/+/refs/heads/main/doc/users/services/commit_queue/index.md, read 2026-10-11): CQ keeps landing while the tree is open; tree status is a human signal, not a derived one. Confirms L1.
- matklad, "Catch Flakes On Main" (https://matklad.github.io/2026/05/14/catch-flakes-on-main.html, 2026-05-14, read 2026-10-11): with a merge queue, every failure on main is by definition a flake or environment; keep merging and keep one list of main failures to prioritize. Changes: supports the red record (red-base-wait Q1) and against the hold.
- Aviator, "Impact of flaky tests in merge queue" (https://www.aviator.co/blog/impact-of-flaky-test-in-merge-queue/, 2025-01-15, read 2026-10-11): one false red drops the PR and cascades to every PR behind it; remedies are quarantine and optimistic validation, not stopping the queue. Matches C1's cascade.
- Mozilla sheriffing (https://wiki.mozilla.org/Sheriffing/How_To/Merges, read 2026-10-11): close autoland only with a human sheriff on duty. Same lesson.
Systems tier (no URL, standard texts): Meadows, "Leverage Points" (1999): rules and goals outrank parameters, so delete the hold and the cap (rules) rather than tune `fix_rounds` or `STALL_MS`. Goldratt, Theory of Constraints: the merge turn is the constraint; nothing upstream should be allowed to stop it (the hold subordinates the constraint to the weakest base run). Reinertsen, "Principles of Product Development Flow" (2009): limit WIP, not iterations; queue age is the metric, and nothing here measures it.
Searched and found nothing stronger: merge-queue practice for agent orchestrators with no human sheriff (GitHub discussions #15254 and vendor posts repeat the quarantine advice).

## 8. Pitfalls over the lifetime

P1 known-red-merge lands while the hold still exists: both rules in one skill. Removed by L1 landing first.
P2 The comparison record treats the sentinel violation (non-test error on base) as unverified and blocks, so the framework base red of last night would still block under red-base-wait (comparison Taken Q2). Removed by fixing the framework detached-checkout sentinel defect (A2 seed) and by `base-run` creating base checkouts in the store, where the guard and the sentinel both hold.
P3 Guard and any future `worktree_root` under a repo. Removed by refusing the key or deleting the per-check guard (L3).
P4 Deleting the cap lets a looping leaf burn seat time overnight. Removed by the progress rule plus the existing 60-minute busy notice; keep the counter visible in status.
P5 Self-update auto-sync pushes a handoff commit that touches code by mistake. Removed by the issue-only path filter (L4) and refusing otherwise.
P6 Operator recovery by hand edits (`fix_rounds: 4`, `setup` flag, `held.yaml` in git) drift from committed state. Removed by committing them in the morning (A5) and by L1/L2 removing the reasons for the edits.
P7 Every stop in this system defaults to `failed` plus one notification. Each leverage item above removes a stop; none adds a notifier.
