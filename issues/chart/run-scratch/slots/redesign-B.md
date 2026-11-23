# Redesign B: run-scratch

Code read on main at 33c11984. (H) marks what I ran on this host on 2026-11-23.

## Short answer

- Pick O4, with one change: the RAM folder is removed by the run's guard unit when that unit stops, not by akrogon code and not by a sweep.
- The run root does two jobs today. It holds akrogon's own record of the run (`.owner`, `out.log`, `refusal.json`) and it is the command's `TMPDIR`. The parked design moved both. F1 to F5 all come from moving the record.
- Move only `TMPDIR`. The record stays under the leaf temp, so reconcile needs no change and reads no second root.

## Design

- D1. The run root stays at `<leaf temp>/run-XXXXXX` (src/run-check.ts:326). `.owner`, `out.log`, `refusal.json` and `AKROGON_EVIDENCE` do not move.
- D2. When `run_root` is set, run-check makes one folder with `mkdtemp` under it and points `TMPDIR` and `BUN_RUNTIME_TRANSPILER_CACHE_PATH` at it (src/run-check.ts:68, :78). When unset, both stay in the run root as today.
- D3. The guard unit gets one more property (src/scope.ts:60-73): `ExecStopPost` that runs `chmod -R u+w <folder>; rm -rf <folder>`. systemd runs it whenever the guard stops.
- D4. Nothing lists `run_root`. Reconcile never reads the key.

Why the guard: it already exists, one per run, and every way a run ends already stops it. The wrapper's `finally` (src/run-check.ts:429), `stop-run` (src/stop-run.ts:7), a cancelled admission (src/admission.ts:231) and a leaf-slice stop.

Tested on a transient user service (H): the folder was removed after a normal exit, after `systemctl stop`, after SIGKILL of the main process and after a stop of its slice. The folder held a mode 555 directory each time.

- `RuntimeDirectory=` is the more native form, but it leaves the folder behind when it holds a 555 directory (H). Akrogon's tests make such directories.
- That 555 case is also why reconcile reports `EACCES` on two old run roots today. With D3 those trees live in the RAM folder and are removed.

## What F1 to F5 become

- F1. Gone. `.owner` stays under the leaf temp, so a live check still protects its evidence.
- F2, F4. Gone. No sweep follows the configured path. The only thing ever removed is the exact folder this run made. No realpath rule is needed.
- F3. Gone. There is no flat sweep.
- F5. Gone. The folder path is fixed in the guard unit when the run starts. Changing or removing the key later strands nothing.

## Against the other options

- O1 patches each finding and adds a liveness record plus a recorded last root. Four new parts.
- O2 gives reconcile a second root to sweep. F2, F3 and F5 stay possible.
- O3 moves seat files and `AKROGON_EVIDENCE` to RAM. They live for hours or days, and a reboot loses them.

## What could break

- R1. Memory. tmpfs pages count against `akrogon.slice` (high 64 GiB, max 96 GiB, `high` events 0 now) (H). One live framework run root was 420 MB in 23,192 files (H). tmpfs can only be reclaimed through swap. A PC with little RAM leaves the key unset.
- R2. ENOSPC. `/tmp` is 62 GB here with 58 GB free (H). A full tmpfs fails the check with a plain error. Rollback is removing the key.
- R3. Stop order. If the guard's cleanup runs while the command is still dying, a late write can recreate a file. Stop the scope before the guard (src/run-check.ts:429 stops both in one call).
- R4. The path goes into a systemd property. systemd reads `%` and quotes in it. Restrict `run_root` to plain path characters in the schema, beside the 40-byte rule (src/config.ts:44-66).
- R5. Nested runs have no guard. They keep `TMPDIR` in the run root on disk. The nested suite is not affected: its fixtures put their leaf temp under the outer `TMPDIR` (tests/isolation.ts:52-62), so it follows into RAM.
- R6. Crash leftovers. The wrapper dies between `mkdtemp` and guard start: one empty folder. The user manager dies or power is lost: tmpfs is empty after reboot, and the disk run root is dropped by the existing dead-owner rule (src/reconcile.ts:1188).
- R7. Tests that assert `TMPDIR` equals the run root need the new case. Not traced which.

Rollback: remove the key. The schema already accepts and ignores it (c4cf74a7), so an older release runs unchanged.

## Proof

- V1. The loaded nested suite, same load as the 109 s run: expect about 42 s.
- V2. `ls <run_root>` is empty after a green run, a red run, `akrogon stop-run`, a SIGKILL of the wrapper and a leaf-slice stop.
- V3. `akrogon.slice` `memory.events` `high` stays 0, and `memory.peak` of the slice before and after. The slice file exists and persists (58.9 GB peak now) (H). A run scope's own `memory.peak` is gone once the scope is collected, so D4 stays cut.
- V4. Reconcile's kept report shows no new `EACCES` run roots.
