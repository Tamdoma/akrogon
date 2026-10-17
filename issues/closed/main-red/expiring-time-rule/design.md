# Design: expiring-time-rule

## Binding decisions, verbatim

### base-red / red-notice Q2 (issues/chart/base-red/forks/red-notice.md)
Autopilot pick by A, 2026-10-17 (not operator words; mode record in CHART.md). Matches the round recommendation.


Q2: one rule line in skills/plan-issue/SKILL.md test-proof rules: an expectation that would expire as calendar time advances injects the time or computes the expected value from the time observed in the same run; deliberate elapsed-time and deadline bounds are unaffected. Nothing in src, no lint, no audit of existing tests now.
Reason: one line against a recurring incident class, enforced by the reviewers who already read criterion tests; narrowed per B so deadline contracts stay valid.
Rejected: clock seam in src (most `Date.now()` reads are correct elapsed-time reads); lint (cannot tell an expiring bound from a relative one); audit now (no evidence of another rotting bound).
Standing dissent: B prefers no prevention rule in this issue, since a rule reminds but does not prevent.

### Carried from red-base-policy
- Known reds pass inside verify, so main can be red while work passes; the plan-issue clause "since main is green by the receipt gate" becomes false and is removed here, since it shares skills/plan-issue/SKILL.md:69 with this rule. (A,C)

### Exclusions
- The verify gate and the notice are owned by known-red-pass and main-red-notice. This leaf changes no src or tests.

## Standing design
/home/ivan/.akrogon/releases/6f31ca94490e98f0306e77a7ad63316cef314b45/skills/chart-issues/assets/standing-design.md

Interpretation for this leaf: a one-line prose rule; proof is reading the changed paragraph. No test is added, since no behavior changes ("No vanity tests").

## Leaf architecture
Owned surface: skills/plan-issue/SKILL.md, the criterion-test paragraph (the one that begins "With `plan.md` written").
Consumers: check-issue and implement-issue route wrong criterion units "under `test-proof-rules`" (skills/check-issue/SKILL.md, skills/implement-issue/SKILL.md); they reference the rules by name and need no edit.
Exclusion: tests/timing-report.test.ts is already fixed (0dfae20); no audit of other tests.
