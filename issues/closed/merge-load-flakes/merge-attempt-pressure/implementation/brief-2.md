# Sub-brief 2: merge-attempt-pressure — criterion tests

## 1. Goal

Add the smallest test set proving the leaf's four behavioral done-criteria, in the existing `tests/merge-attempts.test.ts` only. Unit U2; U1's code already landed on the lane HEAD you build from (commit `b3d77fe`). Plan decisions D1–D8 are already implemented; verify them from the worktree source, do not redesign.

Done-criteria under test:

1. A merged, red, split, held, reuse and ejected attempt each append one line whose `pressure` holds cpu, memory and io stall increases as non-negative integers from batch creation; the restacked case (rerun then reuse) still carries start counters.
2. A batch without `pressure_start`, a host without the injected pressure dir, and an end boot id differing from the start one each append the line exactly as today with no `pressure` field, no refusal or delay.
3. A present-but-unreadable/malformed pressure file stops batch creation or the ending call before any push/state change, naming the path and error.

## 2. Numbered acceptance criteria

1. New cases run the real command paths via spawned scripts (the `tests/next.test.ts` ~line 1635 pattern): the test writes a `bun` script under `f.home` that imports `phaseCommand`/`nextCommand`/`mergePass` from `../src/phase.ts`/`../src/next.ts` (absolute resolved paths via `resolve(import.meta.dir, ...)`) and calls it with the injected pressure dir as the last argument. `phaseCommand` signature: `(slug, rawPhase, rawSlot, rawVerdict, rawReason, rawCheck, rawAttempt, rawRedOnBase, rawCommand, rawCulprit, pressureDir='/proc/pressure')`. `nextCommand(input, pressureDir)`. `mergePass(global, repo, invocation, isAutomatic, pressureDir)` where `global = readGlobal()` (import from `../src/config.ts`), `repo = readRepo('repo', f.root)`, `invocation = { skipped: new Set(), dispatched: new Set() }`. Spawn env must mirror `cli()`: `{ ...process.env, AKROGON_HOME: f.home, HERDR_PANE_ID: '', AKROGON_LEAF_TEMP_ROOT: leafTempRoot(f), ...herdr.env }`, cwd `f.root`. Wrap calls in try/catch: `catch (e) { console.error(e); process.exit(1); }` so the assertion sees stderr.
2. A `pressureDir(f)` helper builds `<home>/psi/proc/pressure/{cpu,memory,io}` (each with a `some avg10=0.00 avg60=0.00 avg300=0.00 total=<N>` line and a `full ...` line) and `<home>/psi/proc/sys/kernel/random/boot_id`. The injected dir is `<home>/psi/proc/pressure`; boot_id resolves at `dir/../sys/kernel/random/boot_id`. A `withStart(fixtureRecord, start, bootId)`-style helper returns the Batch with `pressure_start` set so `saveState` can store it.
3. Criterion 1 cases (each asserts `line.pressure` equals the exact `{cpu, memory, io}` deltas written into the fake dir between "start" values on the record and "end" values at call time — set start counters low, write higher `total=` in the fake dir, assert `pressure.cpu === endCpu - startCpu` etc., all non-negative integers):
   a. `merged` — `batchFixture(f, [...])` with `pressure_start` saved into the holder's batch, then `phaseCommand(hold, 'merged', 'B', undefined, undefined, true, 'a1', undefined, undefined, undefined, dir)` then the same without `check` (the --check run must not append; exactly one line after both).
   b. `reuse` — the existing refused-push-then-restack flow: `--check` first, `advanceRemote`, `phaseCommand` merged (refused → restack, stdout equivalent), then `phaseCommand` merged again → one `reuse` line with `pressure` spanning creation.
   c. `red` — `soloFixture` + `phaseCommand(hold, 'check.fix', 'B', undefined, undefined, undefined, 'a1', undefined, undefined, undefined, dir)` (or the unlanded `nextCommand` reconcile path; cover at least one).
   d. `split` — batchFixture + `check.fix` as the existing split test.
   e. `held` — batchFixture + `check.fix` with `redOnBase` = current `origin/main` sha and `cmd` set (copy the shape from `tests/hold.test.ts`).
   f. `ejected` — batchFixture 2 members + `check.fix` with `culprit` = a member slug (copy the shape from `tests/culprit.test.ts`).
   g. reconcile `merged` — the landed-candidate flow of the existing reconcile test but through `nextCommand(undefined, dir)` with `pressure_start` on the batch.
4. Criterion 2 cases: (a) batch with NO `pressure_start` merged via spawn with an injected dir present — line has no `pressure` key; (b) same but injected dir ABSENT and `pressure_start` present — no `pressure`; (c) `pressure_start` present, end `boot_id` in fake dir differs from start — no `pressure`. Each asserts exit 0 and the line is appended (no refusal, no delay). For (a) also inject a MALFORMED fake dir — proves lazy read never opens it (stronger form of "no error").
5. Criterion 3 cases: (a) ending call — `pressure_start` present, fake dir has `cpu` file with no `total=` (e.g. `some total=abc` or a file without a `some` line): `phaseCommand` merged exits non-zero, stderr names the file path ending in `/pressure/cpu` and an error, `issues/merge-attempts.jsonl` gains no line, holder `state.yaml` `batch` still present and unchanged, remote tip unchanged (no push). (b) creation — a merge-phase holder leaf with `merge_stamp`, no batch: spawn `mergePass` with a malformed fake dir; it exits non-zero naming the path; the holder's `state.yaml` still has no `batch` and no attempt line exists. If `mergePass` swallows the throw into a report instead of propagating (check `mergeTurn`/`report` behavior in `src/next.ts` — per-batch reconcile errors report, but the creation-path read throw propagates out of `mergeTurn` into `mergePass`/`nextCommand`), adapt to whatever propagates and assert the path is named; the no-batch/no-line outcome is the required half.
6. `attemptLines` schema parse already tolerates `pressure` (field added to `attemptRecordSchema`); assert with `expect(line.pressure).toEqual({cpu: X, memory: Y, io: Z})` and `expect(line).not.toHaveProperty('pressure')` for absent cases (check whether schema stripping or `not.toHaveProperty` is the right idiom — `z.object` strips unknowns, so for the absent case assert `line.pressure === undefined`).
7. Use `test.serial` for cases sharing fixture global state, matching the file's convention.

## 3. Read-first

- `tests/merge-attempts.test.ts` (whole file) — `batchFixture`, `soloFixture`, `advanceRemote`, `remoteTip`, `attemptLines`; extend in place.
- `tests/next.test.ts` ~line 1635–1670 — the `Bun.spawn` script-import pattern (writes script, spawns `[process.execPath, script]`).
- `tests/helpers.ts` — `cli`, `fixture`, `leaf`, `leafTempRoot`, `fakeHerdr` env keys.
- `tests/hold.test.ts` and `tests/culprit.test.ts` — the held and ejected invocation shapes.
- `src/attempts.ts` — `readPressure`, `PressureSnapshot`, `appendAttempt` signature (already implemented; read to confirm).
- `src/phase.ts` `phaseCommand` merge block + `src/next.ts` `mergeTurn`/`reconcileBatch` — verify read placement matches what the tests assert.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Owned path: `tests/merge-attempts.test.ts` only. Must land first: U1 (already on your base commit `b3d77fe`). Shared test resource: none beyond the repo's own tmpdir fixtures.

Interfaces (live on your base): `PressureSnapshot`/`readPressure` in `src/attempts.ts`; `Batch.pressure_start`; line field `pressure`; trailing `pressureDir` param on `phaseCommand`, `nextCommand`, `mergePass`, `mergeTurn`, `reconcileBatch`, `mergeWake`, `unpausePass`, `batchPush`, `finishPush`.

## 5. Do-not, reasons and exceptions

- Do NOT modify src files — this unit owns only the test file. If the code is actually broken for a criterion, return a mismatch naming the defect and the failing proof; do not patch src. Exception: revised brief from A.
- Do NOT add new test files — extend `merge-attempts.test.ts`. Exception: none.
- Do NOT change any existing test's assertions, fixtures or expectations. `batchFixture`/`soloFixture` may gain OPTIONAL parameters/fields (e.g. take `pressure_start` and write it into the record) — additive only, existing calls unchanged. Exception: none.
- Do NOT use env vars or config keys to inject the dir — function args only. Exception: none.
- Do NOT write tests that depend on the real `/proc/pressure` — everything through the injected dir. Exception: `readPressure` unit assertions about the real default are unnecessary; skip them.
- Do NOT assert on log wording/prose beyond path-and-error naming (the 2026-10-01 lesson: prefer refusal, reason and side-effect assertions). Exception: literal commands/paths/fixed references are allowed.
- Do NOT leave spawned scripts or helper files outside `f.home` (they die with the fixture anyway; keep them under it).
- Return a mismatch with evidence if a criterion cannot be proven through the listed interfaces. Exception: revised brief from A.

Reasons restated: single-owned-path keeps waves clean; no env injection and spawn-based invocation are the locked design's testability story; additive fixture changes protect existing expectations (the `Test-Change:` trailer names what was added); no-prose assertions follow the recorded lesson.

## 6. Ordered steps

Advisory size: 1 file, ~40 turns.

1. Read `src/attempts.ts`, `src/phase.ts` merge block, `src/next.ts` merge paths — confirm signatures and lazy read (criteria 3, 5 sanity).
2. Read `tests/hold.test.ts`/`tests/culprit.test.ts` for the held/ejected call shapes and `tests/next.test.ts` for the spawn pattern.
3. Add helpers (`pressureDir` writer, `spawnPhase`/`spawnNext` runner, `withPressureStart` record helper) at the top of `merge-attempts.test.ts`.
4. Write criterion-1 cases (step 3a–g). Red/green check: before finishing, break one thing deliberately (e.g. assert wrong delta) once to confirm a case actually goes red, then revert — one deliberate break for the new coverage.
5. Write criterion-2 cases.
6. Write criterion-3 cases.
7. Run the section-7 command plus the full file: `bun test tests/merge-attempts.test.ts --timeout=30000`. Paste results.

## 7. Commands

`: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000` with `AKROGON_BASE=1d7d536100aebc183bd22f63b7c3ba31d5d07ea5`, plus `bun test tests/merge-attempts.test.ts --timeout=30000`.

## 8. Done-when, evidence and report

Every criterion-1/2/3 case passes; the file's pre-existing tests unchanged and green; commands run with pasted results. One commit `test: PSI stall assertions on merge-attempt lines` ending with trailer:

`Test-Change: tests/merge-attempts.test.ts added PSI criterion cases; no existing expectation changed`

For akrogon command work, scenarios use temporary repositories, real files/processes and herdr/gh replaced at one boundary, with no real panes, install roots, GitHub or herdr socket; tests need an observable contract or observed defect, not coverage or wording except literal commands, numbers and fixed references.

End the concrete brief with these four fill-in lines, accepting equivalent wording by content:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
