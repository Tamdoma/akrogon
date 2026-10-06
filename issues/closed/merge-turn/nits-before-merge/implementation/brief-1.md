# Brief 1: move the Nit-to-LESSONS step from merge to check

## 1. Goal

Move the Nit-to-LESSONS recording step out of the merge pass and into check-issue, per plan.md decisions D1-D4. Prose-only edits to three files; no code, no new tests.

## 2. Numbered acceptance criteria

AC1 — `skills/check-issue/SKILL.md` `## check.review` tells B to record each held reusable Nit before recording a verdict that is not `fix`. The rule sits before or inside the paragraph ending in the `akrogon phase` verdict call, so recording happens before that call.
AC2 — `skills/check-issue/SKILL.md` `## check.repair` tells B to record each held reusable Nit before its move to `merge`, skipping Nits already written for this leaf.
AC3 — Both recording rules state the target and shape: one line naming mechanism/date/history in the registered checkout's `learnings/LESSONS.md` plus a `learnings/history/` file with case, evidence and learning, left for the operator to commit, written to the registered checkout (not the worktree copy).
AC4 — `skills/merge-issue/SKILL.md` `## merge` no longer contains the Nit step (currently the section's first paragraph, starting "Turn a Nit B still holds").
AC5 — `docs/guide/learn.md` line 9 ("The merge skill can turn that nit into a short entry and a supporting history file") no longer assigns the step to the merge skill; it names the check skill recording before merge.
AC6 — No other `docs/` page assigns the step to the merge pass (verified by grep).

## 3. Read-first list

- `skills/check-issue/SKILL.md` — `## check.review` "Finish with" paragraph and the sentence beginning "Rerun checks only for a code change, missing evidence or a specific concern, leaving doc/index authorship with A and recording any reusable lesson found here…"; `## check.repair` "Finish with" paragraph.
- `skills/merge-issue/SKILL.md` — `## merge` first paragraph; it is the source of the wording rules to carry over.
- `docs/guide/learn.md` — the **A lesson** paragraph.
- `skills/implement-issue/ponytail.md` — read before editing.

Pattern to copy: the removed merge-issue paragraph itself is the wording template: "one line naming mechanism/date/history in the registered checkout's `learnings/LESSONS.md` and a history file with case, evidence and learning, left for the operator to commit, without reading the active list as pass input or adding another turn."

## 4. Change list and needed interfaces

Owns: `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md`, `docs/guide/learn.md`. No prerequisites; no shared test resource.

- `skills/check-issue/SKILL.md`: extend the existing "recording any reusable lesson found here" sentence in check.review so held reusable Nits are recorded before a non-`fix` verdict, and add the same instruction in check.repair before the `akrogon phase <slug> merge --slot B` call with the skip clause ("skipping Nits already written for this leaf" — `review-B.md` is where the record lives). Do not reorder sections.
- `skills/merge-issue/SKILL.md`: delete the `## merge` first paragraph verbatim; the section then opens with "Before pushing, commit scoped outstanding changes…".
- `docs/guide/learn.md`: rewrite the sentence at line 9 so the check skill (B) records the nit-to-lesson before its move to merge instead of the merge skill; keep the `learnings/LESSONS.md` / `learnings/history/` listing and surrounding framing.

Timing rationale (context, not a criterion): the command aggregates both seats' verdicts, so B cannot see the move into `merge` itself; recording must precede the verdict call.

## 5. Do-not, reasons and exceptions

- Do not change `src/`, tests, or any other file; this leaf is skill/doc prose only — code changes break the leaf's own proof story.
- Do not write into `learnings/` or `issues/`; the branch must not touch them — runtime lessons belong to the registered checkout.
- Do not add a recording trigger to the post-`check.fix` re-check path; plan.md records that as an open limitation left for review.
- Do not rename the verdicts, sections, or the `Test-Change:` rules.
- Do not use em-dash chains or restructure surrounding prose; keep diffs minimal.
- Return a mismatch with evidence instead of changing scope; the exception is a revised brief from A.

Restated: only the three prose edits above; all other changes require a revised brief.

## 6. Ordered steps

1. Read the four read-first files (AC1-AC5 evidence gathering).
2. Edit `skills/check-issue/SKILL.md`: check.review rule (AC1, AC3), check.repair rule (AC2, AC3).
3. Delete the `## merge` first paragraph in `skills/merge-issue/SKILL.md` (AC4).
4. Rewrite `docs/guide/learn.md` line 9's sentence (AC5).
5. `grep -rn -i 'nit\|lesson' docs/` and `grep -n -i 'nit' skills/merge-issue/SKILL.md`; confirm no stale placement remains (AC4, AC6).
6. Commit the three files in one commit; no `Test-Change:` trailer (no test files touched).
7. Run the changed-test command from section 7; expect no affected tests or a clean pass (proof for all ACs is the diff itself plus the greps).

Advisory size: 3 files, under 20 turns.

## 7. Commands

`: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000` with `AKROGON_BASE=923c6c98fac3f051a54ac27168ea024215652602`, run in the worker worktree after `bun install`.

## 8. Done-when, evidence and report

All six ACs hold; the greps in step 5 return no stale hits; the commit exists with the three files; section 7's command ran. Report includes the commit ID, the two grep outputs, and the test command output.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
