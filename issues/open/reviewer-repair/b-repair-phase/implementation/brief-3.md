# Brief 3: implement-issue input rule, watch seat list and guide docs (U3)

## 1. Goal

A's check.fix and the operator guide describe the new flow. A review fix goes to B in `check.repair`. B repairs most Fixes and either merges or hands the rest to A through `check.fix`. Only that handoff counts against `fix_rounds`. Plan decisions D8, D10.

## 2. Numbered acceptance criteria

1. `skills/implement-issue/SKILL.md` `## check.fix` gets one paragraph, placed after the existing "A repair requested from merge..." paragraph (about line 73). The newest entry in `review-B.md` decides A's input:
   - A `Handed to A` list from B's check.repair means A repairs only those items.
   - Red merge checks mean the failing output is the finding (the existing merge rule).
   - Otherwise A repairs every recorded Fix, as today. This covers a leaf already in `check.fix` before this change.

   Nothing else in implement-issue changes. The prompt line, description, footer and operator-actions sentence stay.
2. `skills/watch-issues/SKILL.md:34`, the seat list, adds `check.repair B` after the check.review entry.
3. `docs/guide/phases.md`:
   - The table gets a row `| check.repair | B | Repairs for most review findings. Hands the rest to A. |`. The `check.fix` row becomes repairs B handed to A, or red merge checks.
   - Line 17: fix sends the leaf to B's repair. Only a handoff to A counts against the configured repair-round limit.
   - The diagram shows `check.review --fix--> check.repair`, `check.repair --> merge`, `check.repair --handed to A--> check.fix --> check.review`, and `merge --red checks--> check.fix`.
   - Line 73: recovery keeps `fix_rounds`, so a leaf failed at the cap gets one more A repair and a B-only re-check. Keep that meaning and adjust words only if they become wrong.
   - Lines 101-105: B repairs most findings itself, each with a failing test first, then merges. It hands plan or design changes, missing units, required live runs and too-large work to A. B re-checks only A's repair diff. The cap counts handoffs to A.
4. `docs/guide/idea.md:42-44` table: add a row `check.repair  -  repairs` before `check.fix`. The `check.fix` row becomes `handed repairs` for A. Keep the column alignment. Also check line 48's sentence ("B checks repairs and merges"), and keep it true. For example: B repairs most fixes, checks A's repairs and merges.
5. `docs/guide/setup.md:58`: `fix_rounds` limits repair handoffs to A.
6. `docs/guide/cheat.md:122-123`: the check-issue row result says it reviews and repairs most findings (B). The implement-issue row stays.
7. Grep check: `rg -n "check\.fix|check\.repair" skills/implement-issue skills/watch-issues/SKILL.md docs/guide` shows no line saying a review fix goes straight to `check.fix`.

## 3. Read-first list

- `skills/implement-issue/SKILL.md:67-77`.
- `skills/watch-issues/SKILL.md:30-36`.
- `docs/guide/phases.md` (whole file).
- `docs/guide/idea.md:25-50`.
- `docs/guide/setup.md:50-62`.
- `docs/guide/cheat.md:115-126`.
- `/home/ivan/.claude/skills/implement-issue/ponytail.md`.

Pattern to copy: the existing table and diagram style in `docs/guide/phases.md`.

## 4. Change list and needed interfaces

- Files: `skills/implement-issue/SKILL.md`, `skills/watch-issues/SKILL.md`, `docs/guide/phases.md`, `docs/guide/idea.md`, `docs/guide/setup.md`, `docs/guide/cheat.md`.
- Literal interfaces:
  - Phase `check.repair` (owned by B, skill check-issue).
  - Heading `Handed to A` in `review-B.md`.
  - B's finishes `merge` or `check.fix`.
  - Only `check.repair -> check.fix` increments `fix_rounds`.
  - Merge red checks still go to `check.fix` uncounted.
- Owned paths: the six files above.
- Must land first: nothing.
- Shared test resource: none.

## 5. Do-not, reasons and exceptions

- Do not edit `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md`, `README.md`, `docs/guide/state.md`, `src/AREA.md` or `skills/AREA.md`. Another unit owns check-issue, and the plan marks the rest unaffected.
- Do not restate the operator-only rule. Implement-issue already points to it.
- Do not change `skills/watch-issues/scripts/observe.ts`. Unit 1 owns it.
- Keep edits minimal. Change only the lines whose meaning the new flow changes.

Reasons and exceptions: one definition per rule, disjoint ownership across parallel workers. If a needed change falls outside these files, return a mismatch with evidence. The exception is a revised brief from A.

## 6. Ordered steps

1. implement-issue paragraph (criterion 1).
2. watch-issues seat list (criterion 2).
3. phases.md (criterion 3).
4. idea.md, setup.md and cheat.md (criteria 4-6).
5. Run the grep (criterion 7), then commit with a message like `b-repair-phase u3: check.repair in implement-issue, watch-issues and guide`, with no co-author line.

Advisory size: 6 files, under 24 turns.

## 7. Commands

`rg -n "check\.fix|check\.repair|Handed to A|fix_rounds" skills/implement-issue skills/watch-issues/SKILL.md docs/guide`

There are no code tests for prose.

## 8. Done-when, evidence and report

Done when criteria 1-7 hold. Paste the `rg` output and the new diagram.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
