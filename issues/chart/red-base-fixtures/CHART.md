# Chart: red-base-fixtures

## Destination
Base is green again: tests/peer-wait.test.ts and tests/dependents-first.test.ts pass against the current src and skills, so merge-clean-worktree can resume. Repo: akrogon.

Route: lifecycle (debate no)

## Forks taken
- [Targeted test-only fix](forks/targeted-fix.md): both failures are stale tests (fake herdr lacks `agent list`; dependents-first expects the old exit 1), fixed in tests/ only and proven with only the two failing files

## Open forks

## Fog

## Off route
- Reverting f3199df's src and skills changes: they are the intended behavior and are documented.
- Fixing anything in merge-clean-worktree: its diff is not the cause.

Handed off 2026-10-10
