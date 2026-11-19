# Brief 6: lessons Removal outcome and docs (U6)

## 1. Goal

Give a lesson "this check refused valid work" a way out of the stock: lesson-rule Seed files it as a removal, and learn-issues gets a fifth Sort outcome, Removal. Update every doc that restates the Sort outcomes. Plan decisions D2, D9, D10. Design item W8.

## 2. Acceptance criteria

1. `skills/lesson-rule.md` Seed bullet: a judgment lesson whose mechanism is a check, gate or stop that refused valid work gets `/seed-issue` run as a removal naming that check; other judgment lessons still file nothing.
2. `skills/learn-issues/SKILL.md`:
   - Sort gains **Removal**: the mechanism is a check, gate or stop that refused valid work and is still reachable. Place it so Stays stays the default. Checkable and Transfer text is unchanged.
   - Apply gains Removal: print one runnable `/seed-issue` line naming the check to remove; the operator decides whether to run it; file nothing.
   - The front-matter description names the outcome (stopped, checkable, removal, transfer or stays) and says removal gets a printed seed line.
   - The footer keeps its form; removal seed lines count inside "printed <n> seed lines" (D10). Do not change the footer.
3. `skills/AREA.md` learn-issues Key files line names removal. AREA.md stays at most 40 lines with exactly the sections Commands, Key files, Non-obvious patterns, See also.
4. `docs/reference/skills.md`: line 79 (learn-issues Result) names removal and what happens to it; line 53 (seed-issue "Who starts it") also covers a seat that writes a removal lesson.
5. `docs/use/learn-from-work.md`: the image alt text on line 5 lists removal; the outcome list near line 41 gains a **Removal.** bullet in the doc's plain style. `docs/pictures/lessons-flow.svg` is not edited (A reports it as a stale picture).
6. `bun test tests/docs-links.test.ts tests/chart-shapes.test.ts` stays green; the test "lesson write sites link the shared lesson rule" depends on existing `[lesson rule](lesson-rule.md)` links staying.

## 3. Read-first

- skills/lesson-rule.md, skills/learn-issues/SKILL.md, skills/AREA.md, docs/reference/skills.md (lines 45-82), docs/use/learn-from-work.md.
- Design /home/ivan/Work/infra/akrogon/issues/open/model-choice-rule/model-choice-rule/design.md, sections "lessons" and "Final shape" W8.
- /home/ivan/.claude/skills/implement-issue/ponytail.md.

## 4. Change list

- Owns `skills/lesson-rule.md`, `skills/learn-issues/SKILL.md`, `skills/AREA.md`, `docs/reference/skills.md`, `docs/use/learn-from-work.md`. Needs nothing landed first. No shared test resource.
- Interface: the outcome name is `Removal` (capitalised as the other outcomes are in each file).

## 5. Do-not

- Do not widen Transfer or add any cross-repo transfer: the design rejected it.
- Do not reuse Checkable for this case: the design picked a separate outcome.
- Do not edit `learnings/`, the SVG, or any file outside the five owned: other units own them, and the SVG is a reported limitation. Exception: a revised brief from A.
- Do not add or edit tests: tests are locked.
- Return a mismatch with quotes if a requirement conflicts with existing text.
Reasons and exceptions restated: Transfer and Checkable stay as designed; scope is five files (exception: revised brief); tests are locked.

## 6. Steps

1. Edit lesson-rule.md Seed (criterion 1).
2. Edit learn-issues SKILL.md description, Sort, Apply (criterion 2).
3. Edit AREA.md, docs/reference/skills.md, docs/use/learn-from-work.md (criteria 3-5). Check AREA.md line count with `wc -l`.
4. Run section 7. Commit.

Advisory size: 5 files, under 20 turns.

## 7. Commands

First, in your worktree: `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'`.
Then: `akrogon run-check --name u6-links -- bun test tests/docs-links.test.ts tests/chart-shapes.test.ts`.

## 8. Done-when and report

Commit with message `skills: learn-issues sorts a check that refused valid work as Removal and the lesson rule seeds it`, no Co-Authored-By trailer. Return the commit ID, the `check u6-links: <exit> <path>` line, and:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
