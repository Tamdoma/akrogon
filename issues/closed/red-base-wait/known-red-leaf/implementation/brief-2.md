# Brief 2 — U2: phase wiring, status lines, README (wave 2)

Worktree: /home/ivan/.akrogon/worktrees/akrogon/known-red-leaf-u2

## 1. Goal

Wire the comparison record into `akrogon phase`: the repeatable `--compare <file>` flag, validation inside `transition`, red-record effects plus herdr notice on accepted moves, and the `akrogon status` active-entry lines. Plan decisions D1, D3, D5, D7.

## 2. Acceptance criteria

Every `tests/compare.test.ts` case passes and `tests/command-reference.test.ts` is green. In short: `--compare` accepted on any non-failed, non-merge move (repeated flag collects all files), refused otherwise; each criterion-2 refusal names its field/file; verdict/own-criterion refusal only toward `implement`/`check.review`/`merge`; `--check` validates without effects; `opened`+`notice` events and one `notification show` per new entry; dedupe silent; ancestor-rule resolves; entries in `status` on both slug and board views.

## 3. Read-first

- `src/akrogon.ts` :11-38 (options map — `multiple: true` on `compare`), :60-85 (phase dispatch adds `values.compare` as last `phaseCommand` arg).
- `src/phase.ts` :228-330 (`transition` signature + where validation goes, after the existing `require*` guards, before `if (checkOnly)`), :894-960 (`phaseCommand` signature + guards + `withLock`), :306-320 (`recorded`/`destination`/`commitMove` order — effects go after `saveState`/`commitMove`), :979-999 (hold-notice `herdrCall` shape to copy), :122-128 (`MoveCommittedError`).
- `src/compare.ts`, `src/red-record.ts` — landed wave-1 modules; use their exports exactly as written (`validateComparisons`, `applyComparison`, `resolveComparison`, `appendNotice`, `activeRed`, `RedEntry`, `Comparison`). If their signatures differ from this brief, follow the landed code and note it in the report.
- `src/status.ts` :336-357 (slug view — print red lines after the `held:` line), :380-400 (board repo block — print indented `  red: ...` lines after the repo header).
- `src/batch.ts` `isAncestor`, `src/shell.ts` `herdr`/`herdrError`.
- `tests/compare.test.ts` — the committed contract, read fully; `tests/helpers.ts` `leaf()`/`fakeHerdr`.
- `README.md` :134 (phase row), `src/AREA.md`.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

## 4. Change list and interfaces

Owns: `src/akrogon.ts`, `src/phase.ts`, `src/status.ts`, `README.md`, `src/AREA.md`. Prerequisite: U1 landed (compare.ts/red-record.ts exist on your HEAD — verify before starting; if absent, return a mismatch).

- `akrogon.ts`: add `compare: { type: 'string', multiple: true }` to the phase options; pass `values.compare` to `phaseCommand` as a new last parameter `rawCompare`.
- `phaseCommand`: parse `rawCompare` into `compareFiles: string[]` (trim, min 1, default []); inside the global lock after `findLeaf`, throw `'--compare' is not valid for a failed move` when `requested === 'failed'`, and `` `--compare` is not valid during merge `` when `leaf.state.phase === 'merge'`. Pass `compareFiles` to the non-batch `transition` call.
- `transition(..., compareFiles: string[] = [])` — keep existing callers working with the default. Validation: when `compareFiles.length > 0`, require `state.worktree` (throw `--compare requires a leaf worktree` otherwise), then `const comparisons = await validateComparisons(repo, leaf, state, slot, state.worktree, compareFiles, requested)` placed after `requireNonEmpty`, before `if (checkOnly)`.
- Effects, applied only on real moves (both the `recorded` path after `saveState` and the `commitMove` path after it returns), never on `--check`: for each validated `(file, comparison)` — `await resolveComparison(repo, file, comparison)` first, then `const opened = applyComparison(repo, file, comparison)`, then per opened entry send the notice and `appendNotice`:
  ```ts
  try {
    const shown = await herdrCall(
      ['notification', 'show', `${repo.name} red on base: ${entry.unit.name}`, '--body', entry.provenance.command.join(' '), '--sound', 'request'],
      z.object({ shown: z.boolean(), reason: z.string() }),
      leaf.state.slug,
    );
    appendNotice(repo, entry.id, shown);
  } catch (error) {
    appendNotice(repo, entry.id, { error: error instanceof Error ? error.message : String(error) });
    console.warn(JSON.stringify({ warning: 'red notice failed', slug: leaf.state.slug, error: ... }));
  }
  ```
- `status.ts`: one line per `activeRed(repo)` entry — `red: <unit.name> (<unit.runner> <unit.file>) <provenance.command joined by space> first-seen <first_seen> notice <shown|failed: <error>|pending>` — on the slug view after the `held:` line, and indented `  red: ...` on the board after each repo header line.
- `README.md` :134 row: insert `[--compare <file>]` after `[--attempt <id>]` in the `akrogon phase` invocation (must match `tests/command-reference.test.ts` contract), and extend the effect text with one clause: `--compare <file>` carries a comparison record validated on the move.
- `src/AREA.md`: add `src/compare.ts` and `src/red-record.ts` to Key files, one Non-obvious line (`phase` validates `--compare` records inside `transition`; red entries fold from `issues/red-records.jsonl`, updates re-read inside the global lock), keep ≤40 lines.

## 5. Do-not

- No new `withLock` — `phaseCommand` already holds `resolve(globalHome(), '.lock')` for the whole run; `red-record` functions must never take a lock (locked decision, deadlock).
- Do not edit `src/compare.ts`, `src/red-record.ts`, `src/base-run.ts` (U1's files) or any test or skill/doc besides `README.md`/`src/AREA.md` — return a mismatch if the landed interfaces contradict this brief.
- No edits to merge paths, batch code or the hold lines — `known-red-merge` owns them.
- Return a mismatch with evidence to the plan author instead of changing scope or an interface; the exception is a revised brief from A authorizing that change.

## 6. Ordered steps

1. Read the read-first files; verify `src/compare.ts` and `src/red-record.ts` exist on your HEAD.
2. `bun install` in your worktree.
3. Edit `akrogon.ts`, then `phase.ts`, then `status.ts`, then `README.md` and `src/AREA.md`.
4. `bun run typecheck` — clean.
5. Run the changed-test command below; every `tests/compare.test.ts` and `tests/command-reference.test.ts` case must pass. `tests/red-docs.test.ts` stays red (U3).
6. Commit as one commit `feat: carry comparison records on phase moves and show red entries` on the detached HEAD.

Advisory size: about 5 files, under 60 turns.

## 7. Commands

`: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000` with `AKROGON_BASE=64f27d0e3c4ae254a6aafd49ea393033dc677606` — green required for `compare.test.ts` and `command-reference.test.ts`; `red-docs.test.ts` failures persist (U3 owns them).

## 8. Done-when, evidence and report

Fill these lines:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
