# Design B: lane-first

Code read on main at 814a2387. (H) marks what I measured on this host on 2026-11-23. Ledger figures are the framework repo since 2026-11-22 unless said.

## Short answer

- Keep all three. Each is one or two lines. None is the big lever.
- The big lever is the red rate: 57 of 89 merge runs were red, and each red costs about 650 s of lane time (F3).
- Two things must come first: the CPU controller is off inside `akrogon.slice` today (F1), and 9,764 leaf slices are loaded (R1).

## 1. Where each change goes

P5, land CPU share:
- New `systemd/akrogon-land.slice` with `[Slice] CPUWeight=1000`. The name makes it a child of `akrogon.slice`, so it stays under akrogon's memory limits and its weight 20 against the desktop.
- `src/install.ts:39-42`: one more link. `daemon-reload` already runs (:141).
- `src/land.ts:36-41`: add `--setenv=AKROGON_RUN_SLICE=akrogon-land.slice`. The land service stays in the leaf slice (:34). It only waits, and a stop of the leaf slice still reaches it.
- `src/verify.ts:932`: `--slice=${runSlice('akrogon.slice')}` in place of the fixed name. The variable is already forwarded to the pass (:915).
- Check scopes follow with no change (`src/scope.ts:18-24`, `src/run-check.ts:346`).
- A seat's own `verify --attempt` does not have the variable. It stays in the leaf slice. That is right, it is leaf work.
- F1. `akrogon.slice` has `cgroup.subtree_control` = `memory pids` (H). No child has a CPU weight today, so a land shares CPU with all leaves per thread. The unit file turns the controller on. Side effect: leaf slices become equal groups of weight 100.
- With weight 1000 the land gets 77% of akrogon's CPU against 3 busy leaves and 53% against 9.

Memory:
- `systemd/akrogon.slice:7-8`: `MemoryHigh=50%`, `MemoryMax=75%`. systemd takes the percent of physical RAM (H, a throwaway slice at 55% resolved to 72.9 GB of 132.5 GB).
- Here that is 61.7 and 92.6 GiB. Today 64 and 96 GiB. Peak since boot 54.9 GiB (H). On a 16 GiB PC it is 8 and 12 GiB, where today's numbers limit nothing.
- `tests/install.test.ts:58` asserts the values.

Backpressure:
- `src/next.ts:379-380` leaves `merge` out of `unfinished`, so a waiter frees its slot. At `:404` add to `own` the repo's leaves in `merge`, minus one for the landing leaf. Not to `total`.
- Docs: `docs/reference/config.md:70`, `limits.md:11`.

## 2. Is each still worth it

- F2. Lane (H): 82 attempts, land p50 640 s, p90 1,050 s. From entering merge to landed, repairs included: p50 12,143 s. At 55% of attempt starts 3 or more leaves sat in merge, p90 6, max 9. The repo cap is 3.
- F3. Reds (H): 57 of 89 merge runs red. After land-own-reds landed, still 22 of 37. Five test names recur in 12 to 21 of the 57 red runs.
- P5: host CPU stall during lands is 10% at p50, up from 3% before 11-22. Land duration by stall third is 591, 642 and 724 s. So the most P5 can win is about 18% of a land. 60% of the host's CPU stall since boot is inside `akrogon.slice` (H).
- Memory: no gain here, real on a smaller PC. Keep, it removes a host-tuned number.
- Backpressure: keep. It cuts load and stale branches while the queue is full. It does nothing for the akrogon repo, which has no cap of its own (machine cap 9, framework 3) (H).

## 3. What could break

- R1. 9,764 `akrogon-l*.slice` units are loaded, 3 with tasks (H). With the CPU controller on, the kernel keeps scheduler state for each. Cost not measured. The comment at `src/reconcile.ts:1266` says a slice matching no leaf is stopped when empty. The loop at `:1312-1327` has no branch for it. Clear them before P5.
- R2. Upgrade. If the land unit file is missing, systemd makes a plain slice of weight 100. Same as today, no failure. The memory percent applies to the live slice at reload, 6.8 GiB above the peak.
- R3. Small PC. 8 GiB gives 4 and 6 GiB with swap off for the slice (`systemd/akrogon.slice:9`). A heavy suite is killed inside the slice. The desktop survives. The operator lowers `max_active`.
- R4. No deadlock. A waiter needs the line, not a start slot. The land needs an admission slot, not `max_active`.
- R5. Starvation. A leaf held for the operator stays in `merge` and counts. Three held leaves stop a cap-3 repo. Held is rare: 1 of 162 akrogon attempts, 0 of 1,199 framework (H).
- R6. Tests that read the fake systemd log assert `--slice=` strings for the pass.

## 4. Final shape

- A1. Land slice file, link, one `--setenv`, one `runSlice` call. Proof: `cpu.pressure` of `akrogon-land.slice` per attempt, and the slow third of lands falls from 724 s toward 591 s.
- A2. Two percent values. Proof: `akrogon.slice` `memory.events` `high` stays 0 here.
- A3. One term in `own`. Proof: leaves in merge at attempt start, p90 falls from 6 to 3 in the framework.

Forks:
- Q1. Percent values. O1 50 and 75 (pick, 11% above peak here). O2 55 and 80, looser than today here, tighter margin on an 8 GiB PC.
- Q2. Held leaves. O1 count them like any waiter (pick, rare, and the refusal names the cap). O2 leave them out, one more condition.
- Q3. The 9,764 slices. O1 the loop gets the branch its comment describes (pick). O2 a one-time stop by hand, and they come back. Which tests make them is not traced.
- Q4. The red rate (F3). Not in this chart. O1 seed it with the five names (pick). O2 leave it to land-own-reds.
