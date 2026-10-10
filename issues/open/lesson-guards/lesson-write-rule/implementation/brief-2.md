# Sub-brief U2: guide prose

## 1. Goal

Update `docs/guide/learn.md` and `docs/guide/cheat.md` so the lesson outlet is the shared write rule, not `/learn-issues`. Plan decisions D5, D6.

## 2. Numbered acceptance criteria

1. `docs/guide/learn.md`: the sentence `Run \`/learn-issues\` to remove lessons a running guard already covers and get a seed line for each one a check could cover.` is replaced by text that (a) links `../../skills/lesson-rule.md` (relative link resolvable by tests/docs-links.test.ts) and (b) names its outcome: write-time matching, a filed seed for checkable lessons, akrogon lessons written into akrogon's learnings. `/learn-issues` may be named only as the tool for the existing backlog, not as the way new lessons are handled.
2. `docs/guide/cheat.md` line ~150 (`| Triage lessons | learn-issues | Guarded lines removed, seed lines for checkable ones. |`): reworded so triage is scoped to the backlog (e.g. `Triage the lesson backlog`), no longer presenting `/learn-issues` as the lesson outlet. If the prose line 152 `Invoke setup, intake, charting, watching and lesson triage when you need them.` still reads correctly, leave it; otherwise adjust minimally.
3. No other lines in the two files change. The `issues_repo` seed-routing paragraph in learn.md stays.
4. `bun test tests/docs-links.test.ts` passes (your new link must resolve; note the rule file `skills/lesson-rule.md` is created by a parallel unit — if it is absent in your worktree, create the link anyway; A verifies resolution after landing).

## 3. Read-first list

- `skills/implement-issue/ponytail.md`
- `docs/guide/learn.md` (lesson paragraphs ~lines 14-24)
- `docs/guide/cheat.md` (~lines 148-153)
- `skills/learn-issues/SKILL.md` for what triage actually does now
- leaf `plan.md` is not needed; this brief is self-contained

## 4. Change list and needed interfaces

- `docs/guide/learn.md`: replace the one learn-issues sentence per criterion 1.
- `docs/guide/cheat.md`: one table row reworded per criterion 2.
- Commit in one commit on top of worktree HEAD. No test-file edits.

## 5. Do-not, reasons and exceptions

- Do not restate the rule's mechanics in the guide: one outcome sentence plus the link only; restating creates the duplicate the leaf exists to remove.
- Do not delete `/learn-issues` from the table: it still exists for backlog triage; only its implied monopoly is removed.
- Do not touch README.md:191-195 or other docs: plan scoped them out.
- Return a mismatch with evidence rather than expanding scope; exception is a revised brief from A.

Restated: single-link outcome description only; triage kept but rescoped; exclusions stand unless A revises this brief.

## 6. Ordered steps

1. Edit `docs/guide/learn.md` criterion 1.
2. Edit `docs/guide/cheat.md` criterion 2.
3. Run `bun test tests/docs-links.test.ts` — the new link may fail locally if `skills/lesson-rule.md` is absent; run the changed-tests command, report both outputs honestly.
4. Commit.

Advisory size: 2 files, under 10 turns.

## 7. Commands

`AKROGON_BASE=1d7d536100aebc183bd22f63b7c3ba31d5d07ea5 bun test --changed="$AKROGON_BASE" --timeout=30000` and `bun test tests/docs-links.test.ts`.

## 8. Done-when, evidence and report

Criteria 1-3 met; outputs pasted; commit ID returned. A missing `skills/lesson-rule.md` in the worktree is a known limitation, not a defect of your diff.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
