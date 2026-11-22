# Extras: defects found by the map, and gates before verify

## Question

Q1. Are D1 (a seat-run `merged` after a refused push releases the lock before `restack`, and a wake starts a new attempt over it, about 97 min on 11-18) and D2 (a red hand-off to a lost B seat stalled the line 2 h on 11-21) removed by red-exit Taken 1, so they need no work of their own, only a test or criterion in the red-exit leaf?

Q2. D3: the slow alarm's rolling 20-run median (`src/verify.ts` `decideSlow`) absorbed the framework suite's 5 -> 13 min regrowth over 9 days with no alarm. Is fixing the baseline in this chart's scope (verify is 91% of lane time, so regrowth is the largest merge-speed loss), and if so what baseline: a pinned baseline reset only by an `accepted` close, a longer or older window, or a second check of the rolling median against its own value from N days ago? Or is it recorded for its own chart?

Q3. The land run checks the batch and move guards (`src/phase.ts` `landGates`: `batchGuards`, `moveGuards`, then `recordTested`) only after the full verify. Should the guards that do not need the green receipt run before verify, so a gate refusal costs no suite?

### Carries

- Locks: forks/signposts.md `## Taken` (1a speed from first entry, hard limits no new red on main, PC inside limits, token cost does not grow; 3a; 5a; 2a).
- Taken in this chart: forks/red-exit.md `## Taken`, forks/waiting-seats.md `## Taken`.
- Map: slots/map-merged.md (D1-D3, Extras line).
- History: framework suite-regrowth forks/suite-cuts.md Q5 (/home/ivan/Work/infra/tamdoma/framework/issues/chart/suite-regrowth/forks/suite-cuts.md: the slow alarm closes `recovered`, the rolling median absorbs each step, per-script seconds are not in the ledger).

## Findings

Blind notes slots/extras-A.md, -B.md, -C.md; merged slots/extras-merged.md; rebuttals slots/extras-rebuttal-B.md, -C.md; final-shape check slots/extras-final-shape.md with slots/extras-final-check-B.md, -C.md.

- D1 lives only on the seat-owned batch; `applied: false` is written only after git reported the push rejected (`src/phase.ts` `batchPush`), so the crash case is a safe overwrite (B,C).
- D2: `status-page-schema-graph` held the line 2 h 01 m until `seat_lost` (C, framework timings 2026-11-21); 1 re-prompt in 184 `check.repair` visits (B).
- D3: the alarm opened four times (11-08, 11-12 x3), each closed `recovered` within 41 min on one run still 1.33-1.46x the normal, and each close let the normal step up; median 9.0 -> 13.4 min after 11-12 with no alarm (B, framework verify-runs). Today's close rule came from merge-slow-alarm forks/slowdown-alarm.md (2026-10-28, an autopilot pick).
- D3 replays (B, framework from 11-01): A's min rule alone gives 23 episodes in three weeks; with episode-median recovery 10; with that plus a 14-day `accepted`, one episode open from 11-12T12:25Z, 7 h before C's drift rule opens. C's 14-day floor closes `recovered` silently near 11-29 as the floor creeps up and misses growth under 1.5x per 14 days (B E4, E5); C's rule shows 0 false alarms before 11-12 (C).
- Guards before verify: about 1 refusal in 718 attempts since 10-24 (B); 3 all-time (C).

## Taken

A's pick under autopilot, 2026-11-21 (signpost 1a speed from first entry, hard limits, and the operator's values simplicity and removing over adding decided it):

1. D1 and D2 need no work of their own; red-exit Taken 1 removes them. Two criteria in the red-exit leaf: a wake between a refused push and the command's restack starts no new attempt; with the red leaf's B dead or missing, the next holder starts in the same pass, and that B is restarted when A is live or the cap has room. No `reconcileBatch` crash-window change. Recorded: if the land unit dies between a refused push and the restack, `mergeTurn` overwrites the batch with no `appendAttempt`, so that attempt leaves no `merge-attempts.jsonl` row (B E2); not taken, the window is one fetch and one rebase long.
2. D3 is its own small leaf with no dependency on the others, in `src/verify.ts` `decideSlow`:
   a. With no open episode the normal is the carried normal, lowered to the rolling 20-run median whenever that is lower; it rises only at an `accepted` close. The carried normal is the latest stored `slow.normal_ms`; the run after an `accepted` close takes that window's median instead (the closing row stores the old normal). Ledgers with no stored value start as today (rolling median once 5 eligible runs exist). No replay of old runs; framework starts from its stored normal, and suite-regrowth is the response to today's regrowth.
   b. An open episode closes `recovered` only when the median of its last 20 eligible runs (at least 5) is back under the threshold (1.5x and 2 min unchanged), tested on an eligible run.
   c. It closes `accepted` only when it is at least 14 days old and its last 20 eligible runs all lie inside it. The accepted close sends a notice naming the old and new normal, under its own notice id, retried by the next checked run when the send failed.
   d. Eligibility unchanged (red runs still count, per merge-slow-alarm Q1).
   Consumers: `src/verify.ts` `decideSlow` and its notice send; `src/status.ts` slow line (episodes stay open longer); `docs/reference/checks.md` slow section. Rejected: A's min rule alone (23 episodes in three weeks); C's 14-day floor drift check (closes silently as the floor creeps, misses growth under 1.5x per 14 days); a longer window alone; its own chart. Standing dissent (C): green-only eligibility and the 14-day floor drift check with 3-run hysteresis.
3. Guards before verify: not taken, stays in red-exit Taken 9 (A,B,C).
4. Recorded under Off route: per-command `duration_ms` on verify-runs command entries (C); seat silence in `check.repair` with no busy notice (B,C).
