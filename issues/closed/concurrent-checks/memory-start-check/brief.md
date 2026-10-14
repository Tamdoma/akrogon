# Brief: memory-start-check

## What
Remove the run permit. `akrogon run-check` and `akrogon base-run` start their command right away unless akrogon.slice is near its memory limit: under a short flock, a run starts when the slice's `memory.stat` anon + shmem is below 48 GiB and at least 30 s have passed since the last admitted start; otherwise it polls every 5 s and prints why it waits. Nested runs inside an admitted run start at once. No name-based exemptions.

## Why
One host-wide line made seats wait up to 64 min for a 15 s check and ~16 h of seat waiting in one afternoon (Tamdoma/akrogon#89, chart INTAKE source 4). The operator removed the line (guarantee Taken); the slice ceiling is the host limit and the start check only stops new starts near it (load-guard Taken).

## Done-criteria
1. Two `akrogon run-check` commands started together in two leaves, with the slice below the threshold, run at the same time (their start and end times interleave) instead of one after the other.
2. At or above the threshold a run-check waits and prints the reading and reason; once memory is below the threshold and the 30 s spacing is met, an eligible waiter starts within one poll, with competing waiters re-checking both conditions under the lock. (B)
3. A second start within 30 s of an admitted start waits until the 30 s pass, even when memory is low.
4. A run-check or base-run started inside an admitted run (AKROGON_RUN token of a live run) starts at once and never waits on the spacing or the threshold.
5. `akrogon status` shows runs currently waiting to start with leaf, check and wait reason, and shows no permit holder line.
6. Timing records keep `wait_ms` as the start-check wait for each check start.
7. No `run.lock*` lanes, `run-holder*.yaml` permit files or cheap/selftest exemption remain in src/, and docs (docs/guide/setup.md, docs/guide/files.md, src/AREA.md) describe the start check, not the permit. (C)
8. The repo's `test` and `typecheck` checks pass.
