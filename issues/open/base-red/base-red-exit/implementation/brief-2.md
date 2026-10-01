# Brief 2: base-red-exit repair F4 (variable expansion)

Worktree: `/home/ivan/Work/infra/akrogon/issues/worktrees/base-red-exit-u2` (detached at `6c29639`). Do all edits and commits there. No prerequisites.

## 1. Goal

Repair review finding F4: the diff-inspection command in both base-run rules must expand the configured base variable. Plan D3 corrected; no locked-decision change.

## 2. Numbered acceptance criteria

1. `skills/implement-issue/SKILL.md` Shared-context rule contains `git diff "$AKROGON_BASE"...HEAD` and no bare `AKROGON_BASE...HEAD`.
2. `skills/check-issue/SKILL.md` check.review rule contains `git diff "$AKROGON_BASE"...HEAD` and no bare `AKROGON_BASE...HEAD`.
3. Exactly one new commit in the worker worktree touching only the two owned paths.
4. Section 7 output pasted in the report.

Defect evidence (reviewer ran at the reviewed head): `AKROGON_BASE=<sha> git diff AKROGON_BASE...HEAD -- <file>` exits 128 with `fatal: bad revision 'AKROGON_BASE...HEAD'`; the quoted form exits 0 and lists the five changed files. No new tests: one-line command correction in prose, corrected form already verified live by the reviewer.

## 3. Read-first list

- This brief's section 4 (exact strings).
- `skills/implement-issue/SKILL.md` Shared-context base-run paragraph (contains `git diff AKROGON_BASE...HEAD`).
- `skills/check-issue/SKILL.md` check.review base-run paragraph (same string).
- `skills/implement-issue/ponytail.md`.
- Open the repo index only for a gap in this list.

## 4. Change list and needed interfaces

Owned paths (nothing must land first; no shared test resource; no consumed worker output):

1. `skills/implement-issue/SKILL.md`: replace the exact string `git diff AKROGON_BASE...HEAD` with `git diff "$AKROGON_BASE"...HEAD` (one occurrence, inside the base-run rule's trigger parenthesis).
2. `skills/check-issue/SKILL.md`: same exact replacement (one occurrence, inside the base-run rule's trigger parenthesis).

No other text changes. Verify with `grep -rn 'AKROGON_BASE\.\.\.HEAD' skills/implement-issue/SKILL.md skills/check-issue/SKILL.md` showing only the two quoted forms.

## 5. Do-not, reasons and exceptions

- Do not edit any other line or file: the finding is two strings. Exception: a revised brief from A.
- Do not weaken the rule or add wording: criteria stay as written. Exception: none.
- Return a mismatch with evidence to the plan author instead of changing scope or an interface. Exception: a revised brief from A authorizing that change.

Reasons restated: minimal diff keeps the repair reviewable; criteria stay intact; mismatches protect the locked design.

## 6. Ordered steps

1. Apply the section 4 replacement in `skills/implement-issue/SKILL.md` (criterion 1).
2. Apply the section 4 replacement in `skills/check-issue/SKILL.md` (criterion 2).
3. Run `bun install` once, then the section 7 command; commit only the two paths in one commit; fill section 8 (criteria 3, 4).

Advisory size: 2 files, under 10 turns.

## 7. Commands

Run only this changed-test command (base supplied: `AKROGON_BASE=88f252f02eb36aacee6dadf6668c303374b692d5`):

```sh
: "${AKROGON_BASE:?AKROGON_BASE is required}" && AKROGON_BASE=88f252f02eb36aacee6dadf6668c303374b692d5 bun test --changed="88f252f02eb36aacee6dadf6668c303374b692d5"
```

Criterion proof and every `checks` command belong to A after the final worker.

## 8. Done-when, evidence and report

Done when criteria 1-4 hold: two strings replaced, one commit, pasted command results. No end-to-end artifact applies to prose.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
