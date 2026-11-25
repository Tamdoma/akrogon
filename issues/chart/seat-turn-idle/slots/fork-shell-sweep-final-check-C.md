# Final-shape check: shell-sweep (slot C)

Checked K1–K4 from `issues/chart/seat-turn-idle/forks/shell-sweep.md` `## Taken` and `issues/chart/seat-turn-idle/forks/seed-decision.md` `## Findings` (F1) against `akrogon` source and live `hc 0.1.22` probes (2026-11-25).

## K1 (`SIGKILL` with no wait under the global lock)

- **Defect (signal-order fork race):** Sending `SIGKILL` to the collected PID set in arbitrary or child-first order lets a looping shell root (such as the `until ...; do sleep 30; done` loop in `INTAKE.md` `## Observation`) fork a new child between a child's `SIGKILL` and the shell's own `SIGKILL`, leaving an uncollected survivor in the seat `.scope` because there is no follow-up wait or pass.
  - **Evidence:** `src/phase.ts:commitMove` (single pass, no retry); `INTAKE.md` `## Observation` (looping background shell).
  - **Removal:** Signal the collected tree top-down (shell roots / parents before descendants) so no parent can fork after receiving `SIGKILL`.

## K2 (scope shell roots + sparing `liveRuns()` subtrees)

- **Defect (breaks `run-check` capture publication and wedges the leaf via `abandonedCaptures`):** `src/admission.ts:liveRuns` (`src/admission.ts:144-156`) filters strictly for `record.state === 'live' || record.state === 'waiting'` (`src/admission.ts:152`) and excludes `state === 'ended'`. However, `src/run-check.ts:checkedRun` (`src/run-check.ts:450`) calls `await admission.end()` — which rewrites the record on disk to `state: 'ended'` (`src/admission.ts:withAdmission:374`) — **before** writing the kept log (`src/run-check.ts:468`), appending `check_end` (`src/run-check.ts:469`), unlinking `captureOut`/`captureErr` (`src/run-check.ts:476-477`), and closing `capFd` (`src/run-check.ts:485`). The record file itself remains on disk with `record.pid` (the `akrogon run-check` wrapper living inside the seat `.scope`, observed in live cgroup census of `akrogon-l40ca58c258f0-fw-seo-targets-ia-keyword-a-e6d72639.scope`, 2026-11-25) until `fn` returns and `withAdmission`'s `finally` removes it (`src/admission.ts:378`).
  - **Consequence:** Sparing only `liveRuns()` while K1 sends `SIGKILL` can kill a `run-check` wrapper during its post-`admission.end()` publish/unlink window (`src/run-check.ts:450-486`), closing `capFd` and releasing its shared flock while `capture-<name>-<run>-out.log` stays on disk. `src/run-check.ts:abandonedCaptures` (`src/run-check.ts:126-154`) then reports an abandoned capture pair, causing `src/phase.ts:moveGuards` (`src/phase.ts:413`) and `src/phase.ts:completeOwner` (`src/phase.ts:368,400`) to refuse every subsequent non-failed phase move and owner completion on that leaf until manual operator clearing (`cleared-<run>.md`).
  - **Removal:** Spare any shell subtree holding a PID matching an on-disk `RunRecord` in `<globalHome>/runs/` whose `writerLive(record)` (`src/admission.ts:90`) is true across `state` in `{'waiting', 'live', 'ended'}` (not only `liveRuns()`). Note also that `src/admission.ts:liveStartTime` (`src/admission.ts:60`) reads hardcoded `/proc/${pid}/stat` rather than `procRoot()`, so if K2 reuses it for PID-reuse checks under `AKROGON_PROC_ROOT`, that helper must read through `procRoot()`.

## K3 (two lost-seat shapes, `terminalSchema`, `dispatchSlot`-only predicate)

- **No mechanism or `hc` contract defect.** Verified by throwaway `hc 0.1.22` probes (2026-11-25):
  - `terminal.list` RPC (`src/hc.ts:terminals:281`), `hc get --json` (`src/hc.ts:terminal:290`), `hc events --json` snapshots (`src/hc.ts:369`), and `foreground` events (`src/hc.ts:merged:491`) all carry `argv`, `reason`, and `foreground.name`.
  - `hc read` (`src/hc.ts:screen`), `hc kill` + `hc rm` (`src/hc.ts:end`), and `hc run --parent <parked> --outlive-parent --no-notify` (`src/seat.ts:startSeat:313`) all exit 0 on both parked (`state: 'live', pid: null, reason: 'signaled'`) and spawned (`state: 'live', argv: ['/usr/bin/bash'], keep: true`) kept terminals.
- **Minor schema guard (not a pick break):** If `src/hc.ts:terminalSchema` defaults `argv` to `[]` for stub compatibility, require `argv.length > 0 && argv[0] !== 'systemd-run'` in the spawned predicate so an empty defaulted `argv` cannot match `undefined !== 'systemd-run'`.

## K4 (`keep-off` rejected because `herdr-app` enables `keep` on adoption)

- **No defect.** Confirmed verbatim in `/home/ivan/.config/herdr-app/AGENTS.md` `## The model: spaces, tabs, terminals` (2026-11-25): *"Terminal panes are kept by their machine's core (`keep: true`) ... Adoption also enables core keep"*.
