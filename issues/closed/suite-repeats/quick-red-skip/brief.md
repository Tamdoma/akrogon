# Brief: quick-red-skip

## What

In an `akrogon verify` pass, checks not named in `full` run first and always run; when setup or any of them is red, each check named in `full` is recorded `blocked` by that check without executing. Per-command reuse (copying green entries from an earlier row into a new pass) is deleted; old rows that carry `reused` entries still parse. `verify --known-red` runs no base pass when the merge-base tree already holds a whole-green row and returns the same judgment the gate gives. Seat skills say what a blocked check means and stop promising per-command reuse.

## Why

51 verify passes ran the full test suite beside a red format or typecheck check (124.6 min of test execution); none of those results was ever reused, because fixing a quick check always changes the tree. Per-command reuse saved six 2-second commands in akrogon and nothing on framework heads since it landed.

## Done-criteria

1. In a verify pass where a check outside `full` is red, every other check outside `full` still runs, each `full` check is recorded blocked by that check without executing, the row is red, and the receipt gate refuses the head.
2. After the red check is fixed on a new tree, the `full` check runs and the green row satisfies the receipt gate.
3. A red `full` check does not block another `full` check in the same pass.
4. On a same-tree retry with no eligible whole-green row, commands whose stages are unblocked execute again rather than copying earlier green entries, any new row holds no `reused` entry, and rows carrying `reused` entries from before this leaf still parse and stay excluded from flaky and slow-run counts. (A,B)
5. `akrogon verify --known-red` on a red head whose merge-base tree already holds a whole-green row the existing `greenRun` predicate accepts for that call runs no base pass and exits with the same judgment the receipt gate gives for that head. (A,C)
6. The red-disposition text in `skills/implement-issue/SKILL.md` `## Shared context`, `skills/check-issue/SKILL.md` `## check.review` and `skills/merge-issue/SKILL.md` shared endings says a blocked check did not run and its blocker is fixed first, and none of those, `skills/chart-issues/SKILL.md` `## Direct route` or `docs/reference/checks.md` (`## What runs where`, `## Prove a commit with akrogon verify`, `## Known red`) promises per-command reuse. (A,D)

Criteria 1-5 are proven by tests in the repo's `test` check; criterion 6 by the check.review reading of the changed sections.
