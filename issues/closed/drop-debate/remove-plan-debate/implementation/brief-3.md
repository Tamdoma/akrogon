# Brief 3: human docs (U3)

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/remove-plan-debate-u3` (detached at the leaf head). Install first: `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile'`.

## 1. Goal

Plan decision D9: no current doc under `docs/` describes the lifecycle planning debate, the `debate` state field, the repo `rebuttal` setting, or the `plan.positions`/`plan.rebuttal` phases as an available option. Leaf planning is one pass: seat A writes `plan.md` at `plan.synthesis` from the brief and design. The chart door's route choice is lifecycle or direct. Docs and pictures of the chart-level consultant rebuttal stay unchanged.

## 2. Numbered acceptance criteria

1. `docs/reference/state-and-phases.md`: the picture alt text (line 5) describes phases starting at `plan.synthesis`; the `plan.positions` and `plan.rebuttal` table rows go; the three bullets on `debate` start phase, the `rebuttal` move rule and the `next` debate refusal (lines 24-26) go; the sample `debate: 'no'` line (71) and the `debate` field row (82) go.
2. `docs/reference/config.md`: the `rebuttal` row (56) and sample line (78) go.
3. `docs/reference/skills.md` (23, 25): plan-issue result is "seat A writes `plan.md` from the brief and design"; it is started by the command dispatching seat A for `plan.synthesis`.
4. `docs/reference/files.md` (53-54): the `positions-*.md` and `rebuttal-*.md` rows go.
5. `docs/reference/limits.md` (22): no debate pick at the handoff review.
6. `docs/use/plan-work.md`: the handoff review description names no debate choice (check line 46 and nearby).
7. `docs/use/quick-fix.md` (28-29): route options read lifecycle and direct.
8. `docs/use/write-issues-by-hand.md`: both samples (41, 72) have no `debate` line; bullet 48 says a leaf starts at `plan.synthesis`, where seat A writes the plan.
9. `docs/start/one-change.md` (27, 37): no debate wording; the leaf starts at `plan.synthesis`.
10. `docs/examples/autopilot-story.md` (20, 32): no debate wording.
11. `docs/use/a-working-day.md` `## The usual day` step 5: seat A plans the leaf, A builds it, they review it (no "Seat A and seat B plan it").
12. `docs/pictures/phases.svg` (hand-edited SVG, no generator): the `plan.positions` and `plan.rebuttal` boxes, their arrows, "rebuttal on"/"rebuttal off" labels and "debate off starts here" go; the chart starts at `plan.synthesis` and stays valid, readable SVG with consistent spacing (shift or resize elements and the viewBox as needed; check it is well-formed with `xmllint --noout` if installed, and render it with `rsvg-convert` if installed, viewing the PNG under `$TMPDIR`; report which checks you could run).
13. `docs/use/roll-back-a-release.md`: one added note (place it where rollback data or the manual path is described): records created or saved without `debate` need `debate: 'no'` restored before the previous release can load them.
14. `grep -rniE "debate|plan\.positions|plan\.rebuttal|positions-|rebuttal" docs README.md` shows only the charting-rebuttal hits in `docs/pictures/chart-door.svg` and `docs/examples/quick-fix-story.md`, plus the new rollback note.

## 3. Read-first list

- `/home/ivan/.claude/skills/implement-issue/ponytail.md`
- Each file above. `docs/reference/where-things-go.md` for where facts live (state each fact once).

## 4. Change list and needed interfaces

Owned paths: the 13 files above under `docs/`. No prerequisite units. No shared test resource. Plain, short sentences matching each doc's existing style; tables keep their column alignment (prettier-style padding is not checked for Markdown, but keep tables valid).

## 5. Do-not, reasons and exceptions

- Do not edit `docs/pictures/chart-door.svg`, `docs/examples/quick-fix-story.md` or `docs/pictures/working-day.svg` (charting rebuttal stays; "the seats plan" names no debate).
- Do not edit `skills/`, `src/`, tests, `issues/` or `learnings/` (other units, locked tests, history).
- Do not add docs or sections beyond the rollback note (scope is removal plus that one note).
- Return a mismatch with evidence instead of changing scope; exception: a revised brief from A.

Reasons restated: operator kept the charting debate; other paths are owned elsewhere; scope is removal plus one note.

## 6. Ordered steps

Criteria 1-13 in order, then 14, then section 7, then commit once: `docs: drop the lifecycle planning debate` (no co-author line).

Advisory size: 13 files, under 50 turns.

## 7. Commands

- `akrogon run-check --name u3-docs-tests -- bun test tests/docs-links.test.ts tests/command-reference.test.ts tests/hold-retired.test.ts --timeout=30000`

## 8. Done-when, evidence and report

Done when criteria 1-14 hold and the section 7 command exits 0. Keep output only through `akrogon run-check` and cite each `check <label>: <exit> <path>` line. Return the commit id, the criterion 14 grep result, and how you checked the SVG.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
