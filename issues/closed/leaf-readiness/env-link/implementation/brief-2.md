# Sub-brief: env-link U2 — fixture and root .gitignore + AREA.md + stale init assertions

## 1. Goal

Implement plan decision D6 and the 2026-10-02 implementation note for leaf `env-link`: the shared test fixture repo ignores `.env`, the repo-root `.gitignore` gains a `.env` line, and `tests/init.test.ts` exact-content assertions are updated for the new fixture line. `src/AREA.md` gains one non-obvious-pattern line.

## 2. Numbered acceptance criteria

1. `tests/helpers.ts` `fixture()`: before `git add .`, write `resolve(root, '.gitignore')` containing `.env\n`, so the committed fixture repo ignores `.env`.
2. Worktree root `.gitignore` (the akrogon repo file at your worktree root) gains a `.env` line; `git check-ignore -q .env` exits 0 there.
3. `tests/init.test.ts` still passes: update only the exact `.gitignore` content assertions that are now stale — each becomes the fixture's `.env\n` plus the previously expected init-generated lines (fixture writes `.env\n` first, init appends below it). Change nothing else in that file.
4. `src/AREA.md` "Non-obvious patterns" gains exactly one line, e.g.: "A leaf worktree's `.env` is a symlink to the registered checkout's file; dispatch refuses a real file, tracked path, foreign link or missing ignore rule." Keep the file under 40 lines with its existing four sections.
5. `.env` values are never printed or read in tests; the fixture uses no `.env` content at all (only the ignore rule).

## 3. Read-first list

- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- `tests/helpers.ts` — `fixture()` writes `file`, then `git add .`, then commit; the `.gitignore` write goes with `file`.
- `tests/init.test.ts` — lines asserting `.gitignore` content (roughly lines 13, 28, 87 and the `rootCases` test.each near line 90); copy this pattern: assert exact file content after init.
- `src/AREA.md` — current "Non-obvious patterns" list style.
- `.gitignore` at your worktree root — current contents.

## 4. Change list and needed interfaces

- Owned paths: `.gitignore`, `tests/helpers.ts`, `src/AREA.md`, `tests/init.test.ts` (assertion updates only, per the plan's implementation note).
- No interfaces. Depends on no other unit; U3 depends on the fixture change.

## 5. Do-not, reasons and exceptions

- Do not edit `src/init.ts` — its ignore-list additions are unchanged; the fixture's `.env` line comes from the fixture file, not init. Reasons: locked design owns only the surfaces named here.
- Do not weaken or delete any `tests/init.test.ts` assertion — update the expected string so it reflects the fixture's committed `.gitignore` plus init's appends.
- Do not create `.env` files or read/write any `.env` content — only the ignore rule.
- Do not touch `tests/next.test.ts` — U3 owns it.
- If a needed change falls outside the owned paths, return a mismatch with evidence instead of expanding; the exception is a revised brief from A.

Reasons restated: init stays untouched by lock; assertions are updated, never weakened; no `.env` content exists in tests; owned paths are exact, and a mismatch goes back for a revised brief.

## 6. Ordered steps

Advisory size: 4 files, under 16 turns.

1. Read `tests/helpers.ts` `fixture()`; add the `.gitignore` write (`.env\n`) next to the `file` write, before `git add .` (criterion 1).
2. Append `.env` to your worktree root `.gitignore` (criterion 2); verify `git check-ignore -q .env` exits 0.
3. Read `tests/init.test.ts`; find every assertion of exact `.gitignore` content for a fixture-built repo; prepend `.env\n` to each expected string where the fixture now supplies it (criterion 3).
4. Add the one line to `src/AREA.md` (criterion 4).
5. Run the changed-tests command; `tests/init.test.ts` must be green.

## 7. Commands

`AKROGON_BASE=b2c15ec5d2fe889e158934b084dd93cfeafc9f72 bun test --changed="$AKROGON_BASE" --timeout=30000`

Run `bun install` first if `node_modules` is absent in your worktree. If `--changed` selects no files for your diff, also run `bun test tests/init.test.ts` once.

## 8. Done-when, evidence and report

All four files changed as specified; `tests/init.test.ts` green; you committed only your owned files on the detached worktree HEAD and return the commit id.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
