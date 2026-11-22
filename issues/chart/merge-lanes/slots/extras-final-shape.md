# extras proposed final shape (A's autopilot pick)

1. D1 and D2: no work of their own. Two criteria in the red-exit leaf: a wake between a refused push and the command's restack starts no new attempt; with the red leaf's B dead or missing, the next holder starts in the same pass and `dispatchSlot` restarts that B. No `reconcileBatch` crash-window change (B,C: `applied: false` is written only after git reported the push rejected).
2. D3, its own small leaf with no dependency on the others, in `src/verify.ts` `decideSlow` (B's revised rule):
   a. With no open episode the normal is the carried normal, lowered to the rolling 20-run median whenever that is lower; it never rises except at an `accepted` close. The first carried normal is the rolling median once 5 eligible runs exist (today's start rule).
   b. An open episode closes `recovered` only when the median of its own eligible runs (at least 5) is back under the threshold (1.5x and 2 min unchanged).
   c. It closes `accepted` only when it is at least 14 days old and its last 20 eligible runs all lie inside it; the accepted close sends a notice naming the old and new normal, and the new normal is that window's median.
   d. Eligibility unchanged (red runs still count, per merge-slow-alarm Q1). Standing dissent (C): green-only eligibility and C's 14-day floor drift check with 3-run hysteresis.
3. Guards before verify: not taken, stays in red-exit Taken 9 (A,B,C: about 1 refusal in 718 attempts).
4. Recorded, not taken: per-command `duration_ms` on verify-runs command entries (C); seat silence in `check.repair` (B,C).

## Check asked

Name only what is wrong, cannot be built as written, contradicts a lock in forks/signposts.md `## Taken` or the chart's other `## Taken` sections, or misstates your position. One short pass. "None" is valid.
