# Extras: slot B blind notes

2026-11-21. Code at akrogon `4f5e3fd2`. Evidence is tier `better-than-training` (inspected code, measured ledgers, my own replay of the ledger) unless marked otherwise. Framework ledgers `issues/verify-runs.jsonl`, `merge-attempts.jsonl`, `timings.jsonl`, `log.jsonl`, read 2026-11-21.

## Q1. D1 and D2

- Pick: yes for both. No work of their own, one criterion each in the red-exit leaf.
  - D1 reason: `mergeTurn` protects a batch only when `owner === 'command'` and its land unit is alive (`src/next.ts:946`, `:985`). A seat's `merged` call after a refused push saves `applied: false` and releases the lock (`src/phase.ts` `batchPush`, `:783-795`). A wake then passes the `applied === true` tests (`:950`, `:982`) and builds a new attempt over it. Red-exit Taken 1 removes the seat-owned batch, and the command's push and restack both run inside the live land unit (`landPush`), so the existing guard covers the whole window.
  - D1 criterion: a wake that arrives between a refused push and the restack starts no new attempt. The `owner` field and the seat branch at `src/next.ts:951-952` are deleted, so the unguarded state cannot be written.
  - D2 reason: after Taken 1 a red leaf goes to `check.repair` by the command and the next leaf starts in the same pass. A lost B seat then delays its own leaf, not the line.
  - D2 criterion: a red exit whose B seat is missing or finished is given a seat in the same pass. `dispatchSlot` already restarts such a seat (`src/next.ts:474-553`).
  - Cost: two test cases in the red-exit leaf.
  - Consumers that change: none beyond the red-exit leaf's own (`src/next.ts` `mergeTurn`, `src/phase.ts` `phaseCommand`, `batchPush`).
- Rejected: a separate fix for D1 now (a lock held across push and restack). It guards a state the red-exit leaf deletes.
- Rejected: a separate fix for D2. The line stall has no other cause than a seat-owned hand-off.
- Evidence: D2's leaf, `status-page-schema-graph`, 2026-11-21: one attempt from 07:17Z to 09:50Z. Seat faults are rare: 4 `seat_lost` rows in the week (3 in `plan.synthesis`, 1 in `merge`), and 1 re-prompt in 184 `check.repair` visits.
- Pitfalls:
  - If the land unit dies between a refused push and the restack, the record is `applied: false` with no live unit and the next wake builds a new attempt. That is a correct recovery and costs one suite. The slice rule carried from waiting-seats item 5 removes the known cause.
  - D2's fault moves, it does not vanish. The same leaf sat 172 min in `check.repair` that morning (B prompted 03:42Z, prompted again 06:35Z, `attempts.B` 0 to 1). After red-exit that delay lands on one leaf's journey. At 1 in 184 visits it is about one leaf every two weeks. Not removed here.
- Not asked: how long may a seat stay silent in `check.repair` before it is prompted again? The one case took 172 min.

## Q2. D3, the slow alarm baseline

- Pick: in scope, as one small leaf of its own with no dependency on the other leaves. The normal rises only through an `accepted` close and falls freely. Three changes in `decideSlow`:
  1. With no open episode, the normal is the lower of the carried normal and the rolling 20-run median. Today it is re-derived from the last 20 runs after every close.
  2. An episode closes `recovered` only when the median of its own eligible runs (at least 5) is back under the threshold. Today one run under the threshold closes it.
  3. An `accepted` close sends a notice with the old and new normal. Today it prints one stdout line in a seatless land run.
  - Reason for scope: suite-regrowth `forks/suite-cuts.md` Q5 took "no new ceilings in framework" and handed the cross-run sensor to this chart. Nothing else guards the suite, which is 91% of lane time, and the 4b fix (13 to about 5 min) can regrow the same way.
  - Reason for the rule: the record shows what failed. The alarm opened four times (11-08 15:49Z at 7.0 against 4.6 min, then 11-12 at 9.9 against 5.8, 10.7 against 7.1, 13.7 against 9.0). Each closed `recovered` within 41 min on a single run that was still 1.33 to 1.46 times the normal. Each close let the normal step up. After 11-12 the median went from 9.0 to 13.4 min with no alarm.
  - Cost: more notices. My replay of the ledger from 11-01 gives 10 episodes in three weeks against 4: 7 recovered and 3 accepted. The three accepted closes name the three steps: 4.0 to 6.3 min (11-08), 5.4 to 9.0 (11-12), 8.9 to 13.8 (11-20).
  - Consumers that change: `src/verify.ts` `decideSlow` and its caller in `runOnce` (`:601`, the notice send); `src/status.ts` slow line (an episode stays open longer); the `slow` field in `verify-runs.jsonl` (same shape, `normal_ms` is now carried).
- Rejected: change 1 without change 2. Replay: 23 episodes, 21 of them `recovered`, so about one notice a day.
- Rejected: a longer window. Run against a rolling 200: 99 of 631 runs flagged, and the window still absorbs the step, only later.
- Rejected: a drift check against the median N days earlier. At 7 days and 1.5x it first fired on 11-12 and went quiet once the old value caught up. At 1.25x it fired on 11-05 on noise. It adds a second threshold and a day count.
- Rejected: its own chart. The options are measured here and the change is one function.
- Evidence: stored `slow` records and daily medians (4.4 min on 11-01, 6.1 on 11-08, 9.0 on 11-12, 13.4 on 11-20). merge-slow-alarm `forks/slowdown-alarm.md` Taken (2026-10-28, A's autopilot pick, not operator words) set today's close rule, and its Destination says merge results never change. This pick keeps that.
- Pitfalls:
  - Host load reads as regrowth, and waiting-seats lets 12 leaves work at once. A load spike can be accepted as a new normal. Removed by the fall rule: when load passes, the rolling median drops and the normal follows it down.
  - One lucky fast window sets a low normal and more alarms follow. Bounded by the unchanged threshold (1.5x and 2 min). The replay shows 7 recovered episodes in three weeks.
  - The alarm names the slow run, not the slow script. Per-script seconds are not in the ledger, and merge-slow-alarm put per-command timing off route. Not removed.
- Not asked: should `accepted` need an operator act instead of 20 runs? I would add no new verb now. The notice in change 3 makes each step visible.

## Q3. Guards before verify

- Pick: yes, as one criterion inside the red-exit leaf, not a leaf of its own. `land` calls `batchGuards` and `moveGuards` once before `verify`, and `landGates` runs unchanged after it.
  - Reason: neither guard reads the receipt. Only `recordTested` does (`src/phase.ts` `landGates`, `:725-728`; `requireGreenReceipt` at `:699`). The red-exit leaf already rewrites what `land` does on a refusal, so the order costs two calls.
  - Why both runs: the suite runs in the leaf worktree and can dirty it, and `moveGuards` checks `requireClean`. The check after the suite must stay.
  - Cost: a few seconds per attempt. The whole gap from last verify end to attempt end is 6 s median today.
  - Consumers that change: `src/land.ts` `land`; `src/phase.ts` `batchGuards` and `moveGuards` (called from `land` as well).
- Rejected: its own leaf. The saving is one suite a month (see evidence).
- Rejected: only before verify. A suite that writes tracked files would then land a dirty tree unseen.
- Evidence: since 2026-10-24, 1 of 649 framework attempts and 0 of 69 akrogon attempts ended `red` with only green runs, which is the trace a gate or push refusal leaves. These guards already ran on the leaf head at the move into `merge` (`transition`), so only a moved main can newly fail them.
- Pitfalls:
  - A guard that fails before `setup` and passes after it would refuse early for nothing. I found none: the guards read commits, the worktree state and capture files. Removed by the plan checking `requireClean` against a fresh top.
  - The value is small. If the red-exit leaf must stay minimal, drop this. The loss is about 12 min of line a month.
- Not asked: red-exit Taken 9 lists "gates before verify" as not taken. Does this fork reopen it, or only record the size?
