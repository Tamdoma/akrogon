# Brief: run-units

## What
A top-level `akrogon run-check` or `akrogon base-run` run (setup included) runs in its own transient scope under the owning leaf's slice before its command can fork, plus a guard service that waits on the wrapper process and stops that scope when the wrapper ends for any reason. The run record carries the leaf slice, the launching pane scope and a run ID printed at start; a validated nested invocation stays in its ancestor's unit and creates none. `akrogon stop-run <run-id>` stops a run only when its recorded launching pane equals the caller's pane scope from `/proc/self/cgroup`; with no ID it lists the caller's pane's runs and refuses unless exactly one matches. memory-start-check's admission adds a reservation per top-level run, max(0, 16 GiB minus that run unit's anon + shmem), released when the unit is gone. Skill text replaces the recorded-PID stop rule with `akrogon stop-run`. (A,B,C)

## Why
Seats stopped runs with host-wide `pkill -f`, which killed every leaf's test runs and their own shell, and a killed run left 155 Chrome processes behind (cross-leaf-kill Taken). The start check only reads memory at start; per-run memory lets admission reserve room for runs that grow later (load-guard amendment 3a).

## Blocked by
memory-start-check: this leaf consumes its admission module (`withAdmission`) and adds per-run reservations to it.

## Done-criteria
1. A top-level run-check's command and all its descendants, including a child that forks at once, sit in that run's unit under the leaf slice; a nested run-check inside it creates no unit and stays there. (C)
2. `akrogon stop-run` from one seat stops that seat's run, while a run of another seat in the same leaf and a run of another leaf keep running; a run ID owned by another pane is refused. (B,C)
3. When the seat-started run-check process gets SIGTERM, and in a separate case SIGKILL, while its command is a long sleeper that would not end in the assertion window, the run unit is inactive and no descendant remains within TimeoutStopUSec + 5 s, with no further akrogon command run. (C)
4. A base-run's setup and command run in the same kind of unit and end the same way.
5. Under the admission lock the candidate is counted with existing top-level reservations: a run starts only when slice anon + shmem plus all remaining reservations, including the candidate's own 16 GiB, is below 48 GiB, and the reservation is published with the admission; a nested run adds no reservation; a reservation is gone once its unit is gone. (B)
6. Existing `run-check --holder` and `--leaf` forms keep working; their runs get the same units under akrogon.slice, and stop-run authority comes from the verified launching process, never from a supplied path or slug. (B)
7. implement-issue, check-issue and worker-protocol name `akrogon stop-run` as the way to stop a run, in place of the recorded-PID rule, keeping the ban on pattern kills.
8. The repo's `test` and `typecheck` checks pass.
