# Sub-brief 3: chart.md operator guide sentence

## 1. Goal

`docs/guide/chart.md` mentions the handoff seat question in exactly one sentence. Plan decision D7. Proves the first half of leaf done-criterion 3.

## 2. Numbered acceptance criteria

1. `docs/guide/chart.md` gains exactly one new sentence mentioning the seat question: at handoff the door can ask about setting different execution seats (per issue or epic) when the work names model-sensitive work, e.g. naming a different model or harness for a leaf. One sentence, operator-facing tone matching the guide.
2. Placement: inside the "## Turn the answers into a buildable contract" section, near the handoff description.
3. No other change to this file; no other file touched.

## 3. Read-first list

- `docs/guide/chart.md` — the full guide for tone; the target section.
- `docs/guide/files.md` lines 19-31 — existing seat-override wording for terminology consistency (unchanged).
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

- `docs/guide/chart.md` — the only file this unit owns.
- No chunks must land first; no shared test resource; standalone unit.
- Terminology: the feature is a `slots:` front matter block on `ISSUE.md`/`EPIC.md` overriding a machine seat `{harness, model, effort}`; the guide calls these "seats".

## 5. Do-not, reasons and exceptions

- Do not edit any file outside `docs/guide/chart.md`: scope. No exception.
- Do not add more than one sentence about seats: done-criterion 3 says "mentions ... in one sentence". No exception.
- Do not document the schema or resolution order here: files.md already covers it; the guide sentence only notes the question exists. No exception.
- Do not add tests or wording-assertions. No exception.
- Restated: one sentence, one file, no schema detail; the exception is a revised brief from A.

## 6. Ordered steps

1. Read chart.md, pick the placement inside "Turn the answers into a buildable contract".
2. Add the single sentence.
3. Commit only chart.md with a `docs:` style message.

Advisory size: 1 file, under 5 turns.

## 7. Commands

```sh
bun install --frozen-lockfile   # dependencies required before tests
: "1c3a1ca08e1039f0061be4b7cae6826c5226a81e" && bun test --changed="1c3a1ca08e1039f0061be4b7cae6826c5226a81e" --timeout=30000
```

The changed-test run may select no test files for a prose-only diff; report what it printed.

## 8. Done-when, evidence and report

One sentence added in the named section; commit hash returned.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
