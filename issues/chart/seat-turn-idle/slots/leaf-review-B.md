# Leaf review: shell-sweep, slot B

## Defect

**D1 — The run spare cannot be built within the leaf's owned surfaces; `src/admission.ts` is missing from the surface list.**

The final-shape correction (in the binding Taken, via design.md "Final-shape check") requires: "spare a root subtree holding the writer pid of any run record of the leaf whose writer is alive (`src/admission.ts:writerLive`) in the `waiting`, `live` or `ended` state, not only `liveRuns()`". Design.md "Leaf architecture" repeats this as the leaf's own spare definition, and brief.md done-criterion 2 makes it observable: "a shell subtree holding a run-check of the leaf that is still running or still publishing its log after its payload ended" survives.

In `src/admission.ts` as it exists:

- `writerLive` is module-private (declared `const writerLive = ...` at module scope, never exported).
- The only exported record accessor, `liveRuns()`, filters to `state === 'live' || state === 'waiting'` — records in `ended` state are excluded by construction. Yet the publish window the correction exists for is exactly `ended`: `checkedRun` marks the record ended before publishing its log and unlinking captures.
- No other exported function yields `ended` records with their writer pid/start_time. (`lineRuns()` filters differently and `readRecord` is private.)

So the spare as specified needs either `writerLive` exported, or a new accessor exposing ended-but-writer-alive records. Both are edits to `src/admission.ts`, which is absent from the design's "Owned surfaces" list (which names only `src/phase.ts`, `src/seat.ts`, `src/timing.ts`, `src/hc.ts`, `src/next.ts`). Under the shapes audit ("each criterion can be fulfilled within ownership"), done-criterion 2 cannot be met within the leaf's owned surfaces as written. Fix: add `src/admission.ts` to the owned surfaces with the narrowest export, or restate the spare in terms of what is already exported — the latter loses the publish-window protection the correction was written for, so the former is the repair.

## Verified while checking — no other defect

For the record, these defect candidates were checked against the code or a probe and rejected:

- **Top-level `argv` exists and is rewritten on recovery** (probe, throwaway hc 0.1.22 session, 2026-11-25): healthy terminal argv `["bash","-c","exec sleep 500"]` becomes `["/usr/bin/bash"]` after the payload is killed and the shell resurrects, with `reported` resetting to false. The DC4 spawned shape's linchpin holds. `reason` and `reported` are also present in live `hc get --json` output. Healthy seats have launch argv `systemd-run ...` (checked live, seat t3h6), so the boot exclusion is sound.
- **`src/seat.ts:cgroupOf` exists** but is private — consistent with the design's plan to place the sweep beside it in that module, which is an owned surface. No defect.
- **`src/timing.ts`** uses a discriminated union on `kind`; adding a `shell_sweep` variant is the documented extension path and `timing.ts` is an owned surface. The unknown-kinds-tolerance question was explicitly not taken and is excluded. No defect.
- **Kill-order soundness** (parents before children, then one re-collect): covers the "looping shell that keeps starting children" clause of done-criterion 1 in the presence of subreaper reparenting (herdr-core is the subreaper here, so a killed child reparents outside the scope, not to a surviving in-scope process). No defect.
- **Parked-shape timing** (probe, 2026-11-25): `pid: null, reason: signaled` appears immediately at payload death, before the shell spawns — at that moment the seat genuinely is lost, so the shape is not a false positive. Surviving processes across a core restart reattach with real pid, so no healthy-seat false positive there either. No defect.
- **The two `Open for the plan:` items** (busy_since staleness, silent-end ordering) are correctly framed as plan questions, not contradictions: the lost-branch entry condition in `src/next.ts:dispatchSlot` currently requires the terminal `finished` or missing, so extending that entry condition is exactly the leaf's work and the ordering concern is real but answerable in planning.
- **The held disagreements and residuals** match the Taken text verbatim, including the B dissent on the rejected delivery-time sweep. No missing binding decision: the seed decision, signposts and shell-sweep Taken are all copied whole; the one decision sentence not fully realizable (the first sentence of the operator decision) is carried as a recorded held disagreement with its evidence, which is the charted outcome of F1 rather than a missing home.
