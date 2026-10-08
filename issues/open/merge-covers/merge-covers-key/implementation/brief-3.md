# Brief U3: operator docs and init template

Worktree: `/home/ivan/Work/infra/akrogon/issues/worktrees/merge-covers-key-u3`

## 1. Goal

Document the merge skip for operators and init proposals. Implements plan D6. Covers acceptance A5 docs part.

Binding facts: `docs/guide/merge.md:3` is the merge lead. `docs/guide/setup.md:54` is the `merge_checks` bullet. `skills/init-akrogon/SKILL.md:22-32` is the repo proposal template. `merge_covers` defaults to `[]` and holds `checks` names covered by `merge_checks`.

## 2. Numbered acceptance criteria

1. `docs/guide/merge.md` lead states merge runs every `checks` command not named in `merge_covers`, then every `merge_checks` command.
2. `docs/guide/setup.md` has a `merge_covers` bullet after the `merge_checks` bullet stating it lists `checks` names skipped at merge because `merge_checks` covers them, empty by default.
3. `skills/init-akrogon/SKILL.md` proposal template includes `merge_covers: []` with a one-line comment that entries must be `checks` names covered by `merge_checks`.
4. `grep -n merge_covers docs/guide/merge.md docs/guide/setup.md skills/init-akrogon/SKILL.md` shows all three hits.

Test rules: prose change, no new test file. Verify by reading the edited lines and running the grep in criterion 4. Trivial wording needs no unit test.

## 3. Read-first list

- `docs/guide/merge.md` lines 1-10
- `docs/guide/setup.md` lines 49-66 as the bullet pattern to copy
- `skills/init-akrogon/SKILL.md` lines 20-35
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

Open the index only for a gap in this list.

## 4. Change list and needed interfaces

Owns: `docs/guide/merge.md`, `docs/guide/setup.md`, `skills/init-akrogon/SKILL.md`. Must land first: none. Shared test resource: none.

Changes: one lead edit, one bullet add, one template line add. Keep headings, links, and surrounding bullets unchanged so `tests/docs-links.test.ts` keeps passing.

Interfaces: none. Init proposals feed `repoSchema` in `src/config.ts`, which U1 extends.

## 5. Do-not, reasons and exceptions

- Do not edit `src/*`, `tests/*`, or `skills/merge-issue/SKILL.md`. Reason: owned by U1 and U2, and shared edits break the cherry-pick. Exception: none.
- Do not change check ordering, `grounding`, or other proposal keys. Reason: outside this leaf scope. Exception: none.
- Do not rename headings or link targets. Reason: docs link tests check anchors and relative links. Exception: none.
- Do not change scope or an interface on a conflict. Return a mismatch with evidence instead. Exception: a revised brief from A authorizing that change.

Reasons restated: disjoint ownership keeps the wave clean, unrelated keys stay stable, links must keep passing, and scope changes need a revised brief.

## 6. Ordered steps

1. In `docs/guide/merge.md`, edit the lead for criterion 1.
2. In `docs/guide/setup.md`, add the bullet for criterion 2.
3. In `skills/init-akrogon/SKILL.md`, add the template line for criterion 3.
4. Run the criterion 4 grep plus the changed-test command below. Paste outputs.
5. Commit only the three owned files.

Advisory size: 3 files, under 12 turns.

## 7. Commands

Run only this changed-test command. Install deps first with `bun install` in the worktree. A runs criterion proof and every `checks` command separately.

```sh
export AKROGON_BASE=3e034dee43f0853446c2ba8f97bb72668ab213dc
: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000
```

## 8. Done-when, evidence and report

Done when criteria 1-4 hold and only the three owned files changed. No `Test-Change` trailer needed because no test file changed.

Return the commit ID, pasted grep and test outputs, and the four lines below.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
