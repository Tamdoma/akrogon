# Lesson lifecycle, merged (A, B)

## Q1 destination
- Route by mechanism owner: shared akrogon skill/command -> akrogon's issue repo; consumer code/check -> consumer's existing routing. Carry origin repo, history path and observed case in the seed. (A,B)
- Needs an explicit destination input for seed-issue; do not repoint consumer akrogon.yaml or hardcode a repo. (A,B)
- Rejected: always consumer; always akrogon. (A,B) Rejected: infer target from installed skill paths. (B)
- Evidence: docs/guide/learn.md:26-38 vs skills/seed-issue/SKILL.md:14-22 conflict for this case; framework akrogon.yaml:1. (A,B)
- Pitfalls: invalid target fails visibly and keeps the lesson (B); duplicate search runs against the chosen destination, open and closed (B); one report per mechanism, not one per mentioned repo (B).

## Q2 link and applied standard
- Line stays active until a delivered guard is verified; filing is not prevention. (A,B)
- Link: A appends the seed identity to the active line; B appends the seed URL to the existing history file and keeps the list format unchanged. Differ.
- Applied standard: A mechanical guard only (today's learn-issues rule). B also accepts a brief/skill rule when retained outcome evidence shows the behavior, labelled guidance. Differ.
- Evidence: skills/learn-issues/SKILL.md:18-22,28; framework history 2026-10-05-analytics-guard-proof.md:5-13 (35 tests passed with guards inverted). (A,B)

## New question, both slots
- Who retires the line after delivery, including when the guard lands in a different repo than the lesson? Write-time filing alone does not shrink the stock. (A,B) B: merge-issue has completion steps (skills/merge-issue/SKILL.md:45,69-73) but no owner for this today.
