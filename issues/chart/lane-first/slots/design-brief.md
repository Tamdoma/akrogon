# Design brief: lane-first final shape

You are a consultant. Read only. Write your own view before seeing anyone else's.

Locked: forks/signposts.md (2026-11-23 session: 4a merge speed first, computer load where cheap). Direction from the opening map (issues/chart/lean-akrogon/slots/map-merged.md "Chart 3 lane-first"), A's picks there:
- P5: a static akrogon-land.slice with high CPUWeight for the land service and its scopes, CPU only; akrogon.slice stays CPUWeight 20 against app.slice 100.
- Q3.2: akrogon.slice MemoryHigh/MemoryMax as percentages instead of 64G/96G (systemd/akrogon.slice:7-8).
- Q3.3 backpressure: a repo's merge waiters (except the one landing) count toward that repo's own max_active.
Since then: land-own-reds landed (a land run holds its repo, reruns named failures), run-scratch and run-ram landed (check TMPDIR in RAM under run_root, guard unit per run), one-test-cap landed.

Code on main /home/ivan/Work/infra/akrogon: systemd/ unit files, src/scope.ts (slices, guard, run units), src/land.ts and src/verify.ts (land service, scopes), src/admission.ts (max_active, starts), src/next.ts (starts), src/self-update.ts or install code that writes systemd units, docs/reference/limits.md. Host: `systemctl --user show akrogon.slice -p CPUWeight,MemoryHigh,MemoryMax`, `nproc`, `free -g`.

Answer with file:line:
1. Exactly where each of the three changes goes, how a land run's scopes get into the land slice, and whether leaf checks inside a land attempt (verify --attempt) belong there.
2. Is each still worth it after the landed work? Use ledgers (issues/verify-runs.jsonl, issues/timings.jsonl, framework at /home/ivan/Work/tamdoma-framework if present) for merge wait and land duration under load. Drop any part that no longer pays.
3. What could break: install/upgrade of unit files on a running host, a percentage on a small PC, backpressure starving a repo or deadlocking (merge waiter waits on a slot the waiters hold).
4. Fewest-parts final shape, each part with the figure that proves it, and open forks with your pick.
Under 60 lines. Write slots/design-<slot letter>.md here.
