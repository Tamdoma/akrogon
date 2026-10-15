# Direct review B

Verdict: ready

Base: `2d938d48d71459134f41696a4aa907bd8442634b`
Reviewed head: `63e2479138fdf50fc67af7391ed08ee85a382f38`
Worktree: `/home/ivan/.claude/jobs/6a0d8d81/tmp/wt-handoff-gaps`
Contract: CHART.md G1 and G2, with the operator approval and G3 exclusion supplied in the review prompt.

No Fixes or Nits found in the complete diff. Three skill files changed, five insertions and five deletions. The worktree is clean at the reviewed head.

- G1: `skills/chart-issues/assets/shapes.md:183` now identifies downstream consumers of altered state/preconditions, accepts reuse only after checking the changed state against the consumer's preconditions, and leaves unresolved mechanisms to planning. It retains ownership, literal interfaces, exclusions with owners and dependencies. `skills/plan-issue/SKILL.md:65` closes those questions as plan decisions without reopening locked scope. Tracing the actual stacked-turn cleanup case through these instructions leaves the member-ref mechanism for planning while requiring the branch-ancestry precondition to be examined. It does not require changing the cleanup consumer itself.
- G2 proof mapping: `skills/plan-issue/SKILL.md:61` names the observation, boundary, before/after state, failure and observing command. It preserves proof size, rerun triggers and slow-run restart boundaries. Its artifact/helper restriction applies when the consumer result is unobserved, so it does not ban sufficient helper tests or impose the rejected blanket static-proof ban. The existing smallest-boundary and shared-proof rules remain at :69.
- G2 D1 consolidation: `skills/implement-issue/SKILL.md:66,78` now reference the exceptions retained at :59. The missing-case exception still requires B's criterion handoff, existing runner/helpers, deliberate-break red evidence, A's own commit and a criterion-citing trailer. The other exceptions retain their source and fail-before-fix requirements. B's handoff and re-review rules remain unchanged in `skills/check-issue/SKILL.md:69,79`. No G3 consolidation or lifecycle-routing change was introduced.

Documentation checked: `docs/guide/chart.md:194–207`, `docs/guide/phases.md:78–106` and `skills/AREA.md`. Their existing descriptions remain compatible with the refined instructions. No AREA.md or index path changed. No tests or runner configuration changed, and no Test-Change trailers occur in the reviewed commit range or are required for these paths.

Verification: `git diff --check 2d938d4..63e2479` exited 0. Review used the exact committed text and surrounding contracts, with no prose-matching tests or duplicate full-suite run. The door's parallel verify is still pending: the setup log reports installed dependencies and `direct/check-format-1792044953971-507716.log` reports that all matched files use Prettier style, but no completed receipt for this head or `direct/report.md` was available at review time. This is a ready content-review verdict, not a claim that verify passed. The door must retain its green verify gate before landing.

Last operation: direct B review recorded, no phase move or commit.
Next: chart door completes verification and landing checks.
