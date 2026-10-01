# Brief 1: plan side (U1)

## 1. Goal
Plan synthesis writes a wave-grouped checklist. Plan decisions D1, D2, D3, D4. Prose only.

## 2. Numbered acceptance criteria
1. `skills/plan-issue/SKILL.md` plan.synthesis (line 55) states: the checklist is grouped into waves; each unit lists the paths it owns, any shared test resource it uses (a live fixture, account or test site counts) and the units that must land first; units with disjoint owned paths, no shared test resource and no dependency on another member of the same wave share a wave, up to 3 per wave; a unit whose prerequisite is in an earlier wave goes in a later wave; units needing the same landed prerequisite can share that later wave.
2. The rest of line 55 is unchanged, including the sentence "The checklist names every affected agent and human doc one line each, or states in one line that no doc is affected."
3. No new test (design: a wording test is a vanity test).

## 3. Read-first list
- `skills/plan-issue/SKILL.md` line 55 (the plan.synthesis paragraph)
- `skills/implement-issue/ponytail.md`
- Pattern to copy: the dense one-paragraph style of the neighbouring plan.synthesis paragraphs.

## 4. Change list and needed interfaces
Edit only `skills/plan-issue/SKILL.md`, line 55: replace the clause "ordered file/criterion checklist" with a checklist grouped into waves as in criterion 1. Keep it tight, no new headings or lists.
Chunks that must land first: none. Paths this unit owns: `skills/plan-issue/SKILL.md`. Shared test resource: none. Consumed output: none.

## 5. Do-not, reasons and exceptions
- Do not touch any other file. Other units own the implement-issue skill files and the docs. Exception: none.
- Do not add a clock, a state field, a size gate or any count besides the cap of 3. The design locks wording-only. Exception: none.
- Do not weaken or reword the other sentences of line 55 or add other plan.synthesis rules. Exception: none.
- Return a mismatch with evidence instead of changing scope or an interface; the exception is a revised brief from A authorizing that change.
Reasons and exceptions restated: wording-only scope, one owned file, nothing else; only a brief from A can widen it.

## 6. Ordered steps
1. Read line 55. (criterion 1)
2. Edit the clause. (criteria 1, 2)
3. Run the command in section 7. Advisory size: 1 file, under 6 turns.

## 7. Commands
Install dependencies in the worktree first (`bun install`). Then:
`AKROGON_BASE=2b796e98a2da6f914332e736974b93a0bc645715 bash -c 'bun test --changed="$AKROGON_BASE"'`
(a prose-only diff may run no tests; report that).
Commit only this chunk in your worktree and return the commit ID.

## 8. Done-when, evidence and report
Done when criteria 1 and 2 hold on a re-read of line 55 and the command result is pasted.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
