# Review B: Tasks footer cleanup

Verdict: **ready**

Base: `5dff80ee879619ad3a7fdd4af7c7d32f4dddbf98`  
Reviewed head: `0561e36355cf67e79d78d8cc32bc46d8ca300db0`  
Worktree: `/home/ivan/.akrogon/worktrees/akrogon/tasks-tidy`

Reviewed all four changed files against the operator's request to remove the quiet-repo line, Charts, Last merges and Housekeeping, including the explicitly included per-repo Charts fold. This newer instruction supersedes the earlier requirements to retain those sections.

No defects or Nits found. The renderer and model remove the requested sections, their declarations agree, and no references to the removed board fields remain in the Tasks mod or its tests. Alerts, task rows, expansion, seat icons, stage pills and Files/Changes pin behavior remain intact. Kept and unpacked entries do not move into alerts. Inspected `issues/chart/herdr-panels/direct/live/tt-01-small.png`: task rows and the alert remain, with the requested clutter absent.

## Verification

HEAD matches the supplied SHA and the worktree is clean. Ran:

- `bun test tests/tasks-mod.test.ts tests/tasks-mod-host.test.ts`: **20 pass, 0 fail, 63 expectation calls**.
- `bun run typecheck`: passed.
- `herdr-app check herdr-app/tasks`: passed.
- `node_modules/.bin/prettier --check tests/tasks-mod.test.ts`: passed for the changed test, within the repo's formatting scope.

Retained logs, all read back with `akrogon log`:

- `check review-B4-tidy-diff: 0 /home/ivan/Work/infra/akrogon/issues/chart/tasks-panel/direct/check-review-B4-tidy-diff-1793744379854-1244042.log`
- `check review-B4-tidy-tests: 0 /home/ivan/Work/infra/akrogon/issues/chart/tasks-panel/direct/check-review-B4-tidy-tests-1793744401154-1244838.log`
- `check review-B4-tidy-typecheck: 0 /home/ivan/Work/infra/akrogon/issues/chart/tasks-panel/direct/check-review-B4-tidy-typecheck-1793744412290-1247103.log`
- `check review-B4-tidy-modcheck: 0 /home/ivan/Work/infra/akrogon/issues/chart/tasks-panel/direct/check-review-B4-tidy-modcheck-1793744409223-1247102.log`
- `check review-B4-tidy-format: 0 /home/ivan/Work/infra/akrogon/issues/chart/tasks-panel/direct/check-review-B4-tidy-format-1793744409349-1247101.log`

The unchanged Tasks entry in `src/AREA.md` still describes the module architecture accurately. No AREA file changed and no additional documentation correction is needed.

## Test-Change trailer

`0561e363`: `Test-Change: tests/tasks-mod.test.ts drops the quiet-line, merges, housekeeping and quiet-charts expectations with the removed sections, and adds one case that the board carries none of them and kept or unpacked lines never become alerts.`

Accepted against the operator's explicit removal request. Removed assertions covered removed behavior. Ordering, alerts and retained row interactions still have coverage. No retained test was skipped or disabled.

No deployment, desktop input or paid launch performed.
