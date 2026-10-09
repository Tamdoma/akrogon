# Brief U2: merge skill prose

Worktree: `/home/ivan/Work/infra/akrogon/issues/worktrees/merge-covers-key-u2`

## 1. Goal

Apply the merge skip in merge prose so merge runs uncovered checks then all merge checks on every path. Implements plan D5 and the U2 part of D7. Covers acceptance A2 and A4 merge side.

Binding facts: stack sentence is `skills/merge-issue/SKILL.md:41`, solo sentence is `:51`, rerun block is `:47`, red block is `:63`. New rule: run every `checks` command not named in `merge_covers`, then every `merge_checks` command. Check-issue and implement passes run all checks unchanged.

## 2. Numbered acceptance criteria

1. The stack sentence states merge runs every `checks` command not named in `merge_covers`, then every `merge_checks` command.
2. The solo sentence states the same filtered rule.
3. One clarifier states red and rerun reuse the same filtered set.
4. `grep -n merge_covers skills/check-issue/SKILL.md skills/implement-issue/SKILL.md` returns nothing.

Test rules: prose change, no new test file. Verify by reading the edited lines and running the grep in criterion 4. Trivial wording needs no unit test.

## 3. Read-first list

- `skills/merge-issue/SKILL.md` lines 39-65 as the pattern to copy
- `skills/check-issue/SKILL.md` the checks-run line, to confirm no edit needed
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

Open the index only for a gap in this list.

## 4. Change list and needed interfaces

Owns: `skills/merge-issue/SKILL.md`. Must land first: none. Shared test resource: none.

Changes: edit only the two run sentences and add one clarifier sentence near the rerun or shared-endings block. Keep all other wording, including `Test-Change` trailer rules and broadcast rules, unchanged.

Interfaces: none. The merge seat reads `checks`, `merge_checks`, and `merge_covers` from `akrogon config` output and follows this prose.

## 5. Do-not, reasons and exceptions

- Do not edit `src/*`, `tests/*`, `docs/*`, or `skills/init-akrogon/SKILL.md`. Reason: owned by U1 and U3, and shared edits break the cherry-pick. Exception: none.
- Do not touch check-issue or implement-issue skills. Reason: locked exclusion, those passes run all checks. Exception: none.
- Do not reorder checks or add parallel-run wording. Reason: locked exclusion. Exception: none.
- Do not change scope or an interface on a conflict. Return a mismatch with evidence instead. Exception: a revised brief from A authorizing that change.

Reasons restated: disjoint ownership keeps the wave clean, locked passes stay untouched, ordering stays as is, and scope changes need a revised brief.

## 6. Ordered steps

1. In `skills/merge-issue/SKILL.md`, edit the `:41` stack sentence for criterion 1.
2. In the same file, edit the `:51` solo sentence for criterion 2.
3. In the same file, add one red/rerun clarifier for criterion 3.
4. Run the criterion 4 grep plus the changed-test command below. Paste outputs.
5. Commit only the one owned file.

Advisory size: 1 file, under 6 turns.

## 7. Commands

Run only this changed-test command. Install deps first with `bun install` in the worktree. A runs criterion proof and every `checks` command separately.

```sh
export AKROGON_BASE=3e034dee43f0853446c2ba8f97bb72668ab213dc
: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000
```

## 8. Done-when, evidence and report

Done when criteria 1-4 hold and only the one owned file changed. No `Test-Change` trailer needed because no test file changed.

Return the commit ID, pasted grep and test outputs, and the four lines below.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
