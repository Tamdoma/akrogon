# Plan: failure-signals

Direct synthesis by slot B. The leaf has `debate: no`, so no positions or rebuttals apply. The locked design governs. No execution dependency is required.

## Read first

- Authoritative leaf: `brief.md`, `design.md`, and `state.yaml` beside this plan.
- `REFERENCE.md` and `learnings/LESSONS.md`.
- `docs/next.html` and `docs/state.html` for the documented dispatch and state model. These pages predate the new delivery fields and are grounding, not additional edit scope.
- `src/state.ts`: `stateSchema`, `readState`, `saveState`.
- `src/next.ts`: `busy`, `idle`, `seatFor`, `allocate`, `dispatchSlot`, `dispatchLeaf`, `nextCommand`.
- `src/phase.ts`: `commitMove`; `src/status.ts`: `note`, `cells`.
- `tests/next.test.ts`, `tests/status.test.ts`, `tests/phase.test.ts`, `tests/helpers.ts`, `tests/fake-herdr.ts` for real CLI fixtures, state assertions and recorded calls.
- `src/shell.ts` for command failure propagation and `src/routing.ts` for required slots. `plugin/next.sh` confirms sweeps invoke the CLI directly.

## Decisions and interfaces

D1. Add the design's backward-compatible fields to `stateSchema`: `failed_notified: z.boolean().default(false)`, `busy_since: z.object({ A: z.string().optional(), B: z.string().optional() }).default({})`, and a separate sibling `busy_notified` object with the same per-seat optional string shape and empty-object default. Both timestamp maps belong to the state object. Write timestamps with `new Date(...).toISOString()`. Existing state files require no migration. Retain the locked string schemas rather than broadening this task into timestamp validation policy.

D2. In the failed branch of `dispatchLeaf`, skip notification if `failed_notified` is true. Otherwise await the existing `herdr notification show` command, then save state with that flag true. A command failure leaves the flag false and retains the existing error reporting and nonzero CLI outcome. Retry on the next sweep, without an immediate retry loop. In `commitMove`, reset the flag to false on every transition, as required by the architecture. A fresh failure after `failed -> implement` can notify again. Delivery itself does not write lifecycle history or allocate panes.

D3. Track physical seats A/B, not logical task slots. A third attempt for logical B running in seat A records A. Keep `STALL_MS = 60 * 60 * 1000` in `src/next.ts`. For a pane with an agent and status `working` or `blocked`, set the first-observed stamp once. If elapsed time is strictly greater than the constant and this seat has no delivery timestamp, notify with repo, slug, seat and elapsed duration. Save `busy_notified[seat]` only after success, leaving `busy_since[seat]` unchanged. Failure retains the start timestamp and retries on a later sweep. No notification changes attempts, phase, ownership, agent state or routing.

D4. Use one private observation path in `src/next.ts`, consuming a state, physical seat, pane and current time and returning the resulting state after any required persistence or notification. Observe existing recorded seats under the existing leaf lock before the merge-active early return and before phase-required-slot filtering, so an idle seat is cleared even when its previous task is done. Preserve the hand-built and merged exclusions. Reuse observation for fresh pane reads in `dispatchSlot`, including the post-start readiness check and the successful prompt's pane read. A live idle/done pane clears both entries before prompted-session suppression or another prompt. An agentless pane also ends its old busy episode. An unknown status with an agent does not prove idle and retains its record. Absent panes are not a new error or a reason to change allocation behavior in this leaf.

D5. Thread the updated state through later decisions and saves. In particular, allocation, attempts, prompted-session writes and merge recovery must not overwrite observations with an older snapshot. Observe all existing physical seats rather than only `requiredSlots`, while leaving pane ownership discovery and allocation rules unchanged. Do not clear busy records in `commitMove`: a phase change does not prove that a seat stopped working. Keep the existing ignored `working` hook behavior. The next actual sweep observes the busy episode.

D6. Add busy duration to each leaf's existing NOTE cell, ordered A then B, using the overview's single `now` value. Format whole elapsed minutes as `busy A 0h00m`, `busy A 1h02m`, or `busy B 25h03m`, with two-digit minute remainders and no hour rollover. Clamp negative elapsed duration to zero for a clock moving backward. Show every recorded busy seat, including below the warning threshold. Status remains read-only and makes no herdr calls. Keep the formatting local unless sharing it with notification text actually removes duplicated logic.

## Acceptance criteria

C1. Legacy state without the three fields parses with false/empty defaults. After three sweeps over one failed leaf there is one successful notification and `failed_notified` is true. No agents, tabs or phase history are created by failed-leaf notification.

C2. A failed notification exits nonzero with the existing diagnostic context, leaves delivery unrecorded, and succeeds on a later sweep after the fixture stops failing. Further sweeps do not notify again. A real `phase <slug> implement --slot B` invocation clears the flag. Re-entering failed allows a new notification. Update the existing tests that currently demand byte-identical state after delivery or expect a second notification after success.

C3. First busy observation persists a timestamp. Below or exactly at 60 minutes no warning is due. At 61 minutes one warning is delivered, another sweep sends none, and attempts, phase and ownership stay unchanged. Cover both working and blocked observations. Use a controlled clock for the exact boundary or exercise the private time comparison deterministically, never a wall-clock-sensitive exact-hour subprocess assertion.

C4. Idle/done clears both timestamps, including when the prompted session is unchanged or the seat is no longer required by the phase. A later busy episode gets a fresh start and can warn again. Seats A/B have independent records. Include a logical-slot fallback onto the peer seat and a working merge seat to prove the physical-seat mapping and merge early-return path are covered.

C5. Busy notification failure retains `busy_since`, leaves `busy_notified` absent, reports the command error and retries successfully on a later sweep without consuming another attempt. A fresh start that returns blocked is stamped through the readiness path. Ordinary dispatch state saves retain delivery records.

C6. A real status invocation for a seat stamped 62 minutes ago shows `busy A 1h02m` in its leaf row. Check both seats, a short duration, and absence of busy text for empty maps. Existing state/history and no-herdr-call assertions continue to pass.

C7. End-to-end CLI evidence is saved at this authoritative leaf's `implementation/cli-artifact.log`. It contains the fake herdr notification argument arrays received during failed-leaf deduplication/retry and a busy warning, plus CLI exit outcomes and relevant resulting state/status evidence. All configured checks pass.

## Ordered execution checklist

- [x] A1. Update `src/state.ts` and `src/phase.ts` for D1/D2. Add or extend focused state/transition assertions in the existing tests to cover C1/C2.
- [x] A2. Implement D2–D5 in `src/next.ts`. Extend the existing CLI fixtures in `tests/next.test.ts` for C1–C5. Reuse `failNotification`, pane mutation and `.calls` in `tests/fake-herdr.ts`; no new fake protocol is required. Keep notification errors inside the existing dispatch error boundary.
- [x] A3. Update `src/status.ts` and `tests/status.test.ts` for D6/C6. No documentation, configuration or browser changes belong to this work.
- [x] A4. Run the focused CLI tests and capture C7 with the same isolated fixture mechanism. Create the retained scenario harness `implementation/verify-cli.ts` beside this plan. It can import existing fixture helpers and run actual `bun src/akrogon.ts next`/`status` subprocesses through `cli`; document its exact invocation in the implementation report. Save `.calls` before cleaning temporary fixture repositories. Do not exercise these scenarios against the operator's live leaves.
- [x] A5. Run `bun run format`, `bun run typecheck`, and `bun test`. Inspect the diff for unrelated formatter changes and preserve unrelated pre-existing edits. Record actual checks and artifact paths in the implementation handoff.

## Verification commands

Run from the implementation worktree:

```sh
bun test tests/next.test.ts tests/status.test.ts tests/phase.test.ts
bun run format
bun run typecheck
bun test
```

Run the retained CLI scenario harness with `bun /home/ivan/Work/infra/akrogon/issues/open/loop-hardening/dispatch-progress/failure-signals/implementation/verify-cli.ts`. The harness must assert counts, state and exit outcomes and fail nonzero on disagreement, not merely print a transcript.

## Open limitations and review notes

R1. Herdr delivery and local state persistence are separate operations. A crash or disk failure after successful delivery but before saving its record can cause a duplicate on the next sweep. The locked design provides recorded deduplication and retry, not transactional exactly-once delivery. Do not add a queue or change the herdr protocol to hide this limitation.

R2. Busy duration starts when a sweep observes the seat and only updates on later invocations. There is no new timer. A process that remains busy without further sweeps will not independently trigger a warning. A missing pane or unobserved idle interval cannot establish when its episode ended.

R3. Source documentation omits these new state fields. Updating documentation, extra-pane/session guards, dispatch error isolation and dead-field removal remain outside this leaf. There is no brief/design scope conflict requiring an operator decision.
