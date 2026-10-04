# Worker brief: chart-issues prune offer removal

## 1. Goal

Remove the open-time lesson-prune offer from `skills/chart-issues/SKILL.md`, keeping the `learnings/LESSONS.md` resource read. Plan decision D4.

## 2. Numbered acceptance criteria

1. `skills/chart-issues/SKILL.md` no longer contains `offer a lesson prune at open`.
2. The same sentence still reads `learnings/LESSONS.md` as a resource, grammatically intact.
3. Nothing else in the file changes.
4. No test asserts skill wording. Proof is grep and diff inspection.

## 3. Read-first list

- `skills/chart-issues/SKILL.md` `## Open` section — the paragraph beginning `Read the configured \`grounding.index\` top file`.
- `skills/implement-issue/ponytail.md` — read before editing.

## 4. Change list and needed interfaces

In the open paragraph, delete ` and offer a lesson prune at open` from the sentence `Read the configured \`grounding.index\` top file, relevant linked areas and \`learnings/LESSONS.md\` as resources, report absent resources as gaps, and offer a lesson prune at open; ...`. The rest of the sentence and paragraph stay verbatim.

## 5. Do-not, reasons and exceptions

- Do not touch the lesson-recording clause after the semicolon, any other paragraph, or any other file: the rest of the sentence stays and sibling units own other files.
- Do not reword; delete the phrase only. Rewording invites drift from the locked design.
- A requirement conflict returns as a mismatch with evidence instead of changed scope; the exception is a revised brief from A.

Restated: one phrase deleted in one sentence of one file; nothing else moves.

## 6. Ordered steps

1. Read the open paragraph (criterion 1-3).
2. Delete the phrase.
3. `grep -n 'lesson prune' skills/chart-issues/SKILL.md` returns nothing; `grep -n 'learnings/LESSONS.md' skills/chart-issues/SKILL.md` still matches; `git diff` shows only that phrase removed.
4. Commit on the detached HEAD in your worktree.

Advisory size: 1 file, under 5 turns.

## 7. Commands

Changed-test command: `bun test --changed=76ec78494a77dca27a7b25a2128cf1d3bcda1045 --timeout=30000`. A prose-only edit may produce no changed tests; a pass or "no changed tests" result is acceptable. Run `bun install` first only if tests fail for missing dependencies.

## 8. Done-when, evidence and report

The phrase is gone, the resource read is intact, diff shows only that change, and the edit is committed. Return the commit ID and the filled lines:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
