# Sub-brief 1: merge-attempt-pressure — command and schema changes

## 1. Goal

Record host stall time on every merge-attempt line: read `/proc/pressure` `some total=` counters (cpu, memory, io) plus the boot id at batch creation, snapshot them into the batch record, read again at attempt end, and append the increase as `pressure` on `issues/merge-attempts.jsonl` lines. Implements plan decisions D1–D8. Unit U1 of the plan; all code, schema and doc edits land here. No tests in this unit — criterion tests are U2 (next wave, separate worker).

## 2. Numbered acceptance criteria

1. `src/attempts.ts` exports `type PressureSnapshot = { cpu: number; memory: number; io: number; boot_id: string }` and `readPressure(dir: string = '/proc/pressure'): PressureSnapshot | undefined`. Absent dir returns `undefined`. Present dir: reads `cpu`, `memory`, `io` files, parses the integer after `total=` on the `some` line, and reads `boot_id` from `join(dir, '..', 'sys', 'kernel', 'random', 'boot_id')` — this resolves to `/proc/sys/kernel/random/boot_id` under the default. Any of those four files missing/unreadable, or a `some` line without an integer `total=`, throws `Error` naming the file path and the underlying read/parse failure. Sync reads (match `readState` style, `readFileSync`).
2. `src/state.ts` `batchSchema` gains `pressure_start: z.strictObject({ cpu, memory, io } as ints nonnegative + boot_id string).optional()`.
3. `src/attempts.ts` `attemptRecordSchema` gains `pressure: z.object({ cpu, memory, io } ints nonnegative).optional()`. `appendAttempt(repo, holder, batch, outcome, culprit?: string, end?: PressureSnapshot)`: writes `pressure` only when `batch.pressure_start` is defined AND `end` is defined AND `end.boot_id === batch.pressure_start.boot_id`; values are `end[r] - batch.pressure_start[r]`. No clamping — same boot id makes counters monotone; zod nonnegative is the backstop.
4. End reads are lazy: every end site reads only when `batch.pressure_start !== undefined`. Old batches never touch the reader, so criterion-2 behavior (no field, no error, no delay) holds by construction.
5. `src/next.ts` `mergeTurn`: inside the batch-creation `withLock` (~line 1055), after the holder/eligibility guards return, read `const start: PressureSnapshot | undefined = readPressure(pressureDir)` BEFORE `dropHeld`/`saveState`, and include `pressure_start: start` on the `next` Batch literal beside `started`. When `start` is `undefined` the field is simply `undefined` (zod optional drops it in saved YAML or leaves the key absent — verify the saved state.yaml carries no empty `pressure_start:` key; prefer spreading only when defined if writeYaml serializes undefined).
6. `src/next.ts` `reconcileBatch`: inside `withLock`, after the guard that returns on `batch === undefined`/`attempt` mismatch, before the `landed` computation, read `const end: PressureSnapshot | undefined = batch.pressure_start === undefined ? undefined : readPressure(pressureDir)` and pass it to both `appendAttempt` calls (merged path ~914/932 in the landed branch, and the `red` call ~951).
7. `src/phase.ts`: in `phaseCommand`'s merge block, the single end read sits inside the `else` after `if (check) await batchCheck(...)` — i.e. after the stale-attempt guard and the `--check` branch, before the `redOnBase`/`culprit`/`batchPush`/split/red sub-branches. Every `appendAttempt` in that block (`held` ~829, `ejected` ~886, `split` ~901, red via `transition` callback ~905, merged via `batchPush`) receives `end`. `batchCheck`/`--check` never reads.
8. `src/phase.ts` `batchPush` gains parameter `end: PressureSnapshot | undefined`; it uses that `end` for its `appendAttempt` and returns it on `BatchPending` (`{ kind: 'refused'|'error', ..., end }`) so `finishPush` (called after the push when verifying/fetching) passes the SAME snapshot to its `appendAttempt` — the end must be the read taken before the push. `pending` of kind `none` may carry `end` too or `finishPush` reads none — keep it simple, `end` on the union member is fine.
9. Parameter threading: `phaseCommand(..., pressureDir: string = '/proc/pressure')`, `batchPush`, `finishPush`, `nextCommand`, `mergePass`, `mergeTurn`, `reconcileBatch`, `mergeWake`, `unpausePass` each gain the trailing `pressureDir: string = '/proc/pressure'` parameter and forward it. `src/akrogon.ts` call sites are NOT changed (they use defaults).
10. Docs: `docs/guide/files.md` `## merge-attempts.jsonl` gets one bullet in the `Each line carries:` list: `` `pressure` holds cpu, memory and io stall in integer microseconds (the `some` `total=` increase over the attempt); it is absent when the batch predates this field, the host has no `/proc/pressure`, or the host rebooted mid-attempt.`` `docs/guide/state.md` batch description (~line 52) gains `pressure_start` naming it the boot id and counter snapshot taken at batch creation.

## 3. Read-first

- `src/attempts.ts` (whole, ~35 lines) — schema + `appendAttempt`.
- `src/state.ts` lines 42–62 — `batchSchema`.
- `src/next.ts` lines 865–980 (`reconcileBatch`), 1040–1085 (`mergeTurn` creation withLock), 1219–1240 (`mergePass`, `mergeWake`), ~1400 (`unpausePass`).
- `src/phase.ts` lines 395–440 (`batchCheck`, `BatchPending`, `batchPush` head), 430–510 (`batchPush` body), 715–760 (`finishPush`), 780–920 (`phaseCommand` merge block).
- `docs/guide/files.md` lines 55–80, `docs/guide/state.md` line ~52.
- Pattern to copy for the throw: `src/state.ts` `RepoMismatchError` / phase guard errors naming path + cause.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Files owned by this unit: `src/attempts.ts`, `src/state.ts`, `src/next.ts`, `src/phase.ts`, `docs/guide/files.md`, `docs/guide/state.md`.

Interfaces other units/tests will consume:

```ts
export type PressureSnapshot = { cpu: number; memory: number; io: number; boot_id: string };
export function readPressure(dir?: string): PressureSnapshot | undefined;
// appendAttempt signature: (repo, holder, batch, outcome, culprit?, end?: PressureSnapshot)
// Batch.pressure_start?: { cpu: number; memory: number; io: number; boot_id: string }
// line field: pressure?: { cpu: number; memory: number; io: number }
// phaseCommand/nextCommand/mergePass/mergeWake/unpausePass trailing param pressureDir = '/proc/pressure'
```

Must-land-first: nothing (first unit). Shared test resource: none.

## 5. Do-not, reasons and exceptions

- Do NOT add env vars, config keys, or CLI flags for the pressure dir — the brief forbids them; the interface is the function parameter. Exception: none.
- Do NOT read `full=` lines or avg10/avg60/avg300 — design excludes them. No `full` anywhere.
- Do NOT change any existing outcome, field or call-site behavior beyond the listed additions; no refactoring of `reconcileBatch`/`mergeTurn`/`phaseCommand` structure. Exception: none.
- Do NOT write tests — U2 owns them. Exception: none.
- Do NOT pass an `end` snapshot to `appendAttempt` for `--check` (`batchCheck`) — it is not an attempt end. Exception: none.
- Do NOT read pressure when `batch.pressure_start === undefined` — that is criterion 2. Exception: none.
- Do NOT swallow a read/parse error or fall back to omitting the field when files exist — present-but-bad must throw. Exception: none.
- Do NOT change `src/akrogon.ts` — defaults cover it. Exception: none.
- If any read site cannot be placed before state changes without restructuring, return a mismatch naming the site and the needed reorder rather than silently violating criterion 3. The exception is a revised brief from A authorizing it.
- If a signature listed above collides with real code (e.g. `appendAttempt` arg order), return a mismatch with the actual signature and smallest correction. Exception: revised brief from A.

Reasons restated: the env/config exclusion and lazy read are binding brief/design terms; the throw-on-bad rule is done-criterion 3; the no-test rule keeps waves disjoint; the mismatch return protects the plan's interface contract.

## 6. Ordered steps

Advisory size: 6 files, ~30 turns.

1. `src/attempts.ts` (criteria 1, 3): add `PressureSnapshot`, `readPressure`, `pressure` schema field, `end` parameter and diff logic.
2. `src/state.ts` (criterion 2): `pressure_start` on `batchSchema`.
3. `src/next.ts` (criteria 5, 6, 9): thread `pressureDir` through `reconcileBatch`/`mergeTurn`/`mergePass`/`mergeWake`/`unpausePass`/`nextCommand`; start read in `mergeTurn`; end read in `reconcileBatch`; pass `end` to the three `appendAttempt` sites.
4. `src/phase.ts` (criteria 7, 8, 9): thread `pressureDir`; end read after the `check` branch; `batchPush` param + `BatchPending.end`; `finishPush` uses it; pass `end` to the five append sites.
5. `docs/guide/files.md` + `docs/guide/state.md` (criterion 10): the two doc lines.
6. Run the section-7 command; also run `bun run typecheck` and report its output (typecheck errors here would block everything downstream).

Verify with a concrete scenario trace before returning: a green `phase hold merged` with `pressure_start` present writes `pressure` equal to end minus start; the same call on an old batch never calls `readPressure`; `phase hold check.fix` on a batch without `pressure_start` but a present dir writes no `pressure`.

## 7. Commands

`: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000` with `AKROGON_BASE=1d7d536100aebc183bd22f63b7c3ba31d5d07ea5`.

## 8. Done-when, evidence and report

All 10 criteria implemented; typecheck clean; changed-tests command run with result pasted (expect existing merge-attempt/phase/next tests still green — old batches carry no `pressure_start` so behavior is byte-identical). Commit as one commit on the worker branch ending with message `feat: record PSI stall on merge-attempt lines` or equivalent; no test files touched so no `Test-Change:` trailer needed.

For akrogon command work, scenarios use temporary repositories, real files/processes and herdr/gh replaced at one boundary, with no real panes, install roots, GitHub or herdr socket; tests need an observable contract or observed defect, not coverage or wording except literal commands, numbers and fixed references.

End the concrete brief with these four fill-in lines, accepting equivalent wording by content:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
