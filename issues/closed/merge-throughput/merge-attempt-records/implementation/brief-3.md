# Sub-brief 3: docs/guide/files.md merge-attempts.jsonl section

## 1. Goal

Document `issues/merge-attempts.jsonl` in `docs/guide/files.md` (done-criterion 6, plan D5). One new section describing the file and every field.

## 2. Acceptance criteria

1. `docs/guide/files.md` gains one section (heading level matching the page's existing `##` sections, placed after the artifact-list section and before the `sync:` section) describing `issues/merge-attempts.jsonl`.
2. The section states: one JSON line per merge attempt end, written by the command beside `issues/log.jsonl`; committed through `akrogon sync` like other issue records.
3. Every field is listed with a one-line meaning: `attempt` (batch attempt id), `repo` (registered repo name), `holder` (holder leaf slug), `members` (member slugs in order), `built_on` (remote tip the batch stacked on), `tested_top` (stack top the checks ran against), `outcome` (`merged`, `red`, `split`, `held`, `reuse`, `ejected`), `culprit` (optional, present only for `ejected`), `start` (batch creation time; absent on batches created before this field existed), `end` (attempt end time).
4. One line notes the outcome writers: `merged`/`red`/`split`/`reuse` are written now; `held` and `ejected` are written by other leaves of the merge-throughput work.
5. `issues/log.jsonl` and `issues/merge-attempts.jsonl` are described as separate files; the section adds nothing about log readers.
6. Page style stays consistent: plain markdown, same heading/link conventions, previous/next nav line untouched.

## 3. Read-first list

- `docs/guide/files.md` — the page you edit.
- `docs/guide/merge.md` — merge flow context for accurate wording.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Owns: `docs/guide/files.md` only. No code interface. Depends on unit 1 only for the final field set (already landed in your worktree's base commits); if the actual schema in `src/attempts.ts` differs from criterion 3, document the actual schema and note it in your report.

## 5. Do-not, reasons and exceptions

- Do not document `issues/log.jsonl` internals, other guide pages, or rename anything: criterion 6 names this file only, and log.jsonl must stay unchanged. Exception: none.
- Do not edit code or tests: other units own them. Exception: none.
- Return a mismatch with evidence instead of changing scope; the exception is a revised brief from A.

Reasons and exceptions restated: edit only `files.md` (scope and unchanged-log criterion, no exception); no code or test edits (ownership, no exception); mismatches go back to A (exception is a revised brief).

## 6. Ordered steps

1. Read `docs/guide/files.md` fully and `src/attempts.ts` for the exact schema (criteria 3–4).
2. Add the section in the right position (criteria 1–2, 5–6).
3. Verify every field name against `src/attempts.ts` (criterion 3).

Advisory size: 1 file, under 8 turns.

## 7. Commands

```sh
AKROGON_BASE=2e78945849eed87c42abd56f224909f4d2050b36 && bun test --changed="$AKROGON_BASE" --timeout=30000
```

(Docs-only change; if the changed-test runner selects nothing, paste its output.)

## 8. Done-when, evidence and report

Section added, all fields documented, commands run. Commit `docs/guide/files.md` with a `merge-attempt-records:` prefix message; return the commit ID.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
