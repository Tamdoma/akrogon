# Brief 3: docs for scratch copy removal

Worktree: /home/ivan/.akrogon/worktrees/akrogon/scratch-copy-removal-u3

## 1. Goal

Update `README.md` and `src/AREA.md` so the reconcile behavior they describe matches the landed rule: `verify-*`, `batch-*` and `<slug>-u<N>` copies in the worktree store are scratch, removed with `git worktree remove --force` by owner state (ended/dead verify owner, absent-or-dead batch owner record at `<copy>.owner`, merged owner leaf), kept while the owner lives, while a live pane or a surviving process sits inside, or while the pane list is unavailable.

## 2. Numbered acceptance criteria

1. `README.md`'s reconcile paragraph (the "Every `akrogon next` pass reconciles…" paragraph near line 121) names the scratch copies and the owner records without losing the existing `Kept:`-lines statement.
2. `src/AREA.md`'s `src/reconcile.ts` key-file line and `buildStack` non-obvious-patterns line describe the new removal rules and the owner record; the file keeps its four-section shape (Commands, Key files, Non-obvious patterns, See also) and stays at most 40 lines.
3. `tests/docs-links.test.ts` and `tests/command-reference.test.ts` stay green (you change no links or command contracts, but run the check).

## 3. Read-first list

- `README.md` around line 119-121.
- `src/AREA.md` — the `src/reconcile.ts` line under Key files and the `buildStack` line under Non-obvious patterns.
- `src/reconcile.ts` and `src/batch.ts` on this branch for the exact landed wording of the rules (worker copies, owner records, pane/process vetoes).
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Owned paths: `README.md`, `src/AREA.md`. Prerequisite: none — write against the plan contract above; the code is landing in parallel. Two short edits:

- `README.md`: extend the one reconcile paragraph to name scratch copies (`verify-*`, `batch-*`, `<slug>-u<N>`) removed by owner state, the `batch-<id>.owner` build record, and the pane/process keep vetoes. One or two sentences; no new sections.
- `src/AREA.md`: adjust the `src/reconcile.ts` bullet to mention scratch copies removed by owner state behind pane/process vetoes; adjust the `buildStack` bullet to mention it writes a `batch-<id>.owner` record before its copy. Keep every line terse.

## 5. Do-not, reasons and exceptions

- Do not touch `docs/guide/` — its cleanup lines stay accurate under this leaf (scratch copies are reconciler work).
- Do not restructure `src/AREA.md` or exceed its four-section 40-line shape — the file has a mechanical check.
- Do not document behavior the plan does not name (no slice stops, leaf temp or store-sweep items — those belong to other leaves).
- If the paragraph you find no longer matches this description, return a mismatch with the actual text.

Restated: two files, a few sentences; return a mismatch rather than rewriting structure.

## 6. Ordered steps

1. Read the three listed files plus `src/reconcile.ts`'s candidate loop for exact semantics.
2. Edit `README.md` and `src/AREA.md`.
3. Run `bun test --timeout=30000 tests/docs-links.test.ts tests/command-reference.test.ts`.

Advisory size: 2 files, under 8 turns.

## 7. Commands

- `bun test --timeout=30000 tests/docs-links.test.ts tests/command-reference.test.ts`

## 8. Done-when, evidence and report

Both files updated and the named tests green. Commit `README.md` and `src/AREA.md` in one commit on top of the checked-out HEAD with a one-line conventional message and report the commit id.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
