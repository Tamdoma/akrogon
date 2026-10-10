# Intake: merge-throughput

## Scope
Merge flow in akrogon: fewer red runs on the serial merge turn at equal quality, so more leaves land per hour. Proposed grouping: red-main hold (#62 BASE, #64, #67), gate proof before the turn (#71, #62 DEFECT), merge bounces counted (#72), batch size and solo marks (#68, #62 batching and DRIFT), merge attempt records (#66), dependents-first order (#65, #70). Proposed off route: #63, #69. Proposed separate chart: #73.

## Provenance
- GitHub: Tamdoma/akrogon#62
- GitHub: Tamdoma/akrogon#63
- GitHub: Tamdoma/akrogon#64
- GitHub: Tamdoma/akrogon#65
- GitHub: Tamdoma/akrogon#66
- GitHub: Tamdoma/akrogon#67
- GitHub: Tamdoma/akrogon#68
- GitHub: Tamdoma/akrogon#69
- GitHub: Tamdoma/akrogon#70
- GitHub: Tamdoma/akrogon#71
- GitHub: Tamdoma/akrogon#72
- GitHub: Tamdoma/akrogon#73
- Operator: chart-issues open 2026-10-09

## Source: Tamdoma/akrogon#62
# Queued merge leaves go stale while waiting and bounce back to check.fix; suspected: no rebase on main moves, base-red bounces, no merge admission limit

Source: Tamdoma/akrogon#62
URL: https://github.com/Tamdoma/akrogon/issues/62

Unverified intake.

## Observation

Consumer `Tamdoma/tamdoma-framework`, 2026-10-07 to 2026-10-08. 34 `merge -> check.fix` bounces in about 36 h. Each leaf's `review-B.md` and `implementation/report.md` were classified: DEFECT 12, DRIFT 10, BASE 9, INFRA 3. This report covers the orchestration-side classes, DRIFT and BASE. The leaf-side classes are filed as Tamdoma/tamdoma-framework#207.

- DRIFT (10 bounces): merge attempts ran 50 to 235 main commits behind the leaf's reviewed base. Some leaves waited about 5.5 h in `merge`. On 2026-10-08 at about 22:45 UTC, after the verify-speed leaves merged, all 7 queued leaves conflicted with main in `package.json`, `.claude/hooks/checksums.json` and `review-variants.mjs`. The batch builder marked each one `solo: true` through its conflict path. The operator rebased them by hand through B-seat prompts before the queue could move.
- BASE (9 bounces): the holder went back to `check.fix` when the failing suite also failed on main (red or flaky base). Examples are the `bun test --isolate` zombie stall in `hooks:selftest` and Playwright capture timeouts in `test:cf-workers-deploy`.
- Rates: 20 seats feed `merge` (`max_active: 20` in akrogon `config.yaml`). The single merge turn cleared about 0.85 leaves/h before the framework's verify-lanes split and 1.92/h after it. 7 of 16 merge results bounced after the split. The queue held 9 to 12 leaves through the night.
- Batching: in a batch, one red member fails the whole batch and halves `batch_limit`. With about 62% of leaves passing alone, a 4-member batch is green about 15% of the time.
- Solo marks: dirty restores used to persist `solo: true` (fixed in `914988c` for `next.ts` and `96bde7f` for `phase.ts`). Conflict solo is still persistent. A long-running `phase merged` process kept the old code and re-marked leaves after the fix landed.

## Location

akrogon merge turn: `src/turn.ts` `mergeQueue`, `src/next.ts` `buildStack` / `restoreDrifted` / conflict path, `src/phase.ts` `check.fix` split and restack, `skills/merge-issue/SKILL.md` Shared endings.

## Reproduction

Observed on every busy night with 20 seats. Steps: many leaves reach `merge` faster than the merge turn clears them, and main moves under them through other merges. Not reduced to a minimal case.

## Expected behavior

Not provided by the reporter beyond: a leaf that was green at review should not lose its merge attempt because main moved or main is red. Merge failures should mostly mean the leaf's own defect.

## Urgency

High. Each bounce costs a 10 to 35 min merge run plus a `check.fix` round, and the merge turn is the only serial resource. Workaround: the operator rebases queued leaves by hand and clears `solo: true` in `state.yaml`.

## Suspected cause

Agent view, supported hypothesis:
- Main condition: queued leaves are only rebased when they become the holder or join a batch. Nothing restacks a waiting leaf when main moves, so wait time turns into drift and conflicts. `mergeQueue` in `src/turn.ts` orders by `merge_stamp` only.
- Contributing: the red-check ending in `merge-issue/SKILL.md` sends the holder to `check.fix` with no base comparison. The base-run rule lives in check.fix, after the merge attempt is already lost.
- Contributing: nothing limits leaves entering `merge` to what the merge turn can clear. The inflow rate is set by `max_active`, so the queue grows, and a longer queue means more drift.
- Contributing: batching multiplies per-leaf failure, so a high late-failure rate makes batches mostly red.

Files read: `src/turn.ts`, `src/next.ts`, `src/phase.ts`, `src/config.ts`, `skills/merge-issue/SKILL.md`, consumer `issues/log.jsonl`, and leaf `review-B.md` files.

Not inspected: the exact drift distance per bounce for all 10 DRIFT cases (taken from the classification). Disproved if most DRIFT bounces happened to leaves rebased shortly before their attempt.

Related reports:
- Tamdoma/akrogon#53 (closed): whole-repo merge_checks time out under seat load and stop leaves red on base. Same BASE class, earlier case.
- Tamdoma/akrogon#50 (closed): seats can't tell new failures from base failures.
- Tamdoma/akrogon#48 (closed): check evidence not tied to a commit. Related to rebase-fragile proofs.
- Tamdoma/tamdoma-framework#207: leaf-side classes (late discovery, load flakes, rebase-fragile proofs).
- Searched Tamdoma/akrogon all states: `--author @me` created since 2026-10-06 (#58 to #61, unrelated), "merge queue rebase" (none), "base red merge" (#53, #50, #48).

## Source: Tamdoma/akrogon#63
# Merge gate passed in the leaf worktree but the pushed main failed on a clean checkout (suspected: untracked worktree state hides failures)

Source: Tamdoma/akrogon#63
URL: https://github.com/Tamdoma/akrogon/issues/63

Unverified intake.

## Observation
Consumer `Tamdoma/tamdoma-framework`, 2026-10-09 about 01:58 UTC. Leaf `agent-content-extraction` passed every `checks` and `merge_checks` command at merge and was pushed. The new main `2ccc39534` then failed 4 stage 11/12 tests in `.claude/hooks/tests/composition-spine.test.ts` with ENOENT. The stage11-site scaffold's empty `src/data/_approved/services` and `src/pages/services` folders are not tracked by git, so a clean checkout lacks them. The red main then bounced `finished-site-review` and `deliverable-obligations` at merge and check.fix (3 bounces) until a fix commit `264cc2f5b` landed on main.

## Location
akrogon merge turn: `skills/merge-issue/SKILL.md` lines 41 and 51 ("run every `checks` command then every `merge_checks` command on `HEAD` in the worktree").

## Reproduction
Seen once. Steps: a leaf worktree holds an untracked file or empty folder that a test needs. Merge checks run green in that worktree, the leaf merges, and the same test fails on a clean checkout of main.

## Expected behavior
A green merge gate means the pushed commit passes on a clean checkout.

## Urgency
High when it happens. One red main bounced 3 merge attempts overnight and stalled the queue until an operator fix. Workaround: operator fixes main by hand and moves bounced leaves back to `merge`.

## Suspected cause
Agent view, supported hypothesis: the merge seat reuses the long-lived leaf worktree, which carries untracked and ignored state from implement and check rounds. Nothing checks the gate result against only tracked content, so working-tree leftovers can hide a failure that a clean checkout shows.
Files read: `skills/merge-issue/SKILL.md`, framework `.claude/hooks/tests/composition-spine.test.ts`, commit `264cc2f5b`.
Not inspected: whether the agent-content-extraction worktree actually held those two folders at its merge run (worktree since removed). Disproved if its merge run happened in a clean checkout.
Related reports: Tamdoma/akrogon#62 (bounces from red base, the downstream effect). Searched Tamdoma/akrogon all states: `--author @me` since 2026-10-07 (#58 to #62), "merge checks worktree untracked" (none).

## Source: Tamdoma/akrogon#64
# Leaf bounced by a red main keeps failing at check.fix after main is fixed and needs a manual phase move to merge

Source: Tamdoma/akrogon#64
URL: https://github.com/Tamdoma/akrogon/issues/64

Unverified intake.

## Observation
Consumer `Tamdoma/tamdoma-framework`, 2026-10-09. Leaf `deliverable-obligations` bounced `merge -> check.fix` at 02:16 UTC because main `2ccc39534` was red. Main was fixed by `264cc2f5b`. The leaf then failed at check.fix twice (`check.fix -> failed` at 02:21 and 02:49 UTC) because check.fix kept testing on the old `AKROGON_BASE` and did not rebase onto the fixed main. It only moved after an operator ran `akrogon phase deliverable-obligations merge`, where B rebased and selftest passed. `finished-site-review` needed the same manual recovery.

## Location
akrogon: `src/phase.ts` check.fix transition, `skills/check-issue/SKILL.md` base-run rule (line 61) and re-check scope (line 63).

## Reproduction
Seen twice overnight. Steps: main goes red, a merge holder bounces to check.fix, main is fixed. The leaf in check.fix keeps its pre-fix base and fails again.

## Expected behavior
Not provided beyond: a leaf bounced only by a red base should move forward once main is green, without operator moves.

## Urgency
Medium. Each case costs one or two failed rounds plus an operator `phase` move. Workaround: `akrogon phase <slug> merge`.

## Suspected cause
Agent view, supported hypothesis: check.fix has no step that refreshes the base or rebases onto the current main. A bounce caused by the base, not the leaf, has no route back to merge other than the operator. The red-on-base stop in check-issue ends in `failed` and never rechecks when the base turns green.
Files read: `skills/check-issue/SKILL.md`, consumer `issues/log.jsonl`.
Not inspected: `src/phase.ts` check.fix restack code in this pass.
Related reports: Tamdoma/akrogon#62 (stale waiting leaves and base-red bounces at the merge step; this report is the recovery after the base is fixed), Tamdoma/akrogon#50 (closed, base vs new failures). Searched Tamdoma/akrogon all states: "check.fix rebase base" (#62, #48).

## Source: Tamdoma/akrogon#65
# Merge queue runs oldest-first, so prerequisite leaves wait behind leaves nothing depends on

Source: Tamdoma/akrogon#65
URL: https://github.com/Tamdoma/akrogon/issues/65

Unverified intake.

## Observation
Consumer `Tamdoma/tamdoma-framework`, 2026-10-08. The merge queue orders leaves only by `merge_stamp`, oldest first. Leaves that unblocked many dependents (`manifest-deterministic`, `verify-lanes`, `verify-pile-rules`, `hot-suite-concurrency`) waited behind unrelated leaves. The operator ran a script every 20 s that rewrote those leaves' `merge_stamp` to just after the holder so they merged next. On 2026-10-09 `photo-intake-optimizer` blocked 3 leaves (`image-slot-assignment`, `mockup-asset-bundle`, `video-intake-optimizer`) that could only start after it merged.

## Location
akrogon `src/turn.ts` `mergeQueue` (sort by `merge_stamp`, then slug).

## Reproduction
Every busy night: several leaves in `merge`, one of them a prerequisite for unstarted leaves.

## Expected behavior
Not provided by the reporter.

## Urgency
Medium. Dependent leaves sit idle while the merge turn processes leaves nothing waits on. Workaround: edit `merge_stamp` in `state.yaml` by hand or by script.

## Suspected cause
Agent view, supported hypothesis: `mergeQueue` has no input for how many leaves wait on a candidate through `blocked-by`, so merge order ignores what each merge unblocks.
Files read: `src/turn.ts`.
Not inspected: whether batching picks members in queue order only.
Related reports: Tamdoma/akrogon#62 (queue length and drift, not order). Searched Tamdoma/akrogon all states: "merge queue order dependents" (none).

## Source: Tamdoma/akrogon#66
# Merge speed and batching can't be measured from akrogon records; needed seat transcript scraping

Source: Tamdoma/akrogon#66
URL: https://github.com/Tamdoma/akrogon/issues/66

Unverified intake.

## Observation
Consumer `Tamdoma/tamdoma-framework`, 2026-10-09. To answer whether framework verify-lanes and merge batching sped up merging, the operator's agent had to scrape codex seat transcripts (`~/.codex/sessions/.../*.jsonl`, CommandExecution `duration`) for verify run times and guess batch membership from `merged` records less than 2 min apart. `issues/log.jsonl` merge records carry `ts`, `from`, `to`, `head`, `session` only. Result found: median full verify 35 min before verify-lanes, 12 min after. Merged per hour 0.52, then 1.69, then 1.95 with batching. About 43% of merge attempts still bounce.

## Location
akrogon `src/log.ts` record shape, `src/next.ts` / `src/phase.ts` merge and batch transitions.

## Reproduction
Any attempt to measure merge throughput from akrogon records.

## Expected behavior
Not provided by the reporter.

## Urgency
Low to medium. No live impact, but each tuning decision on batching, admission or verify needs manual transcript mining, and the numbers are approximate (transcript runs include non-merge verify runs).

## Suspected cause
Agent view: the log records phase transitions only. It has no merge attempt id, batch members, split events, check durations or bounce reason, so merge efficiency cannot be computed from akrogon data.
Files read: consumer `issues/log.jsonl`, akrogon `src/turn.ts`.
Not inspected: `src/batch.ts` attempt records.
Related reports: none found. Searched Tamdoma/akrogon all states: "merge metrics duration batch" (none).

## Source: Tamdoma/akrogon#67
# Red main keeps the merge turn running: each new holder burns a full verify run and bounces until someone fixes main

Source: Tamdoma/akrogon#67
URL: https://github.com/Tamdoma/akrogon/issues/67

Unverified intake.

## Observation
When main goes red, akrogon keeps handing the merge turn to the next queued leaf. Each holder runs the full `merge_checks` against a red base, fails, and goes back to `check.fix`. Nothing stops the queue, names a repair owner, or resumes the bounced leaves when main turns green. Consumer `Tamdoma/tamdoma-framework`: 9 of 34 classified bounces on 2026-10-07..08 were BASE (red main). On 2026-10-09 about 01:44-02:16 UTC main was red (`2ccc39534` to `264cc2f5b`) and three holders bounced in a row (hero-role-fields, finished-site-review, deliverable-obligations). Two of them then failed at `check.fix` and needed manual recovery.

## Location
akrogon merge turn: `src/next.ts` holder selection, `src/phase.ts` merge exit, `skills/merge-issue/SKILL.md:65` (red goes to check.fix with no base comparison). `src/pause.ts` exists but is operator-only.

## Reproduction
1. Push a commit that breaks `merge_checks` to main.
2. Leave 2+ leaves queued in `merge`.
3. Each holder in turn runs the full gate, fails on the base failure and moves to `check.fix`.
Seen 2026-10-08 and 2026-10-09 on framework.

## Expected behavior
While main is red, no further merge runs are spent on leaves the red base would fail. Leaves bounced only because of a red base return to the queue once main is green, without a manual phase move.

## Urgency
Medium-high under load. Each red-main hour costs one full verify run per holder (11-35 min each) plus a check.fix round per leaf, and a failed leaf needs the operator. Workaround: operator notices, runs `akrogon pause`, fixes main, then manually moves leaves.

## Suspected cause
Agent view, supported by code: main health is not a tracked state. The merge exit cannot tell "this leaf broke" from "main was already broken", so red always routes the leaf to `check.fix`, and the next holder is dispatched with no gate on main health.
Contributing: the base-run comparison exists only in check.review (`skills/check-issue/SKILL.md:61`) and ends in `failed` with no automatic re-entry.
Files read: `src/next.ts` (holder/batch selection ~970-1000), `src/phase.ts` (split ~788-797), `skills/merge-issue/SKILL.md`, `src/akrogon.ts` pause verbs.
Not inspected: whether `merge_checks` output reliably identifies a base-only failure. Would disprove: holders that bounced during red-main windows also failing on a green base.
Related reports: Tamdoma/akrogon#64 (one bounced leaf cannot re-enter after main is fixed; this report is the queue-wide stop and resume), Tamdoma/akrogon#63 (prevention of red main), Tamdoma/akrogon#62 (base-red bounce listed as a contributing case). Searched Tamdoma/akrogon all states: "red main pause" (none), own reports since 2026-10-07.

## Source: Tamdoma/akrogon#68
# Merge batch size starts at the whole queue, only ever halves, and resets for each new holder

Source: Tamdoma/akrogon#68
URL: https://github.com/Tamdoma/akrogon/issues/68

Unverified intake.

## Observation
The first batch for a holder takes every eligible queued leaf. On a red batch the follower count halves and the holder always stays in. The halved limit is cleared when the next leaf becomes holder, so every new holder with a long queue starts again at the largest batch. A green run never grows the size. Consumer `Tamdoma/tamdoma-framework` since batching started 2026-10-08 22:15 UTC: 21 leaves merged in 16 runs. Solo green rate was about 62% on 10-08 and about 86% on 10-09 (merge exits), so a 4-member batch passes about 15% (10-08) or 55% (10-09) of the time.

## Location
akrogon `src/next.ts:975-978` (`.slice(0, fresh.state.batch_limit)`, undefined on first attempt), `src/phase.ts:154` (`batch_limit` kept only while the leaf stays in merge), `src/phase.ts:788-797` (split halves followers, keeps holder).

## Reproduction
Queue 5+ leaves in `merge` with one known-red member. The first attempt batches all of them, red; the next attempt halves followers but keeps the holder. When the holder leaves merge, the next holder starts again with the full queue.

## Expected behavior
Batch size reflects the repo's recent green rate and the last outcomes across holders. A red batch identifies the failing member without discarding green members' runs, including when the holder itself is the culprit.

## Urgency
Medium when queues refill (10-08 queue was 9-12 leaves). Each red batch wastes one full gate run (11 min now, 35 min before verify-lanes) for every green member it carried. No impact while the queue holds 0-1 leaves, as on 2026-10-09 after 04:10 UTC.

## Suspected cause
Agent view: the batch limit is per-holder state rather than per-repo state, starts unbounded, and the split is a one-directional halving that never isolates the failing member.
Files read: `src/next.ts`, `src/phase.ts`, `src/state.ts:85`.
Not inspected: `src/batch.ts` member restore beyond the split path. Would disprove: logs showing red batches already followed by culprit-only ejection.
Related reports: Tamdoma/akrogon#62 (notes batching multiplies per-leaf failure; this report is the size policy and culprit isolation itself). Searched Tamdoma/akrogon all states: "batch_limit" (#62 only).

## Source: Tamdoma/akrogon#69
# Heavy check runs from all seats share one host with no concurrency limit; load flakes bounce leaves at merge

Source: Tamdoma/akrogon#69
URL: https://github.com/Tamdoma/akrogon/issues/69

Unverified intake.

## Observation
Up to `max_active: 20` seats run full test suites on one host at the same time: leaf `checks`, review reruns, and the merge turn's `merge_checks`. Nothing limits how many heavy runs overlap. Consumer `Tamdoma/tamdoma-framework` 2026-10-07..08: 7 merge bounces were load flakes in the full gate (deploy EPIPE x2, 5 s timeouts x3, a cache miss, a nested `bun test --isolate` zombie stall), plus 2 runtime-record failures, out of 34 classified bounces.

## Location
akrogon seat dispatch and check execution: `src/config.ts:25` (`max_active`), `src/next.ts:323-336` (`activeCount` counts leaves, not running checks), merge turn `merge_checks`.

## Reproduction
Run 10+ active seats that each start full suites while the merge turn runs `merge_checks`. Timeouts and EPIPE failures in the merge run increase. Frequency on framework: about 7 bounces in 36 h.

## Expected behavior
A merge run fails only because of the code under test, not because other seats saturate the host.

## Urgency
Medium. Each flake bounce costs a full gate run plus a check.fix round and a re-queue. Workaround: lower `max_active` by hand, which slows all phases.

## Suspected cause
Agent and Codex/Fable consult view: the only capacity control is the count of active leaves. Heavy check processes are not counted or queued, so peak load follows how many seats happen to test at once. The link from seat load to flake rate is inferred from timing, not measured.
Files read: `src/config.ts`, `src/next.ts` (`activeCount`).
Not inspected: host CPU/memory at the failing timestamps. Would disprove: flake bounces at times with few concurrent check processes.
Related reports: Tamdoma/tamdoma-framework#207 (lists the load flakes), Tamdoma/tamdoma-framework#208 (lane race on shared files, a separate isolation defect), Tamdoma/akrogon#53 (closed, merge_checks timeouts under seat load). Searched Tamdoma/akrogon all states: "concurrent verify load" (none).

## Source: Tamdoma/akrogon#70
# Dispatch starts leaves in discovery order, not by how many dependents each one unblocks

Source: Tamdoma/akrogon#70
URL: https://github.com/Tamdoma/akrogon/issues/70

Unverified intake.

## Observation
When `next --all` dispatches, leaves are tried in inventory order (merged first, then discovery order). A prerequisite that blocks several leaves gets no priority over a leaf nothing depends on, so when the seat cap is reached the critical path can wait. Consumer `Tamdoma/tamdoma-framework` 2026-10-09: the merge turn was idle most hours after 04:10 UTC, while 4 of 8 unfinished leaves waited in `plan.synthesis` on prerequisites (e.g. `photo-intake-optimizer` blocked 3 leaves). Leaf lead time from first record to merged was median 6.7 h, p90 19.2 h (53 leaves since 10-07).

## Location
akrogon `src/next.ts:731-737` (dispatch order sort), `src/next.ts:323-336` (`max_active` check).

## Reproduction
Register more ready leaves than `max_active` allows, where one ready leaf blocks several others. The prerequisite is dispatched only when discovery order reaches it.

## Expected behavior
When seats are limited, leaves on the longest dependency chain or blocking the most dependents start first.

## Urgency
Low now (fewer active leaves than the cap on 2026-10-09). Higher when the cap binds, as with 20 seats on 2026-10-08. No workaround besides dispatching single slugs by hand.

## Suspected cause
Agent view: the dispatch sort only orders merged leaves first. It does not use `blocked-by` edges, which are already read for gating.
Files read: `src/next.ts` (dispatch loop, `activeCount`).
Not inspected: whether `dispatchDependents` reorders later. Would disprove: cap-bound runs where prerequisites were always dispatched first.
Related reports: Tamdoma/akrogon#65 (same gap for merge queue order; this report is the earlier dispatch step). Searched Tamdoma/akrogon all states: "dispatch order max_active" (none).

## Source: Tamdoma/akrogon#71
# Skills defer merge_checks to the serial merge turn, so leaves and their merge-bounce repairs reach merge never having passed the gate

Source: Tamdoma/akrogon#71
URL: https://github.com/Tamdoma/akrogon/issues/71

Unverified intake.

## Observation
Four skill rules keep the full gate (`merge_checks`) out of every phase before merge. The first time a leaf meets the gate is at the one-at-a-time merge turn. After a merge bounce, the repair is proved only with `checks`, so it re-enters merge still unverified against the gate that just rejected it. Consumer `Tamdoma/tamdoma-framework`, 2026-10-07..09: 54 leaves merged, first-pass merge yield 52% (28 merged with no bounce; 15/5/5/1 needed 1/2/3/5). After a bounce, the next merge exit bounced again 19 of 45 times (42%), the same rate as a first attempt. 10 of 12 classified DEFECT bounces failed in suites that only `merge_checks` runs. One repair introduced a new lint error that the next merge found (hero-role-fields `review-B.md:388`). Seats sometimes run the gate early anyway: 166 of 877 review/report artifacts mention a green `framework:verify`, 24 say it was deferred "per protocol".

## Location
- `skills/plan-issue/SKILL.md:63`: a plan "adds no `merge_checks` or whole-suite" proof.
- `skills/implement-issue/SKILL.md:63`: "run `merge_checks` only at merge".
- `skills/implement-issue/SKILL.md:84`: check.fix, same rule, and red merge output is the only finding.
- `skills/check-issue/SKILL.md:85`: check.repair "does not run `merge_checks`, because merge runs them".

## Reproduction
Any leaf whose change breaks a suite that only `merge_checks` covers passes implement, review and repair, then bounces at merge. The repair commits a fix proved by `checks` and returns to merge.
Frequency on framework: about 4 in 10 merge exits.

## Expected behavior
A leaf, or a repair after a merge bounce, reaching the serial merge turn has already passed the gate on a base no older than its review, so the merge turn mostly confirms instead of discovers.

## Urgency
High. Each bounce costs a full gate run on the serial turn (11-35 min), a check.fix round, a re-review and re-queue (about 45 min of leaf time). The repeat rate keeps it from improving across attempts. Workaround: none in protocol; seats that run the gate early violate the prose.

## Suspected cause
Agent view, shared by both consults (Fable, Codex): the deferral rule was written to save whole-suite runs per seat. It moves all gate discovery onto the serial bottleneck. Shingo's terms: judgment inspection at the end of the line instead of source inspection. The repair path repeats the same rule, so a repair is never checked against the failure class it fixes. Google's presubmit guidance (SWE at Google ch. 23) warns against running everything early. So the condition is "no gate evidence before the serial turn", not "too few runs".
Whose view: agent plus Fable and Codex consults.
Files read: the four skill lines above, `skills/implement-issue/brief-template.md:37`, `src/phase.ts:466` (tested-top stamp does not itself run checks).
Not inspected: host load if every repair ran the gate. Would disprove: repeat bounces whose cause the gate could not have caught before merge (pure DRIFT/BASE).
Related reports: Tamdoma/tamdoma-framework#207 (leaf-side view of late discovery), Tamdoma/akrogon#62 (drift while queued), Tamdoma/akrogon#69 (load if more runs happen), Tamdoma/akrogon#48 (closed, check evidence as records). Searched Tamdoma/akrogon all states: "merge_checks only at merge" (#69, #67, #63, #62).

## Source: Tamdoma/akrogon#72
# Merge bounces don't count toward the fix_rounds cap, so one leaf can bounce from merge without limit

Source: Tamdoma/akrogon#72
URL: https://github.com/Tamdoma/akrogon/issues/72

Unverified intake.

## Observation
`fix_rounds` increments only on `check.repair -> check.fix`. A `merge -> check.fix` bounce never increments it, so the configured cap (`fix_rounds: 3`) never stops a leaf that keeps failing at merge. Consumer `Tamdoma/tamdoma-framework` since 2026-10-07: finished-site-review bounced from merge 5 times. Six more leaves bounced 3 times. Each bounce takes a serial merge run. Batch-split failures also leave the holder in merge with no transition, so failed gate runs are undercounted too (Codex found at least 10 split records among merged leaves).
Separately, after a bounce on a leaf with `fix_rounds: 0`, the re-review requires both slots blind (`requiredSlots` returns B-only only when rounds > 0). 7 bounced leaves had `fix_rounds: 0`.

## Location
akrogon `src/phase.ts:151` (`fix_rounds` increment rule), `src/phase.ts:302` (cap check), `src/routing.ts:54-55` (`requiredSlots`).

## Reproduction
Put a leaf in merge whose gate keeps failing after each check.fix. It cycles merge -> check.fix -> check.review -> merge with `fix_rounds` unchanged and is never routed to `failed` by the cap.

## Expected behavior
Repeated merge failures on one leaf reach a stop point where the operator or a fix leaf is asked for, as the review repair cap already does. A bounce caused by a small gate failure does not require a full two-seat blind review.

## Urgency
Medium. A 3-5 bounce leaf burns 1-2 h of the serial merge turn and blocks dependents. Workaround: operator watches bounce counts and fails the leaf by hand.

## Suspected cause
Agent view, confirmed by both consults: the counter and routing were designed for the review-repair loop. Merge-originated repair was added later without being counted. Meadows: the operating rule, not the seat, sets this behavior.
Files read: `src/phase.ts`, `src/routing.ts`.
Not inspected: whether a separate merge-attempt counter exists in batch state. Would disprove: a cap that triggers on merge bounces elsewhere.
Related reports: Tamdoma/akrogon#66 (split attempts and bounce reasons not logged), Tamdoma/akrogon#64 (base-red re-entry). Searched Tamdoma/akrogon all states: "fix_rounds merge" (none specific).

## Source: Tamdoma/akrogon#73
# Lessons never feed back into skills or checks: LESSONS.md is excluded from pass input and learn-issues only prints seed lines

Source: Tamdoma/akrogon#73
URL: https://github.com/Tamdoma/akrogon/issues/73

Unverified intake.

## Observation
The lesson-to-guard loop is open. Seats are told not to read `learnings/LESSONS.md`. `learn-issues` runs only when the operator invokes it, and for a checkable lesson it prints a seed line without acting. Consumer `Tamdoma/tamdoma-framework`, 2026-10-09: 135 active lessons, 0 marked Applied. The stock grew from 129 to 135 over the last day and nothing drains it. The same failure classes recur in merge bounces after being written up: biome lint, schema-version bumps, generated-artifact rewrite conflicts, and rebased receipt ancestry. One example is a top 2026-10-08 lesson on generated-artifact rewrite conflicts.

## Location
- `skills/implement-issue/SKILL.md:31`: "`learnings/LESSONS.md` is not pass input".
- `skills/check-issue/SKILL.md:45`: LESSONS is "not review input".
- `skills/learn-issues/SKILL.md`: operator-invoked, deletes guarded lessons, prints seed lines for checkable ones.

## Reproduction
Record a lesson for a failure class that a cheap check could catch. Later leaves hit the same class at merge, because no seat reads the lesson and no check is added unless the operator runs learn-issues and files the printed seed by hand.

## Expected behavior
A recurring failure class that has been written up becomes a guard (a check, a brief rule or a skill line) without depending on a manual operator pass, and the active lesson stock shrinks as lessons become guards.

## Urgency
Medium. Each recurring class costs bounces repeatedly (DEFECT bounces on framework were 12 of 34 over 10-07..08, several in classes already in LESSONS). Workaround: the operator runs learn-issues and files the seeds manually.

## Suspected cause
Agent view, shared by both consults. Excluding LESSONS from seat input is reasonable, because 135 untriaged prose lessons would be noise. But the only outlet that turns a lesson into a guard is a manual step, so the loop is single-loop: repairs fix instances and the rule that let the class through never changes (Argyris double-loop learning, Senge "fixes that fail").
Files read: the skill lines above, framework `learnings/LESSONS.md`.
Not inspected: how often learn-issues has been run on framework. Would disprove: Applied entries or guards traceable to lessons elsewhere in history.
Related reports: Tamdoma/akrogon#48 (closed, check evidence is prose, not records). Searched Tamdoma/akrogon all states: "LESSONS learn-issues" (only #48).

## Source: operator 2026-10-09 chart open
Okay, we just pulled another set of issues. This has mainly to do with how the merging process and the whole optimization of the merging process goes, but eerything else is also inside. We need to make sure that this process is faster while keeping the same quality so we can merge more things at the same time. Look at all of the issues and think about them from the system's thinking perspective. Look at the stock and flow of the entire Akrogon system. Look at what the reinforcing loops and balancing loops are and how to trigger the least amount of change possible so nothing else gets messed up. So the least amount of changes that are the most elegant that will move the needle the most. Consult with slot B and slot c. Both of them are active in your tab.

## Agent findings
See slots/map-A.md, map-B.md, map-C.md, map-merged.md and rebuttal-B.md, rebuttal-C.md. Framework log (C, 2026-10-09): 100 merge exits since 10-07, 54 merged, 46 bounced, median stay in merge 3.3 h, bounce-to-return 0.34 h. No identity #62-#73 appears in any leaf sources or chart intake.
