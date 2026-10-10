# Plan: merge-attempt-pressure

Debate off (`debate: "no"`); synthesized directly from brief, locked design and live surfaces.

## Decisions

- D1: `readPressure(dir: string = '/proc/pressure'): PressureSnapshot | undefined` exported from `src/attempts.ts`. `PressureSnapshot = { cpu, memory, io, boot_id }` where the first three are the parsed `some total=` microseconds from `<dir>/<resource>` and `boot_id` is read from `join(dir, '..', 'sys', 'kernel', 'random', 'boot_id')` (resolves to `/proc/sys/kernel/random/boot_id` under the default, so the one parameter fakes both in tests). Sync reads, matching `readState` style.
- D2: Absence rule: `existsSync(dir)` false returns `undefined` — the no-PSI permitted state. A present dir makes `cpu`, `memory`, `io` and the `boot_id` file mandatory: any missing, unreadable or unparsable file throws an `Error` naming the file path and the underlying error. A `some` line with no integer `total=` is malformed and throws.
- D3: `state.ts` `batchSchema` gains `pressure_start: z.strictObject({ cpu: int nonnegative, memory: int nonnegative, io: int nonnegative, boot_id: z.string() }).optional()`. Written once at batch creation; every `...batch` spread in `mergeTurn` rebuilds and `restack` rebuilds already carries it, so rerun→reuse keeps start counters with no extra code.
- D4: `attemptRecordSchema` gains `pressure: z.object({ cpu: int nonnegative, memory: int nonnegative, io: int nonnegative }).optional()`. `appendAttempt(repo, holder, batch, outcome, culprit?, end?: PressureSnapshot)` writes `pressure` only when `batch.pressure_start` is defined, `end` is defined and `end.boot_id === batch.pressure_start.boot_id`; values are `end[r] - start[r]`. Same boot id makes counters monotone, so diffs are non-negative by construction and zod is the backstop — no clamp.
- D5: End reads are lazy: sites read only when `batch.pressure_start !== undefined`, so pre-change batches never touch `/proc/pressure` (criterion 2) and are immune to PSI errors (keeps criterion 3 scoped to new batches).
- D6: Injection is a trailing optional parameter `pressureDir: string = '/proc/pressure'` on `phaseCommand`, `batchPush`, `finishPush`, `nextCommand`, `mergePass`, `mergeTurn`, `reconcileBatch`, `mergeWake`, `unpausePass`. `src/akrogon.ts` call sites pass nothing. Tests inject through spawned `bun <script>` imports, the pattern already used in `tests/next.test.ts` (`const { nextCommand } = await import(...)` under `Bun.spawn`). No env var, no config key — as the brief requires.
- D7: Read points. `mergeTurn` creation: inside the batch `withLock`, after the holder/eligibility guards, before `dropHeld`/`saveState` — the throw stops creation before any mutation. `phaseCommand` merge block: one `end` read inside the `else` after `if (check) await batchCheck(...)`, before the `redOnBase`/`culprit`/`batchPush`/split/red sub-branches — so `--check` never reads and every ending reads before `git fetch`, `git push`, `saveState`, `writeHeld` or `restore*`. `batchPush` takes `end` and carries it on `BatchPending` for `finishPush`. `reconcileBatch`: one `end` read inside `withLock` after the attempt-mismatch guard return, before the `landed` branch — every appending path shares it.
- D8: A `reconcileBatch`/`mergeTurn` pressure error propagates to the per-batch `try/catch` in `mergeTurn` or the per-repo catch around `mergePass` and surfaces as a reported skip with exit 1; a `phaseCommand` error propagates to the CLI. Both stop before push/state change and name the path — matches how the command already surfaces per-batch failures.

## Read-first

- `src/attempts.ts` — `attemptRecordSchema`, `appendAttempt`.
- `src/state.ts` — `batchSchema` (line ~42).
- `src/next.ts` — `reconcileBatch` (~865), `mergeTurn` batch creation `withLock` (~1055, `started` set at ~1070), `mergePass` (~1219), `mergeWake` (~1233), `unpausePass` (~1404).
- `src/phase.ts` — `batchPush` (~438, `BatchPending` ~432), `finishPush` (~715), `phaseCommand` merge block (~800–910), `batchCheck` (~395).
- `tests/merge-attempts.test.ts` — `batchFixture`, `soloFixture`, `advanceRemote`, `attemptLines`.
- `tests/helpers.ts` — `cli`, `fixture`, `leaf`, `fakeHerdr`.
- `tests/next.test.ts` ~1635 — spawn-import pattern for injected parameters.
- `docs/guide/files.md` `## merge-attempts.jsonl`, `docs/guide/state.md` batch description (line ~52).
- `src/AREA.md` merge-turn and phase-move notes.

## Interfaces

- `export type PressureSnapshot = { cpu: number; memory: number; io: number; boot_id: string }` and `export function readPressure(dir?: string): PressureSnapshot | undefined` in `src/attempts.ts`.
- `Batch.pressure_start?: { cpu: number; memory: number; io: number; boot_id: string }`.
- Line field `pressure?: { cpu: number; memory: number; io: number }` (integer microseconds of `some` stall gained during the attempt).
- `appendAttempt(repo, holder, batch, outcome, culprit?, end?: PressureSnapshot)`.

## Waves

### Wave 1 — U1: command and schema changes

Owns `src/attempts.ts`, `src/state.ts`, `src/next.ts`, `src/phase.ts`, `docs/guide/files.md`, `docs/guide/state.md`. No shared test resource.

- `src/attempts.ts`: add `PressureSnapshot`, `readPressure` (D1, D2), `pressure` line field and diff logic in `appendAttempt` (D4).
- `src/state.ts`: `pressure_start` on `batchSchema` (D3).
- `src/next.ts`: thread `pressureDir` (D6); read start before batch creation (D7); read end in `reconcileBatch` (D7, D8).
- `src/phase.ts`: thread `pressureDir` (D6); single end read in the merge block (D7); `batchPush`/`BatchPending`/`finishPush` carry `end`.
- `docs/guide/files.md`: under `## merge-attempts.jsonl` add one bullet for `pressure` — integer microseconds of `some` PSI stall gained between batch creation and attempt end for cpu, memory and io; absent when the batch predates the field, the host had no `/proc/pressure`, or the host rebooted mid-attempt.
- `docs/guide/state.md`: extend the batch-field sentence with `pressure_start` (the boot id and counter snapshot taken at batch creation).

### Wave 2 — U2: criterion tests

Owns `tests/merge-attempts.test.ts` only. Depends on U1 (needs `readPressure`, `pressureDir` parameters, schema fields). Shared resource: the same fixture helpers as existing tests, no live external resource.

- Helper in the test file: `pressureDir(f)` creates `<home>/proc/pressure/{cpu,memory,io}` and `<home>/proc/sys/kernel/random/boot_id` matching the `dir/../sys/kernel/random/boot_id` layout, with caller-set `total=` values; helper `spawnPhase(f, script)` runs a generated `bun` script importing `phaseCommand`/`nextCommand`/`mergePass` with the injected dir and the fixture env (`AKROGON_HOME`, fake herdr `PATH`/`FAKE_HERDR`).
- Criterion 1 tests: extend `batchFixture`/`soloFixture` records with `pressure_start` and run merged push, red (`check.fix` solo), split, held (`--red-on-base`), ejected (`--culprit`), reuse-after-restack, and a `next` reconcile landing, each asserting `line.pressure` equals the fixture deltas as non-negative integers; the restack case asserts the diff spans creation (counters carried through `decision: 'rerun'` then `reuse`).
- Criterion 2 tests: batch without `pressure_start` asserts no `pressure` key and no read attempt (succeeds even with a malformed fake dir); injected dir absent → line without `pressure`; end `boot_id` ≠ start `boot_id` → line without `pressure`; each asserts the merge was not refused or delayed (exit 0, line appended as today).
- Criterion 3 tests: malformed `cpu` file (dir present) makes `phase merged` exit non-zero, stderr names the file path and read error, and `issues/merge-attempts.jsonl` gains no line and the batch record is unchanged; same assertion for the creation path via `mergePass` with a fake dir.

## Criterion-to-proof map

- C1 (each outcome appends `pressure` diffs): `bun test tests/merge-attempts.test.ts` — catches missing field, wrong diff arithmetic, or dropped `pressure_start` on restack. Size: minutes. Rerun: any edit to attempts/state/next/phase.
- C2 (permitted no-field states): same file — catches reading when `pressure_start` absent, treating absent PSI as error, or clamping on reboot. Size: minutes. Rerun: schema or read-condition edits.
- C3 (unreadable/malformed stops before irreversible): same file — catches silent skip, late read, or missing path in the error. Size: minutes. Rerun: read-site moves.
- C4 (docs + schema description): `bun test tests/docs-links.test.ts` plus manual line check — catches broken anchors; content verified in review. Size: seconds.
- C5: `bun run format`, `bun test --timeout=30000`, `bun run typecheck`, `bun test --changed=$AKROGON_BASE --timeout=30000` — the repo's blocking `checks`; `merge_checks` is empty, nothing added. Size: minutes.

## Doc checklist

- `docs/guide/files.md` — `pressure` bullet under `## merge-attempts.jsonl`.
- `docs/guide/state.md` — `pressure_start` in the batch record description.
- Agent skills/AREA files: none affected (no behavior surface change to planning/review skills; `src/AREA.md` describes commands, not record fields).

## Notes

- Counters are host-level (`/proc/pressure` is global), so stall is host-wide during the attempt window, matching the brief's intent for #69.
- Open limitation preserved: a malformed fake dir on a pre-change batch is never read (lazy read, D5); that keeps criterion 2 exact.
