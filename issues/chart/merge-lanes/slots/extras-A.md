# extras: slot A blind note

2026-11-21. Code at akrogon working tree (4f5e3fd2). Tier better-than-training unless named.

## Q1 D1 and D2

- Pick: both are removed by red-exit Taken 1 and need no work of their own. D1 lives only on the seat-owned path: a seat runs `merged`, `finishPush` refuses, the lock is released before the seat's `restack`, and a wake's `mergeTurn` starts a new attempt (`src/phase.ts` `batchPush`/`finishPush`, `src/next.ts` `mergeTurn`). Red-exit removes seat `merged` in `merge`; the command's own push loop in `land` (`src/land.ts`, `refusals`) keeps its claim (`landClaim` needs owner `command` and the same attempt) and restacks inside the land run. D2 is a red hand-off to a seat inside `merge`; after red-exit the red leaf is in `check.repair`, so a lost B there stalls only that leaf through the existing `seat_lost` path, never the line. The red-exit leaf gets two done-criteria: a wake during a land push starts no new attempt, and with the red leaf's B dead the next leaf's turn starts in the same pass.
- Rejected: separate fixes (they would patch code red-exit deletes).
- Evidence: map-merged D1, D2 (C; A read the code); `src/land.ts` `land`, `src/phase.ts` `landClaim`.
- Pitfall: a seat-owned path left half in place (a skill still telling B to run `merged`) brings D1 back. Removed by the red-exit leaf changing merge-issue text in the same leaf as the command (red-exit Taken 3).
- Consumers: none beyond red-exit's.

## Q2 D3 slow-alarm baseline

- Pick: in scope, its own small leaf, parallel to red-exit. Reason: verify is 91% of lane time, and the only detector of suite regrowth missed a 2.6x rise for 9 days; it costs no tokens and no PC load. Baseline: `normal = min(pinned, rolling median of the last 20 eligible runs)`, where `pinned` is the rolling median at the latest `accepted` close, or at the first time 20 eligible runs exist. A creeping rise cannot lift the normal (only an accepted episode does, which already prints "accepted as new normal"), and a faster suite (suite-regrowth's cuts) lowers it at once through the min. Episode, notice, `recovered` and `accepted` stay as they are. Cost: one value read from the ledger (the last `accepted` receipt's `normal_ms` or window), no new state; `src/verify.ts` `decideSlow` and `docs/reference/checks.md`.
- Rejected: an older window (N days ago) alone (still drifts, only slower, and needs a time constant); a second check of the median against its value from N days ago (two alarms for one fact); recorded for its own chart (the merge-speed destination needs a detector to keep its gain; the fix is one function).
- Evidence: `src/verify.ts` `decideSlow` (flag needs 1.5x and 2 min over the rolling median; with no open episode the normal is the last-20 median, so each step under 1.5x is absorbed); `docs/reference/checks.md` slow section; map-merged D3 (B,C); suite-regrowth suite-cuts Q5.
- Pitfalls: (1) a pinned normal set by a fast first window (cache-warm runs) fires forever; removed by the `accepted` close, which already resets after 20 runs inside the episode. (2) ledgers with no accepted close need the first-20 rule to start; it also means the first deployment pins today's 13 min, not the old 5 min, so the past regrowth is not alarmed; accepted, since suite-regrowth handles that.
- Consumers: `src/verify.ts` `decideSlow`; `akrogon status` slow line unchanged; `docs/reference/checks.md`.

## Q3 gates before verify

- Pick: depends on how often a gate refused after a green verify. If the window holds a few a week or more, run `batchGuards` and `moveGuards` once before verify too, keep the full `landGates` after it (state can change while the lock is free during the suite). If it is rare, record and leave it.
- Rejected: moving the guards before verify only (a change during the suite would land unchecked).
- Evidence: `src/land.ts` `land` (verify, then `landGates` under the lock, then push); `src/phase.ts` `landGates`. Frequency unknown to A; `wake=gate` is not in the attempts ledger.
- Pitfall: a guard that depends on the green receipt (`recordTested`) cannot move; only the two others.
- Consumers: `src/land.ts` `land`.

## Question the fork does not ask

- None.
