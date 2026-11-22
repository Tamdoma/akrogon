# Map merged: merge-lanes

Sources: slots/map-A.md, slots/map-B.md, slots/map-C.md (2026-11-21). Tags name the slots that wrote each line.

## Lane time (framework, 2026-11-14 to 11-21)

- Lane busy 74.5 h over 248 attempts, 201 merged, 47 red (A,B,C). Verify is 91% of it; fetch, rebase, setup, gates, push and hand-over together are seconds per attempt (median wake gap 8 s) (A,B,C). Optimizing git, setup or push buys nothing (A,B,C).
- 45% of first runs are red (112 of 248) (A,B). After a first red: 43 same-tree green reruns (flake), 28 same-tree red reruns, the rest repairs (A,B,C).
- Journey first entry to merged: median 72 min, p90 205-212, max 493; 77% of it is queue wait (A,B,C). Leaves with two or more merge entries: median 87-91, p90 260-294 (B,C).
- One main-red test (`skills-typecheck-switch`, 11-15 to 11-17) cost 41 head runs plus 19 base runs (about 10 h): every leaf paid a rerun and its own base run because `knownRedReceipt` accepts only a base run linked to that head (`src/verify.ts` `knownRedReceipt`) (B,C).
- Solo conflict turns: 17 attempts, 5.9 lane-h (C).
- 5a alone saves about 10-15% of lane time (seat reading, red reruns, base runs). The green retest of a flake still costs one full line turn later because receipts are keyed by tree and main moves (A,B,C).

## Code surfaces and consumers

- Red today: `src/land.ts` `land` -> `handOff` sets `batch.owner: 'seat'`, keeps the batch; `src/turn.ts` `mergeQueue` sorts batch holders first, so the red leaf keeps the turn while B reads, reruns, repairs (A,B,C).
- Consumers of the merge/batch state: `src/turn.ts` `mergeQueue`; `src/next.ts` `mergeTurn`, `reconcileBatch`, `mergePass`, `dispatchLeaf` (non-holder merge leaves are never prompted); `src/phase.ts` holder-only guard for `merged`/`check.fix`, batch paths, `landClaim`, `commitMove` (`merge_stamp`, `fix_rounds`); `src/verify.ts` `verifyCaller` (`--attempt` needs the holder); `src/status.ts` TURN and land badge; `src/reconcile.ts`/`src/leftovers.ts` worktree keep; `src/timing-report.ts`; skills `merge-issue`, `lifecycle-rules`, `check-issue`, `watch-issues` (A,B,C).
- `check.repair` already exists as B's repair phase with exits `merge`, `check.fix`, `failed` (`src/routing.ts` `routing`), its move back to `merge` needs a green leaf receipt (`src/phase.ts`) (B; A re-read 2026-11-21).
- `merge_stamp` resets on every move into merge (`src/phase.ts` `commitMove`); operator 2026-10-05 "3a", "Foreclosed: keeping the first stamp", reason "never inserted into an already-recorded batch" (merge-turn forks/turn-release.md Q3). Batches were removed in 6e7a33ff (2026-10-19) (B; A re-read).
- `activeCount` counts every unfinished leaf with a live terminal; its only consumer is `allocate`; a leaf with a live seat bypasses the cap (A,B,C). Waiting framework merge leaves hold 2 idle seats each, 0.65 GB per leaf (B), 6.3 GiB for 5 leaves live (C). A cap refusal records no wait reason (`src/timing.ts` `waitReasonSchema`) (B).
- `failed-merge-resume` (door t126, in implement) edits `reconcileBatch` and `commitMove` batch handling; no fork here depends on its outcome, any leaf editing those builds on it (A,B,C).

## Defects found

- D1 Seat-run `merged` after a refused push writes `applied: false` and releases the lock before `restack`; a concurrent wake's `mergeTurn` then starts a new attempt over it (`src/phase.ts` `batchPush`/`finishPush`, `src/next.ts` `mergeTurn`); two incidents 11-18 cost about 97 min (C; A read the code: the window exists for seat-owned batches only, since a command-owned batch is guarded by `landAlive`).
- D2 A red hand-off to a lost B seat stalled the line 2 h (`status-page-schema-graph`, 11-21) (C).
- D3 The slow alarm's rolling median absorbed the 5 -> 13 min regrowth with no alarm for 9 days (`src/verify.ts` `decideSlow`) (B,C; carried from suite-regrowth Q5).

## Forks

- Red exit (lock 5a): where the red leaf goes (marked in merge, `check.repair`, `check.fix`); which hand-offs leave (red only, or every seat hand-off: red, gate, conflict); the off-line retest (none, narrow `run-check`, never a full suite, per lock 2a); flake told apart (seat judgment, or a bounded seatless requeue for listed flakes); return place (back, first stamp, bounded); main-red (a shared main-red cover lands a head whose every failing unit is an unresolved main red, with no rerun and no base run) (A,B,C). B: 5a before main-red cover is worse than today (H3).
- Waiting seats (lock 6a): the predicate (phase `merge` not counted; off-line work counts); keep idle seats or close A; record a capacity wait reason (A,B,C).
- Extras: D1-D3 in scope or recorded (B,C).
- 2a: nothing here waits on N2; speculative depth-2 testing is its own later chart if N2 passes (A,B,C).

## Pitfalls

- A flaky leaf kept at the front alternates at the head (A,B,C). 6a removes the only backpressure, so queue depth, branch age and conflicts grow (B,C). Off-line full runs are wasted when main moves and break lock 2a (A,B,C). Skill text is a consumer and must change with the command (A,B).

## Where slots differ

- Retest: A and C want a guard against a full off-line verify; B relies on routing (a `check.repair` leaf holds no attempt, so `verify --attempt` already refuses it).
- Flake: C proposes a seatless requeue for listed flakes; A and B keep seat judgment.
- Split: A two leaves; B five; C five plus a conditional sixth.
