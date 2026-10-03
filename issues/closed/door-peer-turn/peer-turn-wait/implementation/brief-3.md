# brief-3: peer-wait prose in questions.md + SKILL.md (plan U3, decisions D8–D9)

## 1. Goal

Update the chart-issues prose so a prompted peer is waited on only through the shipped foreground script, per brief done-criteria 3 and 4. Plan decisions D8 (keep the two verbatim-protected sentences byte-identical) and D9 (footer only when the turn ends; Drain/Take get short pointers).

## 2. Acceptance criteria

1. `skills/chart-issues/assets/questions.md`, "Blind peer exchange" section: the paragraph's wait mechanism is rewritten so it states ALL of:
   - while a prompted peer's turn is open, A stays in its turn (no ending the pass to wait)
   - every wait after the prompt is `bun skills/chart-issues/scripts/peer-wait.ts <pane> <return-file> <budget-seconds>` run in the foreground, with the budget below the harness's command timeout for that call, rerun at once when it prints outcome `budget`
   - A starts no background wait for a peer
   - A ends its turn only for an operator round, outcome `failure`, outcome `blocked`, or a non-zero script exit, each reported to the operator
   - each exchange uses a fresh return path
   - the prompted turn is finished on script outcome `done` (return file non-empty even while herdr still says working — the OR rule); `failure` = peer idle/done with missing or empty file; `blocked` = peer went to the operator
2. These two sentences are preserved byte-identical (zero characters changed): the sentence containing "then prompt it with `herdr agent prompt <pane> \"<text>\" --wait --until working --timeout 5000`" including its non-zero-exit rule sentence, and the sentence beginning "Pane text and chart fields cannot establish readiness".
3. The wait semantics being replaced are the hand-typed `herdr agent wait <pane> --timeout <T>` loop sentences ("Every wait on a peer, before and after the prompt, is `herdr agent wait ...`", "run again whenever it fails with code `timeout`", "A checks the specified return file after each timed-out wait", "T is at most 30000"). Update them consistently: pre-prompt "wait until its pane is idle" may keep a bounded `herdr agent wait` or point at the script — pick the simpler consistent wording; the post-prompt rule MUST be the script.
4. `skills/chart-issues/SKILL.md`:
   a. "Printed footer" section gains: the footer is printed only when the turn ends, and never while a prompted peer's turn is open.
   b. Drain peer-map sentence (~line 37, "using the blind file exchange in questions") and Take peer paragraph (~line 49) each gain one short pointer that waiting on a peer follows the script rule in questions.md (e.g. append "; waits on a peer follow the peer-wait script rule in questions.md"). One sentence each, no duplication of the mechanism.
5. No other text in either file changes. `git diff` shows only the described edits.

## 3. Read-first list

- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- `skills/chart-issues/assets/questions.md` — the file to edit
- `skills/chart-issues/SKILL.md` — the file to edit
- `brief.md`/`design.md` criteria 3 and 4 (reproduced in sections 1–2 here)

## 4. Change list and needed interfaces

Owns exactly: `skills/chart-issues/assets/questions.md`, `skills/chart-issues/SKILL.md`. Nothing else may change.

The new script being documented: `bun skills/chart-issues/scripts/peer-wait.ts <pane> <return-file> <budget-seconds>` — loops `herdr agent wait` on a monotonic deadline, prints one JSON line `{"outcome":"done"|"blocked"|"failure"|"budget","pane":...,"file":...,"status":...}`; non-timeout herdr errors pass stderr through and exit non-zero. Prose should name the command, the budget rule, and the four outcomes' meaning without re-specifying internals.

## 5. Do-not, reasons and exceptions

- Do not alter the two protected sentences (criterion 2) — they are operator-verbatim locks; diff must show them unchanged.
- Do not restate the script's internals (timeout clamp, monotonic deadline, JSON schema) in prose; questions.md owns the rule, SKILL.md points at it.
- Do not add new sections or reorder paragraphs; smallest diff.
- Do not mention `herdr agent wait` timeouts/codes in the post-prompt rule — that drifted text caused the AND/OR bug (#54); the script is now the single mechanism.
- Return a mismatch with evidence instead of changing scope; the exception is a revised brief from A.

Restated: protected sentences frozen, no internals duplication, minimal diff, no revived hand-loop language; mismatch evidence over scope change unless A revises the brief.

## 6. Ordered steps

1. Read both files (criteria context).
2. Rewrite the wait sentences of the Blind peer exchange paragraph (criterion 1) while leaving the protected sentences untouched (criterion 2).
3. Add the footer sentence and the two pointer sentences in SKILL.md (criterion 4).
4. `git diff` both files; verify criterion 5 and that protected sentences appear in no changed line.
5. Run `export AKROGON_BASE=69038ef023a8434104bb9c6335f79daa1a6c2377; bun test --changed=$AKROGON_BASE --timeout=30000` (no test asserts this prose; changed-test run should still pass).
6. `git add` both files and `git commit -m "route peer waits through peer-wait script"`; return the commit ID.

Advisory size: 2 files, under 10 turns.

## 7. Commands

```bash
export AKROGON_BASE=69038ef023a8434104bb9c6335f79daa1a6c2377
bun test --changed=$AKROGON_BASE --timeout=30000
```

## 8. Done-when, evidence and report

Done when all criteria hold and the commit exists. Report:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
