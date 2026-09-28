# Brief-1: round-labels template relabel

Worktree: `/home/ivan/Work/infra/akrogon/issues/worktrees/round-labels-u1`
Base commit: `d6f42f8493f909b3e19c46b57d4dabf5f92e8ce4` (leaf HEAD, clean)

## 1. Goal

Relabel the operator round template in `skills/chart-issues/assets/questions.md` to per-round `1`/`1a` labels (plan D1-D3). No other file changes.

## 2. Numbered acceptance criteria

1. Template block shows `### 1 ·` and `### 2 ·` headings, `- **1a (recommended)**` and `- **1b**` options, and reply key ``Reply `1a 2b`, or a numbered free-text answer.``. No `Q1`, `Q2`, `1-A`, `2-B`, `**A`, `**B` label remains.
2. The paragraph after the template states: label questions `1`, `2` and options `1a`, `1b`, `2a`, and use no other code scheme in a round; per-round restart at 1 is kept.
3. `grep -rnE "\bQ[0-9]\b|\b[0-9]-[A-B]\b" skills/ docs/` returns no hit.
4. `git status --porcelain` shows only `skills/chart-issues/assets/questions.md`.

No test file: trivial wording edit, plan D4. Verification is grep plus read checks.

## 3. Read-first list

- `skills/chart-issues/assets/questions.md` (lines 5-27: the only edit surface)
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- Existing pattern to copy: the design target template lines in criterion 1 above (exact replacement text).

Open the repo index only for a gap in this list.

## 4. Change list and needed interfaces

- File owned: `skills/chart-issues/assets/questions.md` only.
- Change A (template block): `### Q1 ·` to `### 1 ·`; `### Q2 · ...` to `### 2 · ...`; `- **A (recommended)**` to `- **1a (recommended)**`; `- **B**` to `- **1b**`; reply key `` `1-A 2-B` `` to `` `1a 2b` ``.
- Change B (line-27 paragraph): at the sentence "Number questions continuously within a round and restart at 1 in the next round.", add the sentence: label questions `1`, `2` and options `1a`, `1b`, `2a`, and use no other code scheme in a round.
- Needed interfaces: none. Text-only edit.
- Prerequisites: none. Single unit, lands directly.

## 5. Do-not, reasons and exceptions

- Do not edit `SKILL.md`, `shapes.md`, other skills, `docs/`, or anything under `issues/`. Reason: intake constraint locks the change inside `questions.md`; other files would break criterion 4. Exception: none.
- Do not add tests or change test files. Reason: wording test would be vanity per plan D4. Exception: none.
- Do not migrate old charts under `issues/` to the new labels. Reason: recorded history stays as-is; known limitation. Exception: none.
- Do not widen scope or change an interface; return a mismatch with evidence to the plan author instead. Exception: a revised brief from B authorizing that change.
- Restated: exclusions above hold because scope is locked to one file and history is preserved; the only way past them is a revised brief from B.

## 6. Ordered steps

1. In `skills/chart-issues/assets/questions.md`, apply Change A (criterion 1). About 5 short replacements in one file; advisory size about 1 file and under 6 turns.
2. In the same file, apply Change B (criterion 2).
3. Verify: read the edited block and paragraph; run the section-7 commands plus the criterion-3 grep and `git status --porcelain` (criteria 1-4).
4. Commit only `skills/chart-issues/assets/questions.md` in the worker worktree; return the commit ID.

Work clearly beyond the advisory size returns a mismatch with evidence, not a hard cutoff.

## 7. Commands

Run from the worker worktree root:

```bash
AKROGON_BASE=d6f42f8493f909b3e19c46b57d4dabf5f92e8ce4 bun test --changed="d6f42f8493f909b3e19c46b57d4dabf5f92e8ce4"
```

A markdown-only change may match no tests; paste that result as evidence. Also run:

```bash
grep -rnE "\bQ[0-9]\b|\b[0-9]-[A-B]\b" skills/ docs/; echo "grep-exit:$?"
git status --porcelain
```

Do not run the full suite; B runs it separately.

## 8. Done-when, evidence and report

Done when criteria 1-4 hold, the brief command output is pasted, and the worker worktree has one new commit on the single file. Reread this section and fill the report before returning, including the commit ID.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
