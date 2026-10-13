# Brief U7: docs for timings.jsonl

## 1. Goal

Document `issues/timings.jsonl` in the operator guide and index the new module (plan U7).

## 2. Acceptance criteria

1. `docs/guide/files.md` gains one `## timings.jsonl` section written in the same style as the existing `## merge-attempts.jsonl` section: what appends it, where it lives (`issues/timings.jsonl` beside `issues/log.jsonl`), one line per event kind naming its writer (`visit_start`, `prompt`, `seat_done`, `check_start`, `check_end`, `batch`, `wait`, `repo_pause`), and that a failed append warns on stderr and never changes the outcome. Keep it under ~15 lines of prose.
2. `src/AREA.md` gains one bullet under `## Key files`: `` `src/timing.ts` defines the timing-event schema and appends to `issues/timings.jsonl`; `readTimings` and `visitOf` are exported for the timing readout. `` — matching existing bullet style.
3. `tests/AREA.md` gains one bullet under `## Key files` for `tests/timing.test.ts`: checks the timing record end to end through real `next`/`phase`/`run-check` calls, worker and base scopes, wait dedup and the unwritable-file negative case.
4. No other files touched.

## 3. Read-first

- `docs/guide/files.md` — the `merge-attempts.jsonl` section is the style template.
- `src/AREA.md`, `tests/AREA.md` — bullet styles.
- `src/timing.ts` — the actual event shapes (source of truth for the doc).
- The brief `What` section in `<leaf>/brief.md` — event semantics.
- ponytail.md.

## 4. Change list and needed interfaces

Owns: `docs/guide/files.md`, `src/AREA.md`, `tests/AREA.md`. Prerequisite: none at edit time (doc text describes the landed design; `src/timing.ts` should exist on HEAD — if absent, mismatch).

## 5. Do-not, reasons and exceptions

- Do NOT document `log.jsonl` schema or timing-readout output — excluded by design. Reason: the reader belongs to a different leaf. Exception: none.
- Do NOT write or edit code or tests. Exception: none.
- Keep `src/AREA.md` under its 40-line cap with exactly the existing second-level sections. Reason: the skill's AREA rule. Exception: none.
- Return a mismatch with evidence instead of changing scope; the exception is a revised brief from A authorizing it.

## 6. Ordered steps

1. Add the `timings.jsonl` section to `docs/guide/files.md` after `merge-attempts.jsonl`.
2. Add the Key-files bullets in `src/AREA.md` and `tests/AREA.md`.
3. Run section 7 (docs-only diff; expected clean).

Advisory: 3 files, under 8 turns.

## 7. Commands

`AKROGON_BASE=df8868911100bf863224f71a51e70bb489d3b5d9 && bun test --changed="$AKROGON_BASE" --timeout=30000`

## 8. Done-when, evidence and report

Three doc edits in place, style matching neighbors. Commit message: `timing-events: document timings.jsonl`. `Test-Change:` trailer only if an existing test file changed (AREA.md files are not test-matched).

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
