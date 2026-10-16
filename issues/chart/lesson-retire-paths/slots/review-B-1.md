# Direct review B

Date: 2026-10-16
Base: `4088a91ad3015c346dc56a9fd485827033e1c507`
Reviewed head: `d899fb8f31b6e67fa861e4c1ed6a96ce6f87edfd`
Worktree: `/home/ivan/.akrogon/worktrees/akrogon/lesson-retire-paths`
Verdict: **nits**

## Findings

No Fixes or operator actions.

**N1 — Git author identity is not necessarily the approving operator.** `skills/learn-issues/SKILL.md:30` fills `approved by <who>` from the registered checkout's `git config user.name`. That identifies the configured commit author, which need not be the person approving this diff. Prefer the actual approving operator's identity when finalizing the transfer record. Deferred because this review found no actual transfer with a mismatched identity, and the separate requirement for operator approval remains explicit. A real learn pass recording a different person as approver would promote this to a Fix against Taken 2a's approval record. No test or new issue is requested for this concern.

## Contract review

- **C1:** the shared Retire clause names removal, refusal before the lesson's harmful effect, and a running guard, each requiring coverage of every reachable path. Implementation, review, chart audit and guide changes carry or reference that rule. The changed header is the only change to LESSONS.md. Neither repository's active lessons were swept.
- **C2:** learn-issues distinguishes Stopped, Checkable, judgment transfers and Stays. Transfer prepares an uncommitted same-repo diff, requires operator approval to complete, uses Transferred rather than Applied, and retains lessons with missing or cross-repo review steps. Checkable lessons cannot transfer under the shared rule. The report's closing phrase “until the operator commits” is narrower than the implemented approval condition; the shipped instructions correctly say approval of the diff.
- **C3:** check-issue accepts each complete stop with its Applied record and rejects partial coverage, dead guards, deleted sites with surviving patterns, failure after harm, closure-based removal and leaf transfers. The chart audit requires retirement for a source-traced complete stop. The unchanged `src/lessons.ts:21` recognizes the retained Applied prefix without interpreting its suffix, so the three stop types need no parser change.
- **C4:** all planned code changes are prose. No executable behavior, tests, fixtures, runner settings or dependencies changed. `Test-Change:` trailers: none, with none required. No exact-wording tests were added. Scenario review covered complete removal, surviving pattern, refusal before/after harm, called/uncalled guard, missing evidence, pending/approved/declined transfer, an unreached step, cross-repo step, Checkable-to-note and report closure.

## Verification evidence

The worktree remained clean at the reviewed head. The full diff was inspected and `git diff --check` passed. Read CHART.md, Taken 1a/2a/3a, INTAKE.md, direct/plan.md, direct/report.md and the changed guide page. There are no separate draft brief/design files in this chart; CHART.md's approved outcomes and the Taken decisions supply those contracts.

The existing verification receipt in `issues/verify-runs.jsonl:119` names this exact head and tree `3edf24062f36e0894bcb420418b5b003ffe02d71`, merge scope, setup exit 0 and all three checks exit 0. Read its logs back with `akrogon log`:

- **V1:** `bun test --timeout=30000`: 993 pass, 0 fail, 147.99 seconds. Log: `direct/check-test-1792157887303-1074119.log`.
- **V2:** `bun run typecheck`: exit 0. Log: `direct/check-typecheck-1792157889420-1074119.log`.
- **V3:** `bunx prettier --check src tests skills/chart-issues/scripts`: exit 0. Log: `direct/check-format-1792157739218-1074119.log`. This does not validate prose semantics; C1–C4 above are the review of those semantics.

No code changed after that verification, so the full suite was not repeated.

Independent review commands ran in the worktree through `akrogon run-check --holder /home/ivan/Work/infra/akrogon/issues/chart/lesson-retire-paths/direct`, and both logs were read back with `akrogon log`:

```text
check review-b-paths: 0 /home/ivan/Work/infra/akrogon/issues/chart/lesson-retire-paths/direct/check-review-b-paths-1792157945783-1504002.log
check review-b-retire-wording: 0 /home/ivan/Work/infra/akrogon/issues/chart/lesson-retire-paths/direct/check-review-b-retire-wording-1792157964712-1504760.log
```

The first command listed all referenced repository files in the changed skills/AREA.md, including command inputs and the two watch script paths, and every path exists. The second located the retirement and transfer wording across the changed skill and guide surfaces for semantic review.

No source edits, commits or phase changes were made. Returned to the chart door for landing checks.
