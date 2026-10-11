# Brief 2: check-issue re-check range-diff clause

## 1. Goal

Extend the re-check sentence in `skills/check-issue/SKILL.md` so B reviews a refreshed `check.fix` handoff through `git range-diff` computed from the SHAs recorded in `implementation/report.md` (plan D4).

## 2. Numbered acceptance criteria

1. The paragraph beginning `On re-check after `check.fix`` contains all of: `git range-diff`, `prior reviewed base`, `prior reviewed head`, `handed-off base`, `handed-off head`, `added or changed`.
2. The same paragraph states that main's commits are not reviewed as repair (wording matching `main's commits ... not reviewed as repair` or `main commits ... not reviewed as repair`).
3. Everything else in the paragraph is unchanged: `inspect only the repair diff from the prior reviewed head`, the `review-B.md` append, earlier-findings confirmation, the fix-bar, the introduced-defect rule, and the merge-origin replay-evidence clause.

Proof: `bun test tests/skill-refresh.test.ts` — the two failing tests under `check-issue re-check after a refreshed check.fix` go green; all other tests stay green.

## 3. Read-first list

- `skills/check-issue/SKILL.md:67` — the paragraph to extend.
- `skills/merge-issue/SKILL.md:53` — existing `git range-diff` phrasing to copy: `git range-diff <old-base>..<prior-head> <target>..<resolved-head>`.
- `tests/skill-refresh.test.ts` — the red test pinning the vocabulary.
- `skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Owns: `skills/check-issue/SKILL.md` only. Nothing must land first; no shared test resource.

Edit: inside the `:67` paragraph, add one clause (a semicolon clause or one sentence, your call) expressing: on re-check after a `check.fix` pass whose `implementation/report.md` records a refresh, B computes `git range-diff <prior reviewed base>..<prior reviewed head> <handed-off base>..<handed-off head>` itself from the SHAs recorded there and reviews as repair the commits it shows added or changed, conflict resolutions included; main's commits are not reviewed as repair.

## 5. Do-not, reasons and exceptions

- Do not edit any other file: siblings own implement-issue, docs; src is out of scope. Exception: none — return a mismatch.
- Do not touch `tests/skill-refresh.test.ts` or any test: planned tests are A's. Exception: revised brief from A.
- Do not restate the SHA-record rule from implement-issue: check-issue names the recorded fields; the producer rule lives elsewhere and duplication drifts. Exception: none.
- Do not reorder or delete existing clauses in the paragraph: the merge-origin replay-evidence clause and the repair-diff scope stay as written. Exception: none.

Reasons restated: single-source wording, minimal diff, planned tests stay A's. Exceptions restated: only a revised brief from A.

## 6. Ordered steps

1. Read the red test and `skills/check-issue/SKILL.md:67`.
2. Make the one-clause edit.
3. `bun install --frozen-lockfile` in the worktree, run `bun test tests/skill-refresh.test.ts`; the two `check-issue re-check` tests pass, nothing else regresses.
4. Commit only `skills/check-issue/SKILL.md`, e.g. `skills: range-diff re-check scope after a refreshed check.fix`; return the commit id.

Advisory size: 1 file, under 6 turns.

## 7. Commands

`bun test tests/skill-refresh.test.ts` from the worktree after `bun install --frozen-lockfile`. AKROGON_BASE=22ede6c12f7d3b3beb2c7dadeb1bc4aea81d6192.

## 8. Done-when, evidence and report

Done when criteria 1-3 hold and the named tests pass with no regression in this file. Commit; paste commit id and bun test summary.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
