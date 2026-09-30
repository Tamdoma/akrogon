# Brief 2: implement-issue test rules and standing design

Worktree: `/home/ivan/Work/infra/akrogon/issues/worktrees/realistic-review-bar-u2` (detached at lane HEAD; commit here, A cherry-picks).

## 1. Goal

Implement plan decisions D5, D6, D7 (proves C4, C5): rewrite the test and repair rules in `skills/implement-issue/SKILL.md` and `brief-template.md`, replace the blanket test lines in `skills/chart-issues/assets/standing-design.md`, and verify the ponytail and plan-issue files are conflict free without editing them.

Binding facts: a leaf writes the smallest test set proving every done-criterion plus one before and after proof per real bug fixed, and one test may prove several criteria. Extra negative or edge cases need a named concrete consequence on a realistic path: a broken required outcome, a security boundary, data loss or an unsafe mutation. Workers extend existing tests before adding files. The report links each done-criterion and each real bug fix to its test or evidence. Repair does required work for Fixes only. Nits get no separate work or test and may only disappear incidentally through Fix repair. End to end evidence with an artifact is required only when browser or runtime behavior or cross-component wiring cannot be shown by a smaller check or when a criterion asks for it.

## 2. Numbered acceptance criteria

- **AC1.** The implement skill test line (line 42) states the smallest proving set, the before and after proof per real bug, the consequence gate with the four listed consequences, and extend-before-add. Its `check.fix` section states Fixes-only repair with no separate Nit work or test. Verified by reading both spots.
- **AC2.** The brief template sections 2 and 8 state the same test rules. Its end to end line is conditional as in section 1. The observable-contract line and the Playwright flags (headless Chromium, trace on, video off) stay. Verified by reading both sections.
- **AC3.** The standing design no longer contains the blanket mandatory negative and edge-case line. It states criterion and consequence driven cases and conditional end to end evidence. The no vanity tests, cheapest sufficient test, Playwright and chain-trigger lines stay. Verified by reading lines 7 through 11.
- **AC4.** `skills/implement-issue/ponytail.md` is unchanged, `skills/check-issue/ponytail.md` is still a symlink (shown by `ls -l` and `readlink`), and `skills/plan-issue/SKILL.md` is unchanged with no Fix or test rule (shown by grep). Verified by pasted command output.
- **AC5.** The section 7 command passes and `git status` shows only the three section 4 files modified. Verified by pasted output.

## 3. Read-first list

- `skills/implement-issue/SKILL.md` line 42 and the `check.fix` section (lines 54 through 60).
- `skills/implement-issue/brief-template.md` sections 2 and 8.
- `skills/chart-issues/assets/standing-design.md` lines 7 through 11.
- Pattern to copy: each file's own terse rule voice. Replace rules in place.
- `skills/implement-issue/ponytail.md` (this skill folder's ponytail; read-only, verify no conflict).
- `skills/plan-issue/SKILL.md` (read-only, verify no conflict).
- Open the grounding index only for a gap in this list.

## 4. Change list and needed interfaces

- `skills/implement-issue/SKILL.md`: rewrite the line 42 test rule and the `check.fix` repair rule in place.
- `skills/implement-issue/brief-template.md`: rewrite the test rules in sections 2 and 8 in place.
- `skills/chart-issues/assets/standing-design.md`: replace lines 8 and 9 in place, keep lines 7, 10 and 11.
- No code interfaces. Literals kept exact: Playwright flags, verdict names `ready`, `nits`, `fix`.
- Chunks that must land first: none. This unit is wave 1.
- Paths owned: the three files above only.
- Shared test resource: none. Consumes no other worker output.

## 5. Do-not, reasons and exceptions

- Do not touch any other file; units 1 and 3 own the rest and D11 keeps waves independent. Exception: none.
- Do not edit the ponytail, the ponytail symlink or the plan-issue skill; AC4 verifies them read-only. Exception: none.
- Do not add tests; D9 forbids prose-wording tests for this leaf. Exception: none.
- Do not write under `issues/`; lifecycle artifacts live only in the registered checkout. Exception: none.
- Do not change scope or an interface; return a mismatch with evidence naming the conflict and smallest brief fix. Exception: a revised brief from A authorizing that change.

Reasons restated: unit ownership, read-only verification of conflict-free files, the no-wording-tests rule, and artifact placement keep this leaf reviewable. Exceptions restated: none, except a revised brief from A for scope or interface changes.

## 6. Ordered steps

1. Read the sections in section 3 (covers AC1-AC4).
2. Apply the three section 4 edits in place (AC1-AC3). Keep untouched lines byte-identical.
3. Verify AC4: `ls -l skills/check-issue/ponytail.md && readlink skills/check-issue/ponytail.md` and `grep -n "Fix\|Nit\|mandatory\|vanity" skills/plan-issue/SKILL.md skills/implement-issue/ponytail.md`; confirm the symlink target and no conflicting rule.
4. Grep the new rules: `grep -n "smallest\|concrete consequence\|extend\|Fixes only" skills/implement-issue/SKILL.md skills/implement-issue/brief-template.md` and `grep -n "Mandatory negative\|consequence\|Playwright\|chain trigger" skills/chart-issues/assets/standing-design.md` (AC1-AC3).
5. Run `bun install --frozen-lockfile` once, then the section 7 command. Repair failures inside this brief (AC5).
6. Commit only the three section 4 files and record the commit ID.

Advisory size: 3 files, under 12 turns. Work clearly beyond it returns a mismatch with evidence.

## 7. Commands

Run in the worktree, this command only:

```sh
AKROGON_BASE=14e045cf44daf5edf3413ba681fd5b66410b62ba bun test --changed="14e045cf44daf5edf3413ba681fd5b66410b62ba"
```

A runs the full suite separately.

## 8. Done-when, evidence and report

Done when AC1-AC5 hold, the greps show the new rules and the absent blanket line, the section 7 command passes, and only the three owned files are committed. No test derivation applies: this is a prose-only edit and D9 writes no new tests.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
