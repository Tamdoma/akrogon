# Waiting edit

## Question
Q1. When a needed config edit cannot be made until a leaf's code merges, where does it wait without reminder issues or new code?

### Carries
- forks/check-entry-points.md Taken 1d and operator's "keep my issues clean, and only actual issues".
- Leaf `sources` are closed by the command at completion (src/pull.ts:180, shapes.md:278); the door closes delivered identities with `akrogon close <id> --by` (skills/chart-issues/SKILL.md:35).

## Findings
- B F3 (slots/carrier-final-check-B.md): keep the edit inside the original issue's undelivered scope with owner and verification, not closed at the prerequisite's merge and not a reminder issue.
- A: the existing source-close rules already allow this. If the GitHub identity is left out of the waiting leaf's `sources`, the original issue stays open after the leaf merges and is mirrored by `akrogon pull`; the door makes the edit, verifies it and runs `akrogon close`. No new issue, no code.
- B final-shape check (slots/framework-switch-B.md Part 1), accepted (A) as clarifications of 1a:
  - shapes.md:278-280 needs a stated exception: the door owns the deferred edit and the identity is withheld from lifecycle sources on purpose.
  - Withhold the identity from every leaf whose completion could close it, not one leaf (src/phase.ts:206-224 closes the union of sources).
  - Unsourced case: record the exact edit, owner, prerequisite leaf and check in CHART.md as pending, not only spoken at handoff.
- Gap: an unsourced chart (operator note only) has no GitHub issue to keep open.

## Taken
Operator 2026-10-12, after asking for a plainer explanation twice: "1a"

Decision: when a needed config edit can only follow a leaf's merge, the original GitHub identity is left out of that leaf's `sources`, so the leaf's completion does not close it. It stays open and mirrored by `akrogon pull`; the door later makes the edit on main, verifies it, and runs `akrogon close <id> --by "<edit and commit>"`. For an unsourced chart, the door names the edit at handoff review as an operator-owned step. Reason: only actual issues stay open, and the problem is not fixed until the edit is made. No new issue kind, no code.
Foreclosed: 1b (rely on 1d alone; framework's case can recur); seed-issue reminders (check-entry-points Taken).
