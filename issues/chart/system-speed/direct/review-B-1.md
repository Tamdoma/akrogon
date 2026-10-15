# Seat B direct review

Verdict: ready. No Fixes or Nits.

Base: `dba0c5c4890fc480a194e5cd43a1554b1e2abe10` (`origin/main`).
Reviewed head: `00f90c62d5c949321a581e26f7c716aa85b0fb24`.
Worktree: `/home/ivan/.claude/jobs/6a0d8d81/tmp/wt-failed-intake`.

## Findings and evidence

- E1 Correctness: `skills/chart-issues/SKILL.md:31` adds the existing read-only `akrogon status` command and presents failed leaves with their reasons for operator confirmation. `src/status.ts:370-374` selects the current registered repository, `:380-381` lists its failed leaves, and `:125-128` puts the recorded cause and reason in each leaf's NOTE. This implements `issues/chart/system-speed/CHART.md:15` D1 and addresses `slots/final-check-D.md:3` X1. Showing all failed leaves is consistent with D1. Operator confirmation leaves transient failures distinguishable from contract defects. Legacy states without a failure record still display `failed`; this change does not invent a missing reason.
- E2 Documentation: no contradiction with `README.md:15,35`, `docs/guide/chart.md:37,46`, or `docs/guide/problems.md:16-27`. Charting still gathers evidence for operator decisions. Failed-leaf recovery still requires resolving the blocker and choosing an active phase. No guide claims that failed leaves cannot supply chart input.
- E3 State and routes: the entire diff is one sentence in one skill. No state schema, phase transition, recovery command, dispatch, or landing behavior changes. `skills/chart-issues/SKILL.md:33` retains the existing import and duplicate rules. Listing a candidate does not import it or resume its leaf.
- E4 Text pins: searching `tests/**/*.ts` found no test pinning the changed sentence. `tests/docs-links.test.ts:75-108` checks skill links and the shared lesson-rule reference, both retained. `tests/status.test.ts:610-630` already proves failed cause/reason output. No test files changed and no `Test-Change:` trailers are required or present.

## Verification

All runner commands were invoked from the reviewed worktree through `akrogon run-check`, with holder `/home/ivan/Work/infra/akrogon/issues/chart/system-speed/direct`.

1. `bun test tests/status.test.ts tests/docs-links.test.ts` could not load the status tests because this worktree has no installed `zod`. The exact-command retry had the same setup error. Documentation tests passed in both runs. Logs: `check-failed-intake-review-B-1792018021349-2268646.log` and `check-failed-intake-review-B-1792018041338-2277472.log`.
2. `bun test tests/docs-links.test.ts` passed all four tests on the reviewed worktree. Run `dd4974b2-6920-48a5-8574-ab9f520c0b15`; log `check-failed-intake-links-B-1792018052533-2282518.log`.
3. `bun test /home/ivan/Work/infra/akrogon/tests/status.test.ts --test-name-pattern 'failed leaves show cause and reason in NOTE and terminal phases suppress busy'` passed the relevant CLI case, with seven assertions. Run `187f5266-a943-4cab-bbd5-16366ecb8280`; log `check-failed-intake-status-B-1792018052728-2282620.log`. This uses the dependency-installed registered checkout. Before running it, `git diff 00f90c6 -- src tests package.json bun.lock` there was empty, so the exercised code, test, helpers and dependency declarations match the reviewed head. This proves the unchanged status behavior, not a full worktree suite.

`git diff --check origin/main..HEAD` passed. The review worktree remained clean. No dependency installation, code edits, commits, pushes or lifecycle moves were made. Runner-generated logs accompany this review.
