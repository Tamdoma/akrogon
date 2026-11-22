# Map: slot A

Evidence window: framework ledgers since 2026-11-14, computed 2026-11-21 by a scratch script over `issues/merge-attempts.jsonl` and `issues/verify-runs.jsonl` (verify runs matched to an attempt by holder slug and time).

## Where lane time goes (framework, 7 days)

- F1 Lane busy 74.5 h over 248 attempts. Verify runs inside attempts: 67.7 h (91%). Everything else (rebase, gates, push, seat thinking): 6.8 h. Gap between one attempt's end and the next start: median 0.1 min when the queue is busy, so idle hand-over time is not a lever.
- F2 First verify per attempt: 248 runs, 47.8 h, median 11.6 min. 112 of 248 first runs are red (45%).
- F3 In-lane reruns after the first run: 107 runs, 19.8 h (27% of lane time): 43 green on the same tree (flake reruns, 8.6 h), 15 green on a new tree (in-place repair, 2.9 h), 28 red on the same tree (4.7 h), 21 red on a new tree (3.6 h). 47 attempts ended red, holding the lane 14.2 h.
- F4 First entry to merge until merged, per leaf: median 72 min, p90 212 min (198 leaves, `issues/log.jsonl` first `to: merge` to `to: merged`).
- F5 What lock 5a can remove from the lane: the 49 red reruns (8.3 h) and the seat time after a red. What it cannot remove without lock 2a: the 58 green reruns (11.5 h) still need one full run each, now later and on a moved base, because main moves while the leaf is off the line. Estimated lane saving 11-15% of busy time; the larger gain is latency for the leaves queued behind a red holder (p90 attempt 30 min, max 153 min).

## Code surfaces (akrogon)

- `src/land.ts` `land`: a red `verify` calls `handOff(... wake: 'red')`, which sets `batch.owner = 'seat'` and keeps the batch on the holder. `src/turn.ts` `mergeQueue` sorts any leaf with a batch first, so the red leaf keeps the turn while seat B judges, reruns and repairs.
- `skills/merge-issue/SKILL.md` `### Shared endings` and the `wake=red` paragraph: B rereads logs, reruns `akrogon verify --attempt <id>` (a full suite, in the lane), may `--known-red`, may repair in place and rerun, and a second red on the same command ends `check.fix`.
- `src/phase.ts` `commitMove`: `merge_stamp` is reset on every move to `merge`, so a leaf back from `check.fix` queues behind every leaf that entered meanwhile; the metric (signpost 1a) counts from first entry.
- `src/next.ts` `reconcileBatch`: returns early for a merge-phase leaf with `applied: true` and no candidate, the shape a red hand-off leaves. The open leaf `watch-consultants/failed-merge-resume` (door t126) changes this same function for a failed leaf moved back to merge. Not a dependency (different outcome), but the 5a leaf alters the batch state that leaf's test builds; the later of the two rebases onto the other.
- `src/next.ts` `activeCount`: counts every unfinished leaf whose terminal is live in its repo's space; waiting merge leaves keep their tabs, so a clogged repo uses up the host-wide `max_active: 12` (C's signpost finding). Consumer: `allocate` (dispatch and `akrogon seat`).
- `src/verify.ts` `newRedUnits` runs for base runs (`compares`) and names new red against main; known-red receipts are B's `--known-red` rerun.

## Forks

- Q1 What "leaves the line" means (lock 5a). Options: (a) on a red land run the command clears the holder claim, keeps the leaf in `merge` marked off-line, and prompts B off the line to judge from the run's logs and narrow commands only, never a full `akrogon verify`; B's verdict sends it back into the queue (flake or main's fault), or to `check.fix` (cause in its diff); (b) the command moves a red leaf straight to `check.fix` and A reproduces narrowly (simpler, but every flake pays a check round, so token cost grows, breaking the signposts limit); (c) a new phase. Recommend (a): B is already prompted on red today, so tokens do not grow, and it reuses `check.fix` for real faults.
- Q2 Where the off-line leaf re-enters the queue. (a) at its first-entry time (front of the queue under today's sort), (b) at the back (today). Recommend (a): signpost 1a counts from first entry; needs a repeat bound so one leaf that keeps going red cannot take every other turn (for example: a second red on the same unit off-line goes to `check.fix`, which exists).
- Q3 Off-line retest without a second full suite (lock 2a). A full `akrogon verify` off the line would run two full suites at once. (a) B judges from logs, `akrogon flaky` and the main-red ledger plus narrow test commands; a mechanical guard refuses `akrogon verify --attempt` for a leaf that does not hold the turn; (b) allow the off-line full rerun (breaks 2a until N2 passes). Recommend (a).
- Q4 A red that is main's fault (every failing unit already red on main). Today B reruns with `--known-red` and lands in the lane. Under 5a: (a) the land run itself checks the ledger and, when no failing unit is new against main, writes the known-red receipt and lands with no seat (one right answer from the ledger); (b) leave the line like any red. Recommend (a) only if `newRedUnits`-style data already answers it for merge runs; otherwise (b). A 11-15..17 main-red streak failed 60 runs, so under (b) every leaf would cycle off and back.
- Q5 Do rebase conflicts and gate or push refusals also leave the line? Today a conflict takes a solo turn (B rebases and runs verify in the lane). Recommend: conflicts and gate refusals leave the line the same way (they are seat work), push retries stay (seconds). Signpost 5a names test failures only; A's pick under 1a.
- Q6 Lock 6a: waiting merge leaves stop counting against `max_active`. Sub-fork: do their idle terminals stay alive (fast hand-off when they become holder or go red, memory held by up to ~20 idle harness processes) or close (memory freed, a cold seat start and re-read on hand-off, so tokens grow)? Recommend keep alive and exclude from the count; `akrogon.slice` `MemoryHigh=64G` remains the host bound. Check: which leaves count as "waiting" (phase `merge`, not holder, no off-line seat turn running). An off-line red leaf whose B is working counts.
- Q7 Lock 2a and N2: no merge-lanes leaf needs two suites. N2 runs after framework `suite-lanes` lands (hours to days). Recommend: 2a is a Pending step (run N2, then new intake only if it passes), not a fork; merge-lanes hands off without waiting.

## Split

- Leaf `red-leaves-line` (Q1-Q5): land run, queue order, stamp, merge-issue skill red endings, verify guard. Akrogon only.
- Leaf `merge-wait-seats` (Q6): `activeCount`. Akrogon only. Independent of the first; parallel.
- No prerequisite leaf: no machinery is missing (both prove with `bun test` at the command boundary with the stand-in harness).

## Pitfalls over the lifetime

- P1 A leaf that flakes every run re-enters at the front forever: removed by the Q2 repeat bound.
- P2 The off-line seat quietly runs the full suite: removed by the Q3 guard.
- P3 The red leaf's tested top goes stale while off the line; re-entry must rebase onto the new main (today's turn start already does; check against `failed-merge-resume`).
- P4 Excluding waiting leaves lets more leaves start elsewhere, raising load: bounded by `akrogon.slice`; the waiting terminals are idle.
- P5 The skill text and the command disagree on who may rerun: one rule definition, the guard's refusal text names the rule.

## Questions the brief does not ask

- Should a leaf whose first run is red on a known flaky test (from `akrogon flaky`) be told apart mechanically? Only as evidence to B: "is this the leaf's fault" is a model's choice (standing-design model-choice line).
