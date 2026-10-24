# Map A: host-run-load

## Cause

- withAdmission starts every run at once (src/admission.ts:139-183). Confirmed.
- Deeper cause, live surface: `akrogon.slice` has `cgroup.subtree_control` = `memory pids`, no `cpu` (read 2026-10-24 17:22 CEST, /sys/fs/cgroup/user.slice/user-1000.slice/user@1000.service/akrogon.slice). Leaf slices have no cpu.weight. So inside akrogon.slice every thread of every seat, Chromium, vitest worker, workerd and verify suite competes as one flat pool. A full suite with fewer threads loses CPU to whoever spawns most threads. akrogon.slice itself is CPUWeight=20 vs app.slice 100 (systemd/akrogon.slice).
- Measured 10 s sample: akrogon.slice 475%, app.slice 288%, load 55 on 32 threads.
- Every run reaches admission through checkedRun (src/run-check.ts:220): seat run-check, verify setup and checks (src/verify.ts:326,339), known-red base runs (same runOnce). verify knows scope and command name; run-check knows only --name.

## Past operator decisions (bind options)

- 2026-10-13: run permit removed, "I don't want the line to even be there ... I just don't want the PC to blow up" (issues/chart/permit-bypass/forks/guarantee.md:25-28). Permit count 2 and queue visibility foreclosed there.
- 2026-10-14: memory gate and 30 s spacing removed as "a huge regression ... so many limitations, serial testing" (issues/chart/idle-processes/INTAKE.md:9, commit 81196b3b).
- 2026-10-13: "don't put any caps", CPUQuota removed (permit-bypass/forks/ceiling-trigger.md:14-16).

## Forks

K1 mechanism
- O1 CPU priority, no waiting: verify runs (setup and checks) start in a shipped `akrogon-verify.slice` with a high CPUWeight. Sibling leaf slices get the default 100. Nothing waits, no cap. Invites: verify starves seats while it runs (bounded by suite length). Two repos' verifies still share the verify slice equally.
- O2 host-wide count of heavy runs with FIFO queue. Fixes overlap directly. Contradicts "no line" and reopens #89 (waits). Needs operator.
- O3 load or CPU-pressure gate. A wait again, plus oscillation. Same objection.
- O4 nothing in akrogon, manual pause (today's workaround). Fails the destination.

K2 what gets priority
- verify runs only (configured checks, setup, merge_checks, known-red base). Seat run-checks stay at leaf weight. Seat full-suite bisects get no boost, by design: the gating result is verify's.
- Nested verify inside a seat run-check (admission kind nested, src/run-check.ts:232) runs in the outer scope's cgroup and gets no boost. Accept, or refuse nested verify.

K3 stop semantics when verify runs leave the leaf slice
- stopSlice of a leaf no longer reaches its verify scope directly. The wrapper (`akrogon verify`, in the seat pane scope) dies with the slice, and the run guard stops the scope (src/scope.ts:63-...). The guard must then live in the same slice as the run scope, not the leaf slice, or both the wrapper and the guard die and the scope is orphaned.
- withAdmissionLock(holder.slice) serializes slice stops with admission (src/admission.ts:45-53, src/reconcile.ts:215). The record's slice must stay the leaf slice for that lock even when the unit runs elsewhere.
- reconcileHost walks only akrogon-l*.slice (src/reconcile.ts:147), so the verify slice is never judged as a leaf slice.

K4 weight value
- Weight 1000 vs nine active leaf slices at 100: verify gets ~53% of akrogon's share under full contention. 10000 gets ~92%. Pick from a measurement, not a guess.

## Pitfalls and tests

- Turning on the cpu controller for akrogon.slice's children changes sharing between leaves too: each leaf slice now gets an equal share instead of a per-thread share. That is fairer, but a Chromium-heavy leaf slows down.
- AKROGON_RUN_SLICE override (src/scope.ts:25-31) must still win for tests.
- Test: verify's runs go to the verify slice and seat run-check to the leaf slice (fake systemd-run argv capture, as tests/run-units.test.ts does). Test: guard argv names the same slice as the scope.
- Proof (real call): a fixed CPU-bound job in akrogon-verify.slice while N spinners run in a leaf slice, wall time with and without the weight.

## Smallest change

O1: ship `systemd/akrogon-verify.slice` (CPUWeight high), install it like akrogon.slice (src/install.ts:32), and have verify's checkedRun calls start the scope and guard there while the record keeps the leaf slice.
