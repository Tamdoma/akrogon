# Review B: recovery-keeps-rounds

Verdict: ready.
Base: `22c447039b192f4caae6cad4d5b56092941d1bed`.
Reviewed head: `00ccfb9f396ecae00578f64927e04135474db44d`.
Initial review. Debate is disabled, so no positions or rebuttal artifacts are expected. The peer review was not read.

## Findings

No blocking defects or nits found.

The diff implements D1-D5 within the owned scope. `commitMove` removes only the failed-phase reset. The review-to-repair increment, cap guard and pass/delivery clearing remain unchanged. All callers use this shared transition function. Recovery directly into `check.fix` preserves the count without incrementing it. `requiredSlots` still selects only B for review when the retained count is positive.

Criterion 1 has real CLI coverage for cap failure followed by recovery into `implement`, generic failure followed by `plan.synthesis`, and recovery directly into `check.fix`. Assertions verify stored counts of 1, 3 and 2. The cap test verifies the failure reason before recovery. The tests exercise the actual transition code rather than mocking it.

Reviewed the changed recovery paragraph in `docs/guide/phases.md`, the unchanged state guide, reference index and routing contract in `skills/watch-issues/SKILL.md`. The recovery-count documentation matches the change. The plan explicitly reserves increment/cap changes for `b-repair-phase`. No AREA.md changed and no new path pointers were added.

## Verification

At the reviewed head, `bun test tests/phase.test.ts -t 'caps repairs|failed exits by command'` passed: 2 tests, 0 failures, 20 assertions. Working tree is clean.

Reused the implementation report's unchanged-head evidence: format unchanged, typecheck exit 0, full suite 353 pass / 0 fail, changed suite 39 pass / 0 fail. No missing evidence or specific concern requires another broad run.

No new reusable lesson identified.

## Merge verification

Rebase target: `origin/main` at `22c447039b192f4caae6cad4d5b56092941d1bed`. Prior reviewed and resolved head: `00ccfb9f396ecae00578f64927e04135474db44d`. Fetch succeeded and rebase was already up to date, with no conflicts or integration changes. Refreshed `AKROGON_BASE` remains the target above.

All configured checks rerun in the leaf worktree:
- `bun run format`: exit 0, all files unchanged.
- `bun test`: exit 0, 353 pass, 0 fail, 4123 assertions, 15 files, 84.24s.
- `bun run typecheck`: exit 0.
- `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"`, with the refreshed base exported: exit 0, 39 pass, 0 fail, 353 assertions, 6.55s.

No configured merge checks or advisory commands. Working tree clean. Completion-owner briefs gathered for all three reviewer-repair leaves before completion. A's deferred documentation Nit belongs to the sibling cap/routing change and adds no blocker here. B has no reusable Nit to record.

Push succeeded: `git push origin HEAD:main` advanced remote main from `22c4470` to `00ccfb9` by fast-forward.
