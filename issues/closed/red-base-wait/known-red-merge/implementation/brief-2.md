# Brief U2 — merge-turn wiring and hold retirement

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/known-red-merge-u2` (detached at `d1515ea`). Leaf: `known-red-merge`. Plan decisions: D1, D3, D5, D6, D7, D9, D11, D12.

## 1. Goal

Retire the hold surface and wire the merge-turn known-red rule: `--compare` accepted on `merged --check` under the `merge` binding, `batch.comparisons` persisted, effects at `--check`, green resolve at landing, restack rerun gating, and retired verbs/flags failing with the pointer error. This unit assumes U1's exports (`green` schema, `merge` param, `resolveGreen`, `hasKnownRed`, `mergeRecords`, `comparisons` field); write against the signatures in section 4 — the cherry-pick lands after U1 and supplies them.

## 2. Numbered acceptance criteria

1. `merged --check --compare <file>` on a merge prompt validates records under the merge binding, stamps `tested_top`, persists accepted file paths on `batch.comparisons`, and prints `compared: N unit(s) pass under the same leaf code on batch base <built_on>`.
2. `merged --check` without `--compare` and `check.fix` without comparison paths leave `comparisons` absent.
3. `merged --check --compare` on `prompted` (solo) still fails `--compare is only valid on prompted`; on `merge` without `--check` and on `check.fix` still fails `not valid during merge`.
4. Effects at `--check`: each `known-red` unit fails the unit-set gate (rejection lines print `unresolved`/`still open` as today), then resolves/applies via the U1 machinery with `counterpart = batch.built_on`, `attempt = batch.attempt`, `retry = null`, and notices print `Repo red entry opened: <unit> in <file>` / `Existing repo red entry confirmed: ...` / `Repo red entry resolved: ...`.
5. Green records resolve at landing: in `batchPush` (direct land, `landed === leaf_revision` only), `finishPush`/`late-dirty` pending-refused path (`landed === leaf_revision` only), and `reconcileBatch` (same gate). An unreadable file or `landed !== leaf_revision` warns on stderr and resolves nothing.
6. Restack: `reuse` requires `hasKnownRed(repo, files, built_on)` false; when true print `rerun tested=<sha|none> pushed=<sha>` and drop `tested_top`. `batch.comparisons` is cleared (`undefined`/`[]` round-trips to absent) on every batch mutation: both restack paths, the dirty-member path, and `check.fix` batch replacement.
7. `unhold`, `hold-fix`, `--red-on-base`, `--command` fail with stderr containing `skills/merge-issue/SKILL.md` and the known-red-rule pointer; `unhold`/`hold-fix` fail with exit != 0 before any leaf lookup or lock (bare call in any directory works). Retired flags fail the same way whether or not a leaf exists.
8. `src/hold.ts` is deleted; `state.ts` holds no `heldSchema` or `heldPath` import; `phase.ts` has no `mergeHolder`, `writeHeld`, `pauseHeld`; `next.ts` has no `pauseHeld`/`mergeHolder`; `status.ts` prints no `held`; `merge-attempts` outcome enum keeps `'held'` in `src/attempts.ts`.
9. `findLeaf`'s `mergeHolder` parameter is removed; `phaseCommand` uses `st.mergeQueue` directly for the holder check (`st.mergeQueue[0]` instead of `mergeHolder(st)`); `next.ts` similarly.
10. `--red-on-base`/`--command` refusal happens before `findLeaf` (bare `akrogon phase x check.fix --red-on-base <sha> --command c` from a directory with no leaf exits != 0 naming the pointer — see `tests/hold-retired.test.ts` case `the retired merge flags fail naming the known-red rule and change nothing` which calls with and without a fixture); the simplest correct position is immediately after `parseArgs` in `phaseCommand`.
11. `--compare` value may repeat; reject a non-string; files are resolved relative to the caller cwd exactly like today.
12. `state.ts`: no `mergeHolder`/`writeHeld` exports remain; `mergeQueue` unchanged.

## 3. Read-first list

- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- `src/phase.ts` — full file; the hold paths, `--compare` gate, `batchCheck` signature, `restack`, `finishPush`, `reconcileBatch`, `recordComparisons`.
- `src/akrogon.ts` — dispatch of `unhold`/`hold-fix`, `findLeaf` call sites, `mergeHolder` import.
- `src/next.ts` — `pauseHeld`, `mergeHolder` call, `landed` block.
- `src/status.ts` — `heldPath`, `mergeHolder`, the `held` print.
- `src/state.ts` — `mergeHolder`, `writeHeld`, `heldPath`, `heldSchema` (note: U1 adds `comparisons`; coordinate by not editing `state.ts` except removing the hold exports and `heldSchema`/`heldPath` — if `comparisons` is absent when you start, leave it absent; U1's pick supplies it).
- `src/attempts.ts` — keep `'held'` in `OUTCOMES`.
- `tests/hold-retired.test.ts` — the retired-surface sweeps and pointer-text assertions (lines ~15-95).
- `tests/merge-compare.test.ts` — `--compare` happy path (lines ~200-430) and restack cases (~lines 900-1000).

## 4. Change list and needed interfaces

U1 supplies (assume these exist; if absent at your HEAD, implement to these signatures anyway — the pick order resolves it):

```ts
// src/compare.ts
export function validateComparisons(repo: string, files: string[], leaf: LeafInfo | undefined,
  scope: 'leaf' | 'merge', head: string, runBase: string, runLeafRev: string,
  merge?: { attempt: string; built_on: string }): Promise<ComparisonRecord[]>
// src/red-record.ts
export async function resolveGreen(repo: string, file: string, record: ComparisonRecord, landed: string): Promise<string[]>
export async function hasKnownRed(repo: string, files: string[], builtOn?: string): Promise<boolean>
export async function mergeRecords(repo: string, file: string, records: ComparisonRecord[]): Promise<...>
```

- `src/phase.ts`:
  - Remove `mergeHolder`, `writeHeld`, `pauseHeld`, `heldPath`, `openHold` imports/uses; `findLeaf(..., mergeQueue[0])`.
  - `phaseCommand` (top, after `parseArgs`): retired-flag check — `if ('redOnBase' in flags || 'command' in flags) throw retired pointer` where the message contains `skills/merge-issue/SKILL.md`. Do the same for `phase === 'unhold' || phase === 'hold-fix'` — actually those never reach `phaseCommand`; they are dispatched in `akrogon.ts` (see below).
  - The `'--compare' is only valid on prompted` / `'--compare' is not valid during merge` gates become: `compareFiles.length && !((prompted) || (merged && check))` → first error when `merged && !check`; keep the two message shapes the tests assert (`not valid during merge` must NOT appear on `merged --check`).
  - `batchCheck(repo, st, leaf, batch, head, compareFiles)` — add the param; after `transition` (and inside `withStateLock`), when `compareFiles.length`: `const records = await validateComparisons(repo, compareFiles, leaf, 'merge', head, batch.built_on, batch.built_on, { attempt: batch.attempt, built_on: batch.built_on })` (runBase/runLeafRev both `built_on` for merge); then for each record `file, record`: `mergeRecords(repo, file, [record])` replacing the old per-file `matchUnits`+`resolveFile` block, keep `applyFile(record)` for non-green, keep notices (`Repo red entry opened:` per unit, `Repo red entry resolved:` per name from the merged `resolved`), print the `compared:` line, persist `batch.comparisons = compareFiles.map(f => resolve(repo, f))` (absolute repo paths — check what the tests assert, `batch.comparisons` in state.yaml, they assert `toContain('compare-flaky.yaml')` style basenames, store the resolved absolute path). Save state.
  - Keep `batchCheck` without comparisons from writing `comparisons` (guard with `if (compareFiles.length)`).
  - `recordComparisons`: replace the per-record `matchUnits`/`resolveFile` loop with `mergeRecords`, keep notices identical.
  - `restack`: reuse gate `batch.comparisons?.length && (await hasKnownRed(repo, batch.comparisons, batch.built_on))` → rerun branch; clear `batch.comparisons` alongside `tested_top` everywhere `tested_top` is cleared (both restack arms, dirty-member path, `check.fix` batch replacement, late-dirty).
  - Green resolve at landing: one helper `await resolveGreenComparisons(repo, batch, landed)` calling `resolveGreen` per file under the `landed === leaf_revision` gate, with parse-failure warn; call it in `batchPush` (after push success where members move), the `finishPush`/pending-refused block, and `reconcileBatch`'s landed block.
  - `check.fix` batch replacement: drop `comparisons` (fresh object already lacks it — verify).
- `src/akrogon.ts`: `unhold`/`hold-fix` dispatch → `fail('<pointer error containing skills/merge-issue/SKILL.md>')` BEFORE `findLeaf`/lock (place before `parseArgs`/`findLeaf`, matching criterion 7); remove `mergeHolder` import; `findLeaf(..., st.mergeQueue[0])`.
- `src/state.ts`: delete `heldSchema`, `heldPath`, `mergeHolder`, `writeHeld`; keep `mergeQueue`.
- `src/next.ts`: remove `pauseHeld`/`mergeHolder`/hold logic; `reconcileBatch` call unchanged signature or add the green-resolve inside phase.ts's `reconcileBatch` (keep it there); `findLeaf` call sites drop the holder arg.
- `src/status.ts`: remove `heldPath` import and the `held` print.
- `src/attempts.ts`: keep `'held'`.
- `src/hold.ts`: `rm`.
- Owned paths: `src/phase.ts`, `src/akrogon.ts`, `src/next.ts`, `src/status.ts`, `src/state.ts`, `src/attempts.ts`, `src/hold.ts` (deletion). Not tests, docs, README, `src/compare.ts`, `src/red-record.ts`, `src/base-run.ts`.
- Chunks that must land first: U1 (compare/red-record/state/base-run). Shared test resources: none.

## 5. Do-not, reasons and exceptions

- No test edits — planned tests are A's; red or wrong tests return a mismatch. Reason: worker must not rewrite proofs. Exception: none.
- No edits outside owned paths. Reason: U3 owns docs/README/sweeps. Exception: revised brief.
- Keep `'held'` in the outcome enum and keep `held.yaml` parsing absent entirely (no read), because old journals must still parse and legacy held.yaml must be inert. Exception: none.
- The pointer error text must contain `skills/merge-issue/SKILL.md`; tests grep for it. Exception: the rest of the message is yours, keep it short.
- Return a mismatch with evidence rather than changing scope or an interface; the exception is a revised brief from A.
- Reasons restated: hold retirement is total (no inert remnant reads); pointer text is asserted; scope isolation prevents pick conflicts.

## 6. Ordered steps

1. `src/state.ts` — remove hold surface (criterion 12).
2. `src/akrogon.ts` — retired verbs + `mergeHolder` removal (criteria 7, 9).
3. `src/phase.ts` — retired flags, `--compare` gate, `batchCheck` param + validation + effects + persistence, `recordComparisons` → `mergeRecords`, restack gating + comparisons clearing, green-resolve helper + call sites (criteria 1-6, 10, 11).
4. `src/next.ts`, `src/status.ts` — hold removal (criterion 8).
5. `rm src/hold.ts` (criterion 8).
6. `bun run typecheck` — expect U1-absent errors only if the pick hasn't landed; report them.
7. Section-7 command.

Advisory size: 7 files, ~40 turns.

## 7. Commands

```
AKROGON_BASE=2756bd07d31730f90ee539e1261299e2c481b66a akrogon run-check --name 'test_changed' -- sh -c 'akrogon guard ancestors && flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '"'"'bun install --frozen-lockfile'"'"' && akrogon guard own-modules && sh -c '"'"': "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000'"'"''
```

`bun run typecheck` may fail on missing U1 exports if U1 hasn't landed — that's expected; note it in the report rather than stubbing.

## 8. Done-when, evidence and report

All criteria met, changed-test command run, commit on detached HEAD (`feat: wire merge comparisons and retire hold surface`); commits change no existing test file so no `Test-Change:` trailer needed.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
