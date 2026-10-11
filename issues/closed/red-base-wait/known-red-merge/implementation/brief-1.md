# Brief U1 — merge comparison machinery and green resolve

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/known-red-merge-u1` (detached at `d1515ea`). Leaf: `known-red-merge`. Plan decisions: D1, D2, D4, D7, D8, D9, D10, D12.

## 1. Goal

Land the comparison-record machinery: the `green` state, batch `comparisons`, the merge-turn binding in `validateComparisons`, `resolveGreen`, a shared `mergeRecords` helper, and `hasKnownRed` for the restack gate. Downstream seats wire these into `phase.ts`/`next.ts` in a later unit.

## 2. Numbered acceptance criteria

1. `comparisonSchema` accepts `state: 'green'` records that omit `retry` and `counterpart`; a green record carrying `retry` or `counterpart` parses (the fields remain on the schema; the binding gate below refuses a green record carrying `retry` — mirror the `new` retry refusal, which today only parses and is refused in validation) — implement it as follows: keep the schema permissive where `phase.ts` already refuses by validation, but `run.complete` on green must be `z.literal(true)`.
2. `batchSchema` in `src/state.ts` gains `comparisons: z.array(z.string()).optional()` on the batch record shape, preserving the existing `batchCheck` and `batchPush` invariants.
3. `validateComparisons` in `src/compare.ts` gains an optional `merge?: { attempt: string; built_on: string }` param. When set, per record it additionally refuses (fail-fast, naming the file and reason):
   - `record.attempt !== merge.attempt` → "bound to attempt <record.attempt>, expected <merge.attempt>" (missing attempt says so),
   - `record.leaf_revision !== head` → names expected vs recorded (exact text to match test assertions: "leaf_revision <a> does not match top <b>"),
   - `record.counterpart !== merge.built_on` → "counterpart <x> does not match built_on <y>",
   - no qualifying base-run line for `record.leaf` → "no completed matching base-run",
   - `record.run.complete !== true` → "leaf run is not complete" (tighten: this must now fire in the merge path too; today `run.complete` is only checked on red-state records in the join pass — move the check before the state dispatch so both paths share it),
   - a `known-red` unit whose `base` outcome is not `fail` → "is not red on the base run" naming the unit.
4. `resolveGreen(repo, file, record, landed)` is exported from `src/red-record.ts`: skips `record.state !== 'green'` (warn), warns on `landed !== record.leaf_revision` (message includes the two shas), otherwise calls `resolveFile` unchanged and returns the resolved unit names.
5. `hasKnownRed(repo, files)` is exported (from `src/red-record.ts` or `src/compare.ts`, your choice): parses each file, returns `true` when any `known-red` unit's verdict is `fail` on both the leaf and counterpart sides; unreadable files count as not-known-red (warn only). Reads `counterpart` when the merge context supplies it, else falls back to `run.base` — for the merge context pass files through a caller-supplied `built_on`; simplest correct shape: `hasKnownRed(repo, files, builtOn?)` where a record's counterpart side is `record.counterpart ?? builtOn ?? record.run.base` and each known-red unit needs `unit.leaf.outcome === 'fail' && unit.base.outcome === 'fail'`.
6. `mergeRecords` exported from `src/red-record.ts`: takes `(repo, file, records: ComparisonRecord[])` (type it after the real record type), runs `matchUnits` + `resolveFile` for each record with `resolved`/`newResolved` accumulation exactly as `recordComparisons` does today in `src/phase.ts` lines 140-146, and returns `{ resolved, newResolved, applied, byUnit }` (byUnit: record name → applied units for the red-record notice). `recordComparisons` in `src/phase.ts` is refactored to call it — that part is done by the phase wiring seat (U2), NOT you; you only export the helper.
7. `baseLines` in `src/base-run.ts` optionally filters on `run.attempt` when the match params carry one (`match.attempt?: string` → require `l.run.attempt === match.attempt`).
8. Green `run.complete: literal(true)` enforced at schema level — a green record with `run.complete: false` fails `comparisonSchema` parse.

## 3. Read-first list

- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- `src/red-record.ts` — `resolveFile`, `applyFile`, `matchUnits`, record schema. Copy its existing export style.
- `src/compare.ts` — `comparisonSchema`, `validateComparisons`, `findRecord`, `findUnit`, `baseLines` usage. Mirror the existing fail-fast refusal loop (lines ~120-155).
- `src/state.ts` — `batchSchema`, `batchCheck`, `batchPush`.
- `src/base-run.ts` — `baseLines` signature and line shape.
- `tests/merge-compare.test.ts` — the refusal wording the tests assert; your error strings must satisfy the `toContain` checks (read the `refuses` cases around lines 480-760).
- `src/phase.ts` lines 140-146 — the `matchUnits`/`resolveFile` accumulation pattern `mergeRecords` extracts. Do not edit `phase.ts`.

## 4. Change list and needed interfaces

- `src/state.ts`: `comparisons` field on `batchSchema` only.
- `src/red-record.ts`: export `resolveGreen`, `hasKnownRed`, `mergeRecords`. Green-state support lives in the schema in `compare.ts`; `resolveGreen` takes the already-parsed record.
- `src/compare.ts`: `green` on `comparisonSchema`; `merge` param + checks on `validateComparisons`; `run.complete` shared check placement; `run.attempt` match param passthrough to `baseLines`.
- `src/base-run.ts`: `attempt` filter on `baseLines`.
- Owned paths: the four files above only. Do not touch `src/phase.ts`, `src/next.ts`, `src/status.ts`, `src/hold.ts`, tests, docs, README, or `src/akrogon.ts`.
- Consumed output: none. Shared test resources: none; worker worktree runs the changed-test command only.

## 5. Do-not, reasons and exceptions

- No test edits — planned tests are A's; a red or wrong test returns a mismatch, because the worker must not rewrite proofs. Exception: none.
- No edits outside the four owned files, because U2/U3 own the wiring surface; exception: a revised brief from A.
- Keep refusal wording compatible with test `toContain` assertions; reason: tests assert specific substrings. Exception: the exact string may differ as long as each asserted substring appears verbatim (check each `expect(...).toContain` in the refusal cases).
- Return a mismatch with evidence to the plan author instead of changing scope or an interface; the exception is a revised brief from A authorizing that change.
- Reasons restated: scope isolation prevents conflicting picks; test assertions bind error wording; worker writes no test.

## 6. Ordered steps

1. `src/compare.ts` — add `green` variant to `comparisonSchema` (criteria 1, 8), add `merge` param + the five checks (criteria 3), hoist the `run.complete` check before the state dispatch.
2. `src/base-run.ts` — `attempt` filter (criterion 7).
3. `src/state.ts` — `comparisons` field (criterion 2).
4. `src/red-record.ts` — `resolveGreen`, `hasKnownRed`, `mergeRecords` (criteria 4, 5, 6).
5. `bun run typecheck`, then the section-7 command.

Advisory size: 4 files, ~25 turns.

## 7. Commands

```
AKROGON_BASE=2756bd07d31730f90ee539e1261299e2c481b66a akrogon run-check --name 'test_changed' -- sh -c 'akrogon guard ancestors && flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '"'"'bun install --frozen-lockfile'"'"' && akrogon guard own-modules && sh -c '"'"': "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000'"'"''
```

Planned tests for this unit stay red (the wiring is U2); `typecheck` must be clean and no previously-green test may go red from your diff.

## 8. Done-when, evidence and report

All criteria met, `bun run typecheck` clean, changed-test command run with results pasted, commit on the detached HEAD (message `feat: comparison machinery for merge turn` or better; commits change no existing test file so no `Test-Change:` trailer needed).

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
