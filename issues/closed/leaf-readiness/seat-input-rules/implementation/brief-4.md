# Brief: U4 — skills/AREA.md invariant line

## 1. Goal

Update `skills/AREA.md` to name the new env invariant once. Plan decision D6.

## 2. Numbered acceptance criteria

1. In `## Non-obvious patterns`, the line starting "- Env-file rule is an invariant of every phase skill:" is replaced by one line naming the invariant: `.env`/`.env.*` are never opened, printed or written by a tool; presence is checked with the `Missing:` lines of `akrogon status <slug>` (absent or empty counts as missing); declared checks and live operations consume values through `bun --env-file=<holder file> <script>` printing results, never values.
2. No other line in the file changes. The file stays under its 40-line cap and keeps exactly its four `##` sections (Commands, Key files, Non-obvious patterns, See also).

## 3. Read-first list

- `skills/AREA.md` — the file under edit.
- `skills/implement-issue/ponytail.md` — style guidance only.

## 4. Change list and needed interfaces

Files owned: `skills/AREA.md` only. One line replaced.

## 5. Do-not, reasons and exceptions

- Do not write any file other than `skills/AREA.md`.
- Do not reword other invariant lines; only the env-file rule line is in scope.
- Do not keep the `present`/`absent` one-liner wording; it is removed by the locked design.
- Restating: return a mismatch with evidence to the plan author instead of changing scope; the exception is a revised brief authorizing it.

## 6. Ordered steps

1. Read `skills/AREA.md`.
2. Replace the env-file rule line per criterion 1.
3. Verify: `grep -n 'akrogon status' skills/AREA.md` shows the line; `wc -l skills/AREA.md` stays at or under 40.
4. Commit only this file, message e.g. `docs: update skills env invariant for seat-input rules`.

Advisory size: 1 file, under 6 turns.

## 7. Commands

`: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000` with `AKROGON_BASE=7c1567dbed492608e8cc104999c401b85d6db408`. Run `bun install` once first if `node_modules` is absent. A markdown-only diff may run zero tests; report that.

## 8. Done-when, evidence and report

Done when both criteria hold in the committed file.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
