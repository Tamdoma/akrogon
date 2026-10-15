# Direct review B, round 2

Verdict: **fix**. F1 is resolved. The guard repair introduces the required-check failure F2 below.

Base: `00f90c62d5c949321a581e26f7c716aa85b0fb24`.
Prior reviewed head: `b1281398e90468eb3146b933e81da40a0b7cdeee`.
Reviewed head: `8f0b08e3e2696e02ea21151ffde930714817e8f1`.
Worktree: `/home/ivan/.claude/jobs/6a0d8d81/tmp/wt-overnight-recs`, clean at this head. Reviewed the two repair commits without reopening the accepted initial diff.

## F1 resolved

`64ec27a` qualifies `skills/implement-issue/SKILL.md:66` so a B-handed missing criterion case cites its criterion line even when added to an existing test file. This resolves the conflict with the exception at `:59` without adding a gate or changing worker permissions.

## F2: the verify integration fixture still expects the removed blanket refusal

Source: the actual required `akrogon verify` run `e688b54f-5efe-4b26-b46e-6914e714ea47` for `8f0b08e`. Setup, format and typecheck exit 0, but test exits 1. `direct/check-test-1792041494840-2554005.log:921–934` records `tests/verify.test.ts:242` failing because verify returned 0. The final summary at lines 960–966 is 827 pass, 1 fail.

Cause: `tests/verify.test.ts:236–248` constructs a checkout with neither a root package.json nor node_modules and expects the missing-modules refusal. `src/guard.ts:37` intentionally now accepts that case. The repair updates the equivalent fixtures in `tests/guard.test.ts:37,122` but leaves this verify integration case unchanged. The failure is directly explained by the repair, so the unrelated-red retry rule does not apply.

Repair: give this fixture a valid root package.json committed into the revision that `verify` checks out, while leaving node_modules absent. Keep its nonzero-result, refusal-log, check-not-run and cleanup assertions. Writing only an uncommitted manifest into the caller worktree would not reach the fresh verification tree. Cite the changed guard contract and real pi setup failure in the test commit's `Test-Change:` trailer, then rerun verification on the repaired head. Do not delete or invert the refusal assertions.

## Other repair evidence

- Independently traced the reported pi failure on its real checkout: installed `akrogon guard own-modules` exits 1 naming missing root node_modules, while `bun <akrogon repair worktree>/src/akrogon.ts guard own-modules` exits 0. This supports the guard change's real source. The updated guard unit tests pass in the verification log at lines 160–165.
- The two `Test-Change: tests/guard.test.ts ...` trailers in `8f0b08e` cite the actual pi verification failure and accurately describe the no-package positive case and retained package-present refusal cases. No unrelated expectation is weakened.
- Read the changed guard documentation in README.md and src/AREA.md. Listed every concrete src/tests/docs file pointer in src/AREA.md in one command. All 19 exist. `git diff --check b1281398..8f0b08e` passes.
- Confirmed the terminal receipt in `issues/verify-runs.jsonl` names the reviewed full SHA, setup 0, format 0, test 1, typecheck 0 and an end time. The older green run on `64ec27a` does not validate the later guard repair. No full suite was duplicated.
- Pi's proposed order is acceptable: land akrogon only after its repair verifies green, update pi's registered checkout locally to expose its setup configuration, verify the pi head, then push pi only on green. Its review remains pending that evidence.

Only this review was written for this chart. No code, dependencies, commits or phase state changed.

Last operation: direct re-check written, F1 resolved, verdict fix for F2.
Next: chart door repairs the verify fixture and supplies green current-head verification, then B re-checks.
