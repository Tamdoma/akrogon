# Sub-brief 1: shapes.md index seat block

## 1. Goal

`skills/chart-issues/assets/shapes.md` documents the optional `slots:` front matter block on `EPIC.md` and `ISSUE.md` index templates with the complete accepted shape, resolution order, and write-order rules. Plan decisions D1, D2, D3, D4, D6, D8. Proves leaf done-criterion 1.

## 2. Numbered acceptance criteria

1. Both index templates under "Handoff tree" (the `EPIC.md` template and the `ISSUE.md` template) show the optional front matter, verbatim shape:

   ```markdown
   ---
   slots:
     a: {harness: claude, model: opus, effort: high}
     b: {harness: codex, model: gpt-6.1-sol, effort: medium}
   ---
   # Epic: <epic>
   ```

   Marked optional in the prose or template; the existing list body stays.

2. A single adjacent paragraph states the complete accepted shape, matching the command's schema at `src/config.ts:12-21`: keys `a`/`b` only and each optional; each seat exactly `{harness, model, effort}`; every value nonblank after trim; no `'` or `"` character in the decoded value (so `model: 'opus'` decodes to `opus` and is fine — YAML delimiters are fine); no other key at any level, meaning a present front matter block on an index holds `slots:` and nothing else; `harness` names a template in the machine `config.yaml` `harnesses:` map.
3. The same or adjacent prose states the resolution order verbatim: `ISSUE.md`, then `EPIC.md`, then repo `issues/config.yaml`, then machine `config.yaml`; nearest set seat wins per seat; an issue inside an epic may carry its own block for its leaves.
4. The prose states the door writes the block into the chosen owner's index before any leaf `state.yaml` is written, and that `state.yaml` carries no seat field.
5. The sentence "Container indexes hold no lifecycle state or global order" is amended to permit the `slots` block as configuration (e.g. "...hold no lifecycle state or global order; their `slots:` front matter is seat configuration").
6. `grep -n restatement skills/chart-issues/assets/shapes.md` output is byte-identical before and after the edit (currently lines 126, 130, 138). The `seats.yaml` chart-record section stays verbatim — it is a different file, not the index front matter.

## 3. Read-first list

- `skills/chart-issues/assets/shapes.md` — sections "Handoff tree" and "Leaf files".
- `src/config.ts` lines 12-21 (schemas) and 83-148 (index resolution) — the rules the prose must match.
- `docs/guide/files.md` lines 19-31 — existing wording style for the same contract.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

- `skills/chart-issues/assets/shapes.md` — the only file this unit owns.
- Front matter detection is literal (`src/config.ts:84-88`): the file's first line must be `---`, closed by a later `---`. Mention this in the prose so a door agent places the block at the very top.
- No chunks must land first; no shared test resource; standalone unit.

## 5. Do-not, reasons and exceptions

- Do not edit `seats.yaml` section or any line containing "restatement": done-criterion 3 requires that grep output unchanged. No exception.
- Do not edit any file outside `skills/chart-issues/assets/shapes.md`: scope. No exception.
- Do not add tests or wording-assertions anywhere: per LESSONS 2026-10-01 the leaf's proof is presence of stated rules, not committed tests. No exception.
- Do not invent schema fields beyond harness/model/effort or soften the strict rules: the prose must describe what `src/config.ts` enforces. Return a mismatch if you find a discrepancy between this brief and the schema.
- Restated: changes stay inside shapes.md, restatement lines and seats.yaml prose untouched, no tests, strict schema only; the exception is a revised brief from A.

## 6. Ordered steps

1. Read shapes.md Handoff tree and surrounding paragraphs; read `src/config.ts:12-21,83-148`.
2. Record `grep -rn restatement skills/chart-issues` output to a scratch variable for comparison.
3. Edit the two index templates to show the optional front matter and add the shape/resolution/write-order prose per criteria 2-5.
4. Re-run the grep; compare identical.
5. Commit only shapes.md with a `docs:` style message.

Advisory size: 1 file, under 8 turns.

## 7. Commands

```sh
bun install --frozen-lockfile   # dependencies required before tests
: "1c3a1ca08e1039f0061be4b7cae6826c5226a81e" && bun test --changed="1c3a1ca08e1039f0061be4b7cae6826c5226a81e" --timeout=30000
```

The changed-test run may select no test files for a prose-only diff; report what it printed.

## 8. Done-when, evidence and report

All six acceptance criteria met; commit hash returned; restatement grep identical.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
