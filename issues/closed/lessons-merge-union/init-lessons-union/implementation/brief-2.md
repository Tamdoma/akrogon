# Brief-2: name the union attribute in init docs

## 1. Goal

Both init docs list the LESSONS.md merge attribute among the command's writes. Plan D8, criterion C5.

## 2. Numbered acceptance criteria

- B2-C5a: `skills/init-akrogon/SKILL.md` names the `learnings/LESSONS.md merge=union` attribute (or the LESSONS.md merge attribute) among what `akrogon init` writes.
- B2-C5b: `docs/guide/setup.md` names the LESSONS.md merge attribute among what `akrogon init` writes.
- B2-C6: `bun test tests/docs-links.test.ts` passes (no broken links/anchors from the edit).

## 3. Read-first list

- `/home/ivan/Work/infra/akrogon/issues/worktrees/init-lessons-union-u2/skills/init-akrogon/SKILL.md` (sentence: "The command owns both config files, repo registration, `issues/open`, the worktree/seeds/lock ignore entries and current `learnings/LESSONS.md` scaffolding, while the skill does not directly write configs, ignore rules, attributes, packages or scripts.")
- `/home/ivan/Work/infra/akrogon/issues/worktrees/init-lessons-union-u2/docs/guide/setup.md` (sentence: "The command writes repository configuration, creates the issue and lesson scaffolds, adds ignore entries and registers the repository.")
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- Open `docs/reference-index.md` only if this list has a gap.

## 4. Change list and needed interfaces

Files owned by this unit: `skills/init-akrogon/SKILL.md`, `docs/guide/setup.md`. No prerequisites must land first. No shared test resource. No consumed output from another worker. No code interfaces needed.

- `skills/init-akrogon/SKILL.md`: extend the command-owns sentence to include the `.gitattributes` union rule among the command's writes. One-line-class edit. Note the sentence already says the skill does not write attributes — keep that contrast intact (the command writes them, the skill does not).
- `docs/guide/setup.md`: extend the writes sentence to include the lesson merge attribute. One-line-class edit.
- Keep both edits to the existing sentences; add no new sections, no AREA.md changes.

## 5. Do-not, reasons and exceptions

- Do not touch `src/`, `tests/`, or anything under `issues/`: locked exclusions and parallel ownership.
- Do not add sections or rewrite surrounding prose: one-line-class edits keep the diff minimal and avoid stale-rule drift.
- Do not touch AREA.md files: no new commands, files, or patterns.
- Mismatch rule: return a mismatch with evidence to the plan author instead of changing scope or an interface; the exception is a revised brief from B authorizing that change.
- Restated: exclusions above protect locked scope and parallel ownership; the only way past one is a revised brief from B.

## 6. Ordered steps

1. `skills/init-akrogon/SKILL.md` B2-C5a: extend the command-owns sentence, grep to confirm the attribute is named.
2. `docs/guide/setup.md` B2-C5b: extend the writes sentence, grep to confirm.
3. Run the section 7 command for B2-C6.

Advisory size: about 2 files and under 8 turns.

## 7. Commands

```sh
AKROGON_BASE=53508e807128de2a77b22cf4874e266224cf4f0e bun test --changed="$AKROGON_BASE"
```

Run from the worker worktree. Only this command, not the full suite. If the changed-runner reports no tests for docs-only changes, also run `bun test tests/docs-links.test.ts` as the targeted check and say so.

## 8. Done-when, evidence and report

Done when B2-C5a and B2-C5b hold by grep and the section 7 command (plus docs-links if needed) passes. Paste command results.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
