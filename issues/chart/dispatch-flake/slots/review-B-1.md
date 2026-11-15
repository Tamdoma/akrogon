# Direct review B, round 1

Date: 2026-11-10 UTC
Verdict: **ready**

- Base: `6352653739fcd32727c809c42a0955811071d98d`
- Reviewed head: `a33d967b5dd07829b81b9dd87802c8a72f8effbd`
- Worktree: `/home/ivan/.akrogon/worktrees/akrogon/fixture-start-window`
- Head tree: `6f7339060926b939a957343efb0048a548fdf45d`

No Fixes or Nits.

## Scope and contracts

Reviewed both commits and the complete seven-file diff against forks/contracts.md Question/Taken, forks/fix-shape.md Question/Findings/Taken, direct/plan.md and direct/report.md. These forks supply the direct route's brief and design. Read check-issue and ponytail instructions.

The implementation removes the shared 3000 ms override, reuses a named explicit override for the four approved unconfirmed-start scenarios, and adds the planned delayed-dependent reproduction. Starting calls receive the short override through the existing environment merge. Subsequent passes continue to exercise existing no-resend and delivery-error handling. Assertions and existing per-test limits remain intact.

The stand-in delay applies before the first status only when its fixture-local `delay-<cwd basename>` file exists. The new scenario delays only `second`, holds its turn working, checks its first attempt after merged and after another pass, and checks one delivered task. Its fixture is cleaned in `finally` through the existing core-stop and directory-removal path.

No production, runner configuration, dependency, attended-tier or pane-wait change. The reproduction's forced sleep is the approved stimulus, not a wait used to make assertions pass. No documented behavior changed. Checked docs/reference/commands.md, Run work: the existing 60-second startup contract remains accurate.

## Criteria and evidence

Read the cited logs through `akrogon log`. No additional test run was needed because current-head evidence covers the changed fixture and all affected tests.

| Ref | Approved outcome | Evidence and judgment |
| --- | --- | --- |
| C1 | A dependent starting after 3 seconds is counted exactly once, red before and green after. | `direct/check-repro-before-1794321357350-3351511.log`: the new scenario fails at the first count with 0 instead of 1, 3464.56 ms. `direct/check-repro-after-1794321395067-3388928.log`: new scenario passes in 4212.45 ms and original scenario passes in 925.48 ms. The full final-head run also includes the new case. Source checks both counts and one task. Satisfied. |
| C2 | The four unconfirmed-start scenarios retain their outcomes within existing limits using their own short window. | `direct/check-four-unproven-1794321423621-3394623.log`: all four pass, 3377.66/14927.53/6661.44/3450.17 ms. Diff changes environment values, not their assertions or limits. Full final-head run is also green. Satisfied. |
| C3 | Configured test check is green on the head with before/after wall times on this host. | Receipt `ba789c4c-84f3-446c-a8b1-634a977ce429` matches the exact reviewed SHA/tree, has setup 0, all three configured commands exit 0, no blocked member, and an end timestamp. `direct/check-test-1794321516786-3452058.log`: 1152 pass, 0 fail, 60.20 s. Base receipt `c3116c8f-8443-4e79-9412-5b916c8710aa` matches the specified base; its test log reports 1151 pass, 0 fail, 58.18 s. Satisfied. |

Receipt command set matches issues/config.yaml: `bunx prettier --check src tests skills/chart-issues/scripts`, `bun run typecheck`, and `bun test --timeout=30000 --parallel=4 --no-isolate`. Read the head format/typecheck logs, which confirm successful formatting and TypeScript checks. The clean-checkout verify receipt was completed after the final commit. The worktree is clean and its HEAD matches the supplied head.

The after-fix targeted proof includes the original test in addition to the planned new scenario. It omits no planned test and does not weaken the proof. No proof-command correction is required. The before/after suite pair records timing, not a bound on timing variability, as the report states. The historical natural trigger remains inferred; the forced-delay proof establishes the approved mechanism.

## Test-Change trailers

Listed all trailers in base..head and judged them against their cited source. All seven changed files match src/test-files.ts's `tests` path rule and have a trailer.

Reproduction commit `99b6137837dc1d0770173b414f252b35cfca299e`:

- `tests/stand-in.sh`: fix-shape K1, a fixture-local way to force the observed delayed-start mechanism. Accepted.
- `tests/next.test.ts`: contracts criterion 1, preserving the recorded zero-count failure as a forced-delay reproduction. Accepted. The historical trigger is not claimed as proven by this test.

Fix commit `a33d967b5dd07829b81b9dd87802c8a72f8effbd`:

- `tests/hc-fixture.ts`: fix-shape Taken 1a, remove the shared override and name the explicit short window. Accepted.
- `tests/hc-start.test.ts`: contracts criterion 2, explicit deadline for the never-working startup. Accepted.
- `tests/hc-delivery.test.ts`: contracts criterion 2, explicit deadline for its initial unconfirmed startup. Accepted.
- `tests/session-reads.test.ts`: contracts criterion 2, explicit deadlines for the two idle-seat startups. Accepted.
- `tests/session-routing.test.ts`: contracts criterion 2, explicit deadline for the blocked-seat startup. Accepted.

No assertion, existing scenario, test selection or configured check was removed or disabled. No operation, paid launch, retry, commit or phase move performed during this review.
