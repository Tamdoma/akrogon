# Sub-brief 5: tests/AREA.md line for the isolation preload

## 1. Goal

One-line documentation of `tests/isolation.ts` and the `bunfig.toml` preload, per plan wave 3 and the AREA.md ≤40-line rule.

## 2. Numbered acceptance criteria

1. `tests/AREA.md` names `tests/isolation.ts`, the `[test] preload` in `bunfig.toml`, and the rule that suite processes must not write to the real HOME or `/var/tmp/akr-<uid>`/leave processes.
2. The file keeps the exact sections `Commands`, `Key files`, `Non-obvious patterns`, `See also` and stays ≤40 lines.
3. No other file changed.

## 3. Read-first list

- `tests/AREA.md` (current content; add under `Key files` or `Non-obvious patterns`, whichever fits the existing one-line style).
- `bunfig.toml` and `tests/isolation.ts` (the thing being documented).
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

- `tests/AREA.md`: one line, e.g. under `Key files`: `` `tests/isolation.ts` is the `bunfig.toml` preload: per-worker scratch HOME/leaf-temp, subreaper + descendant sweep so the suite never reaches real HOME or `/var/tmp/akr-<uid>` and leaves no process. `` — phrased to the file's existing terse style.
- Owned path: `tests/AREA.md` only.

## 5. Do-not, reasons and exceptions

- Do NOT edit any `.ts`/`.toml` — docs only. No exception.
- Do NOT exceed 40 lines or rename sections — the AREA contract. No exception.
- Reasons: the doc surface is one line; everything else is a test-owned file.
- Return a mismatch with evidence to A instead of changing scope or an interface; the exception is a revised brief from A authorizing that change.

## 6. Ordered steps

1. Read `tests/AREA.md`.
2. Add the line (criterion 1, 2).
3. Commit `tests/AREA.md` (a test-surface doc — include `Test-Change: tests/AREA.md preload line` in the trailer block since `src/test-files.ts` matches `tests/` paths).

Advisory size: 1 file, under 4 turns.

## 7. Commands

- `wc -l tests/AREA.md` (must be ≤40 after your line)

No test command.

## 8. Done-when, evidence and report

`tests/AREA.md` ≤40 lines with the isolation line; commit ID returned.

Report format:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
