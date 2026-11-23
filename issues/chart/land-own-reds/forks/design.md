# Design: land-own-reds

## Question

Q1. How does a home stop only what it owns (#151)?
Q2. How does a red land rerun its failing units once (#149 P1, locked first)?
Q3. How is each save recorded and read, rollback-safe?

### Carries

seed-149-decision (P1 first; #147 work and #148 temp out of #149 scope), signposts (A), lean-akrogon/slots/map-merged.md including "After rebuttals". taken8Trigger stays (it is the lane's base pass). K1 shipped separately in k1-compile-cache.

## Findings

- #151 cause (B,C, A read): leafSlice hashes repo/slug only (src/scope.ts:7-9); reconcileHost stops any empty unmatched akrogon-l*.slice (src/reconcile.ts:1361-1374) under a per-home lock.
- Every akrogon-run-* unit carries CollectMode=inactive-or-failed (scope.ts:45,66; land.ts:36; verify.ts:897; seat.ts:290), so systemd collects failed ones itself; the host-wide `reset-failed akrogon-run-*` loop (reconcile.ts:1304,1377-1386) only acts on other homes' or pre-CollectMode units (A read; B "likely dead").
- Checks are opaque `sh -c` commands (verify.ts:716); unit names are titles or `(script) <s>` / `(unnamed) <t>` / `(no test name)` / `(log gone)` (flaky.ts:27-49) (B, A read).
- verify-runs.jsonl rows and their commands are strictObject (verify.ts:60-80) and readVerifyRuns parses every line (verify.ts:107-114): any new field makes the previous release refuse the whole ledger (A read). Signpost 5 needs rollback.
- framework's merge_checks is one command `bun run framework:verify` (framework issues/config.yaml); P1 helps framework only once framework adds its own rerun command (C rebuttal 2).

## Taken

A's picks (full autopilot), 2026-11-22:

1. Q1: delete the unmatched-slice stop branch in reconcileHost (with its badSlices / inventory-error keeps that exist only for it): a home stops only slices it derives from its own leaves. leafSlice adds the resolved home path to the hash when the home is not the default `~/.akrogon` (default keeps today's names: live seats keep their slices across the release switch and rollback). Delete the host-wide reset-failed loop (collection already covers own units). Rejected: home in every name (C; live-seat misses at the switch, B 4b).
2. Q2: optional repo config `rerun: { <merge_checks or checks name>: <command> }`. On a red merge-scope command whose name has a rerun entry, verify runs that command once in the same verify worktree through the same checked-run path, with the failing names written one per line to a file named by env `AKROGON_RERUN_NAMES`. Names are passed as recorded (titles and `(script)`/`(unnamed)` forms); a run whose names include `(no test name)` or `(log gone)`, or more than 3 names, gets no rerun. The rerun's exit decides the command's final exit. No rerun key = today's behavior. Base passes (compares) never rerun. Rejected: akrogon building `bun test -t` (runner-specific), whole-command rerun (11 lane minutes, the 11-21 removal reason). New fact against the 11-21 removal: a unit rerun costs about a minute, not a full suite.
3. Q3: the command row keeps the final exit and log; an optional `rerun: { exit, log, failures }` holds the first red run. Ships in two commits released in order: (a) the schema accepts the optional field (readers ignore it), (b) the writer. Rollback to (a) is safe. `akrogon flaky` counts a saved unit as a failure (it reads `rerun.failures`), so every door open shows saves as intake candidates (B R8 reader). Undo figure: if same-head bounces per day do not fall on akrogon, or saved units rise week over week, remove the rerun key.
4. Seed to framework (filed, not awaited): add a `rerun` command for `verify` that reruns named scripts/tests.

Correction (A, 2026-11-22, final-shape check: slots/final-B.md D1-D8, slots/final-C.md 1-5; B and C agree on each):

- Release order: commit (a) adds the optional `rerun` key to repoSchema and the optional `rerun` field to the receipt command row, and it ships and deploys as its own release before (b) is pushed (B D1, C 1). Framework's seed waits for (a) on the installed release.
- The rerun runs inline: for a sequential check, right after the red command and before blockedBy; for members, after allSettled and before the push into `ran` (B D2).
- Names reach the command through an explicit pass-through: checkedRun gains the names file path, run-check sets `AKROGON_RERUN_NAMES` like AKROGON_BASE, the name is reserved in config.ts, and the file lives in the pass folder `verify-passes/<id>/`, never in the worktree (B D3, C 3).
- Final `failures` on a red rerun = the first run's names the rerun reports again; if it reports none of them by name, keep all first-run names (B D4).
- `akrogon flaky` counts as saved only names in `rerun.failures` absent from final `failures` (all of them when final exit is 0) (C 2).
- Rows with `rerun` are left out of slowEligible (B D5, C 4). resolvedOnMain does not treat a saved row as resolving a main red for a name in `rerun.failures` (C 4). repoSchema rejects a `rerun` key that names no check (C 4).
- leafSlice takes the home as an argument; non-default means `resolve(AKROGON_HOME ?? ~/.akrogon) !== resolve(~/.akrogon)`, not the globalHome() fallback (B D7, C 5). Test sites pass their fixture home.
- Figure on akrogon: rows with a `rerun` entry split by final exit (saved vs still red). Same-head bounces is a framework figure, read after framework adopts the key (B D6). Undo: saved units rising week over week, or saves that later recur as main reds.
- Note for wake-cost: the host step keeps reading closed leaves so a merged leaf's slice is still stopped (B D8).

## Addition Q4 (A, 2026-11-22, from INTAKE F-temp)

Q4. How does a home touch only its own temp folders?

Pick (A): one home key for every shared host name. `homeKey()` in config.ts returns '' when `homePath()` equals `resolve(os.userInfo().homedir, '.akrogon')` (passwd home, not $HOME), else `sha256(homePath())[:4]`.
- `leafTempRoot()` default becomes `/var/tmp/akr-<uid>` plus `-<key>` when the key is non-empty. `retiredLeafTempRoot()` does the same. The env overrides stay.
- `leafSlice` uses the same reference, replacing the `homedir()` comparison from Q1, so a test home with only HOME changed also gets its own names.
- No env forwarding is added to land or run-check. A nested process derives the root from its own home, so the class goes away instead of being guarded per launcher.
- Default home names stay unchanged, so no migration is needed.
Breaks/invites: the socket-budget test gains 5 bytes. A home set by HOME alone, never by AKROGON_HOME, now counts as non-default. That is intended.

### Q4 taken (A, after B and C checks: slots/q4-check-B.md, slots/q4-check-C.md)

The homeKey pick is dropped. B ran Bun 1.4.5 and found that `os.userInfo().homedir` follows $HOME (F1). The key also collides (F2) and leaves keyed roots no home removes (F4, C 1).
Taken: a home deletes only names it derives (the Q1 rule applied to temps). (B)
- S1. In the reconcileHost stray sweep under the leaf temp root, an unknown entry is kept and reported (`keep`), not dropped. The dead-pid `<x>.<pid>.tmp` rule stays. (B)
- S2. The same applies to an unregistered worktree-store dir with no worktree child. (B, C G1)
- S3. `launchLand` forwards AKROGON_LEAF_TEMP_ROOT and AKROGON_RETIRED_TEMP_ROOT when set, the same as the verify pass, so a test home's land stays in its fixture root. (C 1)
Not taken: AKROGON_RUN_SLICE forwarding and the run-check nested env (B G4) go to test-hygiene. Retired root and lock residue (B G2) goes to wake-cost. Seat labels without a home (B G6) is a note only.

## Q4 limit (A, 2026-11-22, after review-D-1 F5)

Slices still collide when two live homes share a repo key and a leaf slug under different HOME values with AKROGON_HOME unset. Bun's homedir follows HOME, so this cannot be told apart without a passwd read. Accepted: fixture keys are unique, and the deletion class is closed by Q4.
