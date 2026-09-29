# Implementation report: keep-chart-in-place

Base: 53508e807128de2a77b22cf4874e266224cf4f0e
Head: 62b0b1e55a6a28dd5924d6cd303a5e4d1a46c196 (one commit, cherry-picked from worker u1 commit 972b2dd)
Mode: delegated, one unit (brief-1.md), one wave, worker worktree removed before verification.

## Changed files and reasons

- src/phase.ts (-2): deleted the `chart` binding and guarded `renameSync` in `completeOwner`, so owner completion moves only the lifecycle record to `issues/closed/<owner>/` and the chart stays at `issues/chart/<owner>/`. All imports kept (used elsewhere). (C1)
- tests/phase.test.ts (+38/-5): flipped the two chart-move assertions (completion test, standalone/epic retry loop) to assert the chart stays and `issues/closed/<owner>/chart` does not exist (C2); added `snapshot` helper + regression test `completion leaves a chart holding a same-slug draft in place and keeps the inventory readable` (C3); added `readdirSync`/`statSync` to the `node:fs` import.

No doc edits: docs/guide never described the chart move (verified by grep in plan), design excludes skill/docs edits. No other files touched; C4 files (tests/state.test.ts, tests/next.test.ts) unchanged.

## Commands run with results

Worker red run (tests before fix, `AKROGON_BASE=53508e8... bun test --changed="$AKROGON_BASE"` in u1 worktree):

```text
(fail) completion reports each issue once, moves only finished containers, and refuses repeated merged
(fail) completion leaves a chart holding a same-slug draft in place and keeps the inventory readable
      ENOENT: no such file or directory, scandir '.../issues/chart/epic' at snapshot
(fail) standalone closure failure retries outstanding sources on next without replaying completion
(fail) epic closure failure retries outstanding sources on next without replaying completion
 28 pass, 4 fail, 274 expect() calls, 32 tests across 1 file
```

The new regression fails pre-fix because completion moved the chart away (snapshot dir gone). Full logs were in the removed worker worktree (red-run.log, green-run.log); pasted output above is the retained evidence.

Worker green run (same command after fix): 32 pass, 0 fail, 290 expect() calls, tests/phase.test.ts.

Lane changed tests after cherry-pick (same command): 32 pass, 0 fail, 290 expect() calls.

B full-file run: `bun test tests/phase.test.ts`, exit 0, 32 pass, 0 fail. Artifact: /tmp/keep-chart-in-place-phase-run.log (outside fixture and repo).

B blocking checks, all exit 0:

- `bun run format` (no changes)
- `bun run typecheck` (`tsc --noEmit`, clean)
- `bun test` full suite: 327 pass, 0 fail, 3870 expect() calls, 15 files, 72.67s. Artifact: /tmp/keep-chart-in-place-full-run.log

C4 confirmed: full suite includes untouched tests/state.test.ts depth tests and tests/next.test.ts invalid-depth tests, all passing.

## Known limitations

- Already-archived charts under `issues/closed/*/chart` stay where they are (no migration, per design). If such a chart holds a draft state.yaml, the inventory stays unreadable until the operator removes that folder by hand.
- The regression's pre-fix red comes from the chart-tree snapshot assertion (chart moved away), which is the documented failure mechanism; the `next --all` stderr and `status` assertions after it were not exercised in isolation on old code.

## Unverified criteria

None. C1-C5 all verified: C1 by diff, C2/C3 by red/green runs, C4 by untouched files passing in the full suite, C5 by the three blocking checks above.
