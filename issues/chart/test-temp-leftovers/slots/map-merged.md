# Merged map: test-temp-leftovers

Merged by A from map-A, map-B, map-C, map-D after all four were written blind. Tags name the slots whose own lines support each point.

## Sources

- S1 /var/tmp leak, proven (A,B,C,D). `src/run-check.ts` `constructedEnv` copies the `copied` list (HOME, PATH, XDG_CACHE_HOME, FAKE_SYSTEMD_RUN_LOG, AKROGON_HOME, display names) but not AKROGON_LEAF_TEMP_ROOT or AKROGON_RETIRED_TEMP_ROOT. A nested akrogon call inside a checked command resolves `leafTempRoot()` to `/var/tmp/akr-<uid>`, `ensureLeafTemp` makes `<hash4>/<hash8>`, the run removes only `run-*`, the empty leaf dir stays. Reproduced independently by B (O4), D (probe 2) and A (O2). `src/verify.ts` `passForwarded` and `src/land.ts` `launchLand` already forward both names (A,B,C,D).
- S1 exact tests (C, confirmed by A O3 and B O7): `tests/state-home.test.ts` (1 dir per run) and `tests/run-permit.test.ts` (3 per run) = the 4-per-run clusters on the host. Seven other fixtures already carry `env`/`pass_env: ['AKROGON_LEAF_TEMP_ROOT']` crutches for the same gap (B,C,D).
- Why it piled up now (C, checked by A): commit dc426cd7 (2026-11-22) made `reconcileHost` keep, not delete, unregistered store and temp dirs. Before it, live passes swept test leftovers silently.
- S2 worktree-store leak: not reproduced by any slot (A, B: full suite + 17 files + git-shim trap, C: full suite, D). Mechanism candidates only: `worktreeStore` reads `homedir()` not `homePath()` (B,C,D); a child with unset or empty HOME falls back to passwd `/home/ivan` (B O2, C O3); `systemd-run --user` services take the manager's HOME (B O3); `src/land.ts` writes `--setenv=HOME=` empty when HOME is unset (B,C). No live path found: land and verify forward HOME today.
- In-suite store dirs (C O5): `tests/batch-merge.test.ts` / `tests/merge-attempts.test.ts` set `process.env.HOME`, which does not move Bun's `os.homedir()` (B O1, C O3), so their store dirs land in the suite root's home. These are inside the per-worker suite root, which the next worker's preload removes. Not a host leftover.
- hc fixture `cleanEnv` drops the temp root names (A,C). Not a live path today: `tests/stand-in.sh` never calls akrogon (A checked).
- Concurrent env mutation (C, raised by B,D as unproven). `tests/config.test.ts` env windows are synchronous with no await between delete and restore (A checked), so no interleave there. Others (install, batch) unproven.

## Options per fork, with tags

### Fork 1: fix site for S1
- 1a Add AKROGON_LEAF_TEMP_ROOT and AKROGON_RETIRED_TEMP_ROOT to run-check `copied`, beside AKROGON_HOME (A,B,C,D). Production unchanged when unset. Cost: the exact-allowlist test in `tests/run-check.test.ts` must list the two names (C,D).
- 1b One shared seam list for run-check, verify and land, or forward the full fixture seam set verify forwards (AKROGON_PROC_ROOT, AKROGON_CGROUP_ROOT, AKROGON_RUN_SLICE) (B Q3, A F1b). Cost: wider change, forwards names no leak needs; AKROGON_RUN_SLICE is per-run and forwarding it changes nested behavior (A).
- 1c Per-fixture `env:` crutches (rejected by A,B,C,D).
- 1d Product refuses an unset root under test (rejected by A,B,C,D; C: a sentinel would itself be stripped by the same allowlist).

### Fork 2: worktree store
- 2a Leave `worktreeStore` as is; record S2 under Off route with the non-reproduction evidence (A,C,D).
- 2b Move `worktreeStore` under `homePath()` (B). Default path identical when AKROGON_HOME unset; changes the store when it is set (C,D: migration-shaped, its own decision).

### Fork 3: detection
- 3a Boundary test at the CLI: nested run-check with no `env` crutch, assert inner leaf temp under the caller's root and the default-root path for the fixture's hash absent, computed in-test (A,B,C,D).
- 3b Host scan guard (rejected by A,B,C,D: shared root with live seats gives false failures).

### Fork 4: extras in the same leaf
- land.ts empty HOME (B optional, C yes), hc-fixture `cleanEnv` forwarding (A,C), `AKROGON_HOME` in the preload (C yes, D optional), concurrent env mutators (C yes, B,D no), removing the seven crutches (C asks).

### Consensus, not forks
- Product host sweep stays as is (A,B,C,D): it keeps unregistered dirs by design (#151).
- Existing host leftovers are not the leaf's to delete (A,D).

## A's proposed picks (autopilot), for rebuttal

- Fork 1: 1a. Removes the proven failure at its mechanism with two names. 1b forwards names no observed failure needs (signpost 1: fix the mechanism that fails; operator value: removing over adding).
- Fork 2: 2a. No slot reproduced S2 on current code; 2b changes a live path on no current evidence (signpost 6 and YAGNI). Off route names the evidence and the trigger to reopen.
- Fork 3: 3a, red on base and green after, free (signpost 2).
- Fork 4: none of the extras. Each has no observed leak on current code. The two leaking tests keep their shape; the new boundary test is the proof. Crutch removal is cleanup outside the outcome.
- One leaf, `nested-temp-root` (signpost 4).

## Points where slots differ

- B: worktree store move (2b) and full seam set (1b).
- C: fold in land.ts, preload AKROGON_HOME, hc cleanEnv, batch test fixes and concurrent mutators.
- D: optional preload AKROGON_HOME; otherwise matches A.
