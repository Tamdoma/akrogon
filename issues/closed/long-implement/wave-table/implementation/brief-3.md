# Brief 3: docs side (U3)

## 1. Goal
The skills index and operator guide describe the wave-grouped checklist and planned waves. Plan decisions D4, D5. Prose only.

## 2. Numbered acceptance criteria
1. `skills/AREA.md` line 21 says implementation mode selects inline work or bounded workers, and that delegated mode runs each plan wave whole, up to 3 independent units at once, each in its own worktree with results cherry-picked onto the lane. Keep one bullet, keep the file at most 40 lines and its four second-level sections unchanged.
2. `docs/guide/phases.md` line 77: "an ordered checklist" becomes a checklist grouped into waves, each unit listing the paths it owns, its shared test resources and the units that must land first. Rest of the paragraph unchanged.
3. `docs/guide/phases.md` line 87: the implement paragraph says A runs each plan wave whole, up to 3 independent workers at once, each in its own worktree with results cherry-picked onto the lane (inline work follows wave order). Keep the tests paragraph after it unchanged.
4. These lines agree with: plan waves hold units with disjoint owned paths, no shared test resource and no dependency on another member of the same wave, up to 3; a unit with an unmet prerequisite goes in a later wave. State only as much of that as each line needs.
5. "one at a time when unsure" appears nowhere in these two files. No new test (design: a wording test is a vanity test).

## 3. Read-first list
- `skills/AREA.md` line 21
- `docs/guide/phases.md` lines 75-90
- `skills/implement-issue/ponytail.md`
- Pattern to copy: the plain, short operator style of the surrounding guide paragraphs.

## 4. Change list and needed interfaces
Edit only the lines named, in `skills/AREA.md` and `docs/guide/phases.md`. Do not add links or files (the docs-links test must still pass).
Chunks that must land first: none. Paths this unit owns: `skills/AREA.md`, `docs/guide/phases.md`. Shared test resource: none. Consumed output: none.

## 5. Do-not, reasons and exceptions
- Do not edit any `skills/*/SKILL.md`, `worker-protocol.md` or `brief-template.md`. Other units own them. Exception: none.
- Do not add a clock, state field, size gate or count other than the cap of 3. The design locks wording-only. Exception: none.
- Do not edit other lines of `phases.md` or `AREA.md`. Exception: none.
- Return a mismatch with evidence instead of changing scope or an interface; the exception is a revised brief from A authorizing that change.
Reasons and exceptions restated: wording-only scope, two owned files, named lines only; only a brief from A can widen it.

## 6. Ordered steps
1. Read the three locations. (criteria 1-3)
2. Edit AREA.md:21. (criterion 1)
3. Edit phases.md:77 and :87. (criteria 2, 3)
4. `wc -l skills/AREA.md` is at most 40. (criterion 1)
5. Run the command in section 7. Advisory size: 2 files, under 10 turns.

## 7. Commands
Install dependencies in the worktree first (`bun install`). Then:
`AKROGON_BASE=2b796e98a2da6f914332e736974b93a0bc645715 bash -c 'bun test --changed="$AKROGON_BASE"'`
(a prose-only diff may run no tests; report that).
Commit only this chunk in your worktree and return the commit ID.

## 8. Done-when, evidence and report
Done when criteria 1-5 hold on a re-read and the command results are pasted.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
