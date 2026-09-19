# Brief 2: skill and human doc prose

Worktree: /home/ivan/Work/infra/akrogon/issues/worktrees/docs-impact-rule

## 1. Goal

Write the doc-impact rule into the four lifecycle skills and describe the init refusal in human docs. Plan decisions D5, D7, D8.

## 2. Acceptance criteria

1. `skills/plan-issue/SKILL.md`: the plan's checklist names every affected doc, agent and human, one line each, found from the grounding index, its linked AREA files and README; an unaffected-docs plan says so in one line. Edit the existing grounding paragraph (~line 25) and the synthesis paragraph (~line 55); one to three sentences total, no new sections.
2. `skills/implement-issue/SKILL.md`: line ~27 says implement updates every doc the plan names plus any doc the diff makes stale, before review; the existing AREA.md shape rule stays verbatim.
3. `skills/check-issue/SKILL.md`: lines ~33-35 revised so the reviewer starts from the changed behavior, opens the doc page describing it even when unchanged, files a Fix for a wrong claim or a path that does not exist, or writes one line that no documented behavior changed. The sentence "Open no area file outside that diff" is deleted. The AREA.md path check keeps its single-command form.
4. `skills/init-issues/SKILL.md`: lines ~56-60 and the Initialize-and-verify section say setup is not reported complete until a top index exists whose rows link to real paths, AREA files exist where one row is not enough, and the proposal's `grounding.index` names that index; `grounding: none` appears only when the operator chose it.
5. `README.md` "Initialize a repository", `docs/guide/setup.md`, `docs/guide/cheat.md`: each describes that init refuses a declared index that is not a readable non-empty file, and that a fresh repo needs an index or an explicit `grounding: none`. Fix the stale claim at `docs/guide/setup.md` line ~94 ("Its default grounding setting can be none").
6. `src/AREA.md`: add `src/init.ts` under Key files and one Non-obvious-pattern line for the refusal; keep the file at most 40 lines with exactly the four existing second-level sections.
7. `docs/reference-index.md`, `skills/AREA.md`, `tests/AREA.md`: verify rows still match; change only if a claim is now wrong.

## 3. Read-first

- The four SKILL.md files and the three human docs listed above
- `src/AREA.md`, `docs/reference-index.md`
- `skills/implement-issue/ponytail.md`
- Style: match the existing flat, terse prose; no new headings, no emoji, no semicolons.

## 4. Change list and needed interfaces

Prose edits only, in the files above. No code, no config, no new files or sections.

## 5. Do-not, reasons and exceptions

- Do not edit `chart-issues`, `merge-issue`, `seed-issue`, `broadcast-issue`, `watch-issues` or `plugin/`; the design excludes them.
- Do not add sections, files or config keys; the design forecloses them.
- Do not remove the AREA.md shape rule in implement-issue or the single-command path check in check-issue; both are locked.
- A conflict with these is a mismatch returned to B with evidence, not a scope change. Exception: a revised brief from B authorizing the change.

Reasons restated: the design locks scope and the kept sentences; only B may revise them.

## 6. Ordered steps

1. Edit the four SKILL.md files (criteria 1-4).
2. Edit README.md, docs/guide/setup.md, docs/guide/cheat.md (criterion 5).
3. Edit src/AREA.md and verify the other index/AREA rows (criteria 6, 7).
4. Run the changed-tests command; `tests/docs-links.test.ts` and `tests/command-reference.test.ts` cover README/guide links and command contracts.

Advisory size: about 8 files, under 32 turns.

## 7. Commands

```sh
: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"
```

with `AKROGON_BASE=f537143aeb0b126fb5d71a89120cb7c52eade382`.

## 8. Done-when, evidence and report

All criteria met, changed-tests output pasted, and the report lists each doc touched with the claim it now makes.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
