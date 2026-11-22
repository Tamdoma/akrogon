# Extras: slot B rebuttal

2026-11-21. Disagreements only. Code at akrogon `4f5e3fd2`. Replays are mine, over framework and akrogon `issues/verify-runs.jsonl`, read 2026-11-21. They approximate each rule and are not akrogon code.

## Q1 crash-window fix

- E1. C's reason is wrong: the candidate in that state cannot have landed. `{applied: false, candidate}` is written in one place, after git reported the push rejected (`src/phase.ts` `batchPush`, the `non-fast-forward` or `[rejected]` branch). The window where a candidate can land with a dead unit is the save before the push (`candidate: head`, `applied` still true), and `reconcileBatch` already covers it.
- E2. What is lost in C's case is the attempt row. `mergeTurn` overwrites the old record with a new batch and calls no `appendAttempt` (`src/next.ts` `mergeTurn`, the `saveState(fresh.path, { ...fresh.state, batch: next })` step). A full verify then leaves no line in `merge-attempts.jsonl`, and lock 1a counts failed rounds from that file. C's one-line change does write that row (`red`, then a new attempt).
- Hold: no fix as a crash guard. If C's line is taken, its criterion is "the refused attempt leaves a `red` row", not "the candidate is checked". The window is one fetch and one rebase long, so I would not hold the red-exit leaf for it.

## Q2 alarm rule

- E3. C's point against my rule is right. In my replay the three `accepted` closes came 6 h 51 m, 6 h 53 m and 8 h 55 m after the episode opened, so the status line is gone within a working day. Three in 21 days, not one every 12 h, but the line still clears before anyone acts.
- E4. C's rule absorbs the regrowth too, 14 days later and under the word `recovered`. Its reference is the lowest 20-run median of the past 14 days. I confirm C's figures (opens 11-12T19:21Z at 6.9 against 4.4 min, 2.92x now). With the suite unchanged, that reference is 9.0 min from 11-27 and 10.4 min from 11-29. C's close bar is then 13.0 min, and 44 triples of consecutive green runs since 11-19 are at or under it. The episode closes `recovered` near 11-29 at 13.5 min, with no notice.
- E5. C's rule has a slow-growth gap. Growth under 1.5x per 14 days never opens it. The 11-08 step (4.4 to 6.1 min, 1.39x) did not open it. A carried normal has no such gap, because it only rises at an `accepted` close.
- E6. Green-only eligibility is not needed and reverses merge-slow-alarm Q1 1a (red runs count, "partial runs spend real time"). Fast-fail red runs under 60 s: 11 of 772 eligible runs since 10-28, at most 4 in any 20-run window, largest drop in a 20-run median 0.84 min. None of the four stored closes came from one (closing runs were 6.1 to 12.5 min). A close on the episode's median removes the single-run case.
- Hold: my rule with one change taken from C. `accepted` needs the episode to be 14 days old as well as 20 runs. So: normal is the lower of the carried normal and the rolling median, `recovered` needs the episode's own median under the threshold, `accepted` needs 14 days and sends a notice with old and new normal.
  - Replay from 11-01: four `recovered` episodes on 11-08 and 11-09, then one episode open from 11-12T12:25Z to now (4.6 against 13.8 min). That is 7 h before C's rule opens. It would close `accepted` on 11-26 with a notice. akrogon: 0 episodes.
  - Caveat: the replay starts at the ledger's first run, so it holds one start-up episode (10-21 to 11-04) that the real alarm would not have.
  - Against A's rule: without the `recovered` change it gives 23 episodes in three weeks.

## Q3 fold or drop

- E7. I now hold A's "record and leave". My own count is the reason: 1 refusal in 718 attempts is about 12 min of line a month. The red-exit leaf already carries eight taken items and the slice rule from waiting-seats, and red-exit Taken 9 already left this out. A second guard call site is not worth a criterion there.
