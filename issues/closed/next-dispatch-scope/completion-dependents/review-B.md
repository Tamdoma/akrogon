# Review B: completion-dependents

Blind review. Did not read the peer review. No debate artifacts exist (`debate: no`), as expected.

## Base and head

- Base: `1a21e22e0056a7e9d6b5e35a5a395b867847a844`
- Reviewed head: `4ac0f7a65e16f47594a31bf2c53ce49236199f39`
- Worktree clean, 1 commit ahead, 4 files changed, no `issues/` files on the branch, no `AREA.md` in the diff.

## What I checked

AC1: `grep -n sweepAll src/next.ts` shows only the definition and the `next --all` outside-a-repo branch (verified inside `input === '--all'` plus `current === null`). All three completion sites capture `completedSlug` before `dispatchLeaf` and call `dispatchDependents`, which filters `discover(repo).leaves` by `blocked-by` and routes through `sweep` to `dispatchLeaf`. Matches plan D1-D4 and the design interface exactly.

AC2-AC3: new two-repo three-path test plus second-blocker negative test use the real CLI with the `fakeHerdr` boundary, no mocks of the unit under test, and assert observable tabs, worktrees, and panes rather than prose. The pane-hook path uses a `pane_exited` event, which exercises the same owner branch as a plain pane hook.

AC4: both chaining tests pass. Only the `tab_closed` title changed (`sweeps and starts the next leaf` to `starts the dependent`), which the brief allows where the old title misdescribes.

AC5: both guides state the dependents-only rule. Both `later sweeps` lines are now qualified to manual passes. The startup sentence is byte-identical: same line 38 in base and head, zero diff lines containing it. Remaining sweep mentions (`merge.md`, `problems.md`, parking, README `--all`) describe manual or cleanup sweeps and stay accurate.

AC6 and exclusions: report records format, typecheck, and full `bun test` (295 pass) green. Diff touches only the four owned files, so `--all`, startup, `plugin/`, and CLI flags are unchanged.

## Verification I ran

- `bun test tests/next.test.ts -t "dependent"`: 7 pass, 0 fail.
- `bun test tests/docs-links.test.ts`: 3 pass, 0 fail.
- Fail-first: swapped in base `src/next.ts`, new targeted-path test fails as expected; restored, worktree clean, `dispatchDependents` present.

## Findings

None. No Fix, no Nit. The diff is minimal, reuses `sweep` and `discover`, and the report has no material gap.

## Verdict

ready
