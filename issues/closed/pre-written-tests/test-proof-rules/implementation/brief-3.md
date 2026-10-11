# Worker brief 3: check-issue, merge-issue and operator docs

You are worker 3 of leaf `test-proof-rules`. You edit rule text (markdown) only, in your detached worktree:

`/home/ivan/Work/infra/akrogon/issues/worktrees/test-proof-rules-u3`

## 1. Goal

Rewrite review, merge and operator docs so review stops demanding tests outside done-criteria, repair seats write only the red-first reproduction test, a missing-machinery finding is a stop cause, and the operator guide reflects planned-test authorship. Implements plan decisions D6, D7 (review/merge half), D8 (review half), plus doc-mirror updates.

## 2. Numbered acceptance criteria

1. `skills/check-issue/SKILL.md` :55 (the missing-test Fix paragraph) is deleted. A case outside the done-criteria with no realistic source is a Nit that gets no test and no new issue — state this in the Nit handling (near :49's verdict format or the :53 region).
2. `check-issue/SKILL.md` :51 (Fix bar) and :53 stay. Keep :53's "A new test needs no cited source" — B reviews diffs and does not author tests; the planner's new files legitimately carry no source citation.
3. Beside :53, add: B checks that the implementation report runs the planned tests through the commands `plan.md` names, and that no change since planning skips, filters or disables a planned test or the runner configuration it depends on.
4. `check-issue/SKILL.md` :79 narrowed to the reproduction rule: for a proven bug the fixing seat commits one reproduction test shown red on the head before the fix, its `Test-Change` trailer citing the finding's realistic source; that is the only test a repair seat writes; replace its "a new test needs no cited source" sentence. Keep :47 and :83 untouched (frozen-test-guard lines).
5. `check-issue/SKILL.md` :75 (check.repair): a review finding that evidence machinery is missing is the stop's cause — it is not repaired and not handed to A as a repair; a proven product defect needing a live rerun is still handed to A.
6. `skills/merge-issue/SKILL.md` :55: replace the "A new test needs no cited source" sentence (every added test now needs the trailer); keep the wrong-test fix and fix-forward sentences. Leave :51's trailer mechanics untouched.
7. `docs/guide/phases.md`: update the implement-issue section (:92 area) and planning line (:80) — A writes criterion tests during plan.synthesis, committed first; implementation runs the planned tests; a Nit gets no test and no new issue; review checks report-ran-planned-commands. Keep operator-readable style, do not restate guard mechanics.
8. `docs/guide/idea.md` :41 table row: Implement is no longer "code + tests" — tests are written in Synthesis; update the row (and only stale lines there).
9. Sweep your owned files for other stale lines telling implementers/workers/repair seats to author tests or build proof machinery; report any hits you judged out of scope.

## 3. Read-first list

- `plan.md`, `design.md`, `brief.md` in `/home/ivan/Work/infra/akrogon/issues/open/pre-written-tests/test-proof-rules/` (read-only)
- Your worktree copies of the four owned files
- `docs/guide/merge.md:11` — confirms :51/:55 trailer text is guard-adjacent; do not edit merge.md (frozen-test-guard adjacency, report only if stale)
- `skills/implement-issue/SKILL.md` and `plan-issue/SKILL.md` — terminology consistency; do not edit (workers 1-2 own)

## 4. Change list

- `skills/check-issue/SKILL.md`: delete :55; add no-test-no-issue Nit rule; add planned-commands/no-skip check beside :53; narrow :79; add machinery-finding rule to :75.
- `skills/merge-issue/SKILL.md`: :55 sentence replacement only.
- `docs/guide/phases.md`: :80, :92-104 mirror updates.
- `docs/guide/idea.md`: :41 row and any stale sibling line.

## 5. Do-not, reasons and exceptions

- Do not edit `plan-issue`, `implement-issue`, `chart-issues`, `src/`, `tests/` — other workers or out of scope.
- Do not touch `check-issue` :47 or :83 and `merge-issue` :51 — frozen-test-guard owns those lines.
- Do not restate freeze-guard mechanics in docs; say tests are locked after planning and point to the trailer rule.
- Keep :53's "A new test needs no cited source" (see criterion 2 — removing it is a defect).
- Do not write or edit any test file.
- Exception to every exclusion: a revised brief from A. Conflicts return a mismatch.

## 6. Ordered steps

1. Read leaf plan/design/brief and your four files fully.
2. Edit `check-issue/SKILL.md` (criteria 1-5).
3. Edit `merge-issue/SKILL.md` (criterion 6).
4. Edit `docs/guide/phases.md` and `docs/guide/idea.md` (criteria 7-8).
5. Run the commands in section 7.
6. Commit your owned files only.

## 7. Commands

- `cd /home/ivan/Work/infra/akrogon/issues/worktrees/test-proof-rules-u3 && bun install --frozen-lockfile`
- `AKROGON_BASE=354c80e14aca6483c430312c61ae5c1397bb548e bun test --changed="$AKROGON_BASE" --timeout=30000`

Prose-only diff; expect no test files changed. Do not write or edit any test.

## 8. Done-when, evidence and report

All nine criteria hold in the diff; commands run with results pasted; commit ID returned. Report changed files and reasons, commands with results, commit ID, out-of-scope sweep hits, limitations. Conflicts return a mismatch naming the conflicting requirement and the smallest brief correction.
