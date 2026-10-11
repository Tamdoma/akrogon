# Design: seat-retry

## Binding decisions, verbatim

From `issues/chart/night-flow/forks/failed-exits.md`, Taken. Operator, 2026-10-11, on the simplified round: "1a | 2a |"

S5 seat-retry (2a)
- Delete the automatic failed moves at `src/next.ts:560-566` and `:572-580`; the leaf keeps its phase, the error and attempt count show in status, the next pass retries (B,C).
- When herdr reports a dead agent in the owned pane, relaunch; reconcile late delivery instead of resending, with the offset bound to its recorded session (B; C rebuttal: required, since the relaunch branch runs only on `pane.agent === null`, `src/next.ts:605`).
- Agent naming unchanged first; a fresh name per launch only if a name stays taken across passes (C rebuttal; B preferred a fresh name now).
- A next pass needs a trigger when no agent exists: carried to forks/keep-running.md (B F3, C rebuttal D2).

Foreclosed: pre-merge wait for main; keeping failed for seat delivery faults; a new phase or daemon for delivery.

Proof after Taken (door, 2026-10-11, recorded in the fork and in readiness.yaml): with herdr 0.9.3, a killed agent reads `{"agent":null,"agent_status":"unknown","agent_session":null}` and is absent from `herdr agent list`, and the same agent name starts again in that pane. So the relaunch and naming bullets are met by today's code (`src/next.ts:649-673`), and late delivery is reconciled by offset at `:641-648`. Line numbers in the Taken are older; on main `c53f619` the failed moves are at `:609-617` and `:621-629`, the reconcile at `:645-652` and the relaunch at `:654-675` (B,C).

The Taken's "offset bound to its recorded session" is not met by today's code: the reconcile compares no session (`src/next.ts:645-652`), although the error stores it (`:602`, `src/state.ts:27`), and `deliveredAfter` sees only a file, offset and prompt (`src/session-file.ts:40`). The door proof covered relaunch and name reuse, not this binding (B H2). This leaf owns it.

From `forks/keep-running.md`, Taken (applies here): the watch is an informal operator habit and no leaf depends on it. A retry happens on the next pass from any existing source (herdr event, startup `--resume`, merge wake, dependents, manual).

Exclusions: the round cap belongs to `plan-not-cap`; the pre-merge red-on-base stop is already gone, removed by the merged `known-red-leaf`; no new trigger.

## Standing design

`/home/ivan/Work/infra/akrogon/skills/chart-issues/assets/standing-design.md`. Interpretation for this leaf: the properties are dispatch state writes, proven in the existing `dispatchSlot` test style with herdr replaced at its one boundary returning retryable and non-retryable errors, then success. Each criterion gets one case and one deliberate break restoring the failed move. No live run and no outside call during implementation; the herdr behavior the leaf relies on is the recorded door proof.

## Leaf architecture

- `recordFailure`: always saves the state with the error and incremented count; the `>= 3` branch goes.
- `unreachable`: replaced by the same record path, with the non-retryable code kept in the error.
- Reconcile: compare `pane.agent_session.value` with `delivery_error[slot].session` before reading the offset; on a mismatch skip the reconcile and send the prompt (A,B).
- `src/status.ts` already prints `<seat> prompt <code>` while the seat is not busy and `A:<n> B:<n>` (`:115-124`), so criterion 4's status part needs no change (C).
- Sweep note: `skills/watch-issues/SKILL.md:28,38-39` describe `failed=<cause>` and recovery of failed leaves. They stay correct for other causes and are listed as out of scope, not edited (C).
- Not in scope: relaunch changes, agent naming, new triggers, a timer, a new phase.
