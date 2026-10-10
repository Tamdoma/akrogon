# Sub-brief 2: merge-issue skill gate clause

## 1. Goal

Done-criterion 5 of `merge-clean-worktree`: `skills/merge-issue/SKILL.md` lines 41 and 51 gain one clause each stating the command removed the holder worktree's empty untracked folders before the merge prompt and that ignored files remain. Plan reference: `issues/open/clean-merge-gate/merge-clean-worktree/plan.md` D6.

## 2. Numbered acceptance criteria

1. Line 41 (`B commits nothing and does not fetch or rebase. … on \`HEAD\` in the worktree, …`) carries a clause such as "the command removed the worktree's empty untracked folders before this prompt; ignored files remain".
2. Line 51 (`Commit scoped outstanding changes … then every \`merge_checks\` command, in the worktree, …`) carries the same clause.
3. No other line changes; the file stays prose-identical otherwise.

## 3. Read-first

- `skills/merge-issue/SKILL.md` lines 35–55 — the two sentences, the surrounding merge flow.
- `issues/open/clean-merge-gate/merge-clean-worktree/plan.md` — D6 and the verification table.
- This skill folder's `ponytail.md`.

## 4. Change list and needed interfaces

- Owns: `skills/merge-issue/SKILL.md` only. No prerequisite units; no shared test resource.
- Add the clause inside each of the two sentences (or immediately after them) so the removal reads as a precondition of the gate B runs.

## 5. Do-not, reasons and exceptions

- Do not edit any other file or any other skill text — criterion 5 names exactly lines 41 and 51.
- Do not describe implementation details (`git ls-files`, helper names); the clause states the guarantee, not the mechanism — the skill text teaches B what to rely on.
- Return a mismatch with evidence instead of changing scope; the exception is a revised brief from A authorizing that change.

Reasons restated: scope is exactly the two gate sentences; mechanism detail would rot while the guarantee is the contract B needs. Exceptions: none without a revised brief.

## 6. Ordered steps

1. Read the two lines and their sections.
2. Edit both clauses.
3. Commit; fill the report.

Advisory: 1 file, under 6 turns.

## 7. Commands

```sh
grep -n "empty untracked" skills/merge-issue/SKILL.md
```

## 8. Done-when, evidence and report

Done when both lines carry the clause and `grep -n "empty untracked" skills/merge-issue/SKILL.md` shows two hits on lines 41 and 51 (or adjacent lines if the sentence wraps). No `Test-Change:` trailer — this file is not matched by the test-file path rule.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
