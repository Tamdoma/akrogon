# Merged opening map (A), lean-akrogon

Inputs: map-A-facts.md (A), map-B.md (B), map-C.md (C), history-reversals.md. A read C's and B's maps after its own fact pass; A's own positions are marked (A). Tags cite lines the slot wrote.

## Core loop (A,B,C)

Serial land lane (about 11 min per land, about 83% busy on framework, B F1) + no backpressure (merge waiters do not count, next.ts:380-381) (A,B,C) + slow disk scratch and leaked slices + equal CPU share inside akrogon.slice (children have no cpu controller, B) → timeouts and broad reds (49% of merge runs red, 499 distinct failing units, B F2; reds rise with CPU pressure, B F3) → repair rounds and new starts → more load. History P1: six of fourteen reversal cycles were lifecycle rules answering this loop (B X8, C core loop).

Session rule (A, from B X8): environment causes are fixed in the run layer; one cheap rerun is the only red absorber in the lane; no further lifecycle rules for flaky reds.

## Forks, by proposed chart

### Chart 1 land-own-reds: #151, P1 with its record, K1

- #151 cause proven (B,C): leafSlice hashes repo/slug only (scope.ts:7-9); host step stops any empty unmatched akrogon-l*.slice (reconcile.ts:1345-1374) under a per-home lock.
  - Q1.1 Fix shape. B: delete the unmatched-slice stop branch (a home stops only slices it derives from its own leaves) and add the home to the hash for non-default homes only (default keeps today's names: no rename on the live install, rollback-safe). C: home hash in every slice and unit name. A: B's shape. Deleting the branch removes the class; the default-home exception avoids live-seat misses at the release switch (stop.ts:58, seat.ts:264 recompute names).
- P1 (locked first by seed 149). Today a first red exits; a rerun happens only on a same-head second visit with the same failing unit (land.ts:143-168, taken8Trigger) (A,C). akrogon cannot rerun a single unit: checks are opaque `sh -c` commands and names are bare titles (B).
  - Q1.2 Rerun mechanism. B 1a: per-check `rerun` command in repo config, given the failing names in a file, run once in the same verify worktree inside runOnce (the worktree is removed before land sees the red); no key = today. B 1b: akrogon builds `bun test -t <title>`. B 1c/C fallback: rerun the whole red command once. C 1a: parse titles/files, fall back to the whole failed command on nameless. A: B 1a. It works for any repo and runner, costs about a minute not 11, and the new fact against the 11-21 removal (lane time) is that cost difference. Cap: at most 3 failing units, no rerun for nameless or log-gone, every save recorded by unit name in the receipt row (B,C). taken8Trigger becomes redundant once 1a exists: A proposes deleting it in the same chart (A).
- K1 (A,B,C): set NODE_DISABLE_COMPILE_CACHE=1 in run-check's always-set child env; delete the copy-if-set and the verify forward (B).
- P11 minimal (B,C): rerun saves ride in the receipt row. Failure cause needs no new field: B's route choice already records it in log.jsonl (B). C wanted `--cause`. A: B's (no new part).
- Figure: red share of land attempts, same-head bounces per day (merge-attempts.jsonl, log.jsonl) (B,C).

### Chart 2 run-scratch: #148 K2, K3, K5 + evidence path

- K3 (B,C): always remove the run root, green or red; delete `.akrogon-kept` and refused-root keep.
  - Q2.1 What survives a red. B 3a / C 2a: an evidence folder next to the check log, exported to the run, packed at close; framework adopts it by seed. B 3b: K3's tar|zstd with exclusion list (framework knowledge in akrogon). A: evidence folder. Ordering risk (B): until framework adopts it, a paid failed capture loses its transcript again (LESSONS 11-15, 11-20). A: land the removal after the framework seed lands, or keep the red root only when the run had no evidence folder written — A prefers the seed-first order (no bridge part).
- K2. Q2.2 Placement. B 2a: optional host setting naming a tmpfs run root, absent = disk. C 3a: automatic spill to disk when /tmp is not tmpfs or free space is under a host-derived floor. Seed 148 locks "moves to RAM". A: C's automatic shape with no setting, because the lock says RAM and "any PC" rules out a hand-set path — open for rebuttal: B's point that a floor heuristic is untested.
- K4 dropped (A,B,C): no wait gate; history C3.
- K5 (B,C): the run guard removes the run root on wrapper death (scope.ts:70); no new sweep.
- Figure: teardown-timeout units per verify; temp root size.

### Chart 3 lane-first: P5, backpressure, any-PC slice memory

- P5. Q3.1. B 7a: static akrogon-land.slice with high CPUWeight for the land service and its scopes, CPU only (IO not delegated on this host); keep akrogon.slice 20 against app.slice 100 (protects the desktop). C: akrogon.slice CPUWeight 100, a land slice CPU 200/IO 200, leaf 50. A: B's (signpost 1a: headroom is a floor; IO weight is inert here).
- Q3.2 any-PC memory (C): akrogon.slice MemoryHigh=64G/MemoryMax=96G are fixed (systemd/akrogon.slice:7-8); percentages work on any PC. A: take it (one-line change, removes a host-tuned number).
- Q3.3 Backpressure. B 5a: a repo's merge waiters (except the one landing) count toward that repo's own max_active. C 4a: separate per-repo merge-queue cap default 2. A: B 5a (existing knob, no new number; the 11-21 reason was cross-repo starvation, which per-repo caps already remove).
- Figure: CPU pressure per attempt; merge wait per leaf.

### Chart 4 wake-cost: P9 + residue

- Q4.1. B: stop reading — keep the wake's facts (capacity wait, visit start) in state.yaml so timings.jsonl is write-only for the wake; inventory reads open only where closed is not needed. C: per-pass cache plus sidecar notice state so verify-runs.jsonl is append-only. A: B's for timings (removes the read), C's for verify-runs (removes the rewrite).
- Residue deletion (B X5, C M4.3): reused, members/split/held/reuse/ejected, Batch.decision, red-records.jsonl, repo fix_rounds key (no reader). Keep parsing old ledger rows (B).

### Chart 5 test-hygiene: #150, P12

- #150 (B,C): timer is right, the e2e is stale (hold spans two boundaries, watch-live.e2e.ts:832). Q5.1 B: assert the first due sent after the hold went once, no fixed number; C: shorten hold to 1.5x interval and add a coalesce log line. A: B's (no timing number; no new log line).
- P12 (B,C): test slices become children of the test's own slice so they stop with it; no reconcile sweep of akrogon-test-*.

### Chart 6 seat-rounds: audit first

- X1 (B): A's first-round review changes the route in 2% of 368 reviews; dropping it saves one of four turns per leaf on the pricier slot and deletes two-seat phase parts. Q6.1 (B,C): audit the 74 fix/fix reviews for Fix items only A found, then decide.
- P3 (B,C) after the audit; mechanical implement-exit proof-command check (B,C) removes the class instead of moving it.
- P8 wording (B,C). X2 skill text stated once (B,C).
- Figure: seat turns per merged leaf (B X3).

## Held or dropped (A,B,C unless noted)

- Held, re-measure after charts 1-3: P7 (B; C wanted a capped main-red return), P14 (history C5), X4 scoped wake (B), X6 rerun-based base pass (B).
- Dropped: K4, P6 (seed framework to split its verify), P10, IO half of P5, reconcile half of P12. X7 merge-slow alarm deletion: fog until traced (B L).
- Seed to framework (B,C): shrink 11 GB test copies; split verify into merge_checks members; adopt the evidence folder.

## Order (A)

1 → 2 (needs K1 and the evidence seed) → 3 (baseline from 1) → 4 and 5 (independent, any time after 1) → 6 (after the audit). One chart lands before the next starts (signpost 5).

## After rebuttals (A's picks, 2026-11-22)

Corrections accepted:
- taken8Trigger stays (B R1, C 1, verified land.ts:219 passes knownRed=true: it is a base pass and the lane's only writer of `compares` rows). A's map line calling it a rerun was wrong.
- Repo fix_rounds key stays (B R2: strictObject config, direct-route bound).
- Backpressure shape (B R3, C 4): a repo's count = its working leaves + its merge waiters except the one landing, waiters counted without the live-terminal test, checked against `repo.max_active ?? global.max_active`. Seats will sit idle while a repo's lane is full: intended; undo figure named in chart 3.
- verify-runs append-only dropped (B R4: no measured cost, rollback risk).
- Placement Q2.2 = B 2a (B R5): optional host setting naming a tmpfs run root, absent = disk; init proposes it on hosts with a large tmpfs; this host sets it. Receipt records each run's memory.peak so an automatic choice can be decided on data later. C's automatic floor rejected: start-time free space does not bound an 11 GB peak (ENOSPC mid-run). Standing C dissent: recorded.
- Chart 2 ships without a framework gate (B R6, C 5): K2, K3 and the evidence-path export together; skills say where the path is; the framework seed is filed, not awaited. Refused-root keep stays (C 5).
- P5 (B R7, C 3): land slice inside akrogon.slice, verify pass service moves with it; chart 3's figure carries leaf check duration beside land pressure. akrogon.slice vs app.slice stays 20/100 (desktop protection, signpost 1). C's sibling-slice dissent recorded.
- Rerun saves need a reader (B R8): chart 1 makes saved units show in `akrogon flaky`, which every door open reads as intake; exact threshold is a chart 1 fork.
- K1 lands and releases alone before P1 (B R9).
- #151 also scopes the global `reset-failed` on akrogon-run-* (B, C 6).
- C 6 small items: frozen-citation scope goes to chart 6; buildStack fast-path and waitPass offset reads held until measured (signpost 4).

Final charts, in order:
1. k1-compile-cache: K1 alone.
2. land-own-reds: #151 (delete unmatched stop, home in hash for non-default homes, scoped reset-failed), P1 (per-check `rerun` command, cap 3 units, receipt record, saves in `akrogon flaky`).
3. run-scratch: K2 (host setting), K3 (always remove, evidence path), K5 (guard removes root), memory.peak in receipt.
4. lane-first: land slice, slice memory as percentages, backpressure.
5. wake-cost: timings out of the wake path, inventory open-only, residue deletion (not fix_rounds).
6. test-hygiene: #150 e2e fix, P12 test slices under their own slice.
7. seat-rounds: review audit, then P3, P8, X1, X2, frozen-citation scope.
Held: P7, P14, X4, X6, buildStack skip, waitPass. Dropped: K4, P6, P10, IO half of P5, reconcile half of P12. Framework seed: shrink test copies, split verify, adopt evidence path.
