# Stop redesign check B: lane-first

Read at worktree head 5debd8b9. The idea holds: no freeze, and the line stays held until the pass ends. Three things make it break as written. (H) marks what I measured on 2026-11-23.

## Breaks

- B1. The order in the brief gives a false red when the slice stop fails.
  - The brief puts the cancel marks before the slice stop. The marks are written at `src/admission.ts:233-234`. If the slice stop is then refused (D saw `Access denied` in rounds 4 and 6), the land stays alive with the marks set.
  - A marked run of the attempt then stops itself: a waiting one throws at `src/admission.ts:174`, a live one not yet launched throws at `src/run-check.ts:438-439`. The pass ends nonzero. The land reads any nonzero result as red and moves the leaf to `check.repair` (`src/land.ts:216-262`). Nothing in `src/land.ts` reads the stop state or the cancel mark.
  - Fix: slice stop first, as round 4 really had it (`src/stop.ts:87` at 073b9db7), then the marks, then passes and runs. The land is dead before any mark exists, and a refused slice stop changes nothing. With the new liveness the marks step still finds the land record.
- B2. The liveness change must sit in `live()` itself (`src/admission.ts:91-92`), not only in the hold check.
  - `sweepStale` uses `live()` (`src/admission.ts:260-262`). It runs at the start of every run on the host (`:298`). It deletes a record whose PID is gone and stops its units. Left as is, the next check start anywhere removes the land record and the line frees while the pass runs.
  - `liveRuns` (`:114`) uses it too. That is what lets a stop retry find the record (`:231`).
- B3. Admission cannot derive the pass unit from the land record.
  - The record's `unit` is a scope name that never exists (`src/land.ts:192`). The pass unit is `akrogon-verify-<random id>` (`src/verify-pass.ts:56-58`, `src/verify.ts:1045`, the id line).
  - Matching on `attempt` is not safe either. A land can join a live pass, and the join key has no attempt (`src/verify.ts:988-1000`).
  - Fix: use the test stop already uses, a pass record with the same repo and leaf slug that is `passLive` (`src/stop.ts:97-102`). It reads files only, so the 1 s admission poll calls no `systemctl`.

## Checked and fine

- Poll cost. The pass lookup runs only for a land record whose PID is dead. 13 pass records are on disk now (H).
- Restart. `landAlive` asks systemd about the land unit (`src/land.ts:65-70`), so a dead land with a live pass is relaunched. The old record does not hold a run of the same attempt (`src/admission.ts:127`), and the new land joins the running pass.
- A killed pass reads as code 1 (`src/verify.ts:979`). With the slice stop first, no land is alive to read it.
- A pass that outlives forever: only through PID reuse. `passLive` checks the PID with no start time (`src/verify-pass.ts:102-104`), and a dead pass record stays 60 minutes (`src/reconcile.ts:1433`). This host forks 53 million processes a day, so the PID range wraps about every 2 hours (H). A long-lived process would have to land on that exact PID. Low risk, and it exists today for pass joins. I would not block on it.
