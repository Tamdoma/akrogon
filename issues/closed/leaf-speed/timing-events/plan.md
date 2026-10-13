# Plan: timing-events

Append-only `issues/timings.jsonl` at the registered root, written beside `issues/log.jsonl`, recording lifecycle timing events: visit starts, prompt deliveries, first-seat completions, check runs, merge batches, wait-reason changes and repo pauses. A failed append warns once on stderr and never changes the outcome.

## Decisions

- D1. `src/timing.ts` is the only new module: a `timingEventSchema` zod discriminated union on `kind` covering `visit_start`, `prompt`, `seat_done`, `check_start`, `check_end`, `batch`, `wait`, `repo_pause`; `appendTiming(repo.root, event)` writing one JSON line to `<root>/issues/timings.jsonl` and converting any failure into exactly one `console.warn('timing append failed: <message>')`, never throwing; `readTimings(root)` mirroring `readLog` (missing file = `[]`, strict parse); `visitOf(log, slug, phase)` = count of rows with `record.slug === slug` and `record.to === phase`.
- D2. Visit number = count of earlier `log.jsonl` rows for that leaf with `to == p`; initial phase is visit 0. Writers use `visitOf` against a `readLog` read made before any same-call `logMove` append, or subtract the just-written row. Every event for the leaf's current phase uses `visitOf(readLog(root), slug, phase)`; `visit_start` written by `commitMove` after `logMove` uses `visitOf(...) - 1` because the arrival row was already appended. `readTimings` and `visitOf` are exported for timing-readout per the design.
- D3. `wait` event `reason` is `'prerequisite' | 'parked' | 'merge_turn' | 'none'`, with `blocking` slug only for `prerequisite`/`parked`. `parked` covers two cases: the leaf's issue is parked (written by `parkCommand`, which owns `issues/parked`; `akrogon next` never sees parked leaves so only `park`/`unpark` can observe it), and a `blocked-by` dependency is parked (seen by `blockDetail`/`unmergedDeps` label `'parked'` in `akrogon next`). Unpark appends `reason: 'none'` ending it. This is the only reading satisfying criterion 4's "parking and unparking a leaf each write one wait", since `next` cannot observe a leaf under `issues/parked`.
- D4. Wait dedup: `recordWait(repo, slug, reason, blocking?)` in `src/timing.ts` reads the leaf's timing events, finds whether an open wait exists (last `wait` with a non-`none` reason not followed by a `prompt` or a `wait reason: 'none'` event), and appends only when the new reason differs from the open one; `reason: 'none'` appends only while a wait is open. Repeated `akrogon next` calls therefore produce no duplicates.
- D5. `runCheck` scope resolution: `leafTarget` also returns `scope` and `unit`. A leaf's own worktree gives `scope: 'leaf'`; a worktree under the worktree store whose basename is `<slug>-u<N>` matching a leaf slug gives `scope: 'worker'`, `unit: 'u<N>'`; an open `base-runs.jsonl` row gives `scope: 'base'` and carries the base run's `attempt` when set. `check_start` is appended after env construction just before `spawnLogged`; `check_end` after the kept log is copied, carrying `exit`, `duration_ms` (from just before the spawn), and `log` (the kept path). A killed run-check leaves `check_start` with no end.
- D6. Prompt events thread the merge attempt id by adding one `attempt?: string` parameter through `dispatchMergeLeaf`, `dispatchLeaf` and `dispatchSlot` instead of parsing it out of `mergeContext`. `recordDelivery` appends `outcome: 'delivered'`; `recordFailure` appends `outcome: 'failed'`; both record `slot`, `phase`, `visit`, `session` (pane `agent_session` value or `null`) and `attempt` when defined.
- D7. `seat_done` is appended in `transition`'s `recorded` branch only when `required.length > 1`, which is exactly the first slot of a paired phase completing without a move; single-slot `recorded` states cannot reach that branch.
- D8. `batch` is appended inside `mergeTurn`'s `withLock` right after `saveState(fresh.path, { ...fresh.state, batch: next })`, carrying `attempt`, `holder` slug, `members` slugs and `built_on`.
- D9. `repo_pause` carries `pause: 'on' | 'off'`, appended by `pauseCommand` after `setPaused` under its lock; it has no `slug`.
- D10. `visit_start` is appended in `commitMove` after `logMove` (inside the same `finally`, after the append, so a `logMove` failure still records or warns), and in `dispatchLeaf` after the identity check when the leaf has no `visit_start` event at all in `timings.jsonl` (the initial plan visit). This covers every visit: move-created visits come from `commitMove`, the initial visit from `next`.
- D11. `check_start`/`check_end` carry `run` (a `randomUUID()` per `runCheck` call), `phase` (resolved leaf's phase; omitted only for the `--holder` checkout fallback whose slug is `'checkout'`), `name` (check name or `'run'`), `scope`, `unit` when `worker`, `attempt` when defined, and on `check_end` `exit`, `duration_ms`, `log`.
- D12. Warning text: `timing append failed: <error message>` on stderr via `console.warn`. Assertions match on `timing append failed`, never on the error tail.

## Read-first

- `src/log.ts` — `readLog`/`logMove` shape this mirrors; `log.jsonl` stays phase moves only.
- `src/state.ts` — `State`, `batchSchema` (`attempt`, `members`, `built_on`), `allLeaves`, `isParked`, `issueFolders`, `leavesUnder`.
- `src/next.ts` — `dispatchLeaf` waiting exits (deps, merge turn, pause, failed, allocate-null, dispatched), `dispatchSlot` `recordDelivery`/`recordFailure`, `mergeTurn` batch creation (~line 1065), `discover` reads only `issues/open` and `issues/closed`.
- `src/phase.ts` — `commitMove` (finally + `logMove`), `transition` `recorded` branch (~line 406), `batchPush` member `commitMove` calls.
- `src/run-check.ts` — `leafTarget`, `spawnLogged`, `runCheck` flow and `runRoot` lifetime.
- `src/base-run.ts` — `baseRunSchema` (`attempt`, open-run detection by missing `end`), `readBaseRuns`.
- `src/pause.ts` — `pauseCommand`, `setPaused` under the global lock.
- `src/park.ts` — `parkCommand` moving issue folders between `open`/`parked`.
- `src/turn.ts` — `blockDetail`, `unmergedDeps` labels (`parked`, `unreadable`, `missing`, merged-filtered).
- `tests/helpers.ts`, `tests/fake-herdr.ts`, `tests/batch-dispatch.test.ts` — fixtures for driving real `next`/`phase` dispatch.
- `docs/guide/files.md` — where the new record file is documented.
- `skills/implement-issue/worker-protocol.md` — `<slug>-u<N>` worker worktree naming.

## Interfaces needed

```ts
export type TimingEvent = z.infer<typeof timingEventSchema>;
export function appendTiming(root: string, event: TimingEvent): void;          // warns once, never throws
export function readTimings(root: string): TimingEvent[];                      // [] when file absent
export function visitOf(log: LogRecord[], slug: string, phase: Phase): number; // count of to==phase rows
export function recordWait(repo: Repo, slug: string, reason: WaitReason, blocking?: string): void; // dedup per D4
```

`leafTarget` becomes `{ slug, target, baseSha?, scope: 'leaf'|'worker'|'base', unit?: string, phase?: Phase, attempt?: string }`.

## Checklist

### Wave 1

- U1 `src/timing.ts` (new): schema, `appendTiming`, `readTimings`, `visitOf`, `recordWait`, `WaitReason`. Owns `src/timing.ts`. Prerequisite for all others.

### Wave 2 (all depend on U1)

- U2 `src/phase.ts`: `seat_done` in `transition`'s `recorded` branch (`required.length > 1`); `visit_start` in `commitMove` after `logMove` with the `-1` correction from D2. Owns `src/phase.ts`.
- U3 `src/run-check.ts`: `leafTarget` returns `scope`/`unit`/`phase`/`attempt` (`<slug>-u<N>` regex on worktree basename, base-run `attempt`, leaf `state.batch?.attempt` for leaf/worker scope); `check_start` before `spawnLogged`, `check_end` after the kept log copy. Owns `src/run-check.ts`.
- U4 `src/pause.ts` + `src/park.ts`: `repo_pause` in `pauseCommand`; `wait parked`/`wait none` per moved leaf in `parkCommand` using `leavesUnder` on the moved folder. Owns `src/pause.ts`, `src/park.ts`.

### Wave 3 (depends on U1; disjoint files, shares tests/timing.test.ts resource as the proving suite only)

- U5 `src/next.ts`: `attempt` parameter through `dispatchMergeLeaf`/`dispatchLeaf`/`dispatchSlot`; `prompt` events in `recordDelivery`/`recordFailure`; `visit_start` first-observation in `dispatchLeaf`; `recordWait` at every `'waiting'` exit of `dispatchLeaf` mapping reason (deps -> `prerequisite` or `parked` by label, merge-not-holder -> `merge_turn`, all others -> `none`) and at `'completed'`/`'skipped'` exits (`none`, closes open waits including a merge member moved by `batchPush`); `batch` event at `mergeTurn`'s batch `saveState`. Owns `src/next.ts`.
- U6 `tests/timing.test.ts` (new): the five criterion tests below. Owns `tests/timing.test.ts`. Already committed red at planning; implementation work is making them green.
- U7 Docs: `docs/guide/files.md` (one `timings.jsonl` section in the same style as `merge-attempts.jsonl`), `src/AREA.md` (one line under Key files). Owns both paths.

Affected docs: `docs/guide/files.md` one line, `src/AREA.md` one line. No `README.md` change (command surface unchanged), no `tests/AREA.md` change needed beyond the new file being listed only if the file's conventions require; the skill's doc rule applies.

## Verification

| Criterion | Proof | Catches | Size | Rerun |
|---|---|---|---|---|
| 1 full drive: `visit_start` every visit incl. initial, `prompt` per routed slot per visit, `seat_done` on first paired-review seat, `batch` with attempt, visits matching derivation | `bun test tests/timing.test.ts -t 'visit events'`: drive `solo` via real `cli next`/`cli phase` plan.synthesis -> implement -> check.review (A `fix` verdict -> check.repair -> B -> check.fix -> check.review -> merge) -> `next` batch + merge prompt -> `phase merged --check --attempt` -> `phase merged --attempt`; assert timing sequence | missing/mislabeled visit or prompt rows, wrong visit arithmetic | minutes | any change to timing or dispatch |
| 2 `check_start` before spawn, `check_end` with exit+duration+log; killed run leaves start without end; `worker` scope with unit; `base` scope | `bun test tests/timing.test.ts -t 'check events'`: `run-check --name smoke -- sh -c 'exit 3'` in leaf worktree; `run-check --name hang` killed by `cli` timeout; `git worktree add` `<slug>-u1` + run-check; `akrogon base-run -- akrogon run-check -- true` with `fakeAkrogon` PATH | scope misdetection, lost exit/duration, end on killed run | minutes | changes to run-check or leafTarget |
| 3 merge attempt id on both check events | same file `-t 'attempt'`: leaf at `merge` with `batch.attempt` set -> run-check in its worktree carries `attempt` on `check_start`/`check_end` | attempt not threaded into check events | seconds | changes to check event attempt resolution |
| 4 `repo_pause` on/off; `wait` start/end for park, prerequisite, merge_turn; no duplicates | same file `-t 'waits'`: `cli pause`/`unpause`; `cli park` + `cli unpark`; `next` on a `blocked-by` leaf (then park dep -> `wait parked`, unpark, merge dep -> end); `next` on merge leaf behind another holder | reason mapping wrong, duplicate waits, missing ends | minutes | changes to next/park/pause |
| 5 unwritable `timings.jsonl`: prompts, checks, moves complete; one warning per append | same file `-t 'unwritable'`: `mkdir issues/timings.jsonl`; `phase` move warns once and commits; `run-check` warns twice and exits child code; `next` still prompts | throw on append, missing warning | seconds | changes to appendTiming |

## Tests committed at planning (red)

`tests/timing.test.ts` with five tests named by the table above, shown red on `bun test tests/timing.test.ts` (0 pass / 5 fail): the full drive completes cleanly and `timings.jsonl` stays absent, so `visit_start` comes back `[]` against expected entries, and every `check_start`/`check_end`/`wait`/`repo_pause`/`batch` lookup finds nothing. No new machinery: file uses the existing `fixture`/`fakeHerdr`/`cli`/`leaf`/`fakeAkrogon` helpers, `git worktree add` for the worker case, `base-run` for the base case and `mkdir` on the timings path for the unwritable case.

## Implementation notes (2026-10-13)

- `appendTiming` signature refined from `appendTiming(root, event)` to `appendTiming(repo: Repo, event: TimingInput)`: it stamps `ts` and `repo` itself so the ~10 call sites never carry them. `TimingInput` is the event union minus `ts`/`repo` (distributive `Omit`).
- `currentVisit(log, slug, phase)` helper added beside `visitOf`: `Math.max(0, visitOf(...) - 1)`. It is the one formula for every current-visit derivation: initial phase (0 rows -> 0), ongoing visit (`to` row appended -> count-1), and the `visit_start` `commitMove` appends after `logMove`. D2 stands; this is its mechanical form.
- `recordWait` dedup scans for the last `wait` or `prompt` event for the slug: a `prompt` (delivered or failed) closes an open wait; `reason: 'none'` appends only while one is open.
- `check` events do not carry `visit` per the brief's event list; their `phase` plus `ts` place them inside a visit.

## Notes for review

- Design names `src/park.ts` a call site; the brief attributes every `wait` write to `akrogon next`. `next` cannot observe parked leaves (discover scans only `open`/`closed`), so `parkCommand` writes the parked leaf's own `wait parked`/`wait none` while `next` writes the dependent's `wait parked` for a parked dependency. See D3.
- `run-check --holder` (the `slug: 'checkout'` fallback) keeps scope `leaf` and omits `phase`; it has no leaf to derive from and no criterion covers it.
