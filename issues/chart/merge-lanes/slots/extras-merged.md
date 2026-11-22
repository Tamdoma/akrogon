# extras merged notes

Sources: slots/extras-A.md, -B.md, -C.md (2026-11-21).

## Q1 D1 and D2

- Agreed (A,B,C): both are removed by red-exit Taken 1; no leaf of their own; regression criteria in the red-exit leaf: a wake between a refused push and the restack starts no new attempt (A,B,C); with the red leaf's B dead or missing, the next holder starts in the same pass (A,B,C) and the red leaf's B is restarted by `dispatchSlot` (B).
- D1 mechanism: `mergeTurn` protects a batch only when `owner === 'command'` and its land unit is alive (`src/next.ts` `mergeTurn`); red-exit deletes the seat-owned batch and the `owner` branch, so the unguarded state cannot be written (B,C).
- Differs: C adds a crash-window fix in `reconcileBatch`: if `akrogon-land` dies after `batchPush` wrote `{applied: false, candidate}`, `reconcileBatch` returns early on `applied !== true` and `mergeTurn` overwrites the batch without checking whether the candidate landed; check `candidate !== undefined` instead (C). B: the same case is a correct recovery costing one suite, and the waiting-seats slice rule removes the known cause (B). Note: the open failed-merge-resume leaf edits `reconcileBatch` (C).
- D2 trace: `status-page-schema-graph` held the line 2 h 01 m (07:33Z-09:34Z) until `seat_lost` (C); after red-exit that delay lands on one leaf (B,C); 1 re-prompt in 184 `check.repair` visits (B).
- Not asked: how long may a seat stay silent in `check.repair` before re-prompt (B); why neither prompt nor busy notice fired in that case (C). Both outside this destination.

## Q2 D3 slow alarm

- Agreed (A,B,C): in scope, one small independent leaf; suite-regrowth suite-cuts Q5 handed the sensor to this chart (B,C); verify is 91% of lane time.
- Failure record: the alarm opened four times (11-08, 11-12 x3); each closed `recovered` within 41 min on one run still 1.33-1.46x the normal, and each close let the normal step up; median 9.0 -> 13.4 min after 11-12 with no alarm (B).
- Differs on the rule:
  - A: `normal = min(pinned, rolling median)`, pinned moves only at an `accepted` close.
  - B: same min rule with a carried normal, plus `recovered` only when the median of the episode's own eligible runs (at least 5) is under the threshold, plus a notice on `accepted` with old and new normal. Replay from 11-01: 10 episodes in three weeks (7 recovered, 3 accepted), the 3 accepted closes naming the three steps 4.0->6.3, 5.4->9.0, 8.9->13.8. Without the recovered change: 23 episodes, about one notice a day.
  - C: green-only eligibility (11 fast-fail red runs under 60 s since 10-28 pulled the median down and closed episodes); a drift check of the current 20-run median against the minimum 20-run median of the past 14 days (1.5x and 2 min); `recovered` only after 3 consecutive green runs at or under 1.25x. Replay: 0 false alarms before 11-12 in framework and akrogon, opens 11-12 (1.57x), stays open to 11-21 (2.92x), catches lingua-relay. C rejects the accepted-pin: `accepted` fires about every 12 h in a busy repo and marches the pin 4.3 -> 6.4 -> 9.0 -> 12.4 min, clearing the status line before the operator acts.
- Rejected (A,B,C): a longer window alone; its own chart. Rejected (A,B): an N-days drift check (B: at 7 days it went quiet once the old value caught up; at 1.25x it fired on noise).
- Pitfalls: host load under 6a can read as regrowth (B: the min rule lets it fall back); low-volume repos (C: drift check only with 20 or more eligible runs); a deliberate new check raises time on purpose (C: ages out after 14 days; A,B: `accepted` close).
- Not asked: record per-command `duration_ms` on `verify-runs.jsonl` command entries (C); `accepted` by operator act instead of 20 runs (B: no new verb).

## Q3 guards before verify

- Agreed (A,B,C): only `batchGuards` and `moveGuards` can move (only `recordTested` reads the receipt); keep the full `landGates` after verify because the suite can dirty the worktree (A,B,C).
- Frequency: 1 of 649 framework and 0 of 69 akrogon attempts since 10-24 ended red with only green runs (B); 0 of 248 this week, 3 all-time (C). The guards already ran at the move into `merge`; only a moved main can newly fail them (B,C).
- Differs: B and C fold it into the red-exit leaf (about 5 lines, a few seconds per attempt); B would drop it if the red-exit leaf must stay small (loss about 12 min of line a month); A: record and leave when rare. Red-exit Taken 9 listed it as not taken (B asks whether this reopens it).
