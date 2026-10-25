# Brief 2: skills (U2)

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/remove-plan-debate-u2` (detached at the leaf head). Install first: `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile'`.

## 1. Goal

Plan decision D8: the agent skills describe leaf planning as one slot A `plan.synthesis` pass from the brief and design, with no lifecycle debate, no `debate` state key, no repo `rebuttal` setting and no `plan.positions`/`plan.rebuttal` phases. The chart door offers the route as lifecycle or direct. The chart-level consultant exchange (blind notes, merge, rebuttal during charting) stays exactly as it is.

## 2. Numbered acceptance criteria

1. `skills/plan-issue/SKILL.md`: the front-matter `description` names only slot A synthesis from the brief and design; `## plan.positions` and `## plan.rebuttal` sections are gone; `## plan.synthesis` first paragraph loses "integrating both positions and any configured rebuttals when debate ran, or directly using the brief/design when `debate: no`" and says it works from the brief and design. Nothing else in `## plan.synthesis` changes (operator decision 1a: no other change).
2. `skills/check-issue/SKILL.md` `## check.review`: the sentence "As B, read your own `positions-B.md` and `rebuttal-B.md` first when debate produced them." and the clause "missing debate artifacts on a `debate: no` leaf are expected" go; the rest of each sentence stays grammatical and keeps its meaning (for line 47, "B's earlier arguments focus attention but are not additional acceptance criteria" refers to debate arguments; drop it with the debate clause if it has no other referent, and keep "`learnings/LESSONS.md` is not review input").
3. `skills/chart-issues/SKILL.md`: `## Handoff` asks no debate question (around line 71); `## Direct route` (around line 102) asks one route question: lifecycle or direct, with the door's recommendation and a reply key, and any "lifecycle debate no/yes" wording becomes "lifecycle"; `## Autopilot` (around line 133) drops debate from the self-answered list and its route line. The `## Take` peer exchange and the `## Handoff` peer leaf-writing exchange (line 55 area) stay unchanged.
4. `skills/chart-issues/assets/shapes.md`: `Route: <lifecycle | direct>` (line 27); autopilot `- route: <lifecycle | direct>` (line 62); `## Leaf files` `state.yaml` template has no `debate` key and `phase: plan.synthesis` with no debate comment (lines 335-338); its paragraph (line 343) drops the two debate sentences and any sentence that only explains debate. The `### readiness.yaml` example is untouched (a test parses it).
5. `skills/init-akrogon/SKILL.md`: the config sample has no `rebuttal:` line, and no prose there names the setting.
6. `skills/watch-issues/SKILL.md` line 38: required seats list starts at `plan.synthesis A` with no retired phase.
7. `grep -rnE "debate|plan\.positions|plan\.rebuttal|positions-|rebuttal" skills/*/SKILL.md skills/chart-issues/assets/shapes.md` shows only charting-rebuttal lines you deliberately kept (list them in your report with why).

## 3. Read-first list

- `/home/ivan/.claude/skills/implement-issue/ponytail.md`
- The six files above, whole sections named.
- `skills/chart-issues/assets/questions.md` line 50-54 (charting rebuttal, which stays) so you can tell the two apart.

## 4. Change list and needed interfaces

Owned paths: `skills/plan-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/shapes.md`, `skills/init-akrogon/SKILL.md`, `skills/watch-issues/SKILL.md`. No prerequisite units. No shared test resource. Edits are deletions and rewording only, matching each file's existing terse style.

## 5. Do-not, reasons and exceptions

- Do not edit `skills/chart-issues/assets/questions.md`, the `## Take` section, or the peer leaf-writing exchange in `## Handoff` (operator scope: charting debate stays).
- Do not edit any test, fixture, script, `src/`, `docs/`, `issues/` or `learnings/` (other units, tests are locked, history untouched).
- Do not add new rules or rewrite surrounding prose beyond what removing debate requires (minimal diff; operator decision 1a for plan-issue).
- Return a mismatch with evidence instead of changing scope; exception: a revised brief from A.

Reasons restated: the operator kept charting debate; other paths are owned elsewhere or locked; scope is removal only.

## 6. Ordered steps

1. plan-issue (criterion 1). 2. check-issue (2). 3. chart-issues SKILL (3). 4. shapes.md (4). 5. init-akrogon (5). 6. watch-issues (6). 7. Run section 7, grep (7), commit once: `skills: drop the lifecycle planning debate` (no co-author line).

Advisory size: 6 files, under 25 turns.

## 7. Commands

- `akrogon run-check --name u2-skill-tests -- bun test tests/docs-links.test.ts tests/chart-shapes.test.ts tests/run-units.test.ts tests/log-reader.test.ts --timeout=30000`

## 8. Done-when, evidence and report

Done when criteria 1-7 hold and the section 7 command exits 0. Keep output only through `akrogon run-check` and cite each `check <label>: <exit> <path>` line. Return the commit id and paste the criterion 7 grep result.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
