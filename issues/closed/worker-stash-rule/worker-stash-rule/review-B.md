# Review B: worker-stash-rule

Date: 2026-11-18. Phase: initial `check.review`. Verdict: **ready**.

Base: `39e203a79c5c4ebeef51d1e76a3d8ea43389debc`.
Reviewed head: `868cac1b071ea34adf5e5e58e89dc2f8192714a3`.

## Findings

No Fixes or Nits. Reviewed independently against the brief, design, plan, implementation report, full two-file diff, worker protocol and framework history case. The worktree is clean. Only the two owned Markdown files changed.

- C1: Template section 5 requires every brief to prohibit every `git stash` subcommand, explains the shared stash and sibling-pop harm, and directs base checks into a second worktree. Delegated leaf briefs additionally require WIP commits followed by `git reset --soft <creation commit>` and one returned commit. Section 4 records the actual worker creation commit when its wave's worktree is created, including reuse on relaunch. This agrees with worker-protocol's detached-worktree creation and single-commit cherry-pick contract. A later-wave creation commit includes earlier landed work, so the returned commit contains only that unit's changes. Standalone briefs expressly omit the reset step and preserve their tests-before-code commits. These instructions address the two detached sibling workers exchanging stashes in `/home/ivan/Work/infra/tamdoma/framework/learnings/history/2026-10-16-stash-shared-across-worker-worktrees.md`.
- C2: SKILL.md's refresh paragraph prohibits A from running `git stash` in leaf or worker worktrees at any time. Reading every stash occurrence in both owned files found only prohibitions. Existing refresh and never-discard rules remain intact.
- C3: The existing link checker covers tracked skill Markdown, including both owned paths. The committed-head targeted proof passed, as did the configured full test check. No links or anchors changed.
- C4: The report explicitly states that prose is not a stop under today's Retire rule and the framework lesson stays active. No lesson or framework path changed.

Read the unchanged behavior documentation in `skills/implement-issue/worker-protocol.md`, the full brief template, and `docs/reference/skills.md`, following `docs/reference-index.md` and `skills/AREA.md`. No documented behavior outside the two owned instruction pages changed. No AREA.md is in the diff, so no changed-area path listing is required.

## Test-Change trailers

`39e203a79c5c4ebeef51d1e76a3d8ea43389debc..HEAD` contains one commit, `868cac1b`, with no `Test-Change:` trailers. Neither changed path matches `src/test-files.ts`; no old test expectation, fixture, runner configuration or planned test was changed, skipped or disabled. No new test is required for this prose-only change under the design's interpretation. There were no proof-command corrections and no product model choice to judge.

## Verification evidence

Read the cited logs with `akrogon log` and checked their results against `issues/timings.jsonl` and the SHA-bound receipts in `issues/verify-runs.jsonl`.

- Targeted planned command: `akrogon run-check --name link-check -- bun test tests/docs-links.test.ts`. `check link-check: 0 /home/ivan/Work/infra/akrogon/issues/open/worker-stash-rule/worker-stash-rule/implementation/check-link-check-1794955979336-1588999.log`. Result: 12 pass, 0 fail.
- First verify receipt `46aa3042-0de2-4e60-a6e5-59904cd81a64` on the reviewed head had setup, format and typecheck green, and one test failure. `check test: 1 /home/ivan/Work/infra/akrogon/issues/open/worker-stash-rule/worker-stash-rule/implementation/check-test-1794956083653-1592774.log`. Its completed runner summary was 1223 pass, 1 fail. The failed `agy: the reset helper runs its stages in order and fresh A gets the start prompt on a new transcript` case observed only the first reset stage at `tests/door-reset.test.ts:270`. The diff changes instruction prose only and has no plausible causal path to that reset-helper fixture failure.
- The report's one retry preserved the configured test command, arguments, scope and worktree, including setup and own-modules guard. `check test: 0 /home/ivan/Work/infra/akrogon/issues/open/worker-stash-rule/worker-stash-rule/implementation/check-test-1794956304978-2019400.log`. Result: 1224 pass, 0 fail, including that agy case. I agree with the report's `inconsistent` disposition. No known-red or base comparison was needed after the green retry.
- Final verify receipt `21875ec0-fde3-4fcf-a979-76b82f697995` binds the same reviewed head and tree `49fb585277222639525feb7726eaf58808763017` to setup 0 and all three configured checks 0. `check format: 0 /home/ivan/Work/infra/akrogon/issues/open/worker-stash-rule/worker-stash-rule/implementation/check-format-1794956313653-2865885.log`. `check typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/worker-stash-rule/worker-stash-rule/implementation/check-typecheck-1794956318665-2865885.log`. `check test: 0 /home/ivan/Work/infra/akrogon/issues/open/worker-stash-rule/worker-stash-rule/implementation/check-test-1794956431444-2865885.log`. Final test result: 1224 pass, 0 fail across 83 files, including the previously red case. No check was blocked.

All evidence is after the sole implementation commit. No tests or proof inputs changed afterward, so no rerun was needed. `git diff --check` is clean. No live or paid operation was launched during review. The leaf has no grants or retained resources; implementation's serial-solo account and local check logs/timing rows show no unexplained paid activity or grant count discrepancy.

## Operator actions

None.
