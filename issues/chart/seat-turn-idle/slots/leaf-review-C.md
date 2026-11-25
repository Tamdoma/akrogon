# Leaf review: seat-turn-idle / shell-sweep (slot C)

Reviewed draft handoff (`ISSUE.md`, `shell-sweep/{brief.md,design.md,readiness.yaml,state.yaml}`) against `forks/shell-sweep.md` `## Taken` (with `### Final-shape check, 2026-11-25`), `forks/seed-decision.md`, `shapes.md` `## Leaf files` & `## Preflight and validation`, `standing-design.md`, and live `akrogon` code (2026-11-25).

## Concrete defects

1. **Done-criterion 2 cannot be met within `Owned surfaces`, and `src/admission.ts:writerLive` is unexported (`design.md` `## Leaf architecture`, `brief.md` `## Done-criteria` #2).**
   - `design.md` `## Leaf architecture` (`Owned surfaces`) omits `src/admission.ts`, listing only `src/phase.ts:commitMove`, `src/seat.ts`, `src/timing.ts`, `src/hc.ts:terminalSchema`/`Seen`, and `src/next.ts:dispatchSlot`.
   - Yet `design.md` (`## Leaf architecture`, Spares) and Done-criterion 2 require sparing any shell subtree holding the writer PID of a run record of the leaf in state `waiting`, `live`, or `ended` whose writer is alive (`src/admission.ts:writerLive`).
   - In `src/admission.ts`, `writerLive` (`src/admission.ts:90`), `runsDir` (`src/admission.ts:49`), and `readRecord` (`src/admission.ts:82`) are all private, no exported function returns `state: 'ended'` run records (`src/admission.ts:liveRuns` filters `live | waiting`; `src/admission.ts:lineRuns` filters `full | land | waiting`), and `writerLive` calls `src/admission.ts:liveStartTime` (`src/admission.ts:60`), which hardcodes `/proc/${pid}/stat` instead of `src/scope.ts:procRoot`.
   - *Fix:* Add `src/admission.ts` to `Owned surfaces` (exporting a helper for writer-live `waiting`/`live`/`ended` run records of a leaf that reads start times through `procRoot()`), rather than duplicating `recordSchema`/dir scanning in `src/seat.ts` (which would violate `standing-design.md`'s single-definition rule).

2. **`design.md` `## Leaf architecture` contradicts `Final-shape check` and `### Standing design` on `/proc` reads (`design.md` `## Leaf architecture`).**
   - `## Leaf architecture` writes literal paths: *"resolve its scope from `/proc/<pid>/cgroup`"* and *"the caller's ancestor chain from `/proc/self` upward"*, and places the sweep beside `src/seat.ts:cgroupOf` (`src/seat.ts:184`, which also hardcodes `/proc/${pid}/cgroup`).
   - `### Final-shape check, 2026-11-25` and `### Standing design` require tests to run under `AKROGON_PROC_ROOT` (`src/scope.ts:procRoot`). Reading literal `/proc` breaks `AKROGON_PROC_ROOT` tests and means `src/seat.ts:cgroupOf` cannot be reused as-is without reading through `procRoot()`.
   - *Fix:* Specify that all `/proc` reads in the sweep (scope cgroup, caller ancestor walk, `comm`/`cmdline`, start-time re-check) go through `src/scope.ts:procRoot` (and either update `src/seat.ts:cgroupOf` to use `procRoot()` or avoid calling it directly).

3. **Key-part proof gaps against `readiness.yaml` (`shapes.md` `## Preflight and validation`, `brief.md` `## Done-criteria` #1 & #4, `readiness.yaml`).**
   - **Criterion 4 (`reason: spawn_pending`):** Asserts *"A seat still starting (launch argv `systemd-run`, or reason `spawn_pending`) is left alone. Proof: own test using hc terminal records shaped like the charting proofs P2."* Neither `readiness.yaml` proof P2 (`result`) nor `forks/shell-sweep.md` `## Charting proofs` P2 records `spawn_pending` — that pre-existing `hc` reason string has no recorded proof in `readiness.yaml`.
   - **Criterion 1 (`SIGKILL` vs P1's `SIGTERM`):** `design.md` `### Standing design` states P1 reaches the key part every criterion rests on, while Taken (`Q1` + `Final-shape check`) locks `SIGKILL`. `readiness.yaml` proof P1 (`result`) probed `TERM` (`SIGTERM`), not `SIGKILL` (low behavioral risk since both signal-terminate the child, but strictly P1 did not observe Claude's `done` flip under `SIGKILL`).

4. **Singular vs per-seat timing row ambiguity (`brief.md` `## Done-criteria` #1, `design.md` `## Leaf architecture`).**
   - `brief.md` Done-criterion 1 requires: *"After a committed phase move, these processes are gone: each leftover shell of **every recorded seat** of the leaf ... **One `shell_sweep` timing row** names the leaf, **the slot** and the ended pids with their program names."*
   - `design.md` `## Leaf architecture` says `sweepSeatShells` *"returns the per-slot result for the timing row"*.
   - When both seats `A` and `B` are recorded (e.g. `check.review` advancing), a single row cannot hold one scalar `slot` for both seats. Specify unambiguously whether a phase move emits **one `shell_sweep` row per swept seat** (naming `slug` and `slot`) or **one row per move with a per-slot structure**, and whether a row is written when a seat had 0 shells ended.

5. **Wrong/stale references in `design.md` (`### Standing design`).**
   - **Stale `standing-design.md` installed path:** `design.md` names `/home/ivan/.akrogon/releases/47bca6c1c62a3e6e320179a7a98baf54443d1922/skills/chart-issues/assets/standing-design.md`, while the active installed release (`readlink -f $(command -v akrogon)`) is `/home/ivan/.akrogon/releases/085f2f88c3a1920732e10afbc0bad190cf32d540/skills/chart-issues/assets/standing-design.md`.
   - **Inaccurate helper reference:** `design.md` states both `AKROGON_CGROUP_ROOT` and `AKROGON_PROC_ROOT` are *"already used by `tests/helpers.ts`"*. `tests/helpers.ts:181` sets only `AKROGON_PROC_ROOT`; `AKROGON_CGROUP_ROOT` is set in individual tests such as `tests/leaf-slices.test.ts` and `tests/green-merge.test.ts`.
