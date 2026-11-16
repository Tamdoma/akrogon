# Plan: count-silent-turns

Slot A synthesis, 2026-11-16, base 8532a1f7. Sources: brief.md, design.md (signposts `1a 2a 3a 4a 5a 6a 7a`, turn-count Q1–Q5 picks and the final-shape correction, standing-design interpretation), readiness.yaml proofs. No brief/design conflict.

One `Open for the plan:` question, answered at D3. No credentials: the design names none and `akrogon status count-silent-turns` prints no `Missing:` lines. No grants, no paid or live operation: every proof is a `bun test` run on the real hc test core with the stand-in seat plus free `run-check` processes that only sleep.

## Read-first

- `src/next.ts` `dispatchSlot` — the counting point and the finished-or-missing replacement branch (the only product change besides schema fields and the removal of the two `+1` sites).
- `src/seat.ts` `startSeat` — the launch record that clears `prompted`/`delivery_error` and today adds `attempts +1` on a confirmed start.
- `src/state.ts` `stateSchema` — `attempts: counts.prefault({})`; `lost` joins with the same shape (criterion 6).
- `src/phase.ts` `commitMove` — resets `attempts: {A:0,B:0}`; `lost` resets beside it on every move.
- `src/timing.ts` `timingEventSchema`/`appendTiming` — where `seat_lost` joins the discriminated union; `readTimings` is all-or-nothing on any parse failure.
- `src/hc.ts` `terminalSchema`/`Seen`, `terminal()`, `screen()`, `end()` — `exit_code`/`signal` join as nullable ints; `end` = `hc kill` + `hc rm`; `hc get` of a removed terminal throws `HcError` kind `not_found`.
- `src/admission.ts` `liveRuns()` — returns records with state `live` or `waiting` whose pid/start_time/boot_id still match real `/proc`.
- `tests/hc-delivery.test.ts` — the existing silent-stop boundary tests (`hd-silent`, `hd-done`, `hd-send`) the new cases extend.
- `tests/hc-fixture.ts`, `tests/stand-in.sh`, `tests/hc-shim.sh`, `tests/helpers.ts` `cli`/`leaf`/`holdTurns`/`freeTurns` — fixture surface: real hc core per file, stand-in modes `work|done|idle|exit|trust`, shim's `HC_SHIM_UNAVAILABLE` send failure, `HC_SHIM_LOG` call order.
- `tests/abandoned-capture.test.ts` `spawnCheck` — pattern for a live background `run-check` in a test.
- `docs/reference/state-and-phases.md` (`attempts` row), `docs/reference/files.md` (timing event list), `src/AREA.md` — the three docs describing the mechanism; nothing else names it.
- `learnings/LESSONS.md` + `learnings/history/2026-11-15-background-wait-fails-leaf.md` — the lesson this leaf covers; design keeps the line (plain background shell jobs stay unseen), writes no `Applied`.

## Decisions

- **D1 (counting point, criteria 1–3).** In `dispatchSlot`, a *silent turn end* exists when `prompted[slot]` is a `Prompted` object, `prompted.address` equals the live/finished terminal's address, and `prompted.turn < seat.turn`. For a live seat this is observed after `observeBusy` and the idle/done status gate, before any `deliver`; for a finished seat it is computed inside the replacement branch. When it exists: first check `liveRuns()` — any record with `repo === repo.name` and `leaf === slug` returns with no write and no send; otherwise one `saveState` writes `attempts[slot] + 1`, `prompted[slot]` cleared and `lost[slot] = 0`; then at `>= 3` `commitMove(..., 'failed', slot, {cause:'attempts', reason:'seat <S> ended <N> turns without reporting'})`, else `deliver()` for a live seat or replacement for a finished one. `deliver` and `startSeat` keep no `attempts` write. The `not_started`/`not_confirmed` resettle branch still writes `prompted` from the recorded error with no count; its turn end is counted later at the counting point.
- **D2 (gone terminal, criterion 4).** `terminal(place.session, known.address)` throwing `HcError` kind `not_found` is caught and makes `seat === undefined`. Any other error propagates. Only in that path is the seat "gone" (row `gone: true`); `terminal()` itself never returns undefined.
- **D3 (replacement ordering, criteria 4–5, answers `Open for the plan:`).** In the finished-or-missing branch, when `silentEnd` is false and `recorded.seat[slot]` exists: (1) append the `seat_lost` row — for a finished terminal: `terminal()`/`screen()` fields, `screen` = last 40 lines (`text.split('\n').slice(-40).join('\n')`); for a gone one: `address` from `recorded.seat[slot]` and `gone: true`, no screen read; (2) `end()` when the terminal exists (gone case skips it); (3) `saveState` writes `lost[slot] + 1`; (4) at `>= 3`, `commitMove(..., 'failed', slot, {cause:'attempts', reason:'seat <S> was lost 3 times before ending a turn'})` and return, starting nothing; else `prepare()` + `startSeat` as today. This order is what the open question names: a crash can at most leave the row without the count, never the count without the row. Consequences traced below.
- **D4 (liveRuns also gates the finished-seat counting point).** Brief criterion 3 says a live/waiting run record means a seen silent turn end "neither counts nor redelivers", and the finished-seat silent end is handled "at the counting point" (design, final-shape check). The `liveRuns()` return therefore wraps the whole counting block: while a record exists, a finished silently-ended seat is not replaced either. A mid-turn-loss path is unaffected (no counting point runs). The seat stays recorded+finished; every pass no-ops until the record is gone.
- **D5 (schema and fields).** `state.lost: counts.prefault({})` beside `attempts`. `commitMove` sets `lost: {A:0,B:0}` beside `attempts`. `terminalSchema`/`Seen` gain `exit_code: z.number().int().nullable().default(null)` and `signal: same` (hc emits both as int-or-null). The `seat_lost` timing member uses the design's literal shape: slugged + `slot`, `phase` (historical), `address`, optional `turn`/`status`/`exit_code`/`signal`, optional `screen`, optional `gone: z.literal(true)`. `startSeat`'s launch record and `seatCommand` never touch `lost`; `logMove` keeps logging `attempts` only (status/watch read `attempts` and reason text, no `lost` read — design).
- **D6 (waves).** Serial-solo: one unit owns every touched file. The counting point, replacement point and schema fields sit inside one function's worth of code (`dispatchSlot` plus its two `+1` removals); splitting src from tests would interleave commits on the same files for no parallelism, and the shared `dispatchSlot` path makes src units dependent anyway. Per implement-issue's rule, A implements the plan itself, no workers.
- **D7 (test updates, not additions, for pinned old semantics).** Existing expectations that pin the delivery/start count (`attempts.A === 1` after a start or a redelivery) are false under the new rule and are updated in place with the reason; no test is deleted. Listed in the checklist.
- **D8 (report obligations).** The implementation report names open leaves in registered repos whose stored `attempts` are 2+ at merge (design Q5), and states the `readTimings` seam: an older akrogon reading a timings file with `seat_lost` rows drops all timings for that repo (design, "Timing seam").

## Interfaces

- `state.lost: { A: int >=0, B: int >=0 }` — persisted, prefaulted for pre-change state.
- `TimingEvent` kind `seat_lost`: `{ ts, repo, slug, kind:'seat_lost', slot:'A'|'B', phase: HistoricalPhase, address: string, turn?: int, status?: string|null, exit_code?: int|null, signal?: int|null, screen?: string, gone?: true }`.
- `Seen.exit_code: number|null`, `Seen.signal: number|null` (live terminals report null; `turn` stays `seat.turn`).
- Failure records: `cause:'attempts'` with the two locked reason strings; nothing else reads `lost`.

## Checklist

- **Wave 1, U1 (serial-solo, all paths).**
  - src: `src/state.ts` (`lost` field), `src/hc.ts` (`exit_code`/`signal` on `terminalSchema`+`Seen`), `src/timing.ts` (`seat_lost` member), `src/seat.ts` (remove the `attempts +1` on confirmed), `src/phase.ts` (`lost` reset in `commitMove`), `src/next.ts` (`dispatchSlot` counting point, `liveRuns` gate, `not_found` catch, replacement branch rewrite, `deliver` `+1` removal).
  - tests (new proof cases): `tests/hc-delivery.test.ts` (C1 assertions on the existing silent tests; C2, C3, C4/C5 new tests), `tests/state.test.ts` (C6 default), `tests/next.test.ts` (C6 dispatch of a `lost`-less state).
  - tests (semantic updates): `tests/next.test.ts` `attempts` expectations at the start/redelivery sites (`attempts` now counts silent ends: every bare-start expectation becomes `{A:0,B:0}`; the two silent-end re-prompt sites become `1`), plus `failed seat starts` gains the `lost` assertions that replace its "uncharged" claim, and `a finished seat restarts` gains `lost.A === 1` beside `attempts {A:0,B:0}`.
  - docs: `docs/reference/state-and-phases.md` (rewrite `attempts` row; add `lost` row; extend the move-clears line), `docs/reference/files.md` (add `seat_lost` to the timing kinds), `src/AREA.md` (attempts-counts-silent-ends wording at line 29).
  - No other agent or human doc names the mechanism (`status`/`watch` read `attempts` and reason text only — verified by grep; SKILL.md `observe.ts` line format unchanged).

## Done-criteria → proofs

Runner: the repo's configured `bun test` through `akrogon run-check`, from the worktree, `bun test --timeout=30000 <file> -t '<test name regex>'`. All machinery exists at base. Size: hc-core dispatch tests are tens of seconds each; the file's own timeout is raised to 60 s where needed (existing `hd-silent` pattern). Rerun trigger: any change to `src/next.ts`, `src/seat.ts`, `src/state.ts`, `src/phase.ts`, `src/timing.ts`, `src/hc.ts` or the named test files.

### C1 — attempts move only at a seen silent turn end; fail at 3; phase move starts at 0.

- Test: `tests/hc-delivery.test.ts` — `silent stops are re-prompted, the third fails the leaf, and a phase move resets the count`, extended with state assertions: `attempts` is `{A:0,B:0}` after the start, `{A:1}`/`{A:2}` after the first and second silent ends, reset to 0 by the phase move, fail at the third; `lost` stays `{A:0,B:0}` throughout. The `hd-done` test gains `attempts {A:1,B:0}` after its done-ending silent end, and `hd-send` gains post-settle assertions (`prompted` cleared, `attempts {A:1,B:0}`, `delivery_error` re-armed). Command: `bun test --timeout=30000 tests/hc-delivery.test.ts -t 'silent stops are re-prompted'`.
- Observation: `readState(path).attempts`/`lost`/`failure` and `core.tasks(address)` before and after each `next` pass on the live stand-in seat.
- Failure caught: counting a delivery or start as a silent turn (the #136/#137 bug), double counting, or a missing failure at the third end.
- Deliberate break (brief-mandated): restore `attempts + 1` inside `deliver`'s started branch → post-start `attempts.A` reads 1 instead of 0 → red. On base this is not an edit: the `+1` already exists there, so the test's base-red output is itself the break evidence.

### C2 — repeated passes over one silent end count once, including a pass whose redelivery send throws.

- Test: new in `tests/hc-delivery.test.ts`, `one silent turn end is counted once, including a pass where the redelivery send throws`: leaf + start; turn 1 ends idle; `hold` file + hook keep the next delivered turn working; pass with `HC_SHIM_UNAVAILABLE` primed → nonzero exit (send throw), `attempts.A === 1`, still 1 task; retry pass → send succeeds, `attempts.A === 1`, exactly 2 tasks; third pass over the still-open turn → `attempts.A === 1`, no third task. Command: `bun test --timeout=30000 tests/hc-delivery.test.ts -t 'counted once'`.
- Observation: `attempts`, task log across the three passes; the throw is `HcError` from the shim's fake `unavailable` reply.
- Failure caught: a count written per pass instead of per turn end, or a count deferred until after a successful send (crash would lose it).

### C3 — a live or waiting run-check record suppresses counting and redelivery; the next pass after it counts.

- Test: new in `tests/hc-delivery.test.ts`, `a live or waiting run-check record suppresses counting and redelivery until it is gone`: leaf + start; spawn `akrogon run-check --leaf <path> --name held -- sh -c 'sleep 60'` via `spawnFiles` (the abandoned-capture `spawnCheck` env pattern, fake `systemd-run` bin first on PATH), poll `<AKROGON_HOME>/runs/*.yaml` for a `live` record with `repo === f.repo && leaf === slug` (15 s bound); turn 1 ends silently; `next` → `attempts.A === 0`, 1 task, exit 0. Then write `checks: { held, queued: 'sleep 60' }, full: ['held','queued']` in `issues/config.yaml`, spawn `queued` → poll a `waiting` record → `next` → still 0/1. `killTree` both children; poll until no live/waiting record has a live pid (records stay on disk orphaned; `liveRuns` liveness is what gates); `next` → `attempts.A === 1`, 2 tasks. Command: `bun test --timeout=30000 tests/hc-delivery.test.ts -t 'live or waiting'`.
- Observation: `runs/*.yaml` record states, `attempts`, task count, pass exit codes across live → waiting → gone.
- Failure caught: the #137 failure mode (re-prompt storm during a seat's own run) or suppression leaking past the run's end.
- Note: the record comes from the real `withAdmission` path, never a hand-made file (brief); `pid`/`start_time`/`boot_id` liveness is real.

### C4 — lost-seat charge, silent-end replacement, third loss fails, resets.

- Test: new in `tests/hc-delivery.test.ts`, `a lost seat is charged and rowed, a finished silent end is not, and the third loss fails`: leaf at `check.review` (both slots); a hold file plus a per-address free file in the stand-in hook keeps each seat working mid-turn on demand. Sequence: kill A mid-turn → `next` → `lost.A === 1`, replacement started; kill+`rm` the replacement mid-turn → `lost.A === 2`, `gone: true` row; free the third seat's turn, wait idle (turn ended), then kill → the pass counts a silent end (`attempts.A === 1`, `lost` reset to 0), not a loss; kill the new seat mid-turn → `lost.A === 1`; kill the next mid-turn → leaf `failed` with `cause: attempts`, `seat A was lost 3 times before ending a turn`, and no new A terminal is started. A second new test, `a seat that dies during its start proof is charged as a loss`, runs an `exit`-mode leaf: the second dead start charges `lost.A === 1` with a `seat_lost` row while `prompted` is never written. `commitMove`'s `lost` reset is also proven by `phase.test.ts` `failed exits by command` updated to seed `lost` and assert `{A:0,B:0}` after the move.
- Command: `bun test --timeout=60000 tests/hc-delivery.test.ts -t 'lost seat'`.
- Observation: `lost`, `attempts`, `failure`, `state.seat`, new terminal count, `seat_lost` timing rows across each kill→pass.
- Failure caught: unbounded paid restarts (#136's 4-attempt boot death), a finished silent end mischarged as a loss, or the leaf surviving the third loss.

### C5 — the `seat_lost` row lands before removal, with hc fields or `gone: true`.

- Same test file and command as C4 (`-t 'lost seat'`): after each loss pass, `readTimings(f.root)` parses (schema proof) and yields exactly one `seat_lost` per replacement, matching `{slug, slot:'A', phase:'check.review', address, turn}`; the finished-terminal row carries `signal: 15` for the `kill`-ed seat and a `screen` of ≤40 lines, no `gone`; the `rm`'d row carries `gone: true`, no `screen`; the dead-start row carries `exit_code: 3`. Ordering: the shim call log (`core.shimLog`) shows `get`/`read` for the address before `end()`'s `kill`/`rm` pair, and the gone-address slice shows only `get` calls — `appendTiming` is synchronous, so the row is durable before `end()` runs in code order; the crash-window property (row without count permitted, never the reverse) is the code-order assertion, not a simulated crash.
- Observation: `issues/timings.jsonl` content, `hcCalls` order, `readTimings` output type.
- Failure caught: evidence lost when `end` removes the terminal (#136's no-record death), or a row the schema/readers cannot parse.

### C6 — pre-change state loads and dispatches with `lost` defaulting to 0.

- Tests: (a) `tests/state.test.ts` — a state object with no `lost` field parses to `lost: {A:0,B:0}` for both slots (extend the existing default-parse test at line ~33). (b) `tests/next.test.ts` — `failed seat starts keep the leaf in phase, uncharged, until a start succeeds` updated: the leaf it builds has no `lost` written by helpers anyway; assert `lost` reads `{A:0,B:0}` at the end and the loss charges land on the `exit`-mode replacements (this same test absorbs criterion 4's "uncharged" rewrite — see D7). Command: `bun test --timeout=30000 tests/state.test.ts -t 'default|parse'` plus the `next.test.ts` test name.
- Observation: parsed `State.lost`, dispatch exit 0 on a `lost`-less `state.yaml`.
- Failure caught: a required-field schema break on every deployed leaf (criterion 6's exact failure).

## Condition checks (per-criterion traces)

- **C1: "count moves only at a seen silent turn end"** — decisions D1/D5. Reachable breaks: (a) a `+1` surviving in `deliver` — covered by the brief's own deliberate-break (red shown at planning). (b) a `+1` surviving in `startSeat` — traced: `startSeat` is the only other attempt writer; its removal is asserted by `attempts === 0` after start in C1. (c) a count on the error-resettle write — traced: that `saveState` writes `prompted`/`delivery_error` only; the `hd-send` test's `settled` state asserts `attempts` stays 0 through resettle. (d) a count while `prompted.turn >= seat.turn` — C2's third pass asserts no count.
- **C2: "count it once including after a throwing send"** — decision D1. Break: clearing `prompted` before the count write (a crash between → count skipped) — the write is one `saveState`; traced: atomic file write, no intermediate state. The throwing-send path is C2's own red scenario.
- **C3: "neither counts nor redelivers while the record is live or waiting"** — D1/D4. Breaks: (a) check after the count write — the `liveRuns()` call precedes `saveState` in code order; the test asserts 0 while live. (b) a record filtered by wrong key — the test uses the real writer, so `repo`/`leaf` fields are exactly what the filter reads. (c) suppression surviving the record's end — the post-kill pass asserts the count lands.
- **C4: "the prior seat is recorded.seat[slot], not allocation.seats[slot]"** — D2/D3. Break: charging by `known === undefined` — a `rm`'d terminal makes `allocation.seats[slot]` undefined even when `recorded.seat` holds it; the gone case asserts the row+charge anyway.
- **C4: "finished silent end → counting point, no loss"** — D1. Break: checking `prompted` before computing `silentEnd` for the finished case — the carve-out sub-case asserts `attempts`+`lost` after a post-turn-end kill.
- **C4: "3rd replacement fails, starts no further seat"** — D3. Break: `commitMove` after `startSeat` — code order + terminal-count assertion.
- **C4: "any phase move resets lost"** — D5. Break: reset only on `failed` — `phase.test.ts` `failed exits by command` (move out of failed) seeds `lost` and asserts `{A:0,B:0}`; a non-failed move (`plan.synthesis → implement` in the C1 test) asserts the same implicitly via `lost` staying 0.
- **C5: "row before the old terminal is removed"** — D3. Breaks: (a) `end` before `appendTiming` — `hcCalls` order + code order. (b) screen read on a gone terminal (would throw and skip the row) — `gone` case asserts the row exists with `gone: true` and no `hc read` call for that address. (c) `seat_lost` written even in the `silentEnd` path — asserted absent (row count equals loss count).
- **C6: "lost defaults 0 for both slots"** — D5. Break: `prefault` applied to one key — the state.test assertion checks both keys.

Each breakable condition above is exercised red at planning where a test exists: C1's deliberate break (the `deliver` `+1`) is run and discarded; the rest are shown red by the criterion tests themselves failing on base (the counting point, `lost`, `seat_lost`, `liveRuns` gate and `not_found` handling do not exist on base). A base-green test that would prove the condition is not required — the criterion tests are new and base-red by construction.

## Implementation notes (2026-11-16)

- **hc turn semantics constrain the loss/silent-end split (refines D1/D3, no locked decision changed).** Observed on the hc test core: `terminal.turn` advances on *every* terminal end — a mid-turn SIGTERM, a SIGKILL, and `hc kill` all end the open turn (`turn` 0→1). So `prompted.turn < seat.turn` is true for any prompted seat whose terminal finished, whatever killed it, and a finished terminal reaches the `lost` branch only when no prompted entry names its address (a start-proof death) or its prompted turn never ended. A mid-turn death therefore lands on the silent-turn-end count — which the brief's own wording supports (the turn ended without a report). `lost` charges, on this hc, for missing terminals and pre-prompt deaths; the finished-terminal rich row path exists for hc builds that report a finished terminal whose prompted turn never ended. The `hd-lost` test kills with `hc kill` + `hc rm` for the missing-terminal losses, `hd-dead-start` covers the finished-terminal row, and the carve-out case (kill after a seen turn end) exercises the silent-end-first branch.

## Plan-run record

All criterion tests run red on base 8532a1f7 through `akrogon run-check`; logs in `implementation/check-plan-*.log`.

- `plan-c1` — `bun test tests/hc-delivery.test.ts -t 'silent stops are re-prompted'` → red: after the start, `attempts.A` reads `1`, expected `0` (`hd-silent` line 88). This base red is also C1's deliberate-break evidence: the `+1` in `deliver` the brief asks to break on already exists at base; the post-start `attempts.A === 1` the test fails on is exactly the violation.
- `plan-c2` — `-t 'counted once'` → red: after the throwing-send pass and the retry delivery, `attempts.A` reads `2`, expected `1` (the delivery counted instead of only the turn end), at `hd-once` line 144.
- `plan-c3` — `-t 'live or waiting'` → red: with the live run record up, the pass counted and redelivered anyway (`attempts.A` `2`, expected `0`), at `hd-runs` line 235.
- `plan-c4c5` — `-t 'lost seat|start proof'` → red: `readState(path).lost` is `undefined` on base after a mid-turn kill (no `lost` field, `hd-lost` line 291) and after a dead start proof (`hd-dead-start` line 373); the `seat_lost` row and schema do not exist.
- `plan-c6` — `tests/state.test.ts -t 'retain defaults'` → red: parsed state has no `lost` key (line 33).
- `plan-c6b` — `tests/next.test.ts -t 'keep the leaf in phase'` → red: `state.lost.A` is undefined (line 2158).
- `plan-c4r` — `tests/phase.test.ts -t 'failed exits by command'` → red: the leaf seeded with `lost: {A:2,B:1}` fails to parse under the strict base schema; the `phase` command exits 1 (line 1011).

Sanity runs on unchanged neighbors: `hd-turn`, `hd-agy`, `hd-status-retry`, `hd-done` pass unaffected in the full-file sweep except `hd-done`'s new `attempts === 1` assertion, which is red by design (base counts the redelivery, not the turn end) and `hd-send`'s resettle assertions (base keeps `prompted` from the recorded error, never counts).

## Operator blockers

None. No grant, env value, live session or paid call is needed by plan or implementation.
