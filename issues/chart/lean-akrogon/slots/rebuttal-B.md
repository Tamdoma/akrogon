# Rebuttal B: map-merged.md

Disagreements only. Lines I opened are marked (H). Everything not listed here I accept.

## Wrong on facts

- R1. Do not delete `taken8Trigger` in chart 1. It is not a rerun and P1 does not replace it (H).
  - The second `verify` call passes `knownRed=true` (src/land.ts:219). With a recorded red head it runs only the base (src/verify.ts:1106-1119). The merged map calls it "a rerun on a same-head second visit". It is a base pass.
  - It is the lane's only writer of `compares` rows. The main-red cover reads only those rows (src/verify.ts:355: `if (red.compares === undefined ...) continue`).
  - Without it, a red on main never gets covered inside the lane. Every leaf then goes red, fails the rerun, and B routes it to `failed` as main-caused (skills/check-issue/SKILL.md:105). That is history C7 again, and it raises the P7 visits we are trying to cut.
  - A repo with no `rerun` key would lose its only absorber.
  - My X6 was narrower: later, run the `rerun` command on the base in place of the full command list. Keep taken8 in chart 1.

- R2. The repo `fix_rounds` key has a reader, and deleting it breaks configs. My map said "no reader", which was wrong.
  - It bounds the chart door's direct route by skill text (skills/chart-issues/assets/direct-route.md:23, docs/reference/config.md:68). This session's 12 rounds come from it (akrogon `issues/config.yaml`).
  - `repoSchema` is a `strictObject` (src/config.ts:58-59) (H). Removing the key makes every config that sets it fail to parse. Akrogon sets 12, framework sets 8, and framework's file is outside akrogon's repo.
  - Take it off the residue list. The dead part is only the docs' wording about the lifecycle.

- R3. Backpressure 5a does nothing on framework as worded (H).
  - The per-repo cap is optional with no default (src/config.ts:64). `capRefusal` skips it when unset (src/next.ts:412-417). Neither framework's nor akrogon's config sets `max_active`.
  - A leaf counts only with a live terminal: `unfinished(leaf) && live.has(leaf.state.slug)` (src/next.ts:397). Merge holds no seat, so a waiter whose tab closed would still not count.
  - Shape that works with no new number: the repo's own count is working leaves plus merge waiters except the one landing, checked against `repo.max_active ?? global.max_active`. Waiters count without the terminal test.
  - Correction to my own map: the recorded reason for the 11-21 change is "the cap only bites on waiters" (history C4). Cross-repo starvation was my inference. Under 5a seats will again sit idle while framework's lane is full. That is intended, so the chart must say so and name the undo figure. Otherwise it gets reversed a third time.

- R4. Do not take the append-only `verify-runs.jsonl` change in chart 4.
  - No measured cost. The finish rewrite (src/verify.ts:842-844) is a 2.4 MB write once per verify. Signpost 4 needs a measured cost for a new mechanism.
  - It puts signpost 5 at risk. The previous release expects one row per run. Reconcile takes the first row with a run's id and treats a missing `end` as in progress (src/reconcile.ts:1036-1037) (H). With two rows per run, a rollback reads the start row first. I have not read C's row shape, so how far this goes is open.
  - The measured cost in P9 is the timings and inventory reads. Keep chart 4 to those.

## A's pick I think is wrong

- R5. Q2.2 placement: an automatic floor on free space fails on exactly the small PCs it is for.
  - Free space at run start says nothing about the run's peak. Framework's verify peaks at 11 GB and ends at 1.6 GB (#148). On a host with an 8 GB tmpfs, every land passes a fraction floor at start and then hits `ENOSPC` mid-run. That is an environment red, the class this session removes.
  - Free space is also the wrong reading. tmpfs pages count toward `akrogon.slice`, and with `MemorySwapMax=0` they cannot be reclaimed. Q3.2 turns `MemoryHigh` into a percentage. On a 16 GB host that is about 8 GB for seats and scratch together, and crossing it throttles the whole slice. That shows up as timeouts.
  - A per-run choice also makes the same check run on RAM one time and disk the next. Teardown is 0.3 s against 163 s, so land times stop being predictable.
  - The lock is met by 2a: this PC gets the tmpfs root set, and other PCs default to disk, which always works. "Any PC" means it must not fail anywhere. It does not mean every PC must use RAM.
  - If A wants automatic, the sound signal is the check's last measured peak (my 2b), compared against slice headroom. Record `memory.peak` in the receipt in chart 2 and decide on data. History P2: every untested admission shape was reversed within hours.

- R6. Seed-first order for chart 2 is circular.
  - The framework seed has to land through framework's lane. That lane is red because of the scratch problem chart 2 fixes (#148: teardown timeouts are 6 of 20 and 16 of 29 failing units).
  - The gate is not needed. Once run-check exports the evidence path, a seat can pass it to a driver by flag the same day. LESSONS.md 2026-11-15 and 11-20 already tell seats to pass an explicit evidence root. The seed only changes the driver's default.
  - Ship K2, K3 and the export together. Add one line to the check and implement skills saying where the path is. File the seed without waiting on it.

## Material points both other slots missed

- R7. `akrogon-land.slice` changes scheduling for every leaf, not only the land (H on host state).
  - Today `akrogon.slice` children have no cpu controller, so all akrogon threads compete one for one. Setting `CPUWeight` on one child turns the controller on for all children.
  - Each leaf slice then gets an equal share by default. A leaf running a 32-thread check gets the same share as a leaf with one idle seat. Heavy leaf checks slow down under load.
  - This may be fine, but it is a second effect in the same chart. Chart 3's figure needs leaf check duration next to land pressure, and the undo value must cover both.
  - The verify pass service sits in `akrogon.slice` itself (src/verify.ts:895), not the leaf slice. It has to move with the land's scopes or the weight misses it.

- R8. The rerun record has no reader.
  - `akrogon flaky` prints, and nothing acts on it (src/flaky.ts:190-194, only caller src/akrogon.ts:303-305).
  - P1 lets a leaf with a real intermittent defect land when the unit passes alone. That unit then fails some share of later lands and is absorbed each time. Main's suite gets worse and nobody sees it.
  - Chart 1 must name who reads the count and what happens at what value. Example: a unit saved 3 times in 7 days is filed through `/seed-issue` by the watch or the door. Without that, the hard limit "every shortcut writes each use to a ledger a script can count" is met on paper only.

- R9. Release K1 alone, before P1. INTAKE's consultants said "do first and alone".
  - K1 changes the env of every land run. Lands have run with the compile cache on since merge became command-owned, and leaf checks run with it off.
  - If K1 and P1 land together, chart 1's one figure (red share of land attempts) cannot say which of them moved it. Signpost 3 needs that. K1 is a one-line commit, so its own release with a day of baseline costs little.
