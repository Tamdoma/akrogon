# Brief 4: docs — README command row, AREA files, command-reference contract

## 1. Goal

Plan D9. Document the new `akrogon base-run` verb in the command table and area files, and register its argument contract so `tests/command-reference.test.ts` stays green.

## 2. Acceptance criteria

1. `README.md` command table gains exactly one row: `| \`akrogon base-run --base <sha> [--attempt <id>] [--cwd <rel>] -- <argv>...\` | <one-sentence effect naming: base checkout in the worktree store, constructed env, log into the leaf, record line, cleanup> |` placed with the other run/guard commands near the table end.
2. `tests/command-reference.test.ts` `contracts` gains `'base-run': '--base <sha> [--attempt <id>] [--cwd <rel>] -- <argv>...'` and its README-coverage test passes.
3. `src/AREA.md`: one Commands bullet for `bun src/akrogon.ts base-run --base <sha> -- <argv>...`, one Non-obvious pattern line covering the record-before-checkout/rewrite-under-lock behavior, and `src/base-run.ts` added under Key files. Keep the file under its 40-line cap and the exact section headings (Commands, Key files, Non-obvious patterns, See also).
4. `tests/AREA.md`: `tests/base-run.test.ts` added under Key files.
5. `bun run typecheck`, `bun test tests/command-reference.test.ts tests/docs-links.test.ts` pass.
6. The commit touching `tests/command-reference.test.ts` ends its message with a `Test-Change: tests/command-reference.test.ts <source and reason>` trailer in the final trailer block, naming that a contracts entry was added for the new verb and that no existing expectation changed (no source citation needed per the added-case rule).

## 3. Read-first

- `README.md` command table (~:128-148) and `tests/command-reference.test.ts` `contracts` (~:10-29).
- `src/AREA.md`, `tests/AREA.md` whole files.
- `skills/implement-issue/ponytail.md`.

## 4. Change list

Owns: `README.md`, `src/AREA.md`, `tests/AREA.md`, `tests/command-reference.test.ts` (contracts entry only — this is the registered harness entry for the new verb, not a test expectation change). Wave 3, parallel with brief 3. No shared test resource.

## 5. Do-not

- Do not edit anything else in `command-reference.test.ts` — the added-contract exception covers exactly the one `contracts` entry.
- Do not edit `docs/guide/*` — the guide describes behavior, not the hand-made mechanics this leaf removes.
- Do not change wording of existing table rows or AREA lines.
- A test expectation that looks wrong is a mismatch to A, never a broader test edit.
Restated: four files, additive lines only, one trailer'd commit touching the test file; anything else returns as a mismatch.

## 6. Ordered steps

1. Add README row + contracts entry (criteria 1, 2).
2. Update `src/AREA.md` and `tests/AREA.md` (criteria 3, 4 — count AREA.md lines after editing; trim an existing bullet rather than exceed the cap if needed).
3. Run section 7. Commit with the Test-Change trailer on the commit touching the test file.

Advisory size: 4 files, under 12 turns.

## 7. Commands

```sh
bun test tests/command-reference.test.ts tests/docs-links.test.ts --timeout=30000
bun run typecheck
```

## 8. Done-when, evidence and report

Rows and AREA lines added, contracts entry in place, named tests green, commit on the detached HEAD with the required trailer. Report commit id.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
