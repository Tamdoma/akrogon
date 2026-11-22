# Brief 2: docs for cross-tree flips and the `patch_id` receipt field (U2)

## 1. Goal

Update the human reference docs and `src/AREA.md` so the flaky rule and the `verify-runs.jsonl` record describe the new behavior. Plan D8 is binding.

## 2. Acceptance criteria

1. `docs/reference/files.md`: the `verify-runs.jsonl` table row gains `patch_id` — recorded at run time, the `merge-base..sha` stable patch id of the verified commit's own diff, absent when the diff is empty, and a ledger holding it does not parse under an older akrogon (same sentence shape as the existing `failures` clause). The `## Flaky report` section describes both pair forms: same-tree red→green as today, and — for merge-scope runs — red on a leaf's merge run then green on that leaf's next merge run when the recorded `patch_id` matches and no base run or landed-main run failed the named unit between; nameless names (`(script)`, `(unnamed)`, `(no test name)`, `(log gone)`) count only same-tree.
2. `docs/reference/commands.md`: the `akrogon flaky` row is reworded off "same tree" to the same rule, one line, first column unchanged (`akrogon flaky` — `command-reference.test.ts` checks the table).
3. `docs/reference/checks.md`: the `akrogon flaky` paragraph near the end is reworded off "same tree" to the same rule.
4. `src/AREA.md`: the `src/verify.ts` bullet's sentence listing what the receipt rewrite writes gains `patch_id`; the `flaky`/main-red unit-matcher clause needs no change. `tests/AREA.md` groups test files and never names `flaky.test.ts` — no change.
5. `bunx prettier --check docs src` passes on the files you touched (repo runs prettier over `src`, `tests`, `skills/chart-issues/scripts` — keep Markdown tables/line style consistent; prettier's configured set does not include `docs`, so the check is `bunx prettier --check` on your edited files only).

## 3. Read-first list

- `docs/reference/files.md` — the `verify-runs.jsonl` row and `## Flaky report` section (copy the `failures` clause's sentence shape).
- `docs/reference/commands.md` — the `flaky` row in `## Inspect`.
- `docs/reference/checks.md` — the `akrogon flaky` paragraph.
- `src/AREA.md` — the `verify.ts` bullet (the long line beginning "`verify`'s pass appends its receipt" / the key-files entry).
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

- Owned paths: `docs/reference/files.md`, `docs/reference/commands.md`, `docs/reference/checks.md`, `src/AREA.md`. No code file, no test file.
- The rule the docs must state, verbatim facts: a flip is a verify command entry red then green; same-tree pairs count as today; for merge-scope runs (`scope: 'merge'`, never a `compares` base run), a red run and that leaf's next merge run pair across different trees when the red run's `patch_id` is set and equal to the green run's, and no completed run that failed the same named unit ended between them while either being a `compares` base run or a run whose sha is an ancestor of the tracked default branch; `(script) …`, `(unnamed)…`, `(no test name)` and `(log gone)` never count across trees.
- Shared test resource: none. Land first: nothing. Worker worktree creation commit: `11500af8` (filled by A at wave start).

## 5. Do-not, reasons and exceptions

- Do not edit any code or test file — docs only.
- Do not change the `akrogon flaky` command name, flags or output columns in docs — unchanged.
- Do not document internals beyond what the record states (no implementation pseudocode); keep the reference style.
- Do not run `git stash` in any form — all worktrees share one stash; set work aside with a WIP commit and, before returning, `git reset --soft 11500af8` and make the unit's returned commit once.
- Keep output via `akrogon run-check --name <label> -- <cmd>` and cite the printed `check <label>: <exit> <path>` line for any command whose output matters.
- Return a mismatch with evidence instead of changing scope; the exception is a revised brief from A authorizing that change.

## 6. Ordered steps

1. `docs/reference/files.md`: row + Flaky report section. Criteria 1.
2. `docs/reference/commands.md` row. Criterion 2.
3. `docs/reference/checks.md` paragraph. Criterion 3.
4. `src/AREA.md` verify.ts bullet. Criterion 4.
5. `bunx prettier --check <your edited files>` then one commit, message like `docs: flaky counts red-then-green across a rebase and records patch_id`.

Advisory size: about 4 files and under 16 turns.

## 7. Commands

- `bun install --frozen-lockfile --backend=copyfile` once first in your worktree.
- `akrogon run-check --name docs-format -- bunx prettier --check docs/reference/files.md docs/reference/commands.md docs/reference/checks.md src/AREA.md`

No test command applies to this unit.

## 8. Done-when, evidence and report

Done when all four files state the new rule, prettier is green on the edited files, and one commit exists on top of `11500af8` with its hash reported. Paste the `check <label>: <exit> <path>` line.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
