# Merged notes: slowdown alarm (A, B)

Sources: slots/map-A.md, slots/map-B.md (blind, 2026-10-28).

## Q1 Which runs count, for the normal and for the check

- Completed merge-scope head runs only: `end` set, setup 0, no `compares` (known-red base), no `reused` or `blocked` entry; compare before adding the current run (A,B). Reason: reused, blocked and base runs are short and pull the median down (A,B).
- Command set: A's map required the same command set; B: exact equality makes a changed-command leaf bypass the alarm by cold start (B). Proposed: ignore command text, so a leaf that adds cost through config still alarms (A, after B).
- Red heads: B asks whether completed red heads count; the first slow framework run was red (B, Q3). Proposed: a red head whose commands all ran (none blocked) is eligible both ways (A).
- Normal = median of the last 20 eligible runs, at least 5 needed (A). Jump = above 1.5x the normal and at least 2 min more (A; B Q1 asked for an absolute floor). Seed's +50% is an example, not a fixed rule (B).
- Per-command timing: off route, total wall time is what the merge lane pays (B O3).

## Q2 Episode: warn once or keep the origin visible

- A: notify only when the previous eligible run was not flagged; the rolling median then adapts to a lasting new cost (A, B O6).
- B: keep the first run and pre-jump reference until recovery, so later merge seats still see an unresolved slowdown (B O5); costs state, recovery rules and a second-jump policy (B).
- Proposed middle: each flagged run's record stores the comparison (`slow` field: normal ms, ratio, episode's first run id); the herdr notice fires once at episode start; derived from the ledger, no new file (A, after B).

## Q3 Which leaf is named

- The earliest flagged run of the episode, red attempts included, worded "first seen at", not "caused by" (A,B O7). Names `renderer-package-cutover` on the framework history (B F3).

## Q4 Where it shows

- Verify stdout alone is not seen during command-owned land (B F6).
- herdr notification like `main red`, outside the receipt lock, failure printed and stored, never changes verify's exit (A,B O10; R1, R3).
- Durable surface: A proposed an `akrogon status` line while the latest eligible merge run is flagged (watch-issues and the operator read status each tick); B asked for a readable merge-seat surface (B O10, Q5).
- Discord broadcast: off route; delayed to owner completion and cannot report an attempt that never lands (B O11).

## Evidence

- better-than-training: `src/verify.ts` `runOnce`, `newRedUnits`, `sendMainRedNotice`, `reportRun`; `src/land.ts`; framework `issues/verify-runs.jsonl` 2026-10-24..28 (A,B).
- operator: framework `issues/chart/verify-time-tradeoffs/forks/tradeoffs.md` D3; lock 2026-09-18 no clocks or polls (A,B). A check computed once at verify end uses an existing event and stays inside the lock (A,B).
- Proof precedent: `issues/closed/main-red/main-red-notice/readiness.yaml` proved `herdr notification show` on 2026-10-17 (A).

## Pitfalls and removal

- Alarm becomes a merge gate: computation never touches exit or receipt eligibility; a done-criterion proves a slow green merge still lands (A,B R1).
- Double send on concurrent completion: decide under the receipt lock, deliver outside it, as main red does (A,B R3).
- Host load false alarms: harmless because the flag never fails a merge (A).

## Where slots differ

- Episode memory (Q2) and the durable surface (Q4): A leaner, B wants persistent visibility until recovery.
