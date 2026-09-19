# Brief 2: lifecycle skills and guide state the leaf= prompt shape

## 1. Goal

Each lifecycle skill states the new prompt shape `<skill> <slug> slot=<S> phase=<P> leaf=<folder>`, says pass artifacts are written under the `leaf=` folder while code is edited only in the worktree, and qualifies every bare-filename write instruction with the leaf folder. Implements plan decisions D5-D8 of `plan.md` (leaf folder: `/home/ivan/Work/infra/akrogon/issues/open/authoritative-leaf-artifacts/prompt-leaf-folder`).

## 2. Numbered acceptance criteria

1. `skills/plan-issue/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md` each state the prompt shape with `leaf=<folder>` on their existing prompt line.
2. Each of the four files has one sentence saying: pass artifacts are written under the `leaf=` folder, code is read and edited only in the worktree, and a manual prompt naming a slug without `leaf=` falls back to locating the slug under the registered repo's `issues/open/`. In `implement-issue`, the standalone mode's no-config, local-artifact note sits next to that fallback sentence.
3. `grep -n "positions-\|rebuttal-\|plan.md\|report.md\|review-" skills/*/SKILL.md` shows no unqualified write instruction; read instructions may stay bare.
4. The printed-footer template `Next: <skill> <slug> slot=<A|B> phase=<phase>` in all four files includes ` leaf=<folder>`.
5. `docs/guide/next.html` line ~68 ("The prompt is always four words: skill, slug, slot, phase.") names the five fields including `leaf` and updates its example.
6. `bun run format` clean on edited files (format check runs at the end).

## 3. Read-first list

- `skills/plan-issue/SKILL.md` — prompt line 10; write lines 33 (`positions-<slot>.md`), 41 (`rebuttal-<slot>.md`), 49 (`plan.md`); footer template line 61.
- `skills/implement-issue/SKILL.md` — prompt line 10; write lines 37 (`<leaf>/implementation/report.md`, already qualified), 49 (`report.md` append, unqualified), 53 (`implementation/brief.md` under Standalone — local artifact, stays unqualified); footer template line 61.
- `skills/check-issue/SKILL.md` — prompt line 10; write lines 25 and 33 (`review-<slot>.md`), 43 (`review-A.md` append); footer template line 53.
- `skills/merge-issue/SKILL.md` — prompt line 10; `review-A.md` mentions at 27, 31, 33 are appends to an existing leaf file — qualify them with the leaf folder where they read as write instructions; footer template line 51 and the repair-move line 54 (`implement-issue <slug> slot=B phase=check.fix` — add `leaf=<folder>`).
- `docs/guide/next.html` line 68.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

- plan-issue: line 10 becomes `The prompt is \`plan-issue <slug> slot=<A|B> phase=<phase> leaf=<folder>\`; it supplies slot, phase and the authoritative leaf folder, independent of harness.` Add the artifacts/fallback sentence in `## Shared context` near the existing "locate the unique slug" line. Qualify the three write lines, e.g. "Write only `positions-<slot>.md` under the `leaf=` folder". Footer template gains ` leaf=<folder>`.
- implement-issue: line 10 becomes `Leaf prompts are \`implement-issue <slug> slot=B phase=implement leaf=<folder>\` or \`phase=check.fix\` with the same `leaf=`; a prompt without a leaf is a standalone task in the current checkout with this session as B.` Add the artifacts/fallback sentence in `## Shared context`, and next to it note standalone keeps its no-config, local-artifact behavior. Qualify the line-49 `report.md` append with the leaf folder. Footer template gains ` leaf=<folder>`.
- check-issue: line 10 gains ` leaf=<folder>`; add the artifacts/fallback sentence in `## Shared context`; qualify `review-<slot>.md` writes at 25/33 and the `review-A.md` append at 43; footer template gains ` leaf=<folder>`.
- merge-issue: line 10 gains ` leaf=<folder>`; add the artifacts/fallback sentence in `## Shared context`; qualify `review-A.md` write/append lines; footer template and the line-54 repair-move prompt gain ` leaf=<folder>`.
- next.html: rewrite the sentence to name five fields, e.g. "The prompt is always five fields: skill, slug, slot, phase, and the leaf's folder. For example `plan-issue rename-flag slot=B phase=plan.synthesis leaf=/home/me/repo/issues/open/issue/rename-flag`." Keep the surrounding prose style.

No exact wording is required by the criteria; match each file's terse style.

## 5. Do-not, reasons and exceptions

- Do not edit `src/`, `tests/`, `README.md`, or `tests/command-reference.test.ts` — code is brief 1; README and command-reference have no prompt-shape mention and the report states that.
- Do not relocate lessons or change `learnings/` instructions — design excludes it.
- Do not add an artifact-existence gate or phase table — design forecloses it (Q3).
- Do not restructure the skills beyond the listed lines — minimal diff.
- Return a mismatch with evidence instead of changing scope; the exception is a revised brief from B authorizing that change.

Restated: scope is the four SKILL.md files and `docs/guide/next.html` only; no new sections beyond the required sentences; mismatches come back to B with evidence.

## 6. Ordered steps

1. Edit `skills/plan-issue/SKILL.md` (criteria 1-4).
2. Edit `skills/implement-issue/SKILL.md` (criteria 1-4, standalone note).
3. Edit `skills/check-issue/SKILL.md` (criteria 1-4).
4. Edit `skills/merge-issue/SKILL.md` (criteria 1-4).
5. Edit `docs/guide/next.html` (criterion 5).
6. Run the grep in criterion 3 and `bun run format`; fix what they flag (criterion 6).

Advisory size: 5 files, under 20 turns.

## 7. Commands

```
cd /home/ivan/Work/infra/akrogon/issues/worktrees/prompt-leaf-folder && grep -n "positions-\|rebuttal-\|plan.md\|report.md\|review-" skills/plan-issue/SKILL.md skills/implement-issue/SKILL.md skills/check-issue/SKILL.md skills/merge-issue/SKILL.md
cd /home/ivan/Work/infra/akrogon/issues/worktrees/prompt-leaf-folder && bun run format
```

No changed-test coverage exists for prose; the grep and format check are the targeted checks for this brief.

## 8. Done-when, evidence and report

All six criteria hold with pasted grep output showing only qualified writes and a clean format run.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
