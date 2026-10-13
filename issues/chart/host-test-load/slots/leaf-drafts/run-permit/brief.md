# Brief: run-permit

## What
Every `akrogon run-check` and `akrogon base-run` execution holds one host-wide permit while its command runs. A second run waits until the holder's process exits, prints who holds the permit, and records how long it waited. A run started inside an admitted run's command does not wait. `akrogon status` names the live holder.

## Why
On 2026-10-13 six framework leaves ran full test suites at once: load 235 on 32 threads and about 1900 browsers (Tamdoma/akrogon#88). One full framework core run alone peaks at load 40 and 409 browsers (chart measurement 2), so heavy runs must take turns.

## Done-criteria
1. While one `akrogon run-check` command runs, a second `akrogon run-check` or `akrogon base-run` started from another shell does not start its command until the first process exits, and prints one stderr line naming the holder's repo, leaf, check name and PID.
2. When the holding run-check process is killed with SIGKILL, a waiting run starts its command within 1 s, even while a child the killed run started under `setsid` is still alive.
3. An `akrogon run-check` started from inside an admitted run's command runs its command at once.
4. A run whose environment carries a run token that does not match a live holder (unknown token, dead holder PID, or same PID with a different start time) waits for the permit like any other run.
5. While a run waits, `akrogon status` and `akrogon next` complete without waiting for the permit.
6. `akrogon status` prints one line naming the holder's repo, leaf, check name, PID and elapsed time while a live run holds the permit, and no holder line when none does or the recorded holder is dead.
7. A run-check that waited records its wait in milliseconds on its `check_start` timing event.
