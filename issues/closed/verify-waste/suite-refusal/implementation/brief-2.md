# Sub-brief 2: skill and doc wording for the run-check refusal

## 1. Goal

Implement plan decisions D4–D5 of the suite-refusal leaf: the three seat skills name the `run-check` refusal of configured `merge_checks` and the rule that check.fix reproduces a red merge check with the narrowest failing command; the docs pages describe the refusal and the printed `akrogon verify --attempt <id>` merge_checks line.

## 2. Numbered acceptance criteria

1. skills/implement-issue/SKILL.md names, where check.fix merge reproduction is described (the `:82` paragraph and the `:67`/`:88` "run `merge_checks` only at merge" sentences), that `akrogon run-check` refuses a configured `merge_checks` command and that a red merge is reproduced with the narrowest failing command on run-check, never the whole merge suite.
2. skills/check-issue/SKILL.md `:69` (retry paragraph) and `:93` (runner list) name the same refusal and the narrowest-failing-command reproduction.
3. skills/merge-issue/SKILL.md names the refusal and the narrowest reproduction in its red-verify context (:79).
4. docs/reference/checks.md run-check section names the refusal; `merge_checks` row/section names `akrogon verify --attempt <id>` as the merge-turn route. docs/reference/config.md `merge_checks` row names the printed line. docs/reference/commands.md `run-check` row effect mentions the refusal (do not change the invocation cell).
5. Keep edits surgical: the skills are consumed verbatim by seats; match their terse style.

The planned test in tests/docs-links.test.ts ('seat skills name the run-check refusal and the narrowest merge reproduction') proves criteria 1–3 mechanically; human review covers docs accuracy. Do not edit tests.

## 3. Read-first list

- skills/implement-issue/SKILL.md (:40 retry paragraph, :67, :82, :84, :88), skills/merge-issue/SKILL.md (:45, :79), skills/check-issue/SKILL.md (:69, :93) — exact lines to amend.
- docs/reference/checks.md (:14-51), docs/reference/config.md (:61, :84), docs/reference/commands.md (:48) — the doc sites.
- tests/docs-links.test.ts:170-179 — the mechanical assertion your edits must satisfy.
- skills/implement-issue/ponytail.md.

## 4. Change list and needed interfaces

- Owns: the three SKILL.md files and the three docs pages named above. No shared test resource. No prerequisite units.
- Interface note for wording: `akrogon config` prints `akrogon verify --attempt <id>` for each `merge_checks` entry; run-check refuses the entry's text-as-words, `sh -c '<text>'`, and the printed `sh -c '<setupCommand(...,text)>'` form.

## 5. Do-not, reasons and exceptions

- Do not edit src/, tests/, or any other skill/doc file — outside this unit; sibling unit owns src/ and src/AREA.md.
- Do not rewrite surrounding skill paragraphs wholesale — minimal insertions naming the refusal and the narrowest-command rule; the skills are operator-locked prose reviewed for diff noise.
- Do not claim `akrogon verify --scope merge` exists — that route was dropped by operator amendment; the only merge-check runner is the merge turn (`akrogon verify --attempt <id>`).
- Restating: scope changes or wrong wording that no longer names the refusal/narrowest reproduction return a mismatch to A; the exception is a revised brief from A.

## 6. Ordered steps

1. Edit skills/implement-issue/SKILL.md (criterion 1).
2. Edit skills/check-issue/SKILL.md :69 and :93 (criterion 2).
3. Edit skills/merge-issue/SKILL.md (criterion 3).
4. Edit docs/reference/checks.md, docs/reference/config.md, docs/reference/commands.md (criterion 4).
5. Run the section-7 command.
Advisory size: ~6 files, under 25 turns.

## 7. Commands

- `bun test --timeout=30000 tests/docs-links.test.ts -t 'run-check refusal'`

## 8. Done-when, evidence and report

The section-7 command exits 0. Report cites the `check <label>: <exit> <path>` line from `akrogon run-check`; commit your changes on the worktree HEAD and return the commit ID.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
