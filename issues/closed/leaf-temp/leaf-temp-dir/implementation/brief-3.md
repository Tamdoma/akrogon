# Brief 3: leaf-temp-dir skills and guides (D7)

## 1. Goal

State the `$TMPDIR` rule in three skills and the confirmed-gone temp deletion in three guide paragraphs. Plan decision D7. Criterion C7, review-only.

## 2. Numbered acceptance criteria

1. Each of `skills/implement-issue/SKILL.md` (Shared context), `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md` carries one sentence: temp files, logs, and base copies go under `$TMPDIR`, never a fixed `/tmp/<name>`; anything needed later goes in the leaf folder.
2. Each of `docs/guide/merge.md` (merged-cleanup paragraph), `docs/guide/problems.md` (lingering-worktree paragraph), `docs/guide/limits.md` (cleanup-boundary line) states the temp folder is deleted once the merged leaf's tab is confirmed gone, keeping the existing worktree/branch cleanup distinction intact.
3. No other guide line contradicts the new cleanup text (sweep all `docs/guide/*.md` cleanup mentions and report hits).

## 3. Read-first list

- `skills/implement-issue/SKILL.md` (Shared context section)
- `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md`
- `docs/guide/merge.md`, `docs/guide/problems.md`, `docs/guide/limits.md`
- This skill folder's `ponytail.md`
- Open the plan's index only for a gap in this list.

## 4. Change list and needed interfaces

Must land first: none (wave 1). Owns: the six files above. No shared test resource. Consumed output: none; the `$TMPDIR` contract is fixed by the plan (`TMPDIR=<per-leaf temp>` exported on dispatch; failed leaves keep scratch; sweeps catch up).

Changes: six minimal prose edits per criteria 1-2, one sentence or paragraph each, matching surrounding tone. No code, no AREA edits (`src/AREA.md` names no allocate env and stays untouched).

## 5. Do-not, reasons and exceptions

- Do not touch `src/` or `tests/` (briefs 1 and 2 own them); mixing owners causes conflicting picks.
- Do not add tests asserting prose wording; C7 is review-only and wording asserts break on rephrase.
- Do not rewrite surrounding paragraphs or fix adjacent prose; minimal diffs keep review on the rule.
- Do not document the `AKROGON_LEAF_TEMP_ROOT` test seam anywhere; it is internal by design.
- Return a mismatch with evidence to the plan author instead of changing scope or an interface; the exception is a revised brief from A authorizing that change.

Reasons restated: owners prevent conflicting picks; wording asserts are brittle; adjacent rewrites hide the rule; the seam must stay internal. Exception restated: only a revised brief from A authorizes a scope or interface change.

## 6. Ordered steps

1. Three skills for criterion 1: add one sentence each.
2. Three guides for criterion 2: extend the named paragraphs.
3. Sweep `docs/guide/*.md` for cleanup mentions for criterion 3; fix contradictions in place or report none with the grep output.
4. Run section 7, paste results, commit only this chunk.

Advisory size: about 6 files and under 8 turns.

## 7. Commands

Run in the brief's worktree after `bun install`:

```sh
AKROGON_BASE=88f252f02eb36aacee6dadf6668c303374b692d5 bun test --changed="88f252f02eb36aacee6dadf6668c303374b692d5"
```

This resolved changed-test command only; criterion proof and every `checks` command belong to A. Paste the result even when it selects no tests, plus the section 8 greps.

## 8. Done-when, evidence and report

Done when criteria 1-3 hold with pasted `grep -n 'TMPDIR' skills/*/SKILL.md` output, the three guide paragraph locations, and the contradiction-sweep grep. Name limitations and unverified criteria explicitly.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
