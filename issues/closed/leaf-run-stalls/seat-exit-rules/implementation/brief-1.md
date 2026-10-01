# Brief U1: seat-exit-rules skill prose

## 1. Goal

Add the two seat-A exit rules to the implement-issue skill. Plan D1-D4, D6. Worktree: `/home/ivan/Work/infra/akrogon/issues/worktrees/seat-exit-rules-u1`. This checkout is that worktree.

## 2. Numbered acceptance criteria

- A1: `skills/implement-issue/SKILL.md` Shared context has one new paragraph directly after the failed-exit paragraph (current lines 31-32). It covers both implement and check.fix, reuses that failed exit, names reason format `"<criterion> red: <cause>"`, and forbids handing off as pre-existing, base red, or modulo anything. The check.fix section has one cross-ref sentence only.
- A2: `skills/implement-issue/worker-protocol.md` line 17 is replaced with a two-branch paragraph. Provider branch: recognize by error text in the failed result, relaunch only after old worker ended, spawn cwd is the retained worktree, brief is original plus the added line below verbatim, one relaunch, second failure of same unit ends leaf pass `failed` naming provider, error text, both transcript paths, standalone reports same contents instead. Budget/limit branch: turn-budget and output-limit stops keep the remainder rule with `never the original brief again` only there.
- A3: Changed-tests command below passes. No new tests: prose-only, a wording test is a vanity test.

## 3. Read-first list

- `skills/implement-issue/SKILL.md` lines 29-34 and the check.fix section
- `skills/implement-issue/worker-protocol.md` full file
- `skills/implement-issue/ponytail.md` (read before editing)
- Pattern to copy: existing failed-exit sentences at SKILL.md:31-32, short declarative rule prose.

## 4. Change list and needed interfaces

- Edit `skills/implement-issue/SKILL.md`: insert rule-1 paragraph after line 32; add one cross-ref sentence in check.fix.
- Edit `skills/implement-issue/worker-protocol.md`: replace line-17 sentence with two-branch paragraph.
- Literal interfaces, byte-exact: `akrogon phase <slug> failed --reason "<criterion> red: <cause>" --slot A`; added worker line `A previous worker died here. Check what is already done (criteria, commits, changed files and external effects such as uploads) before repeating work. Keep what is correct. Finish the brief.`
- Chunks that must land first: none. Paths this unit owns: the two files above. Shared test resource or consumed output: none.

## 5. Do-not, reasons and exceptions

- Do not touch `src/`, `tests/`, `issues/`, `skills/check-issue`, `skills/chart-issues`, pi settings, or AREA files. Reason: design excludes them; extra edits break review scope. Exception: none.
- Do not add tests or new files. Reason: standing design calls a wording test vanity; proof is reading the diff. Exception: none.
- Do not reword the verbatim strings. Reason: review checks literal text. Exception: none.
- Do not fix unrelated prose. Reason: smallest diff wins. Exception: none.
- Return a mismatch with evidence instead of changing scope or an interface. Exception: a revised brief from A authorizing that change.
- Reasons restated: scope stays reviewable, verbatim stays checkable. Exception restated: only a revised brief from A.

## 6. Ordered steps

- Step 1 (A1): read SKILL.md, insert the rule-1 paragraph after line 32, add the check.fix cross-ref, reread the diff.
- Step 2 (A2): read worker-protocol.md, replace the line-17 sentence with the two-branch paragraph, reread the diff.
- Step 3 (A3): run the section 7 command, then `git diff` to confirm only the two files changed, then commit only this chunk.

Advisory size: about 2 files and under 8 turns. Work clearly beyond it returns a mismatch with evidence, not a hard cutoff.

## 7. Commands

- `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"` with `AKROGON_BASE=2ad0acf70a85dacefa3a89c53a53233e2aae11ca`. Run as `AKROGON_BASE=2ad0acf70a85dacefa3a89c53a53233e2aae11ca bun test --changed="$AKROGON_BASE"`. Full suite belongs to A, do not run it.

## 8. Done-when, evidence and report

Done when A1-A2 read true in the diff and A3 passes. Report pastes the changed-tests output and the `git diff --stat`. No end-to-end artifact: prose-only leaf.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
