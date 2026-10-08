# Sub-brief 2: SKILL.md handoff seat question

## 1. Goal

`skills/chart-issues/SKILL.md` Handoff section gains the seat-question rule in the same sentence style as the `debate` election. Plan decision D5, D8. Proves leaf done-criterion 2.

## 2. Numbered acceptance criteria

One addition inside the first paragraph of "## Handoff" (the paragraph that already elects `debate`), stating all four elements in the same sentence style:

1. When it is asked: only at the handoff review, and only when the intake, map or a leaf design names model-sensitive work.
2. Its default: no block is written.
3. Where an answer goes: a `slots:` front matter block in the owner index (`ISSUE.md` or `EPIC.md`) of the operator's chosen scope, written before any leaf `state.yaml` (the shape is defined in shapes.md; reference it rather than repeating the schema).
4. The handoff review lists each leaf's effective seats.

## 3. Read-first list

- `skills/chart-issues/SKILL.md` — "## Handoff" first paragraph; note the `debate` election sentence to match its style.
- `skills/chart-issues/assets/shapes.md` — Handoff tree section (reference only, do not edit).
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

- `skills/chart-issues/SKILL.md` — the only file this unit owns.
- No chunks must land first; no shared test resource; standalone unit.

## 5. Do-not, reasons and exceptions

- Do not touch any line containing "restatement" (currently SKILL.md:51,53 — outside Handoff, but verify): done-criterion 3 requires `grep -rn restatement skills/chart-issues` output unchanged. No exception.
- Do not edit any file outside `skills/chart-issues/SKILL.md`: scope. No exception.
- Do not ask a new question per handoff or make seats unconditional: the locked design asks only for named model-sensitive work and forecloses asking on every handoff. No exception.
- Do not add tests or wording-assertions. No exception.
- Return a mismatch if the Handoff paragraph structure prevents a one-sentence-style addition. Restated: edits stay inside the SKILL.md Handoff paragraph, no restatement line changes, no unconditional seat question; the exception is a revised brief from A.

## 6. Ordered steps

1. Read the Handoff section; record `grep -rn restatement skills/chart-issues` output.
2. Add the seat-question clause/sentence beside the `debate` election in the first Handoff paragraph.
3. Re-run the grep; compare identical.
4. Commit only SKILL.md with a `docs:` style message.

Advisory size: 1 file, under 6 turns.

## 7. Commands

```sh
bun install --frozen-lockfile   # dependencies required before tests
: "1c3a1ca08e1039f0061be4b7cae6826c5226a81e" && bun test --changed="1c3a1ca08e1039f0061be4b7cae6826c5226a81e" --timeout=30000
```

The changed-test run may select no test files for a prose-only diff; report what it printed.

## 8. Done-when, evidence and report

All four elements present in the Handoff paragraph; commit hash returned; restatement grep identical.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
