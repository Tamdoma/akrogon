# Brief 4: docs mirror the bounce-replay exception

## 1. Goal

Plan decision D5 of leaf `bounce-repair-proof`: the three prose surfaces that restate "merge_checks only at merge" gain the same one exception the skills now carry, so no page contradicts the rule. One unit owning three files: `skills/AREA.md`, `docs/guide/phases.md`, `docs/guide/setup.md`.

The skill text landed already (wave 1). The canonical meaning to mirror: a `check.fix` pass after a red merge ending replays the exact command the merge seat recorded, verbatim, in the leaf's own worktree after rebasing the repaired head onto the current `<remote>/<default_branch>`; every other use of `merge_checks` stays merge-only.

## 2. Numbered acceptance criteria

1. `skills/AREA.md` line 23 ("A runs criterion proof plus every `checks` command before review, with `merge_checks` only at merge.") gains the exception: a `check.fix` after a red merge ending replays the exact rejected command. One clause appended, the rest of the bullet unchanged.
2. `docs/guide/phases.md` line 94 ("`merge_checks` run only at merge unless a criterion needs a whole run the brief names") gains the same exception clause in the same sentence. The rest of the paragraph (the base-run description, the report sentence) is unchanged.
3. `docs/guide/setup.md` line 54 ("**merge_checks** lists slow commands that run only at merge, on the rebased leaf before push.") gains a short qualifier naming the bounce replay; the bullet keeps its defining role.
4. No other sentence in any of the three files changes. `docs/guide/merge.md` and `src/AREA.md` are not touched — they describe merge-time behavior only.

Proof is read/grep over the diff; no test asserts doc text.

## 3. Read-first list

- `skills/AREA.md` (:20-28, the affected bullets)
- `docs/guide/phases.md` (:90-100)
- `docs/guide/setup.md` (:50-58)
- Landed skill wording to mirror: `skills/plan-issue/SKILL.md` :63 and `skills/implement-issue/SKILL.md` :63/:84 (already on this worktree's HEAD — read the diff with `git log -3 --oneline` and `git show <sha>` if needed)
- `skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

Owns: `skills/AREA.md`, `docs/guide/phases.md`, `docs/guide/setup.md`.

Three single-clause edits, one per file, all naming the same case: a `check.fix` pass after a red merge ending replays the exact command the merge recorded. Keep each to one clause; do not re-explain the replay mechanics (implement-issue owns those).

Lands first: wave-1 units (already landed on this worktree's HEAD). Shared test resource: none.

## 5. Do-not, reasons and exceptions

- Do not touch `docs/guide/merge.md` or `src/AREA.md`: they describe merge-time behavior, which did not change.
- Do not re-specify the replay (rebase order, evidence fields, conflict rule): skill text owns that; these files only name the exception exists.
- Do not edit any other file.
- Return a mismatch with evidence instead of changing scope; the exception is a revised brief from A authorizing the change.

Restated: one clause per named file, nothing else; any needed extra change is returned as a mismatch, not made.

## 6. Ordered steps

1. Read the three files and the landed skill wording (criteria 1-3).
2. Make the three edits (criteria 1-3).
3. `git --no-pager diff` and confirm only the three clauses were added (criterion 4).
4. Run the changed-test command in section 7.

Advisory size: 3 files, under 12 turns.

## 7. Commands

```bash
cd /home/ivan/Work/infra/akrogon/issues/worktrees/bounce-repair-proof-u4
bun install
export AKROGON_BASE=2e78945849eed87c42abd56f224909f4d2050b36
: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000
```

If `bun test --changed` reports no changed tests to run, that is a valid green result for a doc-only diff; record it as such.

## 8. Done-when, evidence and report

Done when all four criteria hold in the diff, the files are committed in this worktree, and the changed-test command has run green or vacuous.

Commit with a short message like `docs: name the check.fix replay exception to merge_checks-at-merge`. No `Test-Change:` trailer is needed.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
